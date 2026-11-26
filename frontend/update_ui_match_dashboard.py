import re

SRC = "c:/Users/Jeevan Kumar/OneDrive/文档/project/frontend/src/components/AnalysisScanner.tsx"

with open(SRC, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Icons
import_stmt = "import { ScanFace, AlertTriangle, Download, Compass, Activity, UserSearch, ArrowRight, CheckCircle2, ChevronRight, Video, Server, ArrowLeft, Fingerprint, Users, ShieldCheck, Zap, Sparkles, Eye, BarChart3, Layers, Search, Box, Database, Binary, UserCheck, ScanLine, Code } from 'lucide-react';"
new_import = "import { ScanFace, AlertTriangle, Download, Compass, Activity, UserSearch, ArrowRight, CheckCircle2, ChevronRight, Video, Server, ArrowLeft, Fingerprint, Users, ShieldCheck, Zap, Sparkles, Eye, BarChart3, Layers, Search, Box, Database, Binary, UserCheck, ScanLine, Code, MapPin, Calendar, ShieldAlert, ListFilter, FileText, Check, FileCheck, BookmarkPlus, FolderPlus } from 'lucide-react';"
content = content.replace(import_stmt, new_import)

# 2. Update FaceMatchData Interface
old_interface = """interface FaceMatchData {
  status: string;
  embedding_vector: number[];
  top_matches: Array<{
    db_id: string;
    image: string;
    similarity_score: number;
    status: string;
  }>;
}"""

new_interface = """interface FaceMatchData {
  status: string;
  metadata: {
    source: string;
    captured_at: string;
    location: string;
    quality_score: number;
    yaw: number;
    pitch: number;
    roll: number;
  };
  best_match_stats: {
    face_similarity: number;
    geometry_similarity: number;
    algorithm: string;
    search_type: string;
    threshold: number;
  };
  top_matches: Array<{
    rank: number;
    db_id: string;
    name: string;
    alias: string;
    age: number;
    gender: string;
    nationality: string;
    last_seen: string;
    total_records: number;
    risk_level: string;
    db_source: string;
    match_status: string;
    similarity_score: number;
    strength: string;
    image: string;
  }>;
  embedding_distance: number[];
  match_distribution: {
    strong: number;
    possible: number;
    weak: number;
  };
}"""

content = content.replace(old_interface, new_interface)

# 3. Replace face_match_done UI block
start_marker = "{phase === 'face_match_done' && matchData && enhancementData && ("
end_marker = "            </motion.div>\n          )}"

# We need to find the specific face_match_done block.
# Since it's the last block before the tracking scan comment, we can find it.
start_idx = content.find(start_marker)
# Find the exact end of this block by looking for the tracking comment
tracking_comment_idx = content.find("{/* ============================================================ */}\n          {/* STAGE 5 LOADING: Re-ID & Tracking Scan */}")
if tracking_comment_idx == -1:
    tracking_comment_idx = content.find("{/* ============================================================ */}\n          {/* STAGE 4 LOADING: ArcFace Embedding Scan */}")

if start_idx == -1 or tracking_comment_idx == -1:
    print("Could not find frontend markers to replace face_match_done block.")
    exit(1)

new_ui_block = """{phase === 'face_match_done' && matchData && enhancementData && (
            <motion.div key="match-done-new" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 w-full text-gray-300">
              
              {/* Header */}
              <div className="flex justify-between items-center bg-[#070b14] p-3 rounded-xl border border-gray-800">
                <div>
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-2">Home <ChevronRight className="w-3 h-3"/> Face Analysis <ChevronRight className="w-3 h-3"/> <span className="text-gray-300">Face Matching</span></div>
                  <h2 className="text-xl font-bold text-white tracking-wide">Face Matching</h2>
                  <p className="text-[10px] text-gray-400">Match the selected suspect against database using AI face recognition</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 text-xs border border-gray-800 px-4 py-2 rounded bg-black/50"><Database className="w-4 h-4 text-purple-400"/> Database: Criminal Records</div>
                  <button className="flex items-center gap-2 text-xs bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-colors"><Search className="w-4 h-4"/> Search in Database</button>
                  <button className="flex items-center gap-2 text-xs border border-gray-700 hover:border-gray-500 px-4 py-2 rounded transition-colors"><FileText className="w-4 h-4"/> Export Report</button>
                </div>
              </div>

              {/* TOP ROW: 3 Columns */}
              <div className="grid grid-cols-12 gap-4">
                
                {/* 1. SELECTED SUSPECT */}
                <div className="col-span-4 bg-[#0a0d16] border border-gray-800 rounded-xl p-4 flex flex-col">
                  <h3 className="text-[11px] font-bold text-purple-400 tracking-widest mb-4 uppercase">Selected Suspect</h3>
                  <div className="flex gap-4 mb-4">
                    <div className="w-40 rounded-lg overflow-hidden border border-gray-800 relative shadow-lg">
                      <img src={`http://localhost:8000${enhancementData.enhanced_path}`} className="w-full h-full object-cover" alt="Suspect" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="text-[10px] text-gray-500">Source</div>
                        <div className="text-xs text-gray-200 font-mono mb-2">{matchData.metadata.source}</div>
                        
                        <div className="text-[10px] text-gray-500">Captured At</div>
                        <div className="text-xs text-gray-200 mb-2">{matchData.metadata.captured_at}</div>
                        
                        <div className="text-[10px] text-gray-500">Location</div>
                        <div className="text-xs text-gray-200 mb-3">{matchData.metadata.location}</div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-[10px] text-gray-500 w-16">Quality Score</div>
                        <div className="w-10 h-10 rounded-full border-4 border-gray-800 border-t-green-500 border-r-green-500 transform rotate-45 flex items-center justify-center relative">
                          <div className="transform -rotate-45 text-[10px] font-bold text-white">{matchData.metadata.quality_score}%</div>
                        </div>
                        <div className="text-[10px] text-green-500 font-bold">High Quality</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Thumbnails */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-800/50">
                     <ChevronLeft className="w-4 h-4 text-purple-500 cursor-pointer"/>
                     <div className="flex gap-2">
                       <div className="w-10 h-10 rounded border-2 border-purple-500 overflow-hidden"><img src={`http://localhost:8000${enhancementData.enhanced_path}`} className="w-full h-full object-cover"/></div>
                       <div className="w-10 h-10 rounded border border-gray-700 overflow-hidden opacity-50"><img src={`http://localhost:8000${enhancementData.enhanced_path}`} className="w-full h-full object-cover"/></div>
                       <div className="w-10 h-10 rounded border border-gray-700 overflow-hidden opacity-50"><img src={`http://localhost:8000${enhancementData.enhanced_path}`} className="w-full h-full object-cover"/></div>
                       <div className="w-10 h-10 rounded border border-gray-700 overflow-hidden opacity-50"><img src={`http://localhost:8000${enhancementData.enhanced_path}`} className="w-full h-full object-cover"/></div>
                     </div>
                     <ChevronRight className="w-4 h-4 text-purple-500 cursor-pointer"/>
                  </div>
                  
                  {/* Angles */}
                  <div className="mt-4 flex justify-between bg-black/40 p-2 rounded text-[10px]">
                    <div className="text-gray-500">Face Angle</div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center"><span className="text-gray-500">Yaw</span><span className="text-white">{matchData.metadata.yaw}°</span></div>
                      <div className="flex flex-col items-center"><span className="text-gray-500">Pitch</span><span className="text-white">{matchData.metadata.pitch}°</span></div>
                      <div className="flex flex-col items-center"><span className="text-gray-500">Roll</span><span className="text-white">{matchData.metadata.roll}°</span></div>
                    </div>
                  </div>
                </div>

                {/* 2. BEST MATCH */}
                <div className="col-span-4 bg-[#0a0d16] border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center relative">
                  <div className="absolute top-4 left-4 text-[11px] font-bold text-purple-400 tracking-widest uppercase">Best Match</div>
                  <div className="absolute top-4 right-4 text-[9px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 uppercase tracking-wider">{matchData.top_matches[0].strength}</div>
                  
                  <div className="text-6xl font-black text-green-400 mt-6 tracking-tighter drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]">{matchData.best_match_stats.face_similarity.toFixed(1)}%</div>
                  <div className="text-[11px] text-gray-400 font-bold tracking-widest mt-1 mb-8">Match Score</div>
                  
                  {/* Gradient Bar */}
                  <div className="w-full px-4 mb-8">
                    <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 relative">
                       {/* Indicator thumb */}
                       <div className="absolute top-1/2 -translate-y-1/2 w-3 h-4 bg-white shadow-[0_0_5px_white] rounded-sm" style={{ left: `${matchData.best_match_stats.face_similarity}%` }}>
                         <div className="absolute -top-3 left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-white"></div>
                       </div>
                    </div>
                    <div className="flex justify-between w-full mt-2 text-[9px] text-gray-500 font-mono">
                      <span>0%</span><span>50%</span><span>100%</span>
                    </div>
                  </div>
                  
                  {/* Similarities Grid */}
                  <div className="w-full grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-black/40 border border-gray-800/50 rounded-lg p-3 text-center">
                      <div className="text-[10px] text-gray-500 mb-1">Face Similarity</div>
                      <div className="text-xl font-bold text-green-400">{matchData.best_match_stats.face_similarity.toFixed(1)}%</div>
                    </div>
                    <div className="bg-black/40 border border-gray-800/50 rounded-lg p-3 text-center">
                      <div className="text-[10px] text-gray-500 mb-1">Geometry Similarity</div>
                      <div className="text-xl font-bold text-green-400">{matchData.best_match_stats.geometry_similarity.toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  {/* Metadata line */}
                  <div className="w-full flex justify-between text-[10px] border-t border-gray-800/50 pt-3">
                    <div>
                      <div className="text-gray-500 mb-0.5">Algorithm</div>
                      <div className="text-gray-300">{matchData.best_match_stats.algorithm}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-0.5">Search Type</div>
                      <div className="text-gray-300">{matchData.best_match_stats.search_type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 mb-0.5">Threshold</div>
                      <div className="text-gray-300">{matchData.best_match_stats.threshold.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>

                {/* 3. MATCH DETAILS */}
                <div className="col-span-4 bg-[#0a0d16] border border-gray-800 rounded-xl p-4 flex flex-col">
                  <h3 className="text-[11px] font-bold text-purple-400 tracking-widest mb-4 uppercase">Match Details</h3>
                  <div className="flex gap-4">
                    {/* Data List */}
                    <div className="flex-1 space-y-2.5 text-[10px]">
                      <div className="flex justify-between"><span className="text-gray-500">Matched ID</span><span className="text-gray-200">{matchData.top_matches[0].db_id}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="text-gray-200">{matchData.top_matches[0].name}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Alias</span><span className="text-gray-200">{matchData.top_matches[0].alias}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Age</span><span className="text-gray-200">{matchData.top_matches[0].age}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Gender</span><span className="text-gray-200">{matchData.top_matches[0].gender}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Nationality</span><span className="text-gray-200">{matchData.top_matches[0].nationality}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Last Seen</span><span className="text-gray-200">{matchData.top_matches[0].last_seen}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Total Records</span><span className="text-gray-200">{matchData.top_matches[0].total_records}</span></div>
                      <div className="flex justify-between items-center mt-1"><span className="text-gray-500">Risk Level</span><span className="bg-red-500 text-white font-bold px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider">{matchData.top_matches[0].risk_level}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Database Source</span><span className="text-gray-200">{matchData.top_matches[0].db_source}</span></div>
                      <div className="flex justify-between items-center"><span className="text-gray-500">Match Status</span><span className="text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> {matchData.top_matches[0].match_status}</span></div>
                    </div>
                    {/* Match Mugshot */}
                    <div className="w-32 flex flex-col justify-between">
                      <div className="w-full rounded-lg overflow-hidden border border-gray-800 bg-black">
                        <img src={matchData.top_matches[0].image} className="w-full h-full object-cover" alt="Matched Suspect" />
                      </div>
                      <button className="w-full flex items-center justify-center gap-1 text-[10px] py-2 border border-gray-700 hover:border-gray-500 rounded mt-2 transition-colors">
                         <UserSearch className="w-3 h-3"/> View Full Profile
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* MIDDLE ROW */}
              <div className="grid grid-cols-12 gap-4">
                
                {/* 4. TOP MATCH RESULTS Carousel */}
                <div className="col-span-8 bg-[#0a0d16] border border-gray-800 rounded-xl p-4 flex flex-col overflow-hidden">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[11px] font-bold text-purple-400 tracking-widest uppercase">Top Match Results</h3>
                      <span className="bg-gray-800 text-gray-400 text-[10px] px-2 py-0.5 rounded-full">20 Results Found</span>
                    </div>
                    <button className="flex items-center gap-1 text-xs text-gray-400 border border-gray-800 px-2 py-1 rounded hover:text-white transition-colors"><ListFilter className="w-3 h-3"/> Filter</button>
                  </div>
                  
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                    {matchData.top_matches.slice(0, 5).map((match, idx) => (
                      <div key={idx} className={`min-w-[150px] flex-shrink-0 bg-black/40 rounded-lg p-2 border ${idx === 0 ? 'border-green-500/50 shadow-[0_0_15px_rgba(74,222,128,0.1)]' : 'border-gray-800'} relative flex flex-col`}>
                        {/* Rank Badge */}
                        <div className={`absolute top-3 left-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${idx === 0 ? 'bg-green-500 text-black' : 'bg-purple-600 text-white'}`}>{match.rank}</div>
                        {/* Score Badge */}
                        <div className="absolute top-3 right-3 text-[10px] font-bold text-white bg-black/70 px-1 rounded z-10">{match.similarity_score.toFixed(1)}%</div>
                        
                        <div className="w-full h-40 rounded bg-gray-900 overflow-hidden mb-2 relative">
                          <img src={match.image} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="text-xs font-bold text-gray-200">{match.db_id}</div>
                        <div className="text-[10px] text-gray-400 mb-2 truncate">{match.name}</div>
                        
                        <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded self-start mb-2 ${idx === 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : match.similarity_score > 80 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>{match.strength}</div>
                        
                        <div className="mt-auto pt-2 border-t border-gray-800/50 text-[9px] text-gray-500">
                           <div>Age: {match.age} • {match.gender}</div>
                           <div className="truncate">Last Seen: {match.last_seen}</div>
                        </div>
                        {idx === 0 && <div className="absolute bottom-0 left-0 h-0.5 bg-green-500 w-full"></div>}
                      </div>
                    ))}
                    <div className="flex items-center justify-center px-4 cursor-pointer hover:bg-gray-800/20 rounded-lg transition-colors">
                      <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center bg-gray-800/50 text-gray-400 hover:text-white"><ChevronRight className="w-4 h-4"/></div>
                    </div>
                  </div>
                </div>

                {/* 5. SIMILARITY VISUALIZATION */}
                <div className="col-span-4 bg-[#0a0d16] border border-gray-800 rounded-xl p-4 flex flex-col">
                   <h3 className="text-[11px] font-bold text-purple-400 tracking-widest mb-4 uppercase">Similarity Visualization</h3>
                   
                   {/* Tabs */}
                   <div className="flex border border-gray-800 rounded-lg p-0.5 mb-4 bg-black">
                     <button className="flex-1 text-[10px] py-1.5 bg-purple-600 text-white rounded shadow text-center">Overlay</button>
                     <button className="flex-1 text-[10px] py-1.5 text-gray-500 hover:text-gray-300 text-center">Heatmap</button>
                     <button className="flex-1 text-[10px] py-1.5 text-gray-500 hover:text-gray-300 text-center">Geometry</button>
                   </div>
                   
                   {/* Dual Image Comparison */}
                   <div className="flex-1 flex gap-2 mb-4 relative items-center justify-center">
                     <div className="w-1/2 rounded bg-black border border-gray-800 overflow-hidden relative h-[180px]">
                       <img src={`http://localhost:8000${geometryData?.geometry_image_path}`} className="w-full h-full object-cover opacity-80" alt="Suspect Geometry" />
                       <div className="absolute bottom-1 left-0 w-full text-center text-[9px] text-gray-400 bg-black/60 py-0.5">Selected Suspect</div>
                     </div>
                     <div className="w-1/2 rounded bg-black border border-gray-800 overflow-hidden relative h-[180px]">
                       <img src={`http://localhost:8000${geometryData?.geometry_image_path}`} className="w-full h-full object-cover opacity-80" alt="Match Geometry" />
                       <div className="absolute bottom-1 left-0 w-full text-center text-[9px] text-gray-400 bg-black/60 py-0.5">Best Match ({matchData.best_match_stats.face_similarity.toFixed(1)}%)</div>
                     </div>
                     <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-purple-600 border-2 border-black flex items-center justify-center shadow-lg cursor-pointer hover:bg-purple-500 transition-colors">
                       <ChevronLeft className="w-3 h-3 text-white absolute -ml-1.5"/>
                       <ChevronRight className="w-3 h-3 text-white absolute ml-1.5"/>
                     </div>
                   </div>
                   
                   {/* Footer Stats */}
                   <div>
                     <div className="flex justify-between text-[10px] mb-1">
                       <span className="text-gray-500">Key Points Matched</span>
                       <span className="text-gray-300 font-mono">468 / 468</span>
                     </div>
                     <div className="flex justify-between text-[10px] items-center">
                       <span className="text-gray-500">Confidence</span>
                       <div className="flex-1 mx-3 h-1 bg-gray-800 rounded-full"><div className="h-full bg-green-500" style={{ width: '94.6%' }}></div></div>
                       <span className="text-green-500 font-bold">94.6%</span>
                     </div>
                   </div>
                </div>

              </div>

              {/* BOTTOM ROW */}
              <div className="grid grid-cols-12 gap-4">
                
                {/* 6. EMBEDDING DISTANCE */}
                <div className="col-span-5 bg-[#0a0d16] border border-gray-800 rounded-xl p-4 flex flex-col">
                  <h3 className="text-[11px] font-bold text-purple-400 tracking-widest mb-4 flex items-center gap-1 uppercase">Embedding Distance <span className="w-3 h-3 rounded-full border border-gray-600 flex items-center justify-center text-[8px] text-gray-400 cursor-help">?</span></h3>
                  <div className="flex-1 w-full relative pt-2">
                    {/* SVG Line Chart */}
                    <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
                      {/* Grid Lines */}
                      <line x1="0" y1="0" x2="400" y2="0" stroke="#1f2937" strokeWidth="1"/>
                      <line x1="0" y1="50" x2="400" y2="50" stroke="#1f2937" strokeWidth="1"/>
                      <line x1="0" y1="100" x2="400" y2="100" stroke="#1f2937" strokeWidth="1"/>
                      <line x1="0" y1="150" x2="400" y2="150" stroke="#1f2937" strokeWidth="1"/>
                      {/* Y Axis Labels */}
                      <text x="-10" y="5" fill="#6b7280" fontSize="10" textAnchor="end">1.0</text>
                      <text x="-10" y="55" fill="#6b7280" fontSize="10" textAnchor="end">0.5</text>
                      <text x="-10" y="105" fill="#6b7280" fontSize="10" textAnchor="end">0.0</text>
                      {/* X Axis Labels */}
                      <text x="0" y="165" fill="#6b7280" fontSize="10" textAnchor="middle">1</text>
                      <text x="100" y="165" fill="#6b7280" fontSize="10" textAnchor="middle">5</text>
                      <text x="200" y="165" fill="#6b7280" fontSize="10" textAnchor="middle">10</text>
                      <text x="300" y="165" fill="#6b7280" fontSize="10" textAnchor="middle">15</text>
                      <text x="400" y="165" fill="#6b7280" fontSize="10" textAnchor="middle">20</text>
                      <text x="400" y="175" fill="#6b7280" fontSize="8" textAnchor="middle">Rank</text>
                      
                      {/* Plot Line */}
                      <polyline 
                        points={matchData.embedding_distance.map((val, idx) => `${idx * (400/19)},${100 - (val * 100)}`).join(' ')} 
                        fill="none" stroke="#10b981" strokeWidth="2" 
                      />
                      {/* Plot Points */}
                      {matchData.embedding_distance.map((val, idx) => {
                        if(idx === 0) return null; // Handle first point specially
                        return <circle key={idx} cx={idx * (400/19)} cy={100 - (val * 100)} r="2" fill="#10b981" />
                      })}
                      {/* First Point Highlight */}
                      <circle cx="0" cy={100 - (matchData.embedding_distance[0] * 100)} r="3" fill="#a855f7" />
                      <line x1="0" y1={100 - (matchData.embedding_distance[0] * 100)} x2="0" y2="150" stroke="#a855f7" strokeWidth="1" strokeDasharray="2 2" />
                      {/* Data tooltip for first point */}
                      <rect x="5" y={100 - (matchData.embedding_distance[0] * 100) - 20} width="30" height="16" fill="#000" stroke="#a855f7" rx="2" />
                      <text x="20" y={100 - (matchData.embedding_distance[0] * 100) - 9} fill="#fff" fontSize="8" textAnchor="middle">{matchData.embedding_distance[0].toFixed(2)}</text>
                    </svg>
                  </div>
                </div>

                {/* 7. MATCH DISTRIBUTION */}
                <div className="col-span-4 bg-[#0a0d16] border border-gray-800 rounded-xl p-4 flex flex-col">
                  <h3 className="text-[11px] font-bold text-purple-400 tracking-widest mb-4 uppercase">Match Distribution</h3>
                  <div className="flex flex-1 items-center gap-6">
                    {/* Donut Chart (SVG) */}
                    <div className="w-24 h-24 relative">
                       <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                          {/* Weak Match Segment (Red) */}
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="12" strokeDasharray={`${matchData.match_distribution.weak * 2.51} 251.2`} />
                          {/* Possible Match Segment (Yellow) */}
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#eab308" strokeWidth="12" strokeDasharray={`${matchData.match_distribution.possible * 2.51} 251.2`} strokeDashoffset={`-${matchData.match_distribution.weak * 2.51}`} />
                          {/* Strong Match Segment (Green) */}
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray={`${matchData.match_distribution.strong * 2.51} 251.2`} strokeDashoffset={`-${(matchData.match_distribution.weak + matchData.match_distribution.possible) * 2.51}`} />
                       </svg>
                       <div className="absolute inset-0 flex items-center justify-center flex-col">
                          <span className="text-white font-bold text-sm">20</span>
                          <span className="text-[8px] text-gray-500">Matches</span>
                       </div>
                    </div>
                    {/* Distance Guide & Legend */}
                    <div className="flex-1 flex flex-col gap-2">
                       <div className="text-[10px] text-gray-500 border-b border-gray-800 pb-1 mb-1">Distance Guide</div>
                       <div className="flex justify-between items-center text-[10px]"><span className="text-gray-400 font-mono">0.00 - 0.30</span><span className="text-green-500 font-bold bg-green-500/10 px-1.5 py-0.5 rounded">Excellent Match</span></div>
                       <div className="flex justify-between items-center text-[10px]"><span className="text-gray-400 font-mono">0.31 - 0.50</span><span className="text-blue-500 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">Strong Match</span></div>
                       <div className="flex justify-between items-center text-[10px]"><span className="text-gray-400 font-mono">0.51 - 0.70</span><span className="text-yellow-500 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded">Possible Match</span></div>
                       <div className="flex justify-between items-center text-[10px]"><span className="text-gray-400 font-mono">0.71 - 1.00</span><span className="text-red-500 font-bold bg-red-500/10 px-1.5 py-0.5 rounded">Weak Match</span></div>
                       
                       <div className="mt-2 pt-2 border-t border-gray-800 grid grid-cols-1 gap-1 text-[10px]">
                         <div className="flex justify-between items-center"><div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-sm"></div> <span className="text-gray-300">Strong Match</span></div><span className="text-white">{matchData.match_distribution.strong}%</span></div>
                         <div className="flex justify-between items-center"><div className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-500 rounded-sm"></div> <span className="text-gray-300">Possible Match</span></div><span className="text-white">{matchData.match_distribution.possible}%</span></div>
                         <div className="flex justify-between items-center"><div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-sm"></div> <span className="text-gray-300">Weak Match</span></div><span className="text-white">{matchData.match_distribution.weak}%</span></div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* 8. QUICK ACTIONS */}
                <div className="col-span-3 bg-[#0a0d16] border border-gray-800 rounded-xl p-4 flex flex-col">
                  <h3 className="text-[11px] font-bold text-purple-400 tracking-widest mb-4 uppercase">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <button className="bg-[#0d111d] border border-gray-800 hover:border-purple-500/50 rounded-lg flex flex-col items-center justify-center p-2 text-gray-400 hover:text-white transition-colors group">
                      <BookmarkPlus className="w-5 h-5 mb-2 text-purple-500 group-hover:scale-110 transition-transform"/>
                      <span className="text-[10px] text-center">Add to Watchlist</span>
                    </button>
                    <button className="bg-[#0d111d] border border-gray-800 hover:border-purple-500/50 rounded-lg flex flex-col items-center justify-center p-2 text-gray-400 hover:text-white transition-colors group">
                      <UserSearch className="w-5 h-5 mb-2 text-purple-500 group-hover:scale-110 transition-transform"/>
                      <span className="text-[10px] text-center">Open Full Profile</span>
                    </button>
                    <button className="bg-[#0d111d] border border-gray-800 hover:border-purple-500/50 rounded-lg flex flex-col items-center justify-center p-2 text-gray-400 hover:text-white transition-colors group">
                      <FileCheck className="w-5 h-5 mb-2 text-gray-500 group-hover:scale-110 transition-transform"/>
                      <span className="text-[10px] text-center">Export Match Report</span>
                    </button>
                    <button className="bg-[#0d111d] border border-gray-800 hover:border-purple-500/50 rounded-lg flex flex-col items-center justify-center p-2 text-gray-400 hover:text-white transition-colors group">
                      <FolderPlus className="w-5 h-5 mb-2 text-gray-500 group-hover:scale-110 transition-transform"/>
                      <span className="text-[10px] text-center">Add to Case</span>
                    </button>
                  </div>
                </div>

              </div>

            </motion.div>
          )}"""

content = content[:start_idx] + new_ui_block + "\n" + content[tracking_comment_idx:]

with open(SRC, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully replaced Face Matching Dashboard UI.")
