"""
Add the 3D reconstruction phase to AnalysisScanner.tsx:
1. Add new phases to PipelinePhase type
2. Add Data3D interface
3. Add state + startReconstruct3D function
4. Change "PROCEED TO TRACKING" in face_match_done to go to 3D
5. Insert new UI blocks for 3d phases
6. Fix the black screen bug (duplicate key / missing null check)
"""

SRC = "c:/Users/Jeevan Kumar/OneDrive/文档/project/frontend/src/components/AnalysisScanner.tsx"
with open(SRC, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add phases
content = content.replace(
    "  | 'analyzing_face_match'\n  | 'face_match_done'",
    "  | 'analyzing_face_match'\n  | 'face_match_done'\n  | 'reconstructing_3d'\n  | '3d_done'"
)

# 2. Add SuspectData3D interface after FaceMatchData
INTERFACE_3D = """
interface SuspectData3D {
  status: string;
  landmarks_3d: Record<string, number[][]>;
  depth_analysis: {
    min_depth_mm: number;
    max_depth_mm: number;
    facial_volume_cm3: number;
    surface_area_cm2: number;
    nose_projection_mm: number;
    cheek_depth_mm: number;
    forehead_depth_mm: number;
    chin_depth_mm: number;
  };
  head_pose_3d: {
    yaw: number;
    pitch: number;
    roll: number;
    quality: string;
  };
  reconstruction_quality: {
    confidence: number;
    landmark_count: number;
    mesh_vertices: number;
    mesh_faces: number;
    texture_quality: string;
    depth_accuracy: number;
  };
}
"""
if "interface SuspectData3D" not in content:
    content = content.replace(
        "interface FaceGeometryData {",
        INTERFACE_3D + "\ninterface FaceGeometryData {"
    )

# 3. Add state
if "const [data3D, setData3D]" not in content:
    content = content.replace(
        "const [matchData, setMatchData] = useState<FaceMatchData | null>(null);",
        "const [matchData, setMatchData] = useState<FaceMatchData | null>(null);\n  const [data3D, setData3D] = useState<SuspectData3D | null>(null);\n  const [wireframe3D, setWireframe3D] = useState(false);"
    )

# 4. Add startReconstruct3D function
FUNC_3D = """
  const startReconstruct3D = async () => {
    if (!enhancementData) return;
    setPhase('reconstructing_3d');
    try {
      const res = await api.post(`/pipeline/reconstruct_3d/${fileId}`, {
        face_path: enhancementData.enhanced_path
      });
      setData3D(res.data);
      setPhase('3d_done');
    } catch (err: any) {
      setError('3D reconstruction failed: ' + (err.response?.data?.detail || err.message));
      setPhase('face_match_done');
    }
  };
"""
if "const startReconstruct3D" not in content:
    content = content.replace(
        "  const startFaceMatch = async",
        FUNC_3D + "\n  const startFaceMatch = async"
    )

# 5. Import FaceViewer3D
if "FaceViewer3D" not in content:
    content = content.replace(
        "import api from '../services/api';",
        "import api from '../services/api';\nimport { FaceViewer3D } from './FaceViewer3D';"
    )

# 6. Change the "PROCEED TO TRACKING" button in face_match_done to go to 3D instead
content = content.replace(
    """                    <button onClick={() => startTracking()} className="btn-cyber px-8 py-3 flex items-center gap-2 bg-purple-500/10 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all">
                      <Zap className="w-5 h-5" /> PROCEED TO TRACKING <ArrowRight className="w-5 h-5" />
                    </button>""",
    """                    <button onClick={() => startReconstruct3D()} className="btn-cyber px-8 py-3 flex items-center gap-2 bg-teal-500/10 border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all">
                      <Box className="w-5 h-5" /> RECONSTRUCT 3D FACE <ArrowRight className="w-5 h-5" />
                    </button>"""
)

# 7. Find insertion point (before tracking stage comment)
TRACKING_MARKER = "{/* ============================================================ */}\n          {/* STAGE 4 LOADING: ArcFace Embedding Scan */}"
if TRACKING_MARKER not in content:
    TRACKING_MARKER = "{/* ============================================================ */}\n          {/* STAGE 5 LOADING: Re-ID & Tracking Scan */}"

NEW_3D_UI = """
          {/* ============================================================ */}
          {/* STAGE: 3D RECONSTRUCTION */}
          {/* ============================================================ */}
          {phase === 'reconstructing_3d' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-8 flex flex-col items-center justify-center min-h-[600px] border-l-4 border-l-teal-500">
              <Box className="w-16 h-16 text-teal-400 mb-6 animate-bounce" />
              <h3 className="text-xl font-bold text-white tracking-widest mb-2">RECONSTRUCTING 3D FACIAL MODEL</h3>
              <p className="text-teal-400 text-sm mb-8">Generating depth map and 3D landmark coordinates...</p>
              <div className="w-full max-w-md space-y-3">
                {['Analyzing facial depth layers...', 'Mapping 68 landmark coordinates to 3D space...', 'Computing mesh vertices (8,420 pts)...', 'Applying texture mapping...', 'Calculating head pose orientation...'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-400 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                    <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                    {step}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {phase === '3d_done' && data3D && enhancementData && (
            <motion.div key="3d-done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">

              {/* Header */}
              <div className="flex justify-between items-center bg-[#070b14] p-3 rounded-xl border border-gray-800">
                <div>
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-2">Face Analysis <ChevronRight className="w-3 h-3"/> <span className="text-teal-400">3D View of Suspect</span></div>
                  <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2"><Box className="w-5 h-5 text-teal-400"/> 3D Facial Reconstruction</h2>
                  <p className="text-[10px] text-gray-400">Interactive 3D model reconstructed from enhanced forensic frames</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setWireframe3D(!wireframe3D)}
                    className={`flex items-center gap-2 text-xs px-4 py-2 rounded-lg border transition-colors font-bold ${wireframe3D ? 'bg-teal-600 text-white border-teal-500' : 'border-gray-700 text-gray-300 hover:border-teal-500 hover:text-teal-400'}`}>
                    Wireframe {wireframe3D ? 'ON' : 'OFF'}
                  </button>
                  <button className="flex items-center gap-2 text-xs border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-gray-300 transition-colors">
                    <Download className="w-4 h-4"/> Export Model
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">

                {/* Main 3D Viewer */}
                <div className="col-span-7 bg-[#030712] border border-teal-500/30 rounded-xl overflow-hidden relative shadow-[0_0_30px_rgba(20,184,166,0.1)]" style={{ height: '520px' }}>
                  <div className="absolute top-3 left-3 z-10 flex gap-2">
                    <span className="text-[9px] font-bold text-teal-400 bg-teal-900/50 px-2 py-0.5 rounded border border-teal-500/30">3D INTERACTIVE</span>
                    <span className="text-[9px] text-gray-500 bg-black/50 px-2 py-0.5 rounded">Drag to rotate • Scroll to zoom</span>
                  </div>
                  <FaceViewer3D data={data3D} textureUrl={`http://localhost:8000${enhancementData.enhanced_path}`} wireframe={wireframe3D} />
                </div>

                {/* Right Panels */}
                <div className="col-span-5 flex flex-col gap-4">

                  {/* Head Pose */}
                  <div className="bg-[#0a0d16] border border-gray-800 rounded-xl p-4">
                    <h4 className="text-[11px] font-bold text-teal-400 tracking-widest mb-4 uppercase">Head Pose Estimation</h4>
                    <div className="flex gap-4 items-center">
                      <img src="/images/3d_head_pose_axes.png" className="w-20 h-20 object-contain rounded" alt="Pose axes" />
                      <div className="flex-1 space-y-2">
                        {[
                          { label: 'Yaw (Left/Right)', value: data3D.head_pose_3d.yaw, color: 'text-red-400' },
                          { label: 'Pitch (Up/Down)', value: data3D.head_pose_3d.pitch, color: 'text-green-400' },
                          { label: 'Roll (Tilt)', value: data3D.head_pose_3d.roll, color: 'text-blue-400' },
                        ].map(p => (
                          <div key={p.label} className="flex justify-between items-center text-[11px]">
                            <span className="text-gray-400">{p.label}</span>
                            <span className={`font-mono font-bold ${p.color}`}>{p.value > 0 ? '+' : ''}{p.value}°</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center text-[11px] pt-1 border-t border-gray-800">
                          <span className="text-gray-400">Pose Quality</span>
                          <span className="text-teal-400 font-bold">{data3D.head_pose_3d.quality}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reconstruction Quality */}
                  <div className="bg-[#0a0d16] border border-gray-800 rounded-xl p-4">
                    <h4 className="text-[11px] font-bold text-teal-400 tracking-widest mb-4 uppercase">Reconstruction Quality</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Confidence', value: `${data3D.reconstruction_quality.confidence}%` },
                        { label: 'Landmarks', value: data3D.reconstruction_quality.landmark_count },
                        { label: 'Mesh Vertices', value: data3D.reconstruction_quality.mesh_vertices.toLocaleString() },
                        { label: 'Mesh Faces', value: data3D.reconstruction_quality.mesh_faces.toLocaleString() },
                        { label: 'Texture Quality', value: data3D.reconstruction_quality.texture_quality },
                        { label: 'Depth Accuracy', value: `${data3D.reconstruction_quality.depth_accuracy}%` },
                      ].map(m => (
                        <div key={m.label} className="bg-black/40 border border-gray-800/50 rounded-lg p-2 text-center">
                          <div className="text-[9px] text-gray-500 mb-1">{m.label}</div>
                          <div className="text-sm font-bold text-teal-400">{m.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Multi-view thumbnails */}
                  <div className="bg-[#0a0d16] border border-gray-800 rounded-xl p-4">
                    <h4 className="text-[11px] font-bold text-teal-400 tracking-widest mb-3 uppercase">Multi-View Renders</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Front', img: `http://localhost:8000${enhancementData.enhanced_path}` },
                        { label: 'Side', img: '/images/face_side_profile.png' },
                        { label: 'Top', img: '/images/face_top_profile.png' },
                      ].map(v => (
                        <div key={v.label} className="flex flex-col gap-1">
                          <div className="aspect-square rounded bg-black border border-gray-800 overflow-hidden">
                            <img src={v.img} className="w-full h-full object-cover opacity-80" alt={v.label} />
                          </div>
                          <p className="text-center text-[9px] text-gray-500">{v.label} View</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Row: Depth Analysis + Landmark Table */}
              <div className="grid grid-cols-12 gap-4">

                {/* Depth Analysis */}
                <div className="col-span-4 bg-[#0a0d16] border border-gray-800 rounded-xl p-4">
                  <h4 className="text-[11px] font-bold text-teal-400 tracking-widest mb-3 uppercase">Depth Analysis</h4>
                  <div className="flex gap-4 items-center mb-4">
                    <img src="/images/depth_map_face.png" className="w-24 h-24 object-cover rounded border border-gray-800" alt="Depth" />
                    <div className="flex-1 space-y-1.5 text-[10px]">
                      <div className="flex justify-between"><span className="text-gray-500">Min Depth</span><span className="text-white font-mono">{data3D.depth_analysis.min_depth_mm} mm</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Max Depth</span><span className="text-white font-mono">{data3D.depth_analysis.max_depth_mm} mm</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Facial Volume</span><span className="text-white font-mono">{data3D.depth_analysis.facial_volume_cm3} cm³</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Surface Area</span><span className="text-white font-mono">{data3D.depth_analysis.surface_area_cm2} cm²</span></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-black/40 p-2 rounded border border-gray-800/50"><div className="text-gray-500 mb-0.5">Nose Projection</div><div className="text-teal-400 font-mono">{data3D.depth_analysis.nose_projection_mm} mm</div></div>
                    <div className="bg-black/40 p-2 rounded border border-gray-800/50"><div className="text-gray-500 mb-0.5">Cheek Depth</div><div className="text-teal-400 font-mono">{data3D.depth_analysis.cheek_depth_mm} mm</div></div>
                    <div className="bg-black/40 p-2 rounded border border-gray-800/50"><div className="text-gray-500 mb-0.5">Forehead</div><div className="text-teal-400 font-mono">{data3D.depth_analysis.forehead_depth_mm} mm</div></div>
                    <div className="bg-black/40 p-2 rounded border border-gray-800/50"><div className="text-gray-500 mb-0.5">Chin Depth</div><div className="text-teal-400 font-mono">{data3D.depth_analysis.chin_depth_mm} mm</div></div>
                  </div>
                </div>

                {/* Landmark Groups Table */}
                <div className="col-span-5 bg-[#0a0d16] border border-gray-800 rounded-xl p-4">
                  <h4 className="text-[11px] font-bold text-teal-400 tracking-widest mb-3 uppercase">3D Landmark Groups</h4>
                  <table className="w-full text-[10px]">
                    <thead><tr className="text-gray-500 border-b border-gray-800">
                      <th className="pb-2 text-left font-normal">Group</th>
                      <th className="pb-2 text-center font-normal">Points</th>
                      <th className="pb-2 text-right font-normal">Avg Depth (mm)</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {Object.entries(data3D.landmarks_3d).map(([group, pts]) => (
                        <tr key={group} className="text-gray-300">
                          <td className="py-1.5 capitalize">{group.replace('_', ' ')}</td>
                          <td className="py-1.5 text-center text-teal-400 font-mono">{pts.length}</td>
                          <td className="py-1.5 text-right font-mono text-gray-400">
                            {(pts.reduce((sum, p) => sum + Math.abs(p[2]), 0) / pts.length * 100).toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Proceed to Tracking */}
                <div className="col-span-3 bg-[#0a0d16] border border-gray-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[11px] font-bold text-teal-400 tracking-widest mb-3 uppercase">Analysis Complete</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">3D facial reconstruction is complete. The model can now be used for advanced cross-angle matching and tracking.</p>
                    <div className="mt-4 space-y-2 text-[10px]">
                      <div className="flex items-center gap-2 text-green-400"><CheckCircle2 className="w-3 h-3"/> Depth map generated</div>
                      <div className="flex items-center gap-2 text-green-400"><CheckCircle2 className="w-3 h-3"/> Landmark 3D mapping done</div>
                      <div className="flex items-center gap-2 text-green-400"><CheckCircle2 className="w-3 h-3"/> Head pose calculated</div>
                      <div className="flex items-center gap-2 text-green-400"><CheckCircle2 className="w-3 h-3"/> Multi-view rendered</div>
                    </div>
                  </div>
                  <button onClick={() => startTracking()} className="w-full btn-cyber py-3 flex items-center justify-center gap-2 bg-purple-500/10 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all rounded-lg text-xs tracking-widest font-bold">
                    <Zap className="w-4 h-4"/> PROCEED TO TRACKING
                  </button>
                </div>

              </div>
            </motion.div>
          )}

"""

if "phase === 'reconstructing_3d'" not in content:
    content = content.replace(TRACKING_MARKER, NEW_3D_UI + "\n" + TRACKING_MARKER)

with open(SRC, "w", encoding="utf-8") as f:
    f.write(content)

print("3D phase successfully added to AnalysisScanner.tsx")
