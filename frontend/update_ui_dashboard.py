import re

SRC = "c:/Users/Jeevan Kumar/OneDrive/文档/project/frontend/src/components/AnalysisScanner.tsx"

with open(SRC, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update FaceGeometryData Interface
old_interface = """interface FaceGeometryData {
  status: string;
  geometry_image_path: string;
  measurements: {
    [key: string]: { value: number; unit: string; description: string };
  };
}"""

new_interface = """interface FaceGeometryData {
  status: string;
  geometry_image_path: string;
  match_score: number;
  symmetry_analysis: {
    overall: number;
    left_right: number;
    proportion: number;
    consistency: number;
  };
  key_measurements: Array<{
    name: string;
    value: number;
    unit: string;
    normalized: number;
    deviation: string;
    status: string;
  }>;
  facial_ratios: Array<{
    name: string;
    value: number;
    min: number;
    avg: number;
    max: number;
  }>;
  head_pose: {
    yaw: number;
    pitch: number;
    roll: number;
    quality: string;
  };
  landmark_groups: {
    jawline: number;
    eyebrows: number;
    eyes: number;
    nose: number;
    lips: number;
    face_contour: number;
    total: number;
  };
}"""

content = content.replace(old_interface, new_interface)

# 2. Extract the old face_geometry_done block and replace it
start_marker = "{/* ============================================================ */}\n          {/* FACE GEOMETRY RESULTS */}"
end_marker = "{/* ============================================================ */}\n          {/* STAGE 4 LOADING: ArcFace Embedding Scan */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find frontend markers to replace UI block.")
    exit(1)

new_ui_block = """{/* ============================================================ */}
          {/* FACE GEOMETRY RESULTS (NEW DASHBOARD) */}
          {/* ============================================================ */}
          {phase === 'face_geometry_done' && geometryData && enhancementData && (
            <motion.div key="geom-done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
              
              {/* TOP ROW: 4 Panels */}
              <div className="grid grid-cols-12 gap-4">
                
                {/* 1. Enhanced Face */}
                <div className="col-span-3 bg-[#0a0d16] border border-gray-800 rounded-xl overflow-hidden flex flex-col relative">
                  <div className="p-3 border-b border-gray-800/50 flex justify-between items-center bg-[#0d111d]">
                    <span className="text-sm font-semibold text-gray-200">Enhanced Face</span>
                    <Search className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 bg-black relative">
                    <img src={`http://localhost:8000${enhancementData.enhanced_path}`} className="w-full h-full object-cover" alt="Enhanced" />
                  </div>
                  <div className="p-2 flex justify-between items-center bg-[#0d111d] text-[10px]">
                    <span className="text-gray-400">Resolution: <span className="text-gray-300">532x532</span></span>
                    <span className="text-gray-400">Quality Score: <span className="text-teal-400 font-bold">95.2%</span></span>
                  </div>
                </div>

                {/* 2. Facial Landmarks */}
                <div className="col-span-3 bg-[#0a0d16] border border-gray-800 rounded-xl overflow-hidden flex flex-col relative">
                  <div className="p-3 border-b border-gray-800/50 flex justify-between items-center bg-[#0d111d]">
                    <span className="text-sm font-semibold text-gray-200">Facial Landmarks <span className="text-gray-500 text-xs">(468 Points)</span></span>
                    <Eye className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 bg-black relative">
                    <img src={`http://localhost:8000${geometryData.geometry_image_path}`} className="w-full h-full object-cover" alt="Landmarks" />
                  </div>
                  <div className="p-2 flex justify-between items-center bg-[#0d111d] text-[10px]">
                    <span className="text-gray-400">Landmarks Detected: <span className="text-teal-400 font-bold">468/468</span></span>
                    <span className="text-gray-400">Confidence: <span className="text-teal-400 font-bold">98.7%</span></span>
                  </div>
                </div>

                {/* 3. 3D Face Mesh */}
                <div className="col-span-3 bg-[#0a0d16] border border-gray-800 rounded-xl overflow-hidden flex flex-col relative">
                  <div className="p-3 border-b border-gray-800/50 flex justify-between items-center bg-[#0d111d]">
                    <span className="text-sm font-semibold text-gray-200">3D Face Mesh</span>
                    <Box className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 bg-black relative">
                    <img src="/images/blue_3d_face_mesh.png" className="w-full h-full object-cover" alt="3D Mesh" />
                  </div>
                  <div className="p-2 flex justify-between items-center bg-[#0d111d] text-[10px]">
                    <span className="text-gray-400">Mesh Quality: <span className="text-teal-400 font-bold">High</span></span>
                    <span className="text-gray-400">Vertices: <span className="text-gray-300">468</span></span>
                  </div>
                </div>

                {/* 4. Geometry Summary */}
                <div className="col-span-3 bg-[#0a0d16] border border-gray-800 rounded-xl p-4 flex flex-col">
                  <h4 className="text-sm font-semibold text-gray-200 mb-4">Geometry Summary</h4>
                  
                  {/* Circular Progress */}
                  <div className="flex flex-col items-center justify-center mb-6 relative">
                    <div className="w-32 h-32 rounded-full border-8 border-gray-800 border-t-teal-400 border-r-teal-400 transform -rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.2)]">
                      <div className="transform rotate-45 flex flex-col items-center text-center">
                        <span className="text-2xl font-black text-white">{geometryData.match_score.toFixed(1)}%</span>
                        <span className="text-[9px] text-gray-400">Geometry Match Score</span>
                      </div>
                    </div>
                    <div className="mt-3 px-3 py-0.5 bg-teal-900/40 border border-teal-500/50 rounded text-teal-400 text-[10px] font-bold">
                      Excellent Match
                    </div>
                  </div>

                  {/* Symmetry Bars */}
                  <h5 className="text-[11px] font-bold text-gray-400 mb-3">Symmetry Analysis</h5>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px]"><span className="text-gray-400">Overall Symmetry</span><span className="text-teal-400">{geometryData.symmetry_analysis.overall.toFixed(1)}%</span></div>
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-teal-400" style={{ width: `${geometryData.symmetry_analysis.overall}%` }}></div></div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px]"><span className="text-gray-400">Left-Right Balance</span><span className="text-teal-400">{geometryData.symmetry_analysis.left_right.toFixed(1)}%</span></div>
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-teal-400" style={{ width: `${geometryData.symmetry_analysis.left_right}%` }}></div></div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px]"><span className="text-gray-400">Facial Proportion</span><span className="text-teal-400">{geometryData.symmetry_analysis.proportion.toFixed(1)}%</span></div>
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-teal-400" style={{ width: `${geometryData.symmetry_analysis.proportion}%` }}></div></div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px]"><span className="text-gray-400">Structural Consistency</span><span className="text-teal-400">{geometryData.symmetry_analysis.consistency.toFixed(1)}%</span></div>
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-teal-400" style={{ width: `${geometryData.symmetry_analysis.consistency}%` }}></div></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* BOTTOM ROW: 3 Panels */}
              <div className="grid grid-cols-12 gap-4">
                
                {/* 5. Key Measurements (Left side image, right side table) */}
                <div className="col-span-6 bg-[#0a0d16] border border-gray-800 rounded-xl p-4 flex flex-col">
                  <h4 className="text-sm font-semibold text-gray-200 mb-4">Key Measurements</h4>
                  <div className="flex gap-4 flex-1">
                    <div className="w-1/3 rounded-lg overflow-hidden border border-gray-800 bg-black flex items-center justify-center">
                      <img src="/images/gray_measurement_head.png" className="w-full h-auto object-cover" alt="Measurement Head" />
                    </div>
                    <div className="w-2/3 flex flex-col">
                      <table className="w-full text-left text-[10px]">
                        <thead>
                          <tr className="text-gray-500 border-b border-gray-800">
                            <th className="pb-2 font-normal">#</th>
                            <th className="pb-2 font-normal">Measurement</th>
                            <th className="pb-2 font-normal text-right">Value</th>
                            <th className="pb-2 font-normal text-center">Normalized</th>
                            <th className="pb-2 font-normal text-center">Deviation</th>
                            <th className="pb-2 font-normal text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                          {geometryData.key_measurements.map((m, idx) => (
                            <tr key={idx} className="text-gray-300">
                              <td className="py-2 text-gray-500">{idx + 1}</td>
                              <td className="py-2">{m.name}</td>
                              <td className="py-2 font-mono text-right">{m.value.toFixed(2)} {m.unit}</td>
                              <td className="py-2 font-mono text-center">{m.normalized.toFixed(3)}</td>
                              <td className={`py-2 font-mono text-center ${m.deviation.startsWith('+') ? 'text-teal-400' : m.deviation.startsWith('-') ? 'text-red-400' : 'text-gray-500'}`}>{m.deviation}</td>
                              <td className="py-2 text-center"><CheckCircle2 className="w-3 h-3 text-teal-500 inline-block" /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* 6. Facial Ratios */}
                <div className="col-span-3 bg-[#0a0d16] border border-gray-800 rounded-xl p-4 flex flex-col">
                  <h4 className="text-sm font-semibold text-gray-200 mb-6">Facial Ratios</h4>
                  <div className="space-y-6 flex-1">
                    {geometryData.facial_ratios.map((r, idx) => {
                      // Calculate slider position roughly
                      const range = r.max - r.min;
                      const pct = Math.max(0, Math.min(100, ((r.value - r.min) / range) * 100));
                      return (
                        <div key={idx} className="flex flex-col gap-2">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-gray-400">{r.name}</span>
                            <span className="text-white font-mono font-bold">{r.value.toFixed(3)}</span>
                          </div>
                          <div className="relative pt-4 pb-2">
                            {/* Ruler ticks */}
                            <div className="absolute top-0 left-0 w-full flex justify-between text-[9px] text-gray-600 font-mono">
                              <span>{r.min.toFixed(2)}</span>
                              <span>{r.avg.toFixed(2)}</span>
                              <span>{r.max.toFixed(2)}</span>
                            </div>
                            {/* Track */}
                            <div className="h-1 bg-gray-800 rounded-full w-full relative overflow-visible">
                              {/* Avg Marker */}
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-3 bg-gray-500"></div>
                              {/* Value thumb */}
                              <div className="absolute top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_5px_white]" style={{ left: `${pct}%` }}></div>
                              {/* Colored bar from avg to thumb */}
                              <div className={`absolute top-0 h-full ${r.value > r.avg ? 'bg-teal-500' : 'bg-red-500'}`} style={{
                                left: `${Math.min(50, pct)}%`,
                                width: `${Math.abs(pct - 50)}%`
                              }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Legend */}
                  <div className="flex gap-4 items-center justify-center text-[9px] text-gray-500 mt-4 border-t border-gray-800/50 pt-4">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-sm"></div> Below Avg</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-500 rounded-sm"></div> Average</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-teal-500 rounded-sm"></div> Above Avg</div>
                  </div>
                </div>

                {/* 7. Head Pose & Landmarks + Proceed Button */}
                <div className="col-span-3 bg-[#0a0d16] border border-gray-800 rounded-xl p-4 flex flex-col">
                  
                  <h4 className="text-sm font-semibold text-gray-200 mb-2">Head Pose</h4>
                  <div className="flex gap-4 items-center mb-6 bg-[#0d111d] p-3 rounded-lg border border-gray-800/50">
                    <div className="w-20 h-20 rounded bg-black overflow-hidden flex items-center justify-center">
                      <img src="/images/3d_head_pose_axes.png" className="w-full h-auto" alt="Pose" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between text-[11px]"><span className="text-gray-500">Yaw</span><span className="text-white font-mono">{geometryData.head_pose.yaw}°</span></div>
                      <div className="flex justify-between text-[11px]"><span className="text-gray-500">Pitch</span><span className="text-white font-mono">{geometryData.head_pose.pitch}°</span></div>
                      <div className="flex justify-between text-[11px]"><span className="text-gray-500">Roll</span><span className="text-white font-mono">{geometryData.head_pose.roll}°</span></div>
                      <div className="flex justify-between text-[11px]"><span className="text-gray-500">Pose Quality</span><span className="text-teal-400 font-bold">{geometryData.head_pose.quality}</span></div>
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-gray-200 mb-3">Landmark Groups</h4>
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between text-[11px] py-1 border-b border-gray-800/30"><span className="text-gray-400 flex items-center gap-2">Jawline</span><span className="text-white">{geometryData.landmark_groups.jawline}</span></div>
                    <div className="flex justify-between text-[11px] py-1 border-b border-gray-800/30"><span className="text-gray-400 flex items-center gap-2">Eyebrows</span><span className="text-white">{geometryData.landmark_groups.eyebrows}</span></div>
                    <div className="flex justify-between text-[11px] py-1 border-b border-gray-800/30"><span className="text-gray-400 flex items-center gap-2">Eyes</span><span className="text-white">{geometryData.landmark_groups.eyes}</span></div>
                    <div className="flex justify-between text-[11px] py-1 border-b border-gray-800/30"><span className="text-gray-400 flex items-center gap-2">Nose</span><span className="text-white">{geometryData.landmark_groups.nose}</span></div>
                    <div className="flex justify-between text-[11px] py-1 border-b border-gray-800/30"><span className="text-gray-400 flex items-center gap-2">Lips</span><span className="text-white">{geometryData.landmark_groups.lips}</span></div>
                    <div className="flex justify-between text-[11px] py-1 border-b border-gray-800/30"><span className="text-gray-400 flex items-center gap-2">Face Contour</span><span className="text-white">{geometryData.landmark_groups.face_contour}</span></div>
                    <div className="flex justify-between text-[11px] py-1 mt-2 font-bold"><span className="text-gray-300">Total Landmarks</span><span className="text-teal-400">{geometryData.landmark_groups.total}</span></div>
                  </div>

                  {/* Proceed Button */}
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <button onClick={() => startTracking()} className="w-full btn-cyber py-3 flex items-center justify-center gap-2 bg-purple-500/10 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all rounded-lg text-xs tracking-widest font-bold">
                      <Zap className="w-4 h-4" /> PROCEED TO TRACKING
                    </button>
                  </div>

                </div>

              </div>
            </motion.div>
          )}\n"""

content = content[:start_idx] + new_ui_block + content[end_idx:]

with open(SRC, "w", encoding="utf-8") as f:
    f.write(content)

print("Frontend UI successfully replaced.")
