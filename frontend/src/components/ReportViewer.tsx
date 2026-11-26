import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Clock, Sparkles, Box, Fingerprint, Activity, CheckCircle2, 
  Download, Archive, Database, FileJson, Printer, ShieldCheck, ChevronRight 
} from 'lucide-react';

export interface ReportData {
  status: string;
  report_id: string;
  case_id: string;
  generated_at: string;
  investigator: string;
  case_title: string;
  location: string;
  resolution: string;
  source_file: string;
  frames_analyzed: number;
  analysis_started: string;
  analysis_completed: string;
  security_hash: string;
  confidence_scores: {
    face_detection: number;
    enhancement: number;
    geometry_analysis: number;
    face_matching: number;
    reconstruction_3d: number;
    tracking: number;
  };
  overall_confidence: number;
  appearances: number;
  cameras_detected: number;
  tracking_duration: string;
  timeline: { time: string; camera: string; confidence: number }[];
  geometry_metrics: Record<string, number>;
  ai_observations: string[];
  face_path: string;
  report_version: string;
  pages: number;
  file_size_mb: number;
}

interface ReportViewerProps {
  data: ReportData;
  originalImage?: string;
  enhancedImage?: string;
}

export function ReportViewer({ data, originalImage, enhancedImage }: ReportViewerProps) {
  const sections = [
    { id: 'overview', icon: FileText, label: 'Case Overview', active: true },
    { id: 'timeline', icon: Clock, label: 'Timeline & Tracking', active: false },
    { id: 'enhancement', icon: Sparkles, label: 'Face Enhancement', active: false },
    { id: 'geometry', icon: Box, label: 'Geometry Analysis', active: false },
    { id: 'matching', icon: Fingerprint, label: 'Face Matching', active: false },
    { id: 'reconstruction', icon: Box, label: '3D Reconstruction', active: false },
    { id: 'observations', icon: Activity, label: 'AI Observations', active: false },
    { id: 'conclusion', icon: FileText, label: 'Conclusion', active: false },
  ];

  return (
    <div className="flex gap-4 h-full min-h-[800px] text-gray-300">
      
      {/* LEFT SIDEBAR: Sections & Confidence */}
      <div className="w-64 flex flex-col gap-4 flex-shrink-0">
        
        {/* Report Sections */}
        <div className="bg-[#0a0d16] border border-gray-800 rounded-xl p-4 flex-1">
          <h3 className="text-[10px] font-bold text-gray-500 tracking-widest mb-4 uppercase">Report Sections</h3>
          <div className="space-y-1">
            {sections.map((sec, i) => (
              <button key={sec.id} className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors ${sec.active ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'hover:bg-gray-800/50 text-gray-400 border border-transparent'}`}>
                <div className="flex items-center gap-3">
                  {sec.active ? (
                    <div className="w-5 h-5 rounded bg-purple-500 flex items-center justify-center text-white text-[10px] font-bold">{i+1}</div>
                  ) : (
                    <sec.icon className="w-4 h-4" />
                  )}
                  <span>{sec.label}</span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-50" />
              </button>
            ))}
          </div>
        </div>

        {/* AI Confidence Summary */}
        <div className="bg-[#0a0d16] border border-gray-800 rounded-xl p-4">
          <h3 className="text-[10px] font-bold text-purple-400 tracking-widest mb-4 uppercase">AI Confidence Summary</h3>
          
          <div className="flex justify-center mb-6 relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-800" />
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * data.overall_confidence) / 100} className="text-teal-400" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-white">{data.overall_confidence}%</span>
              <span className="text-[8px] text-gray-500 text-center leading-tight">Overall<br/>Confidence</span>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Face Detection', val: data.confidence_scores.face_detection },
              { label: 'Enhancement', val: data.confidence_scores.enhancement },
              { label: 'Geometry Analysis', val: data.confidence_scores.geometry_analysis },
              { label: 'Face Matching', val: data.confidence_scores.face_matching },
              { label: '3D Reconstruction', val: data.confidence_scores.reconstruction_3d },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-[9px] mb-1">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-white">{item.val.toFixed(1)}%</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${item.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN REPORT DOCUMENT */}
      <div className="flex-1 bg-[#f4f4f5] rounded-xl relative overflow-hidden shadow-2xl flex flex-col font-sans text-gray-900 border-x-[12px] border-y-[12px] border-[#0a0d16]">
        {/* Paper corners effect */}
        <div className="absolute top-0 left-0 w-8 h-8 bg-[#0a0d16] rounded-br-3xl z-10"></div>
        <div className="absolute top-0 right-0 w-8 h-8 bg-[#0a0d16] rounded-bl-3xl z-10"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 bg-[#0a0d16] rounded-tr-3xl z-10"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#0a0d16] rounded-tl-3xl z-10"></div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-white">
          
          {/* Document Header */}
          <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-900 rounded-xl flex items-center justify-center">
                <Fingerprint className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-widest text-gray-900">FORENSIQ</h1>
                <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">AI Forensic Analysis System</p>
              </div>
            </div>
            <div className="text-right text-[10px] space-y-1 font-mono text-gray-600">
              <div className="flex justify-end gap-2"><span className="w-24 text-gray-400">REPORT ID:</span> <strong className="text-gray-900">{data.report_id}</strong></div>
              <div className="flex justify-end gap-2"><span className="w-24 text-gray-400">DATE:</span> <strong className="text-gray-900">{data.generated_at}</strong></div>
              <div className="flex justify-end gap-2"><span className="w-24 text-gray-400">PREPARED BY:</span> <strong className="text-gray-900">{data.investigator}</strong></div>
            </div>
          </div>

          {/* 1. Case Overview */}
          <div className="mb-10">
            <h2 className="text-sm font-bold text-purple-800 tracking-widest uppercase border-b border-gray-200 pb-2 mb-4">1. Case Overview</h2>
            <div className="flex gap-8">
              <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-3 text-[11px]">
                <div className="flex gap-2"><span className="text-gray-500 w-24">Case ID</span><span className="font-medium text-gray-900">: {data.case_id}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-32">Total Frames Analyzed</span><span className="font-medium text-gray-900">: {data.frames_analyzed.toLocaleString()}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-24">Case Title</span><span className="font-medium text-gray-900">: {data.case_title}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-32">Resolution</span><span className="font-medium text-gray-900">: {data.resolution}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-24">Source</span><span className="font-medium text-gray-900">: {data.source_file}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-32">Analysis Started</span><span className="font-medium text-gray-900">: {data.analysis_started}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-24">Location</span><span className="font-medium text-gray-900">: {data.location}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-32">Analysis Completed</span><span className="font-medium text-gray-900">: {data.analysis_completed}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-24">Investigator</span><span className="font-medium text-gray-900">: {data.investigator}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-32">Report Generated</span><span className="font-medium text-gray-900">: {data.generated_at}</span></div>
              </div>
              <div className="w-48 flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Suspect Snapshot</span>
                <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                  <img src={`http://localhost:8000${data.face_path}`} alt="Suspect" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Timeline & Tracking Summary */}
          <div className="mb-10 border-t border-dashed border-gray-300 pt-6">
            <h2 className="text-sm font-bold text-purple-800 tracking-widest uppercase mb-4">2. Timeline & Tracking Summary</h2>
            
            <div className="flex justify-between gap-4 mb-8">
              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><Clock className="w-4 h-4"/></div>
                <div>
                  <div className="text-[9px] text-gray-500 uppercase">First Seen</div>
                  <div className="text-xs font-bold">{data.timeline[0]?.time}</div>
                  <div className="text-[9px] text-gray-400">16 May 2024</div>
                </div>
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><Clock className="w-4 h-4"/></div>
                <div>
                  <div className="text-[9px] text-gray-500 uppercase">Last Seen</div>
                  <div className="text-xs font-bold">{data.timeline[data.timeline.length-1]?.time}</div>
                  <div className="text-[9px] text-gray-400">16 May 2024</div>
                </div>
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Fingerprint className="w-4 h-4"/></div>
                <div>
                  <div className="text-[9px] text-gray-500 uppercase">Total Appearances</div>
                  <div className="text-lg font-bold">{data.appearances}</div>
                </div>
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600"><Activity className="w-4 h-4"/></div>
                <div>
                  <div className="text-[9px] text-gray-500 uppercase">Total Cameras</div>
                  <div className="text-lg font-bold">{data.cameras_detected}</div>
                </div>
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><Clock className="w-4 h-4"/></div>
                <div>
                  <div className="text-[9px] text-gray-500 uppercase">Tracking Duration</div>
                  <div className="text-xs font-bold mt-1">{data.tracking_duration}</div>
                </div>
              </div>
            </div>

            {/* Visual Timeline */}
            <div className="relative pt-6 pb-2">
              <div className="absolute top-8 left-0 right-0 h-0.5 bg-purple-200"></div>
              <div className="flex justify-between relative z-10">
                {data.timeline.slice(0, 6).map((event, i) => (
                  <div key={i} className="flex flex-col items-center w-24">
                    <div className="text-[9px] text-gray-500 mb-2">{event.time}</div>
                    <div className="w-2 h-2 rounded-full bg-purple-600 mb-4 ring-4 ring-white"></div>
                    <div className="w-16 h-16 bg-gray-100 rounded border border-gray-300 overflow-hidden mb-2">
                       <img src={`http://localhost:8000${data.face_path}`} className="w-full h-full object-cover" alt="Frame" />
                    </div>
                    <div className="text-[8px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-mono">{event.camera}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 border-t border-dashed border-gray-300 pt-6">
            {/* 3. Face Enhancement */}
            <div>
              <h2 className="text-sm font-bold text-purple-800 tracking-widest uppercase mb-4">3. Face Enhancement Results</h2>
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-[10px] text-gray-500 text-center">Original Image</span>
                  <div className="aspect-[4/5] bg-gray-100 rounded border border-gray-300 overflow-hidden">
                    {originalImage ? <img src={originalImage} className="w-full h-full object-cover filter blur-[2px] contrast-75 grayscale" alt="Original" /> : <div className="w-full h-full bg-gray-200"></div>}
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-[10px] text-gray-500 text-center">Enhanced Image</span>
                  <div className="aspect-[4/5] bg-gray-100 rounded border border-gray-300 overflow-hidden">
                     {enhancedImage ? <img src={enhancedImage} className="w-full h-full object-cover" alt="Enhanced" /> : <div className="w-full h-full bg-gray-200"></div>}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Geometry Analysis */}
            <div>
              <h2 className="text-sm font-bold text-purple-800 tracking-widest uppercase mb-4">4. Geometry Analysis</h2>
              <div className="flex gap-6">
                <div className="w-32 aspect-[4/5] bg-gray-100 rounded border border-gray-300 overflow-hidden relative">
                   <img src={`http://localhost:8000${data.face_path}`} className="w-full h-full object-cover opacity-80" alt="Geom" />
                   {/* Fake dots for effect */}
                   <div className="absolute inset-0 bg-[url('/images/dots.png')] bg-cover opacity-30 mix-blend-screen"></div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <table className="w-full text-[10px]">
                    <tbody className="divide-y divide-gray-100">
                      <tr><td className="py-1.5 text-gray-500">Interocular Distance</td><td className="py-1.5 text-right font-mono text-gray-900">{data.geometry_metrics.interocular_distance} mm</td></tr>
                      <tr><td className="py-1.5 text-gray-500">Nose Width</td><td className="py-1.5 text-right font-mono text-gray-900">{data.geometry_metrics.nose_width} mm</td></tr>
                      <tr><td className="py-1.5 text-gray-500">Mouth Width</td><td className="py-1.5 text-right font-mono text-gray-900">{data.geometry_metrics.mouth_width} mm</td></tr>
                      <tr><td className="py-1.5 text-gray-500">Face Width</td><td className="py-1.5 text-right font-mono text-gray-900">{data.geometry_metrics.face_width} mm</td></tr>
                      <tr><td className="py-1.5 text-gray-500">Face Height</td><td className="py-1.5 text-right font-mono text-gray-900">{data.geometry_metrics.face_height} mm</td></tr>
                      <tr><td className="py-1.5 text-gray-500 font-bold">Symmetry Score</td><td className="py-1.5 text-right font-mono font-bold text-teal-600">{data.geometry_metrics.symmetry_score}%</td></tr>
                      <tr><td className="py-1.5 text-gray-500 font-bold">Geometry Match</td><td className="py-1.5 text-right font-mono font-bold text-purple-600">{data.geometry_metrics.geometry_match}%</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="h-10 bg-white border-t border-gray-200 px-10 flex justify-between items-center text-[9px] text-gray-400 font-mono">
          <span>Page 1 of {data.pages}</span>
          <span>This report is system generated using AI and validated for forensic use.</span>
          <div className="w-6 h-6 bg-gray-200"></div> {/* Fake QR Code */}
        </div>

      </div>

      {/* RIGHT SIDEBAR: Actions & Status */}
      <div className="w-72 flex flex-col gap-4 flex-shrink-0">
        
        {/* Status */}
        <div className="bg-[#0a0d16] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-green-500 flex items-center justify-center bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-green-400">Report Generated</h3>
            <p className="text-[9px] text-gray-400 mt-0.5">All analysis completed successfully<br/>Ready for Download & Share</p>
          </div>
        </div>

        {/* Download Options */}
        <div className="bg-[#0a0d16] border border-gray-800 rounded-xl p-4">
          <h3 className="text-[10px] font-bold text-purple-400 tracking-widest mb-4 uppercase">Download Options</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors group">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-xs font-bold">Download PDF Report</div>
                  <div className="text-[9px] text-purple-200">Recommended for official use</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-800 hover:border-gray-600 text-gray-300 transition-colors group">
              <div className="flex items-center gap-3">
                <Archive className="w-4 h-4 text-gray-500" />
                <div className="text-left">
                  <div className="text-xs">Export Evidence ZIP</div>
                  <div className="text-[9px] text-gray-500">All images & frames</div>
                </div>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-600 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-800 hover:border-gray-600 text-gray-300 transition-colors group">
              <div className="flex items-center gap-3">
                <Box className="w-4 h-4 text-gray-500" />
                <div className="text-left">
                  <div className="text-xs">Export 3D Model (GLB)</div>
                  <div className="text-[9px] text-gray-500">3D reconstructed model</div>
                </div>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-600 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-800 hover:border-gray-600 text-gray-300 transition-colors group">
              <div className="flex items-center gap-3">
                <FileJson className="w-4 h-4 text-gray-500" />
                <div className="text-left">
                  <div className="text-xs">Export JSON Data</div>
                  <div className="text-[9px] text-gray-500">Raw analysis results</div>
                </div>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-600 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-800 hover:border-gray-600 text-gray-300 transition-colors group">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-gray-500" />
                <div className="text-left">
                  <div className="text-xs">Export CSV Summary</div>
                  <div className="text-[9px] text-gray-500">Tabular data & analytics</div>
                </div>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-600 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-800 hover:border-gray-600 text-gray-300 transition-colors group">
              <div className="flex items-center gap-3">
                <Printer className="w-4 h-4 text-gray-500" />
                <div className="text-left">
                  <div className="text-xs">Print Report</div>
                  <div className="text-[9px] text-gray-500">Print ready format</div>
                </div>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Details & Security */}
        <div className="bg-[#0a0d16] border border-gray-800 rounded-xl p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-purple-400 tracking-widest mb-4 uppercase">Report Details</h3>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between border-b border-gray-800 pb-1"><span className="text-gray-500">Report Version</span><span className="text-gray-300 font-mono">{data.report_version}.0.0</span></div>
              <div className="flex justify-between border-b border-gray-800 pb-1"><span className="text-gray-500">File Size</span><span className="text-gray-300 font-mono">{data.file_size_mb} MB</span></div>
              <div className="flex justify-between border-b border-gray-800 pb-1"><span className="text-gray-500">Pages</span><span className="text-gray-300 font-mono">{data.pages}</span></div>
              <div className="flex justify-between border-b border-gray-800 pb-1"><span className="text-gray-500">Generated By</span><span className="text-gray-300">AI ForensiQ Engine</span></div>
              <div className="flex justify-between pb-1"><span className="text-gray-500">Security Hash</span><span className="text-gray-400 font-mono flex items-center gap-1">{data.security_hash}</span></div>
            </div>
          </div>
          
          <div className="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] font-bold text-blue-400">Report Verified & Secured</div>
              <div className="text-[8px] text-blue-200 mt-0.5">Digital signature & data integrity verified</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
