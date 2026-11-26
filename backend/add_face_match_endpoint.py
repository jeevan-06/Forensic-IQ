import re

SRC = "c:/Users/Jeevan Kumar/OneDrive/文档/project/backend/app/api/pipeline.py"

with open(SRC, "r", encoding="utf-8") as f:
    content = f.read()

# Add the new schema
schema = """
class MatchFaceRequest(BaseModel):
    face_path: str
"""

if "class MatchFaceRequest" not in content:
    # insert after AnalyzeFaceGeometryRequest
    content = content.replace(
        "class AnalyzeFaceGeometryRequest(BaseModel):\n    face_path: str",
        "class AnalyzeFaceGeometryRequest(BaseModel):\n    face_path: str\n\nclass MatchFaceRequest(BaseModel):\n    face_path: str"
    )

new_endpoint = """
@router.post("/match_face/{file_id}")
async def match_face(
    file_id: str,
    request: MatchFaceRequest,
    current_user: User = Depends(get_current_user),
):
    import time
    import random
    import math

    # Simulate ArcFace 512D Embedding Generation Delay
    # In a real scenario, this would be a forward pass through a ResNet50/100 ArcFace model.
    time.sleep(1.5)

    # Generate a deterministic but pseudo-random 512D embedding vector based on file_id
    seed = hash(file_id) % 1000
    random.seed(seed)
    
    embedding = [round(random.uniform(-1.0, 1.0), 3) for _ in range(512)]
    
    # Normalize the embedding vector (L2 normalization)
    norm = math.sqrt(sum([x**2 for x in embedding]))
    embedding = [round(x / norm, 4) for x in embedding]

    # Deterministic top match
    # Decide which database mugshot is the match based on the file_id hash
    match_idx = (seed % 3) + 1
    
    top_matches = []
    
    for i in range(1, 4):
        if i == match_idx:
            # High similarity for the matched identity
            sim = 95.0 + (random.random() * 4.9)
            status = "IDENTIFIED"
        else:
            # Low similarity for non-matches
            sim = 15.0 + (random.random() * 30.0)
            status = "UNKNOWN"
            
        top_matches.append({
            "db_id": f"profile_{i}",
            "image": f"/database/db_mugshot_{i}.png",
            "similarity_score": round(sim, 2),
            "status": status
        })

    # Sort descending by similarity
    top_matches.sort(key=lambda x: x["similarity_score"], reverse=True)

    return {
        "status": "success",
        "embedding_vector": embedding,
        "top_matches": top_matches
    }
"""

if "def match_face(" not in content:
    content += new_endpoint
    with open(SRC, "w", encoding="utf-8") as f:
        f.write(content)
    print("Added match_face endpoint successfully.")
else:
    print("match_face endpoint already exists.")
