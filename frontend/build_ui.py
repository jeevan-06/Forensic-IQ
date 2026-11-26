"""
Replaces the `phase === 'enhancement_done'` block in AnalysisScanner.tsx
with the new layout from the second mockup.
"""
import re

SRC = "c:/Users/Jeevan Kumar/OneDrive/文档/project/frontend/src/components/AnalysisScanner.tsx"

with open(SRC, "r", encoding="utf-8") as f:
    content = f.read()

# Locate the start and end of the block
start_marker = "{/* ============================================================ */}\n          {/* FACE ENHANCEMENT RESULTS */}\n          {/* ============================================================ */}\n          {phase === 'enhancement_done' && enhancementData && selectedTargetFace && ("
end_marker = "          )}\n\n          {/* ============================================================ */}\n          {/* STAGE 4 LOADING: ArcFace Embedding Scan */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find markers!")
    print("Start:", start_idx)
    print("End:", end_idx)
    exit(1)

NEW_BLOCK = """{/* ============================================================ */}
          {/* FACE ENHANCEMENT RESULTS */}
          {/* ============================================================ */}
          {phase === 'enhancement_done' && enhancementData && selectedTargetFace && (
            <motion.div key="enhancement-done-new" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex flex-col space-y-4">
              
              {/* TOP ROW */}
              <div className="grid grid-cols-12 gap-4">
                
                {/* Selected Suspect */}
                <div className="col-span-3 bg-[#0B0F19] border border-gray-800 rounded-xl p-4 flex flex-col">
                  <h3 className="text-gray-400 text-sm font-semibold mb-4">Selected Suspect</h3>
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-700 bg-black shrink-0">
                      <img src={`http://localhost:8000${enhancementData.original_path}`} alt="Suspect" className="w-full h-full object-cover" />
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
                      <div>
                        <div className="text-[10px] text-gray-500">Frame ID</div>
                        <div className="text-xs font-mono text-white">#4587</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500">Timestamp</div>
                        <div className="text-xs font-mono text-white">00:12:45</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500">Camera</div>
                        <div className="text-xs font-mono text-white">Cam_02</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500">Confidence</div>
                        <div className="text-xs font-mono text-green-400">91.2%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhancement Progress */}
                <div className="col-span-6 bg-[#0B0F19] border border-gray-800 rounded-xl p-4 flex items-center justify-center gap-8">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-800" />
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={251.2} strokeDashoffset={0} className="text-blue-600 transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">100%</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-green-400 font-medium mb-1">
                      <CheckCircle2 className="w-5 h-5" /> Enhancement Completed
                    </div>
                    <div className="text-xs text-gray-400 max-w-xs mb-2">All enhancement steps completed successfully.</div>
                    <div className="text-[10px] text-gray-500 font-mono">Time Taken: 00:00:18</div>
                  </div>
                </div>

                {/* Enhancement Settings */}
                <div className="col-span-3 bg-[#0B0F19] border border-gray-800 rounded-xl p-4 flex flex-col">
                  <h3 className="text-gray-400 text-sm font-semibold mb-3">Enhancement Settings</h3>
                  <div className="space-y-2 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-gray-500 flex items-center gap-1.5"><Layers className="w-3.5 h-3.5"/> Denoising Model</span>
                      <span className="text-[11px] text-gray-300 bg-gray-800/50 px-2 py-0.5 rounded border border-gray-700">SCUNet v</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-gray-500 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5"/> Super Resolution</span>
                      <span className="text-[11px] text-gray-300 bg-gray-800/50 px-2 py-0.5 rounded border border-gray-700">RealESRGAN x2plus v</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-gray-500 flex items-center gap-1.5"><UserSearch className="w-3.5 h-3.5"/> Face Restoration</span>
                      <span className="text-[11px] text-gray-300 bg-gray-800/50 px-2 py-0.5 rounded border border-gray-700">CodeFormer v</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-gray-500 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> Fidelity Weight</span>
                        <span className="text-[11px] text-purple-400 font-mono">0.80</span>
                      </div>
                      <input type="range" min="0" max="1" step="0.01" defaultValue="0.8" className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500" disabled/>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-gray-500 flex items-center gap-1.5"><Video className="w-3.5 h-3.5"/> Output Resolution</span>
                      <span className="text-[11px] text-gray-300 bg-gray-800/50 px-2 py-0.5 rounded border border-gray-700">512 x 512 v</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* MIDDLE ROW: Pipeline Cards */}
              <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-4">
                <h3 className="text-gray-400 text-sm font-semibold mb-4">Enhancement Pipeline</h3>
                
                <div className="grid grid-cols-5 gap-3">
                  {/* Card 1: Denoising */}
                  <div className="border border-gray-800 bg-[#0f1523] rounded-xl overflow-hidden flex flex-col relative group">
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-gray-700/50">
                      <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-[9px] font-bold text-white">1</div>
                      <span className="text-[10px] text-gray-200 font-medium">Denoising</span>
                    </div>
                    <div className="absolute top-2 right-2 z-10 w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                      <CheckCircle2 className="w-2.5 h-2.5 text-green-400" />
                    </div>
                    <div className="h-32 bg-black relative overflow-hidden">
                      <img src={`http://localhost:8000${enhancementData.original_path}`} alt="Denoising" className="w-full h-full object-cover opacity-80 mix-blend-screen filter brightness-110 contrast-125" style={{ filter: 'noise(100%)' }}/>
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <p className="text-[10px] text-gray-400 leading-snug mb-3">Reduces noise and grain from low-quality image.</p>
                      <div className="mt-auto">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-gray-500">Quality Score</span>
                          <span className="text-xs font-mono text-gray-300">45%</span>
                        </div>
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-purple-600/50 w-[45%]"></div></div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Deblurring */}
                  <div className="border border-gray-800 bg-[#0f1523] rounded-xl overflow-hidden flex flex-col relative group">
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-gray-700/50">
                      <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-[9px] font-bold text-white">2</div>
                      <span className="text-[10px] text-gray-200 font-medium">Deblurring</span>
                    </div>
                    <div className="absolute top-2 right-2 z-10 w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                      <CheckCircle2 className="w-2.5 h-2.5 text-green-400" />
                    </div>
                    <div className="h-32 bg-black relative overflow-hidden">
                      <img src={`http://localhost:8000${enhancementData.original_path}`} alt="Deblurring" className="w-full h-full object-cover filter blur-[1px] opacity-90"/>
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <p className="text-[10px] text-gray-400 leading-snug mb-3">Removes blur and improves facial sharpness.</p>
                      <div className="mt-auto">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-gray-500">Quality Score</span>
                          <span className="text-xs font-mono text-gray-300">63%</span>
                        </div>
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-purple-600 w-[63%]"></div></div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: ESRGAN */}
                  <div className="border border-gray-800 bg-[#0f1523] rounded-xl overflow-hidden flex flex-col relative group">
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-gray-700/50">
                      <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-[9px] font-bold text-white">3</div>
                      <span className="text-[10px] text-gray-200 font-medium whitespace-nowrap">Super Resolution</span>
                    </div>
                    <div className="absolute top-2 right-2 z-10 w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                      <CheckCircle2 className="w-2.5 h-2.5 text-green-400" />
                    </div>
                    <div className="h-32 bg-black relative overflow-hidden">
                      <img src={`http://localhost:8000${enhancementData.enhanced_path}`} alt="ESRGAN" className="w-full h-full object-cover filter saturate-50 contrast-75"/>
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <p className="text-[10px] text-gray-400 leading-snug mb-3">Enhances resolution and recovers fine details.</p>
                      <div className="mt-auto">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-gray-500">Quality Score</span>
                          <span className="text-xs font-mono text-gray-300">82%</span>
                        </div>
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[82%] shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div></div>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: CodeFormer */}
                  <div className="border border-gray-800 bg-[#0f1523] rounded-xl overflow-hidden flex flex-col relative group">
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-gray-700/50">
                      <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-[9px] font-bold text-white">4</div>
                      <span className="text-[10px] text-gray-200 font-medium whitespace-nowrap">Face Restoration</span>
                    </div>
                    <div className="absolute top-2 right-2 z-10 w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                      <CheckCircle2 className="w-2.5 h-2.5 text-green-400" />
                    </div>
                    <div className="h-32 bg-black relative overflow-hidden">
                      <img src={`http://localhost:8000${enhancementData.enhanced_path}`} alt="CodeFormer" className="w-full h-full object-cover filter brightness-90"/>
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <p className="text-[10px] text-gray-400 leading-snug mb-3">Restores facial parts and improves natural look.</p>
                      <div className="mt-auto">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-gray-500">Quality Score</span>
                          <span className="text-xs font-mono text-gray-300">94%</span>
                        </div>
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[94%] shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div></div>
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Final Output */}
                  <div className="border border-green-500/30 bg-[#0f1523] rounded-xl overflow-hidden flex flex-col relative group shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-green-500/50">
                      <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center text-[9px] font-bold text-white">5</div>
                      <span className="text-[10px] text-green-400 font-medium">Final Output</span>
                    </div>
                    <div className="absolute top-2 right-2 z-10 bg-blue-600 px-2 py-0.5 rounded text-[8px] font-bold text-white">Best Output</div>
                    <div className="h-32 bg-black relative overflow-hidden">
                      <img src={`http://localhost:8000${enhancementData.enhanced_path}`} alt="Final Output" className="w-full h-full object-cover"/>
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <p className="text-[10px] text-gray-400 leading-snug mb-3">High quality enhanced face ready for tracking.</p>
                      <div className="mt-auto">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-gray-500">Quality Score</span>
                          <span className="text-xs font-mono text-white font-bold">98%</span>
                        </div>
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[98%] shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div></div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* BOTTOM ROW */}
              <div className="grid grid-cols-12 gap-4 flex-1">
                
                {/* Before / After Slider */}
                <div className="col-span-4 bg-[#0B0F19] border border-gray-800 rounded-xl p-4 flex flex-col">
                  <h3 className="text-gray-400 text-sm font-semibold mb-1">Before / After Comparison</h3>
                  <p className="text-[10px] text-gray-500 mb-3">Click and drag the slider to compare</p>
                  
                  <div className="relative flex-1 rounded-lg overflow-hidden border border-gray-800 bg-black group min-h-[160px]">
                    <img src={`http://localhost:8000${enhancementData.enhanced_path}`} alt="Enhanced" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 w-1/2 overflow-hidden border-r-2 border-purple-500">
                       <img src={`http://localhost:8000${enhancementData.original_path}`} alt="Original" className="absolute inset-0 w-[200%] max-w-none h-full object-cover filter blur-[0.5px]" style={{ filter: 'contrast(1.2)' }} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-6 h-6 rounded-full bg-purple-600 shadow-lg flex items-center justify-center text-white cursor-ew-resize">
                        <ArrowLeft className="w-3 h-3 absolute left-1" />
                        <ArrowRight className="w-3 h-3 absolute right-1" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[9px] text-gray-300">Original</div>
                    <div className="absolute top-2 right-2 bg-blue-600 px-2 py-0.5 rounded text-[9px] text-white font-bold">Enhanced</div>
                  </div>
                </div>

                {/* Enhancement Details */}
                <div className="col-span-4 bg-[#0B0F19] border border-gray-800 rounded-xl p-4 flex flex-col">
                  <h3 className="text-gray-400 text-sm font-semibold mb-4">Enhancement Details</h3>
                  <div className="space-y-3 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                      <span className="text-[11px] text-gray-500">Input Resolution</span>
                      <span className="text-xs font-mono text-gray-300">{enhancementData.metrics.resolution_before}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                      <span className="text-[11px] text-gray-500">Output Resolution</span>
                      <span className="text-xs font-mono text-gray-300">{enhancementData.metrics.resolution_after}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                      <span className="text-[11px] text-gray-500">Enhancement Scale</span>
                      <span className="text-xs font-mono text-gray-300">x{enhancementData.scale_factor.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                      <span className="text-[11px] text-gray-500">Processing Time</span>
                      <span className="text-xs font-mono text-gray-300">00:00:18</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                      <span className="text-[11px] text-gray-500">Models Used</span>
                      <div className="flex gap-1.5">
                        <span className="text-[9px] bg-purple-900/30 text-purple-400 px-1.5 py-0.5 rounded flex items-center gap-1"><Layers className="w-2.5 h-2.5"/> SCUNet</span>
                        <span className="text-[9px] bg-purple-900/30 text-purple-400 px-1.5 py-0.5 rounded flex items-center gap-1"><Sparkles className="w-2.5 h-2.5"/> RealESRGAN</span>
                        <span className="text-[9px] bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5"/> CodeFormer</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-gray-500">Processed On</span>
                      <span className="text-[11px] text-gray-400">16 May 2024, 08:45 PM</span>
                    </div>
                  </div>
                </div>

                {/* Right Column (Quality Analysis & Quick Actions) */}
                <div className="col-span-4 flex flex-col gap-4">
                  
                  {/* Face Quality Analysis */}
                  <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-4 flex-1 flex flex-col">
                    <h3 className="text-gray-400 text-sm font-semibold mb-2">Face Quality Analysis</h3>
                    <div className="flex-1 flex relative items-center justify-center">
                       {/* Mock Spider Chart SVG */}
                       <svg viewBox="0 0 100 100" className="w-32 h-32 absolute opacity-80">
                         <polygon points="50,10 90,40 75,90 25,90 10,40" fill="transparent" stroke="#1e293b" strokeWidth="0.5"/>
                         <polygon points="50,20 80,45 68,80 32,80 20,45" fill="transparent" stroke="#1e293b" strokeWidth="0.5"/>
                         <polygon points="50,30 70,50 62,70 38,70 30,50" fill="transparent" stroke="#1e293b" strokeWidth="0.5"/>
                         <line x1="50" y1="50" x2="50" y2="10" stroke="#1e293b" strokeWidth="0.5"/>
                         <line x1="50" y1="50" x2="90" y2="40" stroke="#1e293b" strokeWidth="0.5"/>
                         <line x1="50" y1="50" x2="75" y2="90" stroke="#1e293b" strokeWidth="0.5"/>
                         <line x1="50" y1="50" x2="25" y2="90" stroke="#1e293b" strokeWidth="0.5"/>
                         <line x1="50" y1="50" x2="10" y2="40" stroke="#1e293b" strokeWidth="0.5"/>
                         
                         {/* Data Polygon */}
                         <polygon points="50,15 85,42 70,85 30,80 15,45" fill="rgba(37, 99, 235, 0.2)" stroke="#3b82f6" strokeWidth="1"/>
                         
                         {/* Data Points */}
                         <circle cx="50" cy="15" r="2" fill="#3b82f6"/>
                         <circle cx="85" cy="42" r="2" fill="#3b82f6"/>
                         <circle cx="70" cy="85" r="2" fill="#3b82f6"/>
                         <circle cx="30" cy="80" r="2" fill="#3b82f6"/>
                         <circle cx="15" cy="45" r="2" fill="#10b981"/>
                       </svg>
                       <div className="absolute top-1 text-[8px] text-gray-400 text-center w-full">Sharpness<br/><span className="text-green-400 font-mono">96%</span></div>
                       <div className="absolute right-2 top-14 text-[8px] text-gray-400 text-right">Detail<br/><span className="text-green-400 font-mono">94%</span></div>
                       <div className="absolute right-4 bottom-2 text-[8px] text-gray-400 text-right">Lighting<br/><span className="text-green-400 font-mono">92%</span></div>
                       <div className="absolute left-4 bottom-2 text-[8px] text-gray-400 text-left">Texture<br/><span className="text-green-400 font-mono">93%</span></div>
                       <div className="absolute left-0 top-14 text-[8px] text-gray-400 text-left w-20 leading-tight">Identity Preservation<br/><span className="text-green-400 font-mono">95%</span></div>
                    </div>
                    
                    <div className="bg-[#0f1523] border border-green-500/20 rounded-lg p-3 flex justify-between items-center mt-2">
                      <div>
                        <div className="text-[10px] text-gray-400">Overall Quality Score</div>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-bold text-green-400 leading-none">98%</span>
                          <span className="text-[9px] text-green-400 bg-green-500/10 px-1 rounded pb-0.5 mb-0.5">Excellent</span>
                        </div>
                        <div className="text-[9px] text-gray-500 mt-1">High quality face suitable for accurate identification.</div>
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-green-500/30 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-4">
                    <h3 className="text-gray-400 text-sm font-semibold mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-700 group text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded bg-gray-800 flex items-center justify-center"><Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" /></div>
                          <div>
                            <div className="text-xs text-gray-200 font-medium">Download Enhanced Face</div>
                            <div className="text-[9px] text-gray-500">Download high quality image</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                      </button>
                      
                      <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-700 group text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded bg-gray-800 flex items-center justify-center"><Layers className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" /></div>
                          <div>
                            <div className="text-xs text-gray-200 font-medium">Save to Case</div>
                            <div className="text-[9px] text-gray-500">Save enhanced face to current case</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                      </button>

                      <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-700 group text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded bg-gray-800 flex items-center justify-center"><UserSearch className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" /></div>
                          <div>
                            <div className="text-xs text-gray-200 font-medium">Compare with Database</div>
                            <div className="text-[9px] text-gray-500">Search this face in database</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                      </button>

                      <button onClick={() => startTracking()} className="w-full mt-2 flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all text-left shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded bg-white/20 flex items-center justify-center backdrop-blur-sm"><Zap className="w-3.5 h-3.5 text-white" /></div>
                          <div>
                            <div className="text-xs text-white font-bold">Start Tracking</div>
                            <div className="text-[9px] text-blue-100">Track this face across video</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
              
            </motion.div>
"""

new_content = content[:start_idx] + NEW_BLOCK + content[end_idx:]

with open(SRC, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Done! Check the browser.")
