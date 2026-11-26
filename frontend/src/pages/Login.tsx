import { useState } from 'react';
import { 
  Fingerprint, Lock, User, ShieldAlert, Mail, EyeOff, ShieldCheck, 
  Target, Box, Hexagon, ScanFace, Activity, CheckCircle2 
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'sso'>('login');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'sso') return;
    setError('');
    try {
      const payload: any = { username, password };
      if (requires2FA) {
        payload.totp_code = totpCode;
      }
      const res = await api.post('/auth/login', payload);
      login(res.data.access_token);
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.detail === '2FA_REQUIRED') {
        setRequires2FA(true);
      } else {
        setError(err.response?.data?.detail || 'Authentication failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#030614] flex flex-col font-sans text-gray-300 relative overflow-hidden">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="flex-1 grid lg:grid-cols-2 relative z-10">
        
        {/* ========================================================= */}
        {/* LEFT PANEL: BRANDING & FEATURES                           */}
        {/* ========================================================= */}
        <div className="hidden lg:flex flex-col justify-between p-12 pr-6 relative">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-[10px] opacity-30"></div>
              <Hexagon className="w-10 h-10 text-blue-400 relative z-10" strokeWidth={1.5} />
              <div className="absolute inset-0 flex items-center justify-center z-10">
                 <Fingerprint className="w-5 h-5 text-blue-300" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-widest leading-none">
                FORENSIQ
              </h2>
              <div className="text-[8px] text-gray-500 tracking-[0.2em] mt-1 uppercase">AI Forensic Analysis System</div>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="relative z-10 max-w-lg mt-12">
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
              AI-Powered Forensic<br/>
              Intelligence for<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Modern Investigations</span>
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-12 max-w-md">
              Advanced facial analysis, accurate matching, and 3D reconstruction — all in one intelligent platform.
            </p>

            {/* Glowing Face Graphic Mimic */}
            <div className="absolute top-1/2 left-[80%] -translate-y-1/2 w-64 h-64 pointer-events-none opacity-40">
               <div className="absolute inset-0 bg-purple-600/20 blur-[60px] rounded-full"></div>
               <div className="absolute inset-0 bg-blue-600/20 blur-[80px] rounded-full mix-blend-screen"></div>
               <ScanFace className="w-full h-full text-blue-500 absolute" strokeWidth={0.5} />
               {/* Match Found Overlay */}
               <div className="absolute -left-12 top-1/2 -translate-y-1/2 bg-[#080d1e]/80 border border-[#1e293b] p-3 rounded-xl backdrop-blur-sm flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-gray-800"></div>
                  <div>
                    <div className="text-[8px] text-green-400 font-bold uppercase tracking-widest mb-1">MATCH FOUND</div>
                    <div className="text-lg font-bold text-white leading-none">94.6%</div>
                    <div className="text-[6px] text-gray-500 uppercase mt-0.5">Confidence Score</div>
                  </div>
               </div>
            </div>
          </div>

          {/* Feature Columns */}
          <div className="grid grid-cols-4 gap-6 mt-20 relative z-10">
            <FeatureCol icon={ScanFace} title="Smart Detection" desc="Advanced AI detects faces in any condition" />
            <FeatureCol icon={Target} title="Accurate Matching" desc="High precision face matching engine" />
            <FeatureCol icon={Box} title="3D Reconstruction" desc="Detailed 3D model for deep analysis" />
            <FeatureCol icon={ShieldCheck} title="Secure & Reliable" desc="Enterprise grade security & privacy" />
          </div>

          <div className="text-[10px] text-gray-600 mt-12">
            &copy; 2026 FORENSIQ. All rights reserved.
          </div>
        </div>


        {/* ========================================================= */}
        {/* RIGHT PANEL: LOGIN FORM                                   */}
        {/* ========================================================= */}
        <div className="flex flex-col items-center justify-center p-6 lg:p-12 z-10">
          
          <div className="w-full max-w-md bg-[#080d1e]/80 backdrop-blur-md border border-[#1e293b] rounded-[24px] p-8 lg:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            
            {/* Glowing lines top/bottom */}
            <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            
            {/* Form Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-600/20 blur-[20px] rounded-full"></div>
                <div className="w-14 h-14 rounded-full border border-[#1e293b] flex items-center justify-center relative z-10 bg-[#050812]">
                   <ShieldCheck className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
              <p className="text-sm text-gray-400">Sign in to continue to FORENSIQ</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#1e293b] mb-6">
              <button 
                onClick={() => setActiveTab('login')}
                className={`flex-1 pb-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'login' ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <User className="w-4 h-4" /> Login
                {activeTab === 'login' && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-purple-500 rounded-t-full"></div>}
              </button>
              <button 
                onClick={() => setActiveTab('sso')}
                className={`flex-1 pb-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'sso' ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <ShieldCheck className="w-4 h-4" /> SSO Login
                {activeTab === 'sso' && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-purple-500 rounded-t-full"></div>}
              </button>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-xs text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              
              {!requires2FA ? (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-2">Username or Email</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Enter your username or email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-[#050812] border border-[#1e293b] rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#050812] border border-[#1e293b] rounded-xl py-3 pl-11 pr-11 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                        required
                      />
                      <EyeOff className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-300" />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-2 text-center text-purple-400">TWO-FACTOR AUTHENTICATION</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="000000"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      maxLength={6}
                      className="w-full bg-[#050812] border border-purple-500/50 rounded-xl py-3 px-4 text-white text-center tracking-[0.5em] font-mono text-xl focus:outline-none focus:border-purple-400 transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4 h-4 rounded bg-[#050812] border border-purple-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-sm bg-purple-400"></div>
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
                </label>
                <a href="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Forgot Password?</a>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] mt-2 flex items-center justify-center gap-2"
              >
                {requires2FA ? 'Verify 2FA' : 'Sign In'} <span className="font-normal">&rarr;</span>
              </button>
            </form>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-[#1e293b]"></div>
              <span className="text-[10px] text-gray-500">or continue with</span>
              <div className="flex-1 h-[1px] bg-[#1e293b]"></div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <SSOBtn icon={<span className="font-bold text-white">G</span>} label="Google" />
              <SSOBtn icon={<span className="font-bold text-white">M</span>} label="Microsoft" />
              <SSOBtn icon={<ShieldCheck className="w-3.5 h-3.5 text-purple-400" />} label="SAML SSO" />
            </div>

            <div className="mt-8 pt-6 border-t border-[#1e293b] flex flex-col items-center justify-center gap-4">
               <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400">
                  Don't have an account? <Link to="/register" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">Sign up</Link>
               </div>
               <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500">
                 <Lock className="w-3 h-3" /> Your data is protected with end-to-end encryption
               </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM FOOTER BAR                                         */}
      {/* ========================================================= */}
      <footer className="h-20 bg-[#050812] border-t border-[#1e293b]/50 relative z-20 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 text-gray-400">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-purple-500/30 bg-purple-900/20 flex items-center justify-center">
             <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-white">Trusted by Law Enforcement</div>
            <div className="text-[9px] text-gray-500">Agencies Worldwide</div>
          </div>
        </div>

        <div className="flex items-center gap-8 md:gap-16">
           <FooterStat icon={Box} val="1M+" label="Cases Analyzed" />
           <FooterStat icon={ScanFace} val="500K+" label="Matches Found" />
           <FooterStat icon={Target} val="99.2%" label="Accuracy Rate" />
           <FooterStat icon={CheckCircle2} val="24/7" label="System Uptime" />
        </div>
        
      </footer>

    </div>
  );
}

// Subcomponents

function FeatureCol({ icon: Icon, title, desc }: any) {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-10 h-10 rounded-xl border border-purple-500/30 bg-[#080d1e] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-purple-600/10"></div>
        <Icon className="w-5 h-5 text-purple-400 relative z-10" />
      </div>
      <h4 className="text-xs font-bold text-white mt-1">{title}</h4>
      <p className="text-[10px] text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function SSOBtn({ icon, label }: any) {
  return (
    <button type="button" className="flex items-center justify-center gap-2 py-2.5 bg-[#050812] border border-[#1e293b] hover:bg-[#1e293b]/50 rounded-lg transition-colors">
      {icon}
      <span className="text-[11px] font-bold text-gray-300">{label}</span>
    </button>
  );
}

function FooterStat({ icon: Icon, val, label }: any) {
  return (
    <div className="flex items-center gap-3">
       <Icon className="w-6 h-6 text-purple-500/50" strokeWidth={1.5} />
       <div>
         <div className="text-sm font-bold text-white leading-none mb-0.5">{val}</div>
         <div className="text-[9px] text-gray-500">{label}</div>
       </div>
    </div>
  );
}
