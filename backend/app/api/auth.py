from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.database import get_db
from app.core.security import (
    verify_password, get_password_hash, create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES, generate_totp_secret, verify_totp, get_provisioning_uri,
    SECRET_KEY, ALGORITHM
)
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, LoginRequest, Token
from pydantic import BaseModel

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user_in.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password,
        totp_secret=generate_totp_secret()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    if "@" in login_req.username:
        user = db.query(User).filter(User.email == login_req.username).first()
    else:
        user = db.query(User).filter(User.username == login_req.username).first()
        
    if not user or not verify_password(login_req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username/email or password")
    
    if user.is_2fa_enabled:
        if not login_req.totp_code:
            raise HTTPException(status_code=401, detail="2FA_REQUIRED")
        if not verify_totp(user.totp_secret, login_req.totp_code):
            raise HTTPException(status_code=401, detail="Invalid 2FA code")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

class TwoFASetupResponse(BaseModel):
    secret: str
    provisioning_uri: str

@router.post("/2fa/setup", response_model=TwoFASetupResponse)
def setup_2fa(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    uri = get_provisioning_uri(user.totp_secret, user.email)
    return {"secret": user.totp_secret, "provisioning_uri": uri}

@router.post("/2fa/enable")
def enable_2fa(username: str, code: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if verify_totp(user.totp_secret, code):
        user.is_2fa_enabled = True
        db.commit()
        return {"msg": "2FA successfully enabled"}
    raise HTTPException(status_code=400, detail="Invalid code")

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

