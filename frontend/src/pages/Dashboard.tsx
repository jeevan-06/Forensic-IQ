import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Search, Bell, Calendar, Settings, LogOut, Menu, ChevronDown, 
  Plus, FolderOpen, ScanFace, FileText, Image, Box, CheckCircle2, 
  Target, UploadCloud, UserCheck, Zap, Activity, ShieldCheck,
  Server, PieChart, Database, TrendingUp, Cpu, MonitorPlay, BarChart, ChevronRight
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import UploadZone from '../components/UploadZone';
import AnalysisScanner from '../components/AnalysisScanner';
import DatabaseManagement from './DatabaseManagement';
import Investigator from './Investigator';
import SettingsView from './SettingsView';
import AnalyticsView from './AnalyticsView';

export default function Dashboard() {
  const logout = useAuthStore((state) => state.logout);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api.get('/auth/me').then(res => setUser(res.data)).catch(console.error);
  }, []);

  return (
    <div className="h-screen w-full bg-[#030614] flex font-sans overflow-hidden text-gray-300">
      <Sidebar />

      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#030614]">
        
        {/* Top Header */}
        <header className="h-16 border-b border-[#1e293b]/50 bg-[#030614] flex items-center justify-between px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
             <div className="relative w-[480px]">
               <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
               <input 
                 type="text" 
                 placeholder="Search Cases, Suspects, Reports..." 
                 className="w-full bg-[#080d1e] border border-[#1e293b] rounded-xl pl-12 pr-12 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-colors shadow-inner" 
               />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-mono text-gray-600 bg-[#111827] px-2 py-0.5 rounded border border-gray-800">Ctrl /</div>
             </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-5">
               <div className="relative">
                 <Bell className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                 <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-purple-600 rounded-full text-[8px] font-bold text-white flex items-center justify-center border border-[#030614]">12</span>
               </div>
               <Calendar className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer transition-colors" />
               <Settings className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
            
            <div className="flex items-center gap-3 border-l border-[#1e293b] pl-8 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700">
                <img src="https://i.pravatar.cc/150?u=admin" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-[11px] font-bold text-white leading-tight group-hover:text-purple-400 transition-colors">Investigator</p>
                <div className="flex items-center gap-1">
                   <p className="text-[9px] text-gray-500">Admin</p>
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]"></div>
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-500 ml-2" />
            </div>
            
            <button 
              onClick={logout} 
              className="ml-4 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative custom-scrollbar">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/upload" element={<UploadView />} />
            <Route path="/analysis/:fileId" element={<AnalysisScanner />} />
            <Route path="/database" element={<DatabaseManagement />} />
            <Route path="/investigator" element={<Investigator />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/analytics" element={<AnalyticsView />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function HomeView() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-[1800px] mx-auto">
      
      {/* Top Grid: Hero & Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* HERO SECTION */}
        <div className="xl:col-span-8 bg-[#030614] border border-[#1e293b]/80 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[420px] shadow-[0_0_60px_rgba(0,0,0,0.8)]">

          {/* === CINEMATIC BACKGROUND LAYERS === */}

          {/* Deep space gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#050c20] via-[#030614] to-[#08001a] pointer-events-none"></div>

          {/* Animated grid scanlines */}
          <div className="absolute inset-0 pointer-events-none opacity-20"
            style={{backgroundImage:'linear-gradient(rgba(99,102,241,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.15) 1px,transparent 1px)', backgroundSize:'40px 40px'}}>
          </div>

          {/* Horizontal scan beam */}
          <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent pointer-events-none"
            style={{animation:'scanline 4s linear infinite', top:'30%'}}>
          </div>

          {/* Central pulsing radar orb */}
          <div className="absolute left-[48%] top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            {/* Outer pulse rings */}
            <div className="absolute inset-0 -m-32 w-64 h-64 rounded-full border border-blue-500/10 animate-[ping_3s_ease-out_infinite]"></div>
            <div className="absolute inset-0 -m-24 w-48 h-48 rounded-full border border-purple-500/15 animate-[ping_3s_ease-out_infinite_0.5s]"></div>
            <div className="absolute inset-0 -m-16 w-32 h-32 rounded-full border border-blue-400/20 animate-[ping_3s_ease-out_infinite_1s]"></div>
            {/* Slow rotating rings */}
            <div className="absolute -m-20 w-40 h-40 rounded-full border border-blue-500/30" style={{animation:'spin 12s linear infinite'}}></div>
            <div className="absolute -m-14 w-28 h-28 rounded-full border border-purple-500/40 border-dashed" style={{animation:'spin 8s linear infinite reverse'}}></div>
            {/* Core glow */}
            <div className="w-0 h-0">
              <div className="absolute -m-10 w-20 h-20 bg-blue-600/20 rounded-full blur-[20px]"></div>
              <div className="absolute -m-6 w-12 h-12 bg-purple-600/30 rounded-full blur-[10px]"></div>
              <div className="absolute -m-2 w-4 h-4 bg-blue-300/80 rounded-full shadow-[0_0_20px_8px_rgba(147,197,253,0.4)]"></div>
            </div>
            {/* Scanning face silhouette */}
            <div className="absolute" style={{left:'-80px',top:'-90px'}}>
              <ScanFace className="w-44 h-44 text-blue-500/20" strokeWidth={0.8} />
              {/* Face scan lines */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-blue-400/40" style={{animation:'facescan 2s ease-in-out infinite', boxShadow:'0 0 8px 2px rgba(96,165,250,0.5)'}}></div>
            </div>
          </div>

          {/* Floating data particles */}
          {[
            {left:'15%',top:'20%',delay:'0s',size:'w-1 h-1',color:'bg-blue-400'},
            {left:'80%',top:'30%',delay:'0.5s',size:'w-1.5 h-1.5',color:'bg-purple-400'},
            {left:'25%',top:'75%',delay:'1s',size:'w-1 h-1',color:'bg-cyan-400'},
            {left:'70%',top:'70%',delay:'1.5s',size:'w-1 h-1',color:'bg-blue-300'},
            {left:'55%',top:'15%',delay:'2s',size:'w-1 h-1',color:'bg-indigo-400'},
          ].map((p,i) => (
            <div key={i} className={`absolute ${p.size} ${p.color} rounded-full opacity-70 pointer-events-none`}
              style={{left:p.left,top:p.top,animation:`float 3s ease-in-out infinite`,animationDelay:p.delay,
              boxShadow:`0 0 6px 2px currentColor`}}>
            </div>
          ))}

          {/* TOP STATUS BAR */}
          <div className="relative z-10 flex items-center justify-between px-8 pt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" style={{animation:'pulse 2s infinite'}}></div>
              <span className="text-[10px] text-green-400 font-bold tracking-[0.2em] uppercase">System Online — All Nodes Active</span>
            </div>
            <div className="text-[10px] text-gray-600 font-mono tracking-widest">FORENSIQ v3.1 // SECURE CHANNEL</div>
          </div>

          {/* MAIN HERO CONTENT */}
          <div className="relative z-10 px-8 pb-6 max-w-[420px]">
            {/* Eyebrow label */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-[1px] w-8 bg-gradient-to-r from-purple-500 to-transparent"></div>
              <span className="text-[9px] text-purple-400 font-bold tracking-[0.3em] uppercase">AI Forensic Platform</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-[1.1]">
              AI-Powered<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400"
                style={{filter:'drop-shadow(0 0 20px rgba(99,102,241,0.5))'}}>
                Forensic<br/>Intelligence
              </span>
            </h1>

            <p className="text-gray-400 text-[11px] mb-8 leading-relaxed max-w-sm">
              Next-gen facial analysis, precision matching, and 3D reconstruction
              for smarter, faster criminal investigations.
            </p>

            <div className="flex gap-3 mb-10">
              <button onClick={() => navigate('/upload')}
                className="group relative bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[11px] font-bold py-3 px-7 rounded-xl flex items-center gap-2 transition-all overflow-hidden"
                style={{boxShadow:'0 0 30px rgba(147,51,234,0.5)'}}>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"></div>
                <Plus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">New Investigation</span>
              </button>
              <button className="bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-900/10 text-gray-300 text-[11px] font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all">
                <FolderOpen className="w-4 h-4" /> View Cases
              </button>
            </div>

            {/* Live Stats Row */}
            <div className="flex gap-6">
              {[
                {icon:ScanFace,val:'32',label:'Active Cases',color:'text-blue-400',bg:'bg-blue-500/10',border:'border-blue-500/20'},
                {icon:UserCheck,val:'156',label:'Suspects',color:'text-purple-400',bg:'bg-purple-500/10',border:'border-purple-500/20'},
                {icon:Target,val:'94.6%',label:'Accuracy',color:'text-green-400',bg:'bg-green-500/10',border:'border-green-500/20'},
              ].map((s,i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${s.bg} border ${s.border} flex items-center justify-center`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${s.color} leading-none`}>{s.val}</div>
                    <div className="text-[8px] text-gray-600 mt-0.5 uppercase tracking-wider">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* === ANIMATED PIPELINE NODES (right side) === */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10 hidden lg:flex">
            {[
              {icon:ScanFace, color:'text-green-400', glow:'shadow-[0_0_12px_rgba(74,222,128,0.4)]', border:'border-green-400/40', bg:'bg-green-400/10', title:'DETECT', desc:'Locate faces in frames', delay:'0ms'},
              {icon:Zap, color:'text-blue-400', glow:'shadow-[0_0_12px_rgba(96,165,250,0.4)]', border:'border-blue-400/40', bg:'bg-blue-400/10', title:'ENHANCE', desc:'Improve quality & clarity', delay:'150ms'},
              {icon:Activity, color:'text-purple-400', glow:'shadow-[0_0_12px_rgba(192,132,252,0.4)]', border:'border-purple-400/40', bg:'bg-purple-400/10', title:'ANALYZE', desc:'Extract facial geometry', delay:'300ms'},
              {icon:Target, color:'text-orange-400', glow:'shadow-[0_0_12px_rgba(251,146,60,0.4)]', border:'border-orange-400/40', bg:'bg-orange-400/10', title:'MATCH', desc:'Find database matches', delay:'450ms'},
              {icon:Box, color:'text-teal-400', glow:'shadow-[0_0_12px_rgba(45,212,191,0.4)]', border:'border-teal-400/40', bg:'bg-teal-400/10', title:'RECONSTRUCT', desc:'Generate 3D model', delay:'600ms'},
              {icon:FileText, color:'text-yellow-400', glow:'shadow-[0_0_12px_rgba(250,204,21,0.4)]', border:'border-yellow-400/40', bg:'bg-yellow-400/10', title:'REPORT', desc:'Generate forensic report', delay:'750ms'},
            ].map((node, i) => (
              <div key={i} className="flex items-center gap-3 group cursor-default">
                {/* Connector line */}
                {i < 5 && (
                  <div className="absolute right-14 flex flex-col items-center" style={{top:`calc(50% - 90px + ${i * 54 + 27}px)`}}>
                    <div className={`w-[1px] h-[54px] bg-gradient-to-b ${i % 2 === 0 ? 'from-gray-700/50 to-gray-700/20' : 'from-gray-700/20 to-gray-700/50'}`}></div>
                  </div>
                )}
                <div className={`w-8 h-8 rounded-lg ${node.bg} border ${node.border} flex items-center justify-center transition-all group-hover:scale-110 ${node.glow} flex-shrink-0`}
                  style={{animation:`pulse 3s ease-in-out infinite`, animationDelay:node.delay}}>
                  <node.icon className={`w-4 h-4 ${node.color}`} />
                </div>
                <div>
                  <div className={`text-[10px] font-black ${node.color} tracking-[0.15em] group-hover:tracking-[0.25em] transition-all`}>{node.title}</div>
                  <div className="text-[8px] text-gray-500 group-hover:text-gray-400 transition-colors">{node.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom accent bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent pointer-events-none"></div>
        </div>
        {/* OVERVIEW SECTION */}
        <div className="xl:col-span-4 bg-[#080d1e] border border-[#1e293b]/50 rounded-2xl p-6 flex flex-col shadow-lg">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">OVERVIEW</h3>
             <div className="flex items-center gap-1 text-[10px] text-gray-400 cursor-pointer">This Week <ChevronDown className="w-3 h-3"/></div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
             <OverviewCard icon={MonitorPlay} val="32" label="Cases Analyzed" color="text-purple-400" />
             <OverviewCard icon={ScanFace} val="156" label="Faces Detected" color="text-blue-400" />
             <OverviewCard icon={Target} val="48" label="Matches Found" color="text-green-400" />
             <OverviewCard icon={FileText} val="12" label="Reports Generated" color="text-pink-400" />
             <OverviewCard icon={PieChart} val="94.6%" label="Avg. Accuracy" color="text-blue-400" isPercent />
             <OverviewCard icon={Activity} val="98.2%" label="System Uptime" color="text-green-400" isPercent />
          </div>

          <div className="flex-1 border border-[#1e293b]/50 rounded-xl relative overflow-hidden bg-[#050812] flex items-end pt-4">
             <div className="absolute top-2 right-4 text-[9px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">94.6%</div>
             <svg className="w-full h-24" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333ea" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,40 L0,20 L10,25 L20,15 L30,18 L40,10 L50,15 L60,8 L70,12 L80,5 L90,10 L100,2 L100,40 Z" fill="url(#chartGrad)" />
                <polyline points="0,20 10,25 20,15 30,18 40,10 50,15 60,8 70,12 80,5 90,10 100,2" fill="none" stroke="#a855f7" strokeWidth="1" />
                {/* Dots */}
                <circle cx="20" cy="15" r="1.5" fill="#fff" className="animate-pulse" />
                <circle cx="40" cy="10" r="1.5" fill="#fff" className="animate-pulse" />
                <circle cx="60" cy="8" r="1.5" fill="#fff" className="animate-pulse" />
                <circle cx="80" cy="5" r="1.5" fill="#fff" className="animate-pulse" />
             </svg>
             <div className="absolute bottom-1 left-0 right-0 flex justify-between px-4 text-[7px] text-gray-500 font-mono">
               <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
             </div>
          </div>
        </div>
      </div>

      {/* Investigation Workflow Horizontal Stepper */}
      <div className="bg-[#080d1e] border border-[#1e293b]/50 rounded-2xl p-6 shadow-lg">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">INVESTIGATION WORKFLOW</h3>
        <div className="flex items-center justify-between px-4">
           <WorkflowStep icon={UploadCloud} title="Upload Video" sub="Input CCTV Footage" color="text-purple-400" glow="shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
           <WorkflowLine />
           <WorkflowStep icon={ScanFace} title="Detect Faces" sub="AI Detection" color="text-green-400" glow="shadow-[0_0_15px_rgba(74,222,128,0.4)]" />
           <WorkflowLine />
           <WorkflowStep icon={Image} title="Enhance Quality" sub="Improve Clarity" color="text-blue-400" glow="shadow-[0_0_15px_rgba(96,165,250,0.4)]" />
           <WorkflowLine />
           <WorkflowStep icon={Activity} title="Analyze Geometry" sub="Facial Measurements" color="text-pink-400" glow="shadow-[0_0_15px_rgba(244,114,182,0.4)]" />
           <WorkflowLine />
           <WorkflowStep icon={Target} title="Match Database" sub="Find Best Matches" color="text-orange-400" glow="shadow-[0_0_15px_rgba(251,146,60,0.4)]" />
           <WorkflowLine />
           <WorkflowStep icon={Box} title="3D Reconstruction" sub="Generate 3D Model" color="text-teal-400" glow="shadow-[0_0_15px_rgba(45,212,191,0.4)]" />
           <WorkflowLine />
           <WorkflowStep icon={FileText} title="Generate Report" sub="Export Results" color="text-yellow-400" glow="shadow-[0_0_15px_rgba(250,204,21,0.4)]" />
        </div>
      </div>

      {/* Middle Grid: Tables & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Recent Cases Table */}
        <div className="xl:col-span-5 bg-[#080d1e] border border-[#1e293b]/50 rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">RECENT CASES</h3>
             <span className="text-[9px] text-purple-400 hover:text-purple-300 cursor-pointer">View All Cases</span>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[8px] text-gray-500 uppercase tracking-widest border-b border-gray-800">
                <th className="pb-3 font-medium">CASE ID</th>
                <th className="pb-3 font-medium">TITLE</th>
                <th className="pb-3 font-medium">DATE</th>
                <th className="pb-3 font-medium">STATUS</th>
                <th className="pb-3 font-medium text-right">PROGRESS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <CaseRow id="CASE-4587-FR" title="City Center Investigation" date="16 May 2024" status="Completed" prog={100} />
              <CaseRow id="CASE-4586-FR" title="Mall Surveillance Analysis" date="15 May 2024" status="In Progress" prog={75} />
              <CaseRow id="CASE-4585-FR" title="Highway CCTV Footage" date="14 May 2024" status="Completed" prog={100} />
              <CaseRow id="CASE-4584-FR" title="Bank Security Analysis" date="13 May 2024" status="In Progress" prog={60} />
              <CaseRow id="CASE-4583-FR" title="Parking Lot Investigation" date="12 May 2024" status="Completed" prog={100} />
            </tbody>
          </table>
        </div>

        {/* Top Matches */}
        <div className="xl:col-span-3 bg-[#080d1e] border border-[#1e293b]/50 rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">TOP MATCHES</h3>
             <span className="text-[9px] text-purple-400 hover:text-purple-300 cursor-pointer">View All</span>
          </div>
          <div className="space-y-4">
             <MatchRow rank={1} img="1" id="DB_4587" name="David John" score={94.6} color="bg-green-500" rankBg="bg-green-500" />
             <MatchRow rank={2} img="2" id="DB_2156" name="Michael Lee" score={89.3} color="bg-blue-500" rankBg="bg-purple-500" />
             <MatchRow rank={3} img="3" id="DB_8741" name="Daniel Kim" score={81.7} color="bg-orange-500" rankBg="bg-orange-500" />
             <MatchRow rank={4} img="4" id="DB_6589" name="James Park" score={78.4} color="bg-red-500" rankBg="bg-blue-600" />
          </div>
        </div>

        {/* Quick Actions & AI Engine */}
        <div className="xl:col-span-4 flex flex-col gap-4">
           <div className="bg-[#080d1e] border border-[#1e293b]/50 rounded-2xl p-6 shadow-lg flex-1">
             <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">QUICK ACTIONS</h3>
             <div className="grid grid-cols-2 gap-3">
                <ActionBtn icon={Plus} label="New Investigation" />
                <ActionBtn icon={UploadCloud} label="Upload Video" />
                <ActionBtn icon={Search} label="Search Database" />
                <ActionBtn icon={FileText} label="View Reports" />
                <ActionBtn icon={Plus} label="Add Case" />
                <ActionBtn icon={Server} label="System Logs" />
             </div>
           </div>
           
           {/* AI Engine */}
           <div className="bg-gradient-to-br from-purple-900/30 to-[#080d1e] border border-purple-500/30 rounded-2xl p-6 shadow-lg relative overflow-hidden flex items-center justify-between">
              <div className="relative z-10">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">AI ENGINE</h3>
                <h2 className="text-sm font-bold text-purple-300 mb-2">Active & Learning</h2>
                <p className="text-[9px] text-gray-400 max-w-[150px] mb-3">Continuously improving accuracy and detection capabilities.</p>
                <button className="text-[9px] border border-purple-500/50 hover:bg-purple-500/20 text-purple-300 px-3 py-1 rounded transition-colors">
                  View Analytics <ChevronRight className="w-3 h-3 inline" />
                </button>
              </div>
              <Cpu className="w-24 h-24 text-purple-500/20 absolute -right-4 top-1/2 -translate-y-1/2" strokeWidth={1} />
           </div>
        </div>

      </div>

      {/* Bottom Data Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
         <DataCard icon={Database} title="DATABASE OVERVIEW" val="24,568" sub="Total Records" trend="+156" trendText="Added This Week" color="text-purple-500" />
         
         <div className="bg-[#080d1e] border border-[#1e293b]/50 rounded-2xl p-5 shadow-lg flex justify-between items-center">
            <div>
              <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">MATCH ACCURACY</h3>
               <div className="space-y-1 text-[8px]">
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-sm"></div><span className="text-gray-400 w-24">High Confidence</span><span className="text-white">94.6%</span></div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-sm"></div><span className="text-gray-400 w-24">Medium Confidence</span><span className="text-white">4.2%</span></div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-sm"></div><span className="text-gray-400 w-24">Low Confidence</span><span className="text-white">1.2%</span></div>
               </div>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 36 36">
                 <path className="text-gray-800" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                 <path className="text-blue-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" strokeDasharray="94.6, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
               </svg>
               <span className="text-[10px] font-bold text-white relative z-10">94.6%</span>
            </div>
         </div>

         <DataCard icon={Box} title="3D MODELS GENERATED" val="1,248" sub="Total Models" trend="+32" trendText="This Week" color="text-teal-400" />
         <DataCard icon={FileText} title="REPORTS GENERATED" val="568" sub="Total Reports" trend="+18" trendText="This Week" color="text-pink-400" />
         
         <div className="bg-[#080d1e] border border-[#1e293b]/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">SYSTEM PERFORMANCE</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                 <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 36 36">
                   <path className="text-gray-800" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                   <path className="text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]" strokeDasharray="98.2, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                 </svg>
                 <div className="text-center relative z-10">
                    <div className="text-[9px] font-bold text-white leading-none mt-1">98.2%</div>
                    <div className="text-[5px] text-green-400">Healthy</div>
                 </div>
              </div>
              <div className="flex-1 h-8">
                 <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <polyline points="0,15 10,12 20,18 30,8 40,10 50,4 60,12 70,2 80,8 90,5 100,10" fill="none" stroke="#22c55e" strokeWidth="1.5" className="drop-shadow-[0_0_3px_rgba(34,197,94,0.8)]" />
                 </svg>
              </div>
            </div>
         </div>

      </div>

    </div>
  );
}

// Subcomponents

function FeatureNode({ icon: Icon, color, bg, border, title, desc }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full ${bg} border ${border} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <div className="text-[10px] font-bold text-white uppercase">{title}</div>
        <div className="text-[8px] text-gray-500">{desc}</div>
      </div>
    </div>
  );
}

function OverviewCard({ icon: Icon, val, label, color, isPercent }: any) {
  return (
    <div className="bg-[#050812] border border-[#1e293b] rounded-xl p-3 flex flex-col items-center justify-center text-center">
       <Icon className={`w-4 h-4 ${color} mb-2`} />
       <div className={`text-lg font-bold text-white leading-none mb-1 ${isPercent ? color : ''}`}>{val}</div>
       <div className="text-[8px] text-gray-500 uppercase">{label}</div>
    </div>
  );
}

function WorkflowStep({ icon: Icon, title, sub, color, glow }: any) {
  return (
    <div className="flex flex-col items-center gap-2 z-10 bg-[#080d1e] px-2">
       <div className={`w-10 h-10 rounded-full border border-gray-700 bg-[#050812] flex items-center justify-center ${glow}`}>
          <Icon className={`w-4 h-4 ${color}`} />
       </div>
       <div className="text-center">
          <div className="text-[9px] font-bold text-white mb-0.5">{title}</div>
          <div className="text-[8px] text-gray-500">{sub}</div>
       </div>
    </div>
  );
}

function WorkflowLine() {
  return <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#1e293b] to-transparent -translate-y-4"></div>;
}

function CaseRow({ id, title, date, status, prog }: any) {
  const isCompleted = status === 'Completed';
  return (
    <tr className="text-[10px] hover:bg-white/5 transition-colors group cursor-pointer">
      <td className="py-2.5 flex items-center gap-2 text-gray-400 group-hover:text-white"><FileText className="w-3 h-3"/> {id}</td>
      <td className="py-2.5 text-gray-300">{title}</td>
      <td className="py-2.5 text-gray-500">{date}</td>
      <td className="py-2.5">
         <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${isCompleted ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-400'}`}>
           {status}
         </span>
      </td>
      <td className="py-2.5 flex items-center justify-end gap-2">
         <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-blue-400'}`} style={{ width: `${prog}%` }}></div>
         </div>
         <span className="text-[9px] text-gray-400 w-6 text-right">{prog}%</span>
      </td>
    </tr>
  );
}

function MatchRow({ rank, img, id, name, score, color, rankBg }: any) {
  return (
    <div className="flex items-center gap-3">
       <div className={`w-4 h-4 rounded text-[8px] font-bold flex items-center justify-center text-white ${rankBg}`}>{rank}</div>
       <div className="w-8 h-8 rounded bg-gray-800 overflow-hidden border border-gray-700">
         <img src={`https://i.pravatar.cc/150?u=${img}`} alt="match" className="w-full h-full object-cover" />
       </div>
       <div className="flex-1">
          <div className="text-[8px] text-gray-500">{id}</div>
          <div className="text-[10px] text-white font-bold">{name}</div>
       </div>
       <div className="w-24 text-right">
          <div className="flex justify-between text-[8px] mb-1">
             <span className="text-gray-500">Match Score</span>
             <span className={color.replace('bg-', 'text-')}>{score}%</span>
          </div>
          <div className="h-0.5 bg-gray-800 rounded-full">
            <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }}></div>
          </div>
       </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label }: any) {
  return (
    <button className="flex items-center gap-2 bg-[#050812] border border-[#1e293b] hover:border-purple-500/50 hover:bg-purple-900/10 transition-colors p-2.5 rounded-lg text-left">
      <Icon className="w-3.5 h-3.5 text-gray-400" />
      <span className="text-[9px] text-gray-300">{label}</span>
    </button>
  );
}

function DataCard({ icon: Icon, title, val, sub, trend, trendText, color }: any) {
  return (
    <div className="bg-[#080d1e] border border-[#1e293b]/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
       <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">{title}</h3>
       <div className="flex items-center justify-between mb-2">
         <div className="flex-col flex">
           <span className="text-xl font-bold text-white leading-none mb-1">{val}</span>
           <span className="text-[9px] text-gray-500">{sub}</span>
         </div>
         <Icon className={`w-8 h-8 ${color} opacity-40`} strokeWidth={1} />
       </div>
       <div className="text-[8px] text-gray-400 mt-2 flex items-center gap-1 border-t border-gray-800 pt-2">
          <span className="text-green-400 font-bold">{trend}</span> {trendText}
       </div>
    </div>
  );
}

// Dummy component functions to keep routing happy
function UploadView() { return <UploadZone />; }
