import { Link, useLocation } from 'react-router-dom';
import { Home, Video, UserSquare2, Sparkles, ScanFace, Users2, Box, FileCheck2, Briefcase, Database, LineChart, Bell, Settings, ShieldCheck, Lightbulb, Hexagon } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  
  return (
    <div className="w-[280px] h-full bg-[#030614] border-r border-[#1e293b]/50 flex flex-col pt-6 pb-6 overflow-y-auto custom-scrollbar flex-shrink-0 z-20 font-sans shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      
      {/* Logo */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-[10px] opacity-20"></div>
          <Hexagon className="w-8 h-8 text-blue-500 relative z-10" strokeWidth={1.5} />
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-1.5 h-1.5 bg-blue-300 rounded-full shadow-[0_0_8px_#60a5fa]"></div>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-white tracking-widest leading-none">
            FORENSIQ
          </h2>
          <div className="text-[7px] text-gray-500 tracking-[0.2em] mt-1 uppercase">AI Forensic Analysis System</div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        
        <NavItem icon={Home} label="Home" to="/" active={true} />
        <NavItem icon={Video} label="Video Analysis" to="/upload" hasArrow />
        
        <div className="h-4"></div> {/* Spacer */}
        
        <NavItem icon={UserSquare2} label="Face Detection" />
        <NavItem icon={Sparkles} label="Face Enhancement" />
        <NavItem icon={ScanFace} label="Face Geometry" />
        <NavItem icon={Users2} label="Face Matching" />
        <NavItem icon={Box} label="3D View of Suspect" />
        <NavItem icon={FileCheck2} label="Report Ready" />
        
        <div className="h-4"></div> {/* Spacer */}
        
        <NavItem icon={Briefcase} label="Case Management" />
        <NavItem icon={Database} label="Database" to="/database" />
        <NavItem icon={LineChart} label="Analytics" to="/analytics" badge="12" />
        <NavItem icon={Bell} label="Alerts" />
        <NavItem icon={Settings} label="Settings" to="/settings" />
        <NavItem icon={UserSquare2} label="Investigator" to="/investigator" />
      </nav>
      
      {/* Bottom Widgets */}
      <div className="px-4 mt-8 flex flex-col gap-4">
        
        {/* System Protection */}
        <div className="bg-[#080d1e] border border-[#1e293b]/50 rounded-xl p-4 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-green-500/10 blur-xl rounded-full"></div>
          <ShieldCheck className="w-6 h-6 text-green-500 relative z-10" />
          <div className="relative z-10">
            <h4 className="text-white text-xs font-bold tracking-wide">System Protection</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
               <span className="text-[10px] text-gray-400">All systems secure</span>
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></div>
            </div>
          </div>
        </div>

        {/* Quick Tip */}
        <div className="bg-transparent border border-dashed border-[#1e293b] rounded-xl p-4 relative group hover:bg-[#080d1e]/50 transition-colors cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-purple-400" />
              <h4 className="text-purple-400 text-xs font-bold tracking-wide">Quick Tip</h4>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-gray-400 transition-colors"></div>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Upload clear CCTV footage for better analysis results
          </p>
          <div className="flex gap-1 mt-3">
             <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div>
          </div>
        </div>

      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, to = '#', active, hasArrow, badge }: any) {
  return (
    <Link to={to} className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${active ? 'bg-gradient-to-r from-purple-700 to-purple-900 shadow-[0_0_15px_rgba(126,34,206,0.4)] border border-purple-500/50' : 'hover:bg-white/5 border border-transparent'}`}>
      <div className="flex items-center gap-4">
        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`} strokeWidth={active ? 2.5 : 2} />
        <span className={`${active ? 'text-white font-bold' : 'text-gray-400 group-hover:text-gray-200 font-medium'} text-xs tracking-wide`}>{label}</span>
      </div>
      
      {hasArrow && (
        <div className="w-1.5 h-1.5 border-t border-r border-gray-500 rotate-45 group-hover:border-gray-300 transition-colors"></div>
      )}
      
      {badge && (
        <span className="bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(147,51,234,0.5)]">
          {badge}
        </span>
      )}
    </Link>
  );
}
