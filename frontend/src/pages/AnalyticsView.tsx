import React, { useEffect, useState } from 'react';
import { 
  LineChart, Activity, Cpu, ShieldAlert, 
  Target, Zap, Clock, Users, Hexagon, ChevronDown, CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function AnalyticsView() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 max-w-[1600px] mx-auto space-y-6 relative overflow-hidden">
      
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 blur-[100px] rounded-full pointer-events-none mix-blend-screen"></div>

      {/* Header */}
      <div className="flex justify-between items-end mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="relative flex items-center justify-center w-10 h-10">
                <div className="absolute inset-0 bg-blue-500/20 rounded-lg animate-pulse"></div>
                <div className="absolute inset-0 border border-blue-400/50 rounded-lg animate-[spin_4s_linear_infinite]"></div>
                <Activity className="w-5 h-5 text-blue-400 relative z-10" />
             </div>
             <h1 className="text-3xl font-bold text-white tracking-wide">SYSTEM ANALYTICS</h1>
          </div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest pl-13">Real-time Performance & Intelligence Metrics</p>
        </div>
        
        <div className="flex items-center gap-3 bg-[#080d1e]/80 border border-[#1e293b] rounded-lg px-4 py-2 cursor-pointer hover:border-purple-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
           <span className="text-xs text-gray-300 font-bold">Last 30 Days</span>
           <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Top Row: Animated KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <KPICard 
          icon={Users} title="Total Faces Processed" val="124,592" 
          trend="+12.5%" trendColor="text-green-400" 
          glow="shadow-[0_0_20px_rgba(59,130,246,0.15)]" borderHover="hover:border-blue-500/50" iconColor="text-blue-400"
          delay={100} mounted={mounted}
        />
        <KPICard 
          icon={Target} title="Average Match Confidence" val="94.2%" 
          trend="+2.1%" trendColor="text-green-400" 
          glow="shadow-[0_0_20px_rgba(168,85,247,0.15)]" borderHover="hover:border-purple-500/50" iconColor="text-purple-400"
          delay={200} mounted={mounted}
        />
        <KPICard 
          icon={Zap} title="Avg. Processing Time" val="1.2s" 
          trend="-0.3s" trendColor="text-green-400" 
          glow="shadow-[0_0_20px_rgba(234,179,8,0.15)]" borderHover="hover:border-yellow-500/50" iconColor="text-yellow-400"
          delay={300} mounted={mounted}
        />
        <KPICard 
          icon={ShieldAlert} title="Active Investigations" val="34" 
          trend="Critical Load" trendColor="text-red-400" 
          glow="shadow-[0_0_20px_rgba(239,68,68,0.15)]" borderHover="hover:border-red-500/50" iconColor="text-red-400"
          delay={400} mounted={mounted}
        />
      </div>

      {/* Middle Row: Custom Animated Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* Bar Chart: Detection Volume */}
        <div className="lg:col-span-2 bg-[#080d1e]/80 backdrop-blur-md border border-[#1e293b] rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('/images/grid.png')] bg-repeat opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"></div>
          
          <div className="flex justify-between items-center mb-8 relative z-10">
             <div className="flex items-center gap-2">
                <LineChart className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">Detection Volume (7 Days)</h3>
             </div>
             <div className="flex gap-4">
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_5px_#a855f7]"></div><span className="text-[9px] text-gray-500">Processed</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_5px_#3b82f6]"></div><span className="text-[9px] text-gray-500">Matched</span></div>
             </div>
          </div>

          {/* Custom CSS Bar Chart */}
          <div className="h-[200px] flex items-end justify-between gap-2 relative z-10 px-4">
            {/* Y-Axis lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
               {[100, 75, 50, 25, 0].map(val => (
                 <div key={val} className="w-full border-t border-gray-800/50 flex justify-end">
                   <span className="text-[8px] text-gray-600 -mt-2 pr-2">{val}k</span>
                 </div>
               ))}
            </div>
            
            {/* Bars */}
            {[
              { day: 'Mon', p: 65, m: 40 }, { day: 'Tue', p: 80, m: 55 }, 
              { day: 'Wed', p: 50, m: 30 }, { day: 'Thu', p: 95, m: 70 }, 
              { day: 'Fri', p: 75, m: 50 }, { day: 'Sat', p: 40, m: 25 }, 
              { day: 'Sun', p: 85, m: 60 }
            ].map((data, i) => (
              <div key={data.day} className="flex flex-col items-center gap-2 z-10 w-full group/bar cursor-crosshair">
                <div className="flex gap-1 w-full justify-center items-end h-[180px] bg-gray-900/20 rounded hover:bg-gray-800/40 transition-colors pt-4 px-1">
                   {/* Processed Bar */}
                   <div 
                     className="w-1/3 max-w-[12px] bg-gradient-to-t from-purple-900 to-purple-500 rounded-t-sm transition-all duration-1000 ease-out group-hover/bar:shadow-[0_0_10px_#a855f7] relative"
                     style={{ height: mounted ? `${data.p}%` : '0%', transitionDelay: `${i * 100}ms` }}
                   >
                     <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 text-[9px] text-purple-300 font-bold transition-opacity">{data.p}k</div>
                   </div>
                   {/* Matched Bar */}
                   <div 
                     className="w-1/3 max-w-[12px] bg-gradient-to-t from-blue-900 to-blue-500 rounded-t-sm transition-all duration-1000 ease-out group-hover/bar:shadow-[0_0_10px_#3b82f6] relative"
                     style={{ height: mounted ? `${data.m}%` : '0%', transitionDelay: `${(i * 100) + 50}ms` }}
                   >
                     <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 text-[9px] text-blue-300 font-bold transition-opacity">{data.m}k</div>
                   </div>
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart: Accuracy Distribution */}
        <div className="bg-[#080d1e]/80 backdrop-blur-md border border-[#1e293b] rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/30 transition-colors">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-600/10 blur-[40px] rounded-full group-hover:bg-purple-600/20 transition-colors"></div>
          
          <div className="flex items-center gap-2 mb-6 relative z-10">
             <Target className="w-4 h-4 text-purple-400" />
             <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">Accuracy Distribution</h3>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative z-10">
             {/* Custom CSS Donut / Circular Progress */}
             <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                {/* Outer Ring > 90% */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                   <circle cx="80" cy="80" r="70" className="stroke-gray-800" strokeWidth="12" fill="none" />
                   <circle cx="80" cy="80" r="70" className="stroke-green-500 transition-all duration-[1500ms] ease-out drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" strokeWidth="12" fill="none" strokeDasharray="440" strokeDashoffset={mounted ? 440 - (440 * 0.65) : 440} />
                </svg>
                {/* Middle Ring 80-90% */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                   <circle cx="80" cy="80" r="54" className="stroke-gray-800/50" strokeWidth="12" fill="none" />
                   <circle cx="80" cy="80" r="54" className="stroke-blue-500 transition-all duration-[1500ms] ease-out drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" strokeWidth="12" fill="none" strokeDasharray="340" strokeDashoffset={mounted ? 340 - (340 * 0.25) : 340} style={{ transitionDelay: '200ms' }} />
                </svg>
                {/* Inner Ring <80% */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                   <circle cx="80" cy="80" r="38" className="stroke-gray-800/30" strokeWidth="12" fill="none" />
                   <circle cx="80" cy="80" r="38" className="stroke-purple-500 transition-all duration-[1500ms] ease-out drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" strokeWidth="12" fill="none" strokeDasharray="240" strokeDashoffset={mounted ? 240 - (240 * 0.10) : 240} style={{ transitionDelay: '400ms' }} />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-2xl font-bold text-white leading-none shadow-black drop-shadow-md">94%</span>
                   <span className="text-[8px] text-gray-400 uppercase tracking-widest mt-1">Avg Score</span>
                </div>
             </div>

             {/* Legend */}
             <div className="w-full space-y-3">
                <AccuracyLegend color="bg-green-500" label="> 90% Confidence" val="65%" />
                <AccuracyLegend color="bg-blue-500" label="80% - 90% Confidence" val="25%" />
                <AccuracyLegend color="bg-purple-500" label="< 80% Confidence" val="10%" />
             </div>
          </div>
        </div>

      </div>

      {/* Bottom Row: Live Intelligence Feed */}
      <div className="bg-[#080d1e]/80 backdrop-blur-md border border-[#1e293b] rounded-2xl p-6 relative z-10">
         <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-4 h-4">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-50"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">Live Intelligence Feed</h3>
             </div>
             <span className="text-[10px] text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1 font-bold">
               View Full Log &rarr;
             </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] text-gray-500 uppercase tracking-widest border-b border-[#1e293b]">
                  <th className="pb-3 font-medium">TIMESTAMP</th>
                  <th className="pb-3 font-medium">MATCH ID</th>
                  <th className="pb-3 font-medium">CONFIDENCE SCORE</th>
                  <th className="pb-3 font-medium">PROC. TIME</th>
                  <th className="pb-3 font-medium">ORIGIN NODE</th>
                  <th className="pb-3 font-medium">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                <FeedRow time="Just now" id="MCH-9921-A" conf={98.4} proc="0.8s" node="NYC-CAM-04" status="Verified" />
                <FeedRow time="2 min ago" id="MCH-9920-B" conf={95.1} proc="1.1s" node="DB-SCAN-INTERNAL" status="Verified" />
                <FeedRow time="5 min ago" id="MCH-9919-C" conf={82.3} proc="1.5s" node="LAX-SEC-09" status="Flagged" isWarning />
                <FeedRow time="12 min ago" id="MCH-9918-A" conf={99.1} proc="0.9s" node="NYC-CAM-01" status="Verified" />
                <FeedRow time="15 min ago" id="MCH-9917-D" conf={74.8} proc="2.1s" node="API-EXT-02" status="Review Required" isDanger />
              </tbody>
            </table>
          </div>
      </div>

    </div>
  );
}

// Subcomponents

function KPICard({ icon: Icon, title, val, trend, trendColor, glow, borderHover, iconColor, delay, mounted }: any) {
  return (
    <div 
      className={`bg-[#080d1e]/80 backdrop-blur-md border border-[#1e293b] rounded-2xl p-5 transition-all duration-700 ease-out ${borderHover} ${glow} flex items-center justify-between group overflow-hidden relative`}
      style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transitionDelay: `${delay}ms` }}
    >
       {/* Background animated gradient flair */}
       <div className={`absolute -right-10 -top-10 w-24 h-24 rounded-full blur-[30px] opacity-10 group-hover:opacity-30 transition-opacity ${iconColor.replace('text-', 'bg-')}`}></div>
       
       <div>
         <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{title}</div>
         <div className="text-2xl font-bold text-white mb-2">{val}</div>
         <div className={`text-[10px] font-bold ${trendColor} bg-white/5 inline-block px-2 py-0.5 rounded border border-white/5`}>
           {trend}
         </div>
       </div>
       <div className={`w-12 h-12 rounded-xl bg-[#050812] border border-[#1e293b] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${iconColor}`}>
          <Icon className="w-6 h-6" />
       </div>
    </div>
  );
}

function AccuracyLegend({ color, label, val }: any) {
  return (
    <div className="flex items-center justify-between text-[11px]">
       <div className="flex items-center gap-2 text-gray-400">
         <div className={`w-2 h-2 rounded-full ${color} shadow-[0_0_5px_currentColor]`}></div>
         {label}
       </div>
       <span className="font-bold text-white">{val}</span>
    </div>
  );
}

function FeedRow({ time, id, conf, proc, node, status, isWarning, isDanger }: any) {
  
  let statusColor = 'text-green-400 bg-green-900/20 border-green-500/30';
  let Icon = CheckCircle2;

  if (isWarning) {
    statusColor = 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
    Icon = AlertTriangle;
  }
  if (isDanger) {
    statusColor = 'text-red-400 bg-red-900/20 border-red-500/30';
    Icon = AlertTriangle;
  }

  // Calculate progress bar color based on confidence
  let barColor = 'bg-purple-500 shadow-[0_0_8px_#a855f7]';
  if (conf > 90) barColor = 'bg-green-500 shadow-[0_0_8px_#22c55e]';
  else if (conf < 80) barColor = 'bg-yellow-500 shadow-[0_0_8px_#eab308]';

  return (
    <tr className="text-[11px] hover:bg-white/5 transition-colors group">
      <td className="py-3.5 text-gray-500 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {time}</td>
      <td className="py-3.5 text-gray-300 font-mono font-bold group-hover:text-purple-400 transition-colors"><Hexagon className="w-3.5 h-3.5 inline mr-1 text-purple-500/50" /> {id}</td>
      <td className="py-3.5">
         <div className="flex items-center gap-2">
           <span className="text-white font-bold w-10">{conf}%</span>
           <div className="w-20 h-1 bg-gray-800 rounded-full overflow-hidden">
             <div className={`h-full ${barColor}`} style={{ width: `${conf}%` }}></div>
           </div>
         </div>
      </td>
      <td className="py-3.5 text-gray-400">{proc}</td>
      <td className="py-3.5 text-gray-400"><Cpu className="w-3.5 h-3.5 inline mr-1 text-gray-600" /> {node}</td>
      <td className="py-3.5">
         <span className={`px-2 py-0.5 rounded border text-[9px] font-bold flex items-center gap-1 w-fit ${statusColor}`}>
           <Icon className="w-3 h-3" /> {status}
         </span>
      </td>
    </tr>
  );
}
