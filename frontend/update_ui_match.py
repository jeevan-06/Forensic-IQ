import re

SRC = "c:/Users/Jeevan Kumar/OneDrive/文档/project/frontend/src/components/AnalysisScanner.tsx"

with open(SRC, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add missing lucide icons
import_stmt = "import { ScanFace, AlertTriangle, Download, Compass, Activity, UserSearch, ArrowRight, CheckCircle2, ChevronRight, Video, Server, ArrowLeft, Fingerprint, Users, ShieldCheck, Zap, Sparkles, Eye, BarChart3, Layers, Search, Box } from 'lucide-react';"
new_import = "import { ScanFace, AlertTriangle, Download, Compass, Activity, UserSearch, ArrowRight, CheckCircle2, ChevronRight, Video, Server, ArrowLeft, Fingerprint, Users, ShieldCheck, Zap, Sparkles, Eye, BarChart3, Layers, Search, Box, Database, Binary, UserCheck, ScanLine, Code } from 'lucide-react';"
content = content.replace(import_stmt, new_import)

# 2. Add FaceMatchData Interface
interface_code = """
interface FaceMatchData {
  status: string;
  embedding_vector: number[];
  top_matches: Array<{
    db_id: string;
    image: string;
    similarity_score: number;
    status: string;
  }>;
}
"""
if "interface FaceMatchData" not in content:
    content = content.replace(
        "interface FaceGeometryData {",
        interface_code + "\ninterface FaceGeometryData {"
    )

# 3. Add state
if "const [matchData, setMatchData]" not in content:
    content = content.replace(
        "const [geometryData, setGeometryData] = useState<FaceGeometryData | null>(null);",
        "const [geometryData, setGeometryData] = useState<FaceGeometryData | null>(null);\n  const [matchData, setMatchData] = useState<FaceMatchData | null>(null);"
    )

# 4. Add startFaceMatch function
start_match_func = """
  const startFaceMatch = async () => {
    if (!enhancementData) return;
    setPhase('analyzing_face_match');
    try {
      const res = await api.post(`/pipeline/match_face/${fileId}`, {
        face_path: enhancementData.enhanced_path
      });
      setMatchData(res.data);
      setPhase('face_match_done');
    } catch (err: any) {
      setError('Face match failed: ' + (err.response?.data?.detail || err.message));
      setPhase('face_geometry_done');
    }
  };
"""
if "const startFaceMatch" not in content:
    content = content.replace(
        "const startTracking = async",
        start_match_func + "\n  const startTracking = async"
    )

# 5. Update the "PROCEED TO TRACKING" button in Geometry Done to point to startFaceMatch
content = content.replace(
    """<button onClick={() => startTracking()} className="w-full btn-cyber py-3 flex items-center justify-center gap-2 bg-purple-500/10 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all rounded-lg text-xs tracking-widest font-bold">
                      <Zap className="w-4 h-4" /> PROCEED TO TRACKING
                    </button>""",
    """<button onClick={() => startFaceMatch()} className="w-full btn-cyber py-3 flex items-center justify-center gap-2 bg-blue-500/10 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all rounded-lg text-xs tracking-widest font-bold">
                      <Fingerprint className="w-4 h-4" /> EXTRACT ARCFACE EMBEDDING
                    </button>"""
)

# 6. Insert new UI block
ui_block = """
          {/* ============================================================ */}
          {/* STAGE 4: FACE MATCHING UI */}
          {/* ============================================================ */}
          {phase === 'analyzing_face_match' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-8 flex flex-col items-center justify-center min-h-[600px] border-l-4 border-l-blue-500">
              <ScanLine className="w-16 h-16 text-blue-400 mb-6 animate-pulse" />
              <h3 className="text-xl font-bold text-white tracking-widest mb-2">EXTRACTING 512D EMBEDDING</h3>
              <p className="text-blue-400 text-sm mb-8">Deep Learning ArcFace Engine Initialization...</p>
              
              <div className="w-full max-w-lg bg-black/50 p-4 rounded-xl border border-gray-800 flex gap-4 overflow-hidden relative">
                {/* Simulated Scanning Grid */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMWUzYTg4IiBzdHJva2Utd2lkdGg9IjAuNSIvPgo8L3N2Zz4=')] opacity-20"></div>
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-blue-400 animate-[scan_2s_ease-in-out_infinite_alternate] shadow-[0_0_20px_theme('colors.blue.400')]"></div>
                
                <div className="w-32 h-32 bg-gray-900 rounded overflow-hidden relative z-10 border border-gray-700">
                  {enhancementData && <img src={`http://localhost:8000${enhancementData.enhanced_path}`} className="w-full h-full object-cover filter contrast-125" />}
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-2 z-10">
                  <div className="h-2 bg-gray-800 rounded-full w-full overflow-hidden"><div className="h-full bg-blue-500 w-full animate-pulse"></div></div>
                  <div className="h-2 bg-gray-800 rounded-full w-3/4 overflow-hidden"><div className="h-full bg-blue-400 w-full animate-[pulse_1.5s_ease-in-out_infinite]"></div></div>
                  <div className="h-2 bg-gray-800 rounded-full w-5/6 overflow-hidden"><div className="h-full bg-blue-600 w-full animate-[pulse_1.2s_ease-in-out_infinite]"></div></div>
                  <div className="text-xs font-mono text-gray-500 mt-2">Computing Cosine Similarity against Forensic Database...</div>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'face_match_done' && matchData && enhancementData && (
            <motion.div key="match-done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
              
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-blue-400" /> IDENTITY VERIFICATION
                </h3>
                <div className="text-xs font-mono text-blue-400 bg-blue-500/10 px-3 py-1 rounded border border-blue-500/30">
                  ARCFACE 512D EMBEDDING EXTRACTED
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                
                {/* Left Panel: Embedding Viz */}
                <div className="col-span-4 bg-[#0a0d16] border border-gray-800 rounded-xl p-4 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Binary className="w-32 h-32" /></div>
                  <h4 className="text-sm font-semibold text-gray-200 mb-4 z-10 flex items-center gap-2"><Code className="w-4 h-4 text-blue-500"/> Suspect Vector</h4>
                  
                  <div className="flex gap-4 mb-6 z-10">
                    <div className="w-24 h-24 rounded bg-black border border-blue-500/30 overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                      <img src={`http://localhost:8000${enhancementData.enhanced_path}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-1">
                      <div className="text-xs text-gray-400">Embedding Length: <span className="text-white font-mono">512</span></div>
                      <div className="text-xs text-gray-400">Precision: <span className="text-white font-mono">FP32</span></div>
                      <div className="text-xs text-gray-400">L2 Normalized: <span className="text-green-400 font-mono">TRUE</span></div>
                    </div>
                  </div>

                  <h5 className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 z-10">Vector Barcode (Visualized)</h5>
                  <div className="flex-1 bg-black border border-gray-800 rounded p-2 flex flex-wrap content-start gap-[1px] z-10 opacity-80">
                    {matchData.embedding_vector.slice(0, 256).map((val, idx) => {
                      // Map -1..1 to colors for visualization
                      const heat = Math.floor((val + 1) / 2 * 255);
                      return <div key={idx} className="w-1.5 h-4" style={{ backgroundColor: `rgb(0, ${heat}, ${255 - heat})` }}></div>;
                    })}
                  </div>
                </div>

                {/* Right Panel: Database Matches */}
                <div className="col-span-8 bg-[#0a0d16] border border-gray-800 rounded-xl p-4 flex flex-col">
                  <h4 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2"><Database className="w-4 h-4 text-blue-500"/> Forensic Database Matches</h4>
                  
                  {/* Top Match Highlight */}
                  <div className="bg-[#0d111d] border border-blue-500/30 rounded-lg p-4 mb-6 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-blue-500/10 blur-3xl pointer-events-none"></div>
                    
                    <div className="flex items-center gap-6 relative z-10">
                      <div className="w-24 h-24 rounded border border-gray-700 bg-black overflow-hidden relative">
                         <img src={matchData.top_matches[0].image} className="w-full h-full object-cover" />
                         <div className="absolute bottom-0 w-full bg-blue-500 text-black text-[9px] font-bold text-center py-0.5">DATABASE</div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="text-xs text-gray-400 tracking-widest mb-1">TOP MATCH</div>
                        <div className="text-3xl font-black text-white flex items-center gap-3">
                          {matchData.top_matches[0].similarity_score}%
                          {matchData.top_matches[0].status === "IDENTIFIED" ? 
                            <span className="text-[10px] px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/50 rounded flex items-center gap-1 uppercase tracking-widest"><UserCheck className="w-3 h-3"/> Identified</span> : 
                            <span className="text-[10px] px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/50 rounded uppercase tracking-widest">Unknown</span>
                          }
                        </div>
                        <div className="text-xs text-gray-500 mt-2 font-mono">DB_ID: {matchData.top_matches[0].db_id}</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="w-16 h-16 rounded-full border-4 border-gray-800 border-t-blue-500 border-r-blue-500 transform rotate-45 flex items-center justify-center">
                          <div className="transform -rotate-45 text-lg font-black text-blue-400"><Fingerprint className="w-6 h-6"/></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Runner Ups */}
                  <h5 className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Other Comparisons</h5>
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-800">
                        <th className="pb-2 font-normal">Rank</th>
                        <th className="pb-2 font-normal">Profile ID</th>
                        <th className="pb-2 font-normal">Similarity</th>
                        <th className="pb-2 font-normal text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {matchData.top_matches.slice(1).map((m, idx) => (
                        <tr key={idx} className="text-gray-300">
                          <td className="py-3 text-gray-500">#{idx + 2}</td>
                          <td className="py-3">{m.db_id}</td>
                          <td className="py-3 text-gray-400">{m.similarity_score}%</td>
                          <td className="py-3 text-right">
                            <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-[10px]">{m.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Proceed to Tracking */}
                  <div className="mt-4 pt-4 border-t border-gray-800 flex justify-end">
                    <button onClick={() => startTracking()} className="btn-cyber px-8 py-3 flex items-center gap-2 bg-purple-500/10 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all">
                      <Zap className="w-5 h-5" /> PROCEED TO TRACKING <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
"""

# Find where to insert the new UI block. Right before tracking loading state.
target = "{/* ============================================================ */}\n          {/* STAGE 5 LOADING: Re-ID & Tracking Scan */}"

if target not in content:
    # If the old tracker loading state text was slightly different
    target = "{/* ============================================================ */}\n          {/* STAGE 4 LOADING: ArcFace Embedding Scan */}"

if target in content:
    content = content.replace(target, ui_block + "\n" + target)
else:
    print("Could not find insertion point for Face Matching UI.")
    exit(1)

with open(SRC, "w", encoding="utf-8") as f:
    f.write(content)

print("Face Matching UI updated successfully.")
