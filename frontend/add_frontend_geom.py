import re

SRC = "c:/Users/Jeevan Kumar/OneDrive/文档/project/frontend/src/components/AnalysisScanner.tsx"

with open(SRC, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update PipelinePhase
content = content.replace(
    "| 'enhancement_done'\n  | 'tracking'",
    "| 'enhancement_done'\n  | 'analyzing_face_geometry'\n  | 'face_geometry_done'\n  | 'tracking'"
)

# 2. Add FaceGeometryData interface
geom_interface = """
interface FaceGeometryData {
  status: string;
  geometry_image_path: string;
  measurements: {
    [key: string]: { value: number; unit: string; description: string };
  };
}
"""
if "interface FaceGeometryData" not in content:
    content = content.replace("interface FaceMetadata {", geom_interface + "\ninterface FaceMetadata {")

# 3. Add geometryData state
if "const [geometryData" not in content:
    content = content.replace(
        "const [enhancementData, setEnhancementData] = useState<EnhancementData | null>(null);",
        "const [enhancementData, setEnhancementData] = useState<EnhancementData | null>(null);\n  const [geometryData, setGeometryData] = useState<FaceGeometryData | null>(null);"
    )

# 4. Add startFaceGeometryAnalysis
api_func = """
  const startFaceGeometryAnalysis = async () => {
    if (!enhancementData) return;
    setPhase('analyzing_face_geometry');
    try {
      const res = await api.post(`/pipeline/analyze_face_geometry/${fileId}`, {
        face_path: enhancementData.enhanced_path,
      });
      setGeometryData(res.data);
      setPhase('face_geometry_done');
    } catch (err: any) {
      setError('Geometry analysis failed: ' + (err.response?.data?.detail || err.message));
      setPhase('enhancement_done');
    }
  };
"""
if "startFaceGeometryAnalysis = async" not in content:
    content = content.replace(
        "const startTracking = async",
        api_func + "\n  const startTracking = async"
    )

# 5. Update Enhancement "Start Tracking" button to "Analyze Face Geometry"
content = content.replace(
    """<button onClick={() => startTracking()} className="w-full mt-2 flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all text-left shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded bg-white/20 flex items-center justify-center backdrop-blur-sm"><Zap className="w-3.5 h-3.5 text-white" /></div>
                          <div>
                            <div className="text-xs text-white font-bold">Start Tracking</div>
                            <div className="text-[9px] text-blue-100">Track this face across video</div>""",
    """<button onClick={() => startFaceGeometryAnalysis()} className="w-full mt-2 flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all text-left shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded bg-white/20 flex items-center justify-center backdrop-blur-sm"><Compass className="w-3.5 h-3.5 text-white" /></div>
                          <div>
                            <div className="text-xs text-white font-bold">Analyze Face Geometry</div>
                            <div className="text-[9px] text-blue-100">Calculate structural proportions</div>"""
)

# 6. Add the new UI blocks (analyzing_face_geometry and face_geometry_done)
new_ui = """
          {/* ============================================================ */}
          {/* FACE GEOMETRY: Loading */}
          {/* ============================================================ */}
          {phase === 'analyzing_face_geometry' && (
            <motion.div key="geom-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-panel p-10 border-l-4 border-l-teal-500 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(20,184,166,0.08)_0%,_transparent_70%)] pointer-events-none"></div>
              
              <div className="relative flex items-center justify-center mb-8">
                <div className="absolute w-48 h-48 rounded-full border border-teal-500/10 animate-ping"></div>
                <div className="w-20 h-20 rounded-full bg-teal-900/30 border border-teal-500 flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.5)]">
                  <Compass className="w-10 h-10 text-teal-400 animate-spin-slow" />
                </div>
              </div>

              <h3 className="text-xl font-black text-white tracking-widest mb-2">MAPPING FACIAL GEOMETRY</h3>
              <p className="text-teal-400 font-mono text-sm mb-8 text-center max-w-md">
                Extracting 468 3D landmarks via Mediapipe.<br/>
                Calculating mathematical proportions and symmetry...
              </p>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* FACE GEOMETRY RESULTS */}
          {/* ============================================================ */}
          {phase === 'face_geometry_done' && geometryData && (
            <motion.div key="geom-done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-panel p-6 border-l-4 border-l-teal-500 relative overflow-hidden min-h-[600px] flex flex-col">
              <div className="absolute right-0 top-0 bottom-0 w-64 bg-teal-500/5 blur-3xl pointer-events-none"></div>

              <h3 className="text-lg font-bold text-white tracking-widest border-b border-cyber-border/50 pb-4 mb-6 flex items-center justify-between relative z-10">
                <span className="flex items-center gap-2"><Compass className="w-5 h-5 text-teal-400" /> FACE GEOMETRY ANALYSIS</span>
                <span className="text-sm font-mono text-teal-400 font-bold bg-teal-500/10 px-3 py-1 rounded">468 LANDMARKS MAPPED</span>
              </h3>

              <div className="grid grid-cols-12 gap-6 flex-1 relative z-10">
                {/* Left: Wireframe Image */}
                <div className="col-span-5 bg-[#0B0F19] border border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center">
                  <h4 className="text-gray-400 text-sm font-semibold mb-4 self-start w-full border-b border-gray-800/50 pb-2">Forensic Mesh Overlay</h4>
                  <div className="w-full max-w-[320px] rounded-lg overflow-hidden border border-teal-500/30 shadow-[0_0_25px_rgba(20,184,166,0.15)] bg-black">
                    <img src={`http://localhost:8000${geometryData.geometry_image_path}`} alt="Geometry Wireframe" className="w-full h-auto object-contain" />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-4 text-center">Structural boundaries, distances, and spatial ratios extracted securely.</p>
                </div>

                {/* Right: Metrics Table */}
                <div className="col-span-7 bg-[#0B0F19] border border-gray-800 rounded-xl p-4 flex flex-col">
                  <h4 className="text-gray-400 text-sm font-semibold mb-4 border-b border-gray-800/50 pb-2">Geometric Proportions</h4>
                  
                  <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                    {Object.entries(geometryData.measurements).map(([key, data]) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-[#0f1523] border border-gray-800 hover:border-teal-500/30 transition-colors">
                        <div>
                          <div className="text-xs font-bold text-gray-200 capitalize">{key.replace('_', ' ')}</div>
                          <div className="text-[10px] text-gray-500">{data.description}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-mono font-bold text-teal-400">{data.value}</span>
                          <span className="text-[10px] text-gray-500 ml-1">{data.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-800/50 flex justify-end">
                    <button onClick={() => startTracking()} className="btn-cyber px-8 py-3 flex items-center gap-2 bg-purple-500/10 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all">
                      <Zap className="w-5 h-5" /> PROCEED TO TRACKING <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
"""

if "FACE GEOMETRY RESULTS" not in content:
    content = content.replace(
        "{/* ============================================================ */}\n          {/* STAGE 4 LOADING: ArcFace Embedding Scan */}",
        new_ui + "\n          {/* ============================================================ */}\n          {/* STAGE 4 LOADING: ArcFace Embedding Scan */}"
    )

with open(SRC, "w", encoding="utf-8") as f:
    f.write(content)

print("Frontend updated successfully!")
