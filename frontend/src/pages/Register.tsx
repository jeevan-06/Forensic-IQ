import { useState } from 'react';
import { 
  UserPlus, User, Lock, Mail, ShieldCheck, Box, 
  ScanFace, ChevronDown, Check, Building2, Phone, Hexagon,
  FileText, Cloud, Users, FileStack, Target
} from 'lucide-react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [org, setOrg] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!agreed) {
      setError('You must agree to the Terms of Service');
      return;
    }

    try {
      // Sending basic auth fields, other fields exist for UI completeness
      await api.post('/auth/register', { username, email, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#030614] flex flex-col font-sans text-gray-300 relative overflow-hidden">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="flex-1 grid lg:grid-cols-2 relative z-10 p-6 lg:p-12 gap-8">
        
        {/* ========================================================= */}
        {/* LEFT PANEL: BRANDING & FEATURES                           */}
        {/* ========================================================= */}
        <div className="hidden lg:flex flex-col justify-between bg-[#080d1e]/80 border border-[#1e293b] rounded-[24px] p-10 relative overflow-hidden">
          
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-[10px] opacity-30"></div>
                <Hexagon className="w-10 h-10 text-blue-400 relative z-10" strokeWidth={1.5} />
                <div className="absolute inset-0 flex items-center justify-center z-10">
                   <div className="w-4 h-4 rounded-full border-2 border-blue-300/50 flex items-center justify-center">
                     <div className="w-1.5 h-1.5 bg-blue-300 rounded-full"></div>
                   </div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-widest leading-none">
                  FORENSIQ
                </h2>
                <div className="text-[8px] text-gray-500 tracking-[0.2em] mt-1 uppercase">AI Forensic Analysis System</div>
              </div>
            </div>

            {/* Main Hero Content */}
            <div className="max-w-md">
              <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                Create Your Account<br/>
                Join the Future of<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Forensic Intelligence</span>
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed mb-12 max-w-sm">
                Register now and unlock the power of AI-driven forensic analysis for smarter investigations.
              </p>
            </div>
            
            {/* Feature List */}
            <div className="flex flex-col gap-6 max-w-xs relative z-10">
               <FeatureBlock icon={ScanFace} color="text-purple-400" title="AI-Powered Face Analysis" desc="High accuracy detection and matching" />
               <FeatureBlock icon={Box} color="text-blue-400" title="3D Reconstruction" desc="Detailed 3D modeling for deep analysis" />
               <FeatureBlock icon={ShieldCheck} color="text-green-400" title="Secure & Reliable" desc="Enterprise-grade security for your data" />
            </div>
          </div>

          {/* Glowing Face Graphic Mimic */}
          <div className="absolute top-[40%] right-10 -translate-y-1/2 w-80 h-80 pointer-events-none opacity-60">
             <div className="absolute inset-0 bg-purple-600/30 blur-[80px] rounded-full"></div>
             <div className="absolute inset-0 bg-blue-600/30 blur-[100px] rounded-full mix-blend-screen"></div>
             <ScanFace className="w-full h-full text-blue-500 absolute" strokeWidth={0.5} />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/images/dots.png')] bg-cover opacity-30 mix-blend-screen"></div>
          </div>

          <div className="relative z-10 mt-12 space-y-6">
            {/* Inline Stats */}
            <div className="flex items-center gap-6 pb-6 border-b border-[#1e293b]/50">
               <StatItem icon={Database} val="1M+" label="Cases Analyzed" color="text-purple-400" />
               <StatItem icon={User} val="500K+" label="Matches Found" color="text-green-400" />
               <StatItem icon={Target} val="99.2%" label="Accuracy Rate" color="text-blue-400" />
               <StatItem icon={ShieldCheck} val="24/7" label="System Uptime" color="text-yellow-400" />
            </div>

            {/* Testimonial & Trust Badge */}
            <div className="bg-[#050812]/50 border border-[#1e293b]/50 rounded-xl p-6 flex flex-col gap-4">
              <div className="flex items-start gap-4">
                 <div className="text-4xl text-purple-500 font-serif leading-none opacity-50">"</div>
                 <p className="text-[11px] text-gray-300 italic leading-relaxed pt-2">
                   "FORENSIQ has transformed the way investigations are conducted. The accuracy and insights are unmatched."
                 </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-[#1e293b]/30">
                 <div className="w-8 h-8 rounded-full border border-purple-500/30 bg-purple-900/20 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                 </div>
                 <div>
                   <div className="text-[10px] font-bold text-white">Trusted by Law Enforcement</div>
                   <div className="text-[9px] text-gray-500">Agencies Worldwide</div>
                 </div>
              </div>
            </div>
          </div>
        </div>


        {/* ========================================================= */}
        {/* RIGHT PANEL: REGISTRATION FORM                            */}
        {/* ========================================================= */}
        <div className="flex flex-col items-center justify-center z-10">
          
          <div className="w-full max-w-2xl bg-[#080d1e]/80 backdrop-blur-md border border-[#1e293b] rounded-[24px] p-8 lg:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            
            {/* Form Header */}
            <div className="flex flex-col items-center mb-10">
              <div className="w-14 h-14 rounded-full border border-purple-500/30 bg-purple-900/10 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(147,51,234,0.2)]">
                 <UserPlus className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Create an Account</h2>
              <p className="text-sm text-gray-400">Fill in your details to get started with <span className="text-purple-400 font-bold">FORENSIQ</span></p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-xs text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" placeholder="Enter your full name" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-[#050812] border border-[#1e293b] rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" placeholder="Choose a username" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#050812] border border-[#1e293b] rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors" required />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="email" placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#050812] border border-[#1e293b] rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="password" placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#050812] border border-[#1e293b] rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors" required />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="password" placeholder="Confirm your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-[#050812] border border-[#1e293b] rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors" required />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-2">Organization / Department</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Enter your organization" value={org} onChange={e => setOrg(e.target.value)} className="w-full bg-[#050812] border border-[#1e293b] rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-2">Role</label>
                  <div className="relative">
                    <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-[#050812] border border-[#1e293b] rounded-xl py-3 pl-4 pr-11 text-sm text-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors appearance-none">
                      <option value="" disabled>Select your role</option>
                      <option value="investigator">Lead Investigator</option>
                      <option value="analyst">Forensic Analyst</option>
                      <option value="admin">System Admin</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-2">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="tel" placeholder="Enter your phone number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-[#050812] border border-[#1e293b] rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${agreed ? 'bg-purple-600 border-purple-500' : 'bg-[#050812] border-[#1e293b] group-hover:border-purple-500/50'}`} onClick={() => setAgreed(!agreed)}>
                    {agreed && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-[11px] text-gray-400" onClick={() => setAgreed(!agreed)}>
                    I agree to the <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Terms of Service</a> and <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Privacy Policy</a>
                  </span>
                </label>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] mt-2 flex items-center justify-center gap-2"
              >
                Create Account <span className="font-normal">&rarr;</span>
              </button>
            </form>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-[#1e293b]"></div>
              <span className="text-[10px] text-gray-500">or register with</span>
              <div className="flex-1 h-[1px] bg-[#1e293b]"></div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <SSOBtn icon={<span className="font-bold text-white">G</span>} label="Google" />
              <SSOBtn icon={<span className="font-bold text-white">M</span>} label="Microsoft" />
              <SSOBtn icon={<ShieldCheck className="w-3.5 h-3.5 text-purple-400" />} label="SAML SSO" />
            </div>

            <div className="mt-8 pt-6 flex items-center justify-center gap-1 text-[11px] text-gray-400">
               Already have an account? <Link to="/login" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">Sign in</Link>
            </div>
            
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM FOOTER BAR                                         */}
      {/* ========================================================= */}
      <footer className="bg-[#050812] border-t border-[#1e293b]/50 relative z-20 flex justify-center py-6">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 px-6 max-w-6xl w-full">
           <FooterFeature icon={Lock} title="End-to-End Encryption" desc="Your data is protected with military-grade encryption" />
           <FooterFeature icon={Cloud} title="Secure Cloud Storage" desc="Reliable and encrypted cloud infrastructure" />
           <FooterFeature icon={Users} title="Role-Based Access" desc="Granular access control for your team" />
           <FooterFeature icon={FileStack} title="Audit & Logs" desc="Complete activity logs for accountability" />
        </div>
      </footer>

    </div>
  );
}

// Subcomponents

function FeatureBlock({ icon: Icon, color, title, desc }: any) {
  return (
    <div className="flex items-start gap-3 bg-[#050812]/50 border border-[#1e293b]/50 p-3 rounded-xl backdrop-blur-sm">
      <div className={`w-8 h-8 rounded border border-gray-700 bg-gray-800 flex items-center justify-center flex-shrink-0 ${color.replace('text-', 'bg-').replace('400', '900/20')}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <h4 className="text-[11px] font-bold text-white leading-tight mb-1">{title}</h4>
        <p className="text-[9px] text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, val, label, color }: any) {
  return (
    <div className="flex flex-col gap-1 items-center">
       <div className="flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${color}`} />
          <span className="text-sm font-bold text-white">{val}</span>
       </div>
       <div className="text-[8px] text-gray-500 tracking-wider uppercase">{label}</div>
    </div>
  );
}

function SSOBtn({ icon, label }: any) {
  return (
    <button type="button" className="flex items-center justify-center gap-2 py-2.5 bg-[#050812] border border-[#1e293b] hover:bg-[#1e293b]/50 rounded-lg transition-colors">
      {icon}
      <span className="text-[10px] font-bold text-gray-300">{label}</span>
    </button>
  );
}

function FooterFeature({ icon: Icon, title, desc }: any) {
  return (
    <div className="flex items-center gap-3 max-w-[220px]">
       <div className="w-10 h-10 rounded-full border border-purple-500/30 bg-[#080d1e] flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-purple-400" />
       </div>
       <div>
         <div className="text-[10px] font-bold text-white leading-none mb-1">{title}</div>
         <div className="text-[8px] text-gray-500 leading-relaxed">{desc}</div>
       </div>
    </div>
  );
}

// Adding a dummy Database icon component since it was missing in the earlier lucide imports
function Database(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}
