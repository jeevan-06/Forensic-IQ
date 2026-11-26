import React from 'react';
import { 
  CheckCircle2, Briefcase, TrendingUp, FileText, Search, UserCheck, 
  User, Calendar, Mail, Phone, Fingerprint, ShieldCheck, 
  MapPin, Award, UploadCloud, Database, Edit, Monitor, Lock, Check
} from 'lucide-react';

export default function Investigator() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-[1600px] mx-auto space-y-4">
      
      {/* Top Section: Hero + Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Profile Hero Card */}
        <div className="xl:col-span-8 bg-[#080d1e] border border-[#1e293b] rounded-2xl p-8 relative overflow-hidden flex flex-col justify-center min-h-[300px]">
          
          {/* Background glowing fingerprint */}
          <div className="absolute right-10 top-1/2 -translate-y-1/2 w-[240px] h-[240px] pointer-events-none opacity-80 flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-600/10 blur-[60px] rounded-full"></div>
            <div className="absolute inset-0 border border-blue-500/20 rounded-full animate-[spin_15s_linear_infinite] border-t-blue-400"></div>
            <div className="absolute inset-4 border border-purple-500/20 rounded-full animate-[spin_10s_linear_infinite_reverse] border-b-purple-400"></div>
            <Fingerprint className="w-32 h-32 text-blue-500/50 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" strokeWidth={1} />
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-blue-400/50 shadow-[0_0_10px_#60a5fa] animate-scan"></div>
          </div>

          <div className="relative z-10 flex items-center gap-8">
            <div className="relative w-32 h-32 flex-shrink-0">
               <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 p-[2px]">
                 <div className="w-full h-full bg-[#050812] rounded-full overflow-hidden">
                    <img src="https://i.pravatar.cc/300?u=johndavidsmith" alt="Investigator" className="w-full h-full object-cover opacity-90" />
                 </div>
               </div>
               <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-[#080d1e] rounded-full shadow-[0_0_8px_#22c55e]"></div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-white">John David Smith</h1>
                <CheckCircle2 className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-purple-400 font-bold text-sm mb-1">Senior Forensic Investigator</h2>
              <p className="text-[11px] text-gray-400 mb-6">Cyber Crime Division</p>
              
              <div className="flex items-center gap-3 mb-6">
                 <span className="px-3 py-1 bg-purple-600 rounded text-[10px] font-bold text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]">Active</span>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest">Investigator ID</span>
                  <span className="text-xs text-blue-400 font-mono">INV-2024-001</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest">Email</span>
                  <span className="text-xs text-gray-300">john.smith@forensiq.gov</span>
                </div>
                <div className="flex gap-3 items-center">
                   <Briefcase className="w-4 h-4 text-gray-500" />
                   <div className="flex flex-col">
                     <span className="text-[9px] text-gray-500 uppercase tracking-widest">Department</span>
                     <span className="text-xs text-gray-300">Forensic Science Unit</span>
                   </div>
                </div>
                <div className="flex gap-3 items-center">
                   <Phone className="w-4 h-4 text-gray-500" />
                   <div className="flex flex-col">
                     <span className="text-[9px] text-gray-500 uppercase tracking-widest">Phone</span>
                     <span className="text-xs text-gray-300">+1 (555) 987-6543</span>
                   </div>
                </div>
                <div className="flex gap-3 items-center">
                   <Calendar className="w-4 h-4 text-gray-500" />
                   <div className="flex flex-col">
                     <span className="text-[9px] text-gray-500 uppercase tracking-widest">Join Date</span>
                     <span className="text-xs text-gray-300">12 January 2024</span>
                   </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="xl:col-span-4 bg-[#080d1e] border border-[#1e293b] rounded-2xl p-6 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-gray-300 mb-6">Investigator Statistics</h3>
          <div className="grid grid-cols-2 gap-4 flex-1">
             <StatCard icon={Briefcase} val="128" label="Cases Assigned" color="text-purple-400" />
             <StatCard icon={CheckCircle2} val="86" label="Cases Completed" color="text-green-400" />
             <StatCard icon={TrendingUp} val="94.6%" label="Success Rate" color="text-blue-400" />
             <StatCard icon={FileText} val="568" label="Reports Generated" color="text-yellow-400" />
             <StatCard icon={Search} val="1,248" label="Total Analyses" color="text-cyan-400" />
             <StatCard icon={UserCheck} val="342" label="Matches Found" color="text-pink-400" />
          </div>
        </div>

      </div>

      {/* Middle Section: Info, Activity, Security */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Personal Information */}
        <div className="bg-[#080d1e] border border-[#1e293b] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6 text-gray-300">
             <User className="w-4 h-4 text-purple-400" />
             <h3 className="text-xs font-bold">Personal Information</h3>
          </div>
          <div className="space-y-4">
             <InfoRow icon={User} label="Full Name" val="John David Smith" />
             <InfoRow icon={Calendar} label="Date of Birth" val="15 March 1988" />
             <InfoRow icon={UserCheck} label="Gender" val="Male" />
             <InfoRow icon={MapPin} label="Nationality" val="American" />
             <InfoRow icon={Briefcase} label="Employee ID" val="EMP-2024-4587" />
             <div className="flex items-center justify-between text-[11px] border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2 text-gray-500">
                   <ShieldCheck className="w-3.5 h-3.5" /> Clearance Level
                </div>
                <span className="px-2 py-0.5 bg-purple-900/40 text-purple-400 rounded text-[9px] font-bold border border-purple-500/20">Level 5 - Top Secret</span>
             </div>
             <InfoRow icon={MapPin} label="Work Location" val="National Forensic Lab, New York" />
             <InfoRow icon={Award} label="Designation" val="Senior Forensic Investigator" noBorder />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#080d1e] border border-[#1e293b] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2 text-gray-300">
                <ActivityIcon className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold">Recent Activity</h3>
             </div>
             <span className="text-[9px] text-gray-500 cursor-pointer hover:text-gray-300">View All</span>
          </div>
          <div className="relative border-l border-gray-800 ml-4 space-y-6">
             <ActivityItem icon={CheckCircle2} title="Completed analysis for CASE-4587-FR" desc="Face matching and 3D reconstruction completed" time="10:24 AM" color="bg-purple-600" />
             <ActivityItem icon={FileText} title="Generated report for CASE-4586-FR" desc="Report generated successfully" time="Yesterday" color="bg-green-600" />
             <ActivityItem icon={UploadCloud} title="Uploaded video for CASE-4585-FR" desc="Video analysis initiated" time="16 May 2024" color="bg-orange-600" />
             <ActivityItem icon={Edit} title="Updated case notes for CASE-4584-FR" desc="Notes updated successfully" time="15 May 2024" color="bg-pink-600" />
             <ActivityItem icon={Database} title="Accessed database - Suspect Records" desc="Viewed 25 records" time="15 May 2024" color="bg-blue-600" />
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-[#080d1e] border border-[#1e293b] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6 text-gray-300">
               <ShieldCheck className="w-4 h-4 text-purple-400" />
               <h3 className="text-xs font-bold">Security & Access</h3>
            </div>
            <div className="space-y-4">
               <div className="flex items-center justify-between text-[11px] border-b border-gray-800 pb-2">
                  <div className="flex items-center gap-2 text-gray-500">
                     <User className="w-3.5 h-3.5" /> Account Status
                  </div>
                  <span className="text-green-400">Active</span>
               </div>
               <InfoRow icon={Calendar} label="Last Login" val="16 May 2024, 08:45 AM" />
               <InfoRow icon={MapPin} label="IP Address" val="192.168.1.45" />
               <InfoRow icon={Monitor} label="Device" val="Windows 11 / Chrome" />
               <div className="flex items-center justify-between text-[11px] border-b border-gray-800 pb-2">
                  <div className="flex items-center gap-2 text-gray-500">
                     <Lock className="w-3.5 h-3.5" /> Two-Factor Authentication
                  </div>
                  <span className="text-green-400 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Enabled</span>
               </div>
               <InfoRow icon={Lock} label="Password Last Changed" val="20 April 2024" noBorder />
            </div>
          </div>
          <button className="w-full mt-6 py-2.5 rounded-lg border border-purple-500/50 hover:bg-purple-900/20 text-purple-400 text-[11px] font-bold flex items-center justify-center gap-2 transition-colors">
            <ShieldCheck className="w-4 h-4" /> Manage Security
          </button>
        </div>

      </div>

      {/* Bottom Section: Assigned Cases */}
      <div className="bg-[#080d1e] border border-[#1e293b] rounded-2xl p-6">
         <div className="flex justify-between items-center mb-6">
             <h3 className="text-xs font-bold text-gray-300">Assigned Cases</h3>
             <span className="text-[10px] text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1">
               <CheckCircle2 className="w-3 h-3" /> View All Cases
             </span>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] text-gray-500 uppercase tracking-widest border-b border-gray-800">
                <th className="pb-3 font-medium">CASE ID</th>
                <th className="pb-3 font-medium">TITLE</th>
                <th className="pb-3 font-medium">ASSIGNED DATE</th>
                <th className="pb-3 font-medium">STATUS</th>
                <th className="pb-3 font-medium">PROGRESS</th>
                <th className="pb-3 font-medium">PRIORITY</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <CaseRow id="CASE-4587-FR" title="City Center Robbery Investigation" date="16 May 2024" status="In Progress" prog={76} prio="High" />
              <CaseRow id="CASE-4586-FR" title="Mall Surveillance Analysis" date="15 May 2024" status="Completed" prog={100} prio="Medium" />
              <CaseRow id="CASE-4585-FR" title="Highway Footage Analysis" date="14 May 2024" status="In Progress" prog={62} prio="High" />
              <CaseRow id="CASE-4584-FR" title="Bank Security Footage" date="13 May 2024" status="Completed" prog={100} prio="Medium" />
              <CaseRow id="CASE-4583-FR" title="Parking Lot Investigation" date="12 May 2024" status="In Progress" prog={48} prio="Low" />
            </tbody>
          </table>
      </div>

    </div>
  );
}

// Subcomponents

function ActivityIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}

function StatCard({ icon: Icon, val, label, color }: any) {
  return (
    <div className="bg-[#050812] border border-[#1e293b] rounded-xl p-4 flex items-center gap-4 hover:border-gray-700 transition-colors cursor-default">
       <div className={`w-10 h-10 rounded border border-gray-800 bg-[#080d1e] flex items-center justify-center flex-shrink-0 ${color.replace('text-', 'bg-').replace('400', '900/20')}`}>
          <Icon className={`w-5 h-5 ${color}`} />
       </div>
       <div>
         <div className="text-xl font-bold text-white leading-none mb-1">{val}</div>
         <div className="text-[9px] text-gray-500">{label}</div>
       </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, val, noBorder }: any) {
  return (
    <div className={`flex items-center justify-between text-[11px] pb-2 ${noBorder ? '' : 'border-b border-gray-800'}`}>
       <div className="flex items-center gap-2 text-gray-500">
          <Icon className="w-3.5 h-3.5" /> {label}
       </div>
       <span className="text-gray-300">{val}</span>
    </div>
  );
}

function ActivityItem({ icon: Icon, title, desc, time, color }: any) {
  return (
    <div className="relative pl-6">
       <div className={`absolute -left-3 top-0 w-6 h-6 rounded-full border-4 border-[#080d1e] ${color} flex items-center justify-center`}>
          <Icon className="w-2.5 h-2.5 text-white" />
       </div>
       <div className="flex justify-between items-start">
         <div>
           <div className="text-[11px] text-gray-300 font-bold mb-0.5">{title}</div>
           <div className="text-[9px] text-gray-500">{desc}</div>
         </div>
         <span className="text-[9px] text-gray-500">{time}</span>
       </div>
    </div>
  );
}

function CaseRow({ id, title, date, status, prog, prio }: any) {
  const isCompleted = status === 'Completed';
  
  let prioColor = 'bg-yellow-500';
  if (prio === 'High') prioColor = 'bg-red-500';
  if (prio === 'Low') prioColor = 'bg-green-500';

  return (
    <tr className="text-[11px] hover:bg-white/5 transition-colors group cursor-pointer">
      <td className="py-3 flex items-center gap-2 text-gray-400 group-hover:text-white"><FileText className="w-3.5 h-3.5"/> {id}</td>
      <td className="py-3 text-gray-300">{title}</td>
      <td className="py-3 text-gray-500">{date}</td>
      <td className="py-3">
         <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${isCompleted ? 'bg-green-900/20 text-green-500 border-green-500/30' : 'bg-blue-900/20 text-blue-400 border-blue-500/30'}`}>
           {status}
         </span>
      </td>
      <td className="py-3">
         <div className="flex items-center gap-3">
           <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-blue-400'}`} style={{ width: `${prog}%` }}></div>
           </div>
           <span className="text-[10px] text-gray-400 w-8">{prog}%</span>
         </div>
      </td>
      <td className="py-3">
         <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${prioColor} shadow-[0_0_5px_${prioColor}]`}></div>
            <span className="text-gray-300">{prio}</span>
         </div>
      </td>
      <td className="py-3 text-right">
         <span className="text-gray-500 hover:text-white pb-2 font-bold tracking-widest cursor-pointer">...</span>
      </td>
    </tr>
  );
}
