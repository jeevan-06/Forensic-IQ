import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ScanFace, AlertTriangle, Download, Compass, Activity, UserSearch, ArrowRight, CheckCircle2, ChevronRight, Video, Server, ArrowLeft, Fingerprint, Users, ShieldCheck, Zap, Sparkles, Eye, BarChart3, Layers, Search, Box, Database, Binary, UserCheck, ScanLine, Code, MapPin, Calendar, ShieldAlert, ListFilter, FileText, Check, FileCheck, BookmarkPlus, FolderPlus, ChevronLeft } from 'lucide-react';
import api from '../services/api';
import { FaceViewer3D } from './FaceViewer3D';
import { ReportViewer } from './ReportViewer';
import type { ReportData } from './ReportViewer';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

type PipelinePhase = 
  | 'init'
  | 'extracting_frames' 
  | 'frames_done' 
  | 'analyzing_geometry' 
  | 'geometry_done' 
  | 'extracting_faces' 
  | 'faces_done'
  | 'choosing_action'
  | 'enhancing_face'
  | 'enhancement_done'
  | 'analyzing_face_geometry'
  | 'face_geometry_done'
  | 'analyzing_face_match'
  | 'face_match_done'
  | 'reconstructing_3d'
  | '3d_done'
  | 'tracking'
  | 'tracking_done'
  | 'generating_report'
  | 'report_done';

interface EnhancementStep {
  id: number;
  name: string;
  method: string;
  status: string;
}

interface EnhancementData {
  original_path: string;
  enhanced_path: string;
  original_size: { w: number; h: number };
  enhanced_size: { w: number; h: number };
  scale_factor: number;
  metrics: {
    sharpness_before: number;
    sharpness_after: number;
    sharpness_gain_pct: number;
    noise_before: number;
    noise_after: number;
    noise_reduction_pct: number;
    brightness_before: number;
    brightness_after: number;
    resolution_before: string;
    resolution_after: string;
  };
  steps: EnhancementStep[];
}

interface TrackingEvent {
  event_id: string;
  frame_path: string | null;
  timestamp: string;
  frame_number: number;
  confidence: number;
  pose: string;
  distance_m: number;
  bounding_box: { x: number; y: number; w: number; h: number };
}

interface TrackingData {
  face_id: string;
  person_id: string;
  total_appearances: number;
  average_confidence: number;
  timeline: TrackingEvent[];
  embedding_model: string;
  similarity_metric: string;
  threshold: number;
}



interface FaceMatchData {
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
}


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

interface FaceGeometryData {
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
}

interface FaceMetadata {
  id: string;
  path: string;
  timestamp: string;
  frame_number: number;
  quality_score: number;
  resolution: string;
  person_id: string;
  face_angle: string;
  metrics: {
    sharpness: number;
    brightness: number;
    contrast: number;
    pose: number;
    occlusion: number;
  };
}

interface FaceStats {
  total_faces: number;
  unique_individuals: number;
  best_quality: number;
  processing_status: string;
}


export default function AnalysisScanner() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  
  const [phase, setPhase] = useState<PipelinePhase>('init');
  const [error, setError] = useState('');
  
  const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
  const [cctv, setCctv] = useState<any>(null);
  const [extractedFaces, setExtractedFaces] = useState<FaceMetadata[]>([]);
  const [faceStats, setFaceStats] = useState<FaceStats | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [selectedTrackEvent, setSelectedTrackEvent] = useState<TrackingEvent | null>(null);
  const [enhancementData, setEnhancementData] = useState<EnhancementData | null>(null);
  const [geometryData, setGeometryData] = useState<FaceGeometryData | null>(null);
  const [matchData, setMatchData] = useState<FaceMatchData | null>(null);
  const [data3D, setData3D] = useState<SuspectData3D | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [wireframe3D, setWireframe3D] = useState(false);
  const [enhancingStep, setEnhancingStep] = useState(0);

  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const [selectedTargetFace, setSelectedTargetFace] = useState<FaceMetadata | null>(null);

  // --- API CALLS ---
  const startFrameExtraction = async () => {
    setPhase('extracting_frames');
    try {
      const res = await api.post(`/pipeline/extract_frames/${fileId}`);
      setExtractedFrames(res.data.extracted_frames);
      setPhase('frames_done');
    } catch (err: any) {
      setError('Frame extraction failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  const startGeometryAnalysis = async () => {
    setPhase('analyzing_geometry');
    try {
      const res = await api.post(`/pipeline/analyze_geometry/${fileId}`);
      setCctv(res.data.cctv_geometry);
      setPhase('geometry_done');
    } catch (err: any) {
      setError('Geometry analysis failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  const startFaceDetection = async () => {
    setPhase('extracting_faces');
    try {
      const res = await api.post(`/pipeline/extract_faces/${fileId}`);
      setExtractedFaces(res.data.extracted_faces);
      setFaceStats(res.data.stats);
      setPhase('faces_done');
      if (res.data.extracted_faces.length > 0) {
        setSelectedTargetFace(res.data.extracted_faces[0]);
      }
    } catch (err: any) {
      setError('Face detection failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  
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

  


  const startGenerateReport = async () => {
    if (!enhancementData) return;
    setPhase('generating_report');
    try {
      const res = await api.post(`/pipeline/generate_report/${fileId}`, {
        face_path: enhancementData.enhanced_path,
        case_title: 'Theft Investigation - Main Entrance',
        investigator: 'Investigator Admin',
        location: 'Gate No. 3, Main Entrance',
        resolution: '1920x1080',
      });
      setReportData(res.data);
      setPhase('report_done');
    } catch (err: any) {
      setError('Report generation failed: ' + (err.response?.data?.detail || err.message));
      setPhase('tracking_done');
    }
  };

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

  const startTracking = async (faceOverride?: FaceMetadata) => {
    const face = faceOverride || selectedTargetFace;
    if (!face) return;
    setPhase('tracking');
    try {
      const res = await api.post(`/pipeline/track_person/${fileId}`, {
        face_id: face.id,
        person_id: face.person_id,
        face_path: face.path,
      });
      setTrackingData(res.data);
      setSelectedTrackEvent(res.data.timeline[0] || null);
      setPhase('tracking_done');
    } catch (err: any) {
      setError('Tracking failed: ' + (err.response?.data?.detail || err.message));
      setPhase('faces_done');
    }
  };

  const startEnhancement = async () => {
    if (!selectedTargetFace) return;
    setPhase('enhancing_face');
    setEnhancingStep(0);
    // Animate step progress
    const stepInterval = setInterval(() => {
      setEnhancingStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 1800);
    try {
      const res = await api.post(`/pipeline/enhance_face/${fileId}`, {
        face_path: selectedTargetFace.path,
      });
      clearInterval(stepInterval);
      setEnhancingStep(4);
      setEnhancementData(res.data);
      setPhase('enhancement_done');
    } catch (err: any) {
      clearInterval(stepInterval);
      setError('Enhancement failed: ' + (err.response?.data?.detail || err.message));
      setPhase('faces_done');
    }
  };

  // --- BREADCRUMB NAVIGATION ---
  const navigateToPhase = (targetPhase: PipelinePhase) => {
    if (targetPhase === 'frames_done' && extractedFrames.length > 0) setPhase('frames_done');
    if (targetPhase === 'geometry_done' && cctv) setPhase('geometry_done');
    if (targetPhase === 'faces_done' && extractedFaces.length > 0) setPhase('faces_done');
    if (targetPhase === 'tracking_done' && trackingData) setPhase('tracking_done');
    if (targetPhase === 'enhancement_done' && enhancementData) setPhase('enhancement_done');
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-10">
        <div className="glass-panel border-red-500/50 p-8 flex flex-col items-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-400">PIPELINE FAILURE</h2>
          <p className="text-gray-400 mt-2">{error}</p>
          <button onClick={() => navigate('/upload')} className="mt-6 btn-cyber border-red-500/30 text-white hover:border-red-500 hover:text-red-500">
            RETURN TO UPLOAD
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // CUSTOM LOADERS
  // ==========================================

  const FrameLoader = () => (
    <div className="glass-panel border-cyber-neonBlue p-24 flex flex-col items-center justify-center relative overflow-hidden h-[500px]">
      <div className="absolute inset-0 flex flex-col justify-between py-10 opacity-20">
        {/* Simulating Film Strip / Timeline Slicing */}
        <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-full h-8 border-y-4 border-dashed border-cyber-neonBlue" />
        <motion.div animate={{ x: ["100%", "-100%"] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="w-full h-8 border-y-4 border-dashed border-cyber-neonBlue" />
      </div>
      <Video className="w-20 h-20 text-cyber-neonBlue animate-pulse mb-6 relative z-10 drop-shadow-[0_0_15px_rgba(0,243,255,0.8)]" />
      <h2 className="text-2xl font-black text-white tracking-[0.3em] drop-shadow-[0_0_10px_rgba(0,0,0,1)] relative z-10">
        STAGE 1: FRAME EXTRACTION
      </h2>
      <p className="text-cyber-neonBlue mt-4 tracking-[0.2em] font-mono text-sm relative z-10 bg-black/50 px-4 py-1 rounded border border-cyber-neonBlue/30">
        SLICING 4FPS HIGH-DENSITY TIMELINE...
      </p>
      <div className="w-64 h-1 bg-gray-800 mt-6 rounded overflow-hidden relative z-10">
        <motion.div className="h-full bg-cyber-neonBlue" animate={{ width: ["0%", "100%"] }} transition={{ duration: 1.5, ease: "linear", repeat: Infinity }} />
      </div>
    </div>
  );

  const GeometryLoader = () => (
    <div className="glass-panel border-purple-500 p-24 flex flex-col items-center justify-center relative overflow-hidden h-[500px]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-30"></div>
      {/* 3D Gyroscope Rings */}
      <motion.div animate={{ rotateX: 360, rotateY: 180 }} transition={{ repeat: Infinity, duration: 6, ease: "linear" }} className="absolute w-72 h-72 border-2 border-dashed border-purple-500/50 rounded-full" style={{ transformStyle: 'preserve-3d' }} />
      <motion.div animate={{ rotateY: -360, rotateZ: 180 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }} className="absolute w-56 h-56 border-2 border-cyber-neonBlue/50 rounded-full" style={{ transformStyle: 'preserve-3d' }} />
      <div className="absolute w-8 h-8 border border-purple-500 flex items-center justify-center opacity-80">
        <div className="w-1 h-1 bg-purple-500 rounded-full animate-ping"></div>
      </div>
      <div className="relative z-10 mt-32 bg-black/60 p-6 border border-purple-500/50 rounded-lg backdrop-blur-sm min-w-[400px] text-center">
        <h2 className="text-xl font-black text-white tracking-[0.3em] flex items-center justify-center gap-3">
          <Compass className="w-6 h-6 animate-pulse text-purple-400" /> STAGE 2: CCTV GEOMETRY
        </h2>
        <p className="text-purple-400 mt-4 tracking-[0.1em] font-mono text-xs">CALCULATING VANISHING POINTS & PHYSICS...</p>
        <div className="w-full h-1 bg-gray-800 mt-4 rounded overflow-hidden">
          <motion.div className="h-full bg-purple-500" animate={{ width: ["0%", "100%"] }} transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }} />
        </div>
      </div>
    </div>
  );

  const FaceLoader = () => (
    <div className="glass-panel border-cyber-neonGreen p-24 flex flex-col items-center justify-center relative overflow-hidden h-[500px]">
      {/* Biometric Neural Network Scanner */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <div className="w-64 h-64 border-4 border-cyber-neonGreen rounded-lg relative overflow-hidden">
          <motion.div animate={{ top: ["0%", "100%", "0%"] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute left-0 right-0 h-1 bg-cyber-neonGreen shadow-[0_0_20px_rgba(57,255,20,1)]" />
          <motion.div animate={{ left: ["0%", "100%", "0%"] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute top-0 bottom-0 w-1 bg-cyber-neonGreen/50" />
        </div>
      </div>
      <div className="relative z-10 mt-40 bg-black/80 p-6 border border-cyber-neonGreen/50 rounded-lg backdrop-blur-md min-w-[400px] text-center">
        <h2 className="text-xl font-black text-white tracking-[0.3em] flex items-center justify-center gap-3">
          <UserSearch className="w-6 h-6 animate-pulse text-cyber-neonGreen" /> STAGE 3: FACE ISOLATION
        </h2>
        <p className="text-cyber-neonGreen mt-4 tracking-[0.1em] font-mono text-xs">RUNNING HAAR CASCADE NEURAL NETWORKS...</p>
        <div className="w-full h-1 bg-gray-800 mt-4 rounded overflow-hidden flex gap-1">
          {[...Array(10)].map((_, i) => (
            <motion.div key={i} className="h-full flex-1 bg-cyber-neonGreen" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full px-4 xl:px-8 mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER WITH CLICKABLE BREADCRUMBS */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-4 pt-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-widest flex items-center gap-2">
            <Server className="w-6 h-6 text-cyber-neonBlue" />
            PIPELINE WORKFLOW
          </h2>
          <p className="text-gray-400 font-mono text-sm mt-1">EVIDENCE ID: {fileId}</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-mono font-bold">
          <button 
            disabled={extractedFrames.length === 0}
            onClick={() => navigateToPhase('frames_done')}
            className={`px-3 py-1 rounded transition-colors ${phase === 'frames_done' ? 'bg-cyber-neonBlue text-black' : extractedFrames.length > 0 ? 'text-cyber-neonBlue hover:bg-cyber-neonBlue/20 cursor-pointer' : 'text-gray-600 cursor-not-allowed'}`}
          >
            1. FRAMES
          </button>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <button 
            disabled={!cctv}
            onClick={() => navigateToPhase('geometry_done')}
            className={`px-3 py-1 rounded transition-colors ${phase === 'geometry_done' ? 'bg-purple-500 text-white' : cctv ? 'text-purple-400 hover:bg-purple-500/20 cursor-pointer' : 'text-gray-600 cursor-not-allowed'}`}
          >
            2. GEOMETRY
          </button>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <button 
            disabled={extractedFaces.length === 0}
            onClick={() => navigateToPhase('faces_done')}
            className={`px-3 py-1 rounded transition-colors ${phase === 'faces_done' ? 'bg-cyber-neonGreen text-black' : extractedFaces.length > 0 ? 'text-cyber-neonGreen hover:bg-cyber-neonGreen/20 cursor-pointer' : 'text-gray-600 cursor-not-allowed'}`}
          >
            3. FACES
          </button>
        </div>
      </div>

      <div className="relative min-h-[600px]">
        <AnimatePresence mode="wait">
          
          {/* INIT SYSTEM SCREEN */}
          {phase === 'init' && (
            <motion.div key="init" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="max-w-3xl mx-auto mt-20 text-center glass-panel p-16 border-cyber-neonBlue/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-cyber-neonBlue/5 pointer-events-none"></div>
              <Activity className="w-20 h-20 text-cyber-neonBlue mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl font-black text-white tracking-widest mb-4 drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">SYSTEM INITIALIZED</h2>
              <p className="text-gray-400 mb-10 font-mono">Evidence securely mounted. The AI Pipeline is standing by.</p>
              <button onClick={startFrameExtraction} className="btn-cyber px-10 py-4 text-lg flex items-center gap-3 mx-auto bg-cyber-neonBlue/10 hover:bg-cyber-neonBlue hover:text-black shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                <Video className="w-5 h-5" /> START FRAME EXTRACTION
              </button>
            </motion.div>
          )}

          {/* LOADING SCREENS */}
          {phase === 'extracting_frames' && <motion.div key="load1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><FrameLoader /></motion.div>}
          {phase === 'analyzing_geometry' && <motion.div key="load2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><GeometryLoader /></motion.div>}
          {phase === 'extracting_faces' && <motion.div key="load3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><FaceLoader /></motion.div>}

          {/* STAGE 1: FRAMES VIEW */}
          {phase === 'frames_done' && (
            <motion.div key="view1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass-panel p-6 border-l-4 border-l-cyber-neonBlue h-full flex flex-col">
              <h3 className="text-lg font-bold text-white tracking-widest border-b border-cyber-border pb-4 mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2"><ScanFace className="w-5 h-5 text-cyber-neonBlue" /> STAGE 1: EXTRACTED FRAMES</span>
                <span className="text-sm font-mono text-cyber-neonBlue bg-cyber-neonBlue/10 px-3 py-1 rounded">{extractedFrames.length} TOTAL FRAMES</span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1 mb-8">
                {extractedFrames.map((frame: string, idx: number) => (
                  <div key={idx} onClick={() => setSelectedFrame(frame)} className="relative group rounded-lg overflow-hidden border border-cyber-border aspect-video bg-black flex flex-col cursor-pointer hover:border-cyber-neonBlue transition-colors">
                    <img src={`http://localhost:8000${frame}`} alt={`Frame ${idx}`} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 w-full bg-black/80 py-1 text-center text-xs text-cyber-neonBlue border-t border-cyber-border font-mono">
                      F_{(idx + 1).toString().padStart(4, '0')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-cyber-border/50">
                <button onClick={() => navigate('/upload')} className="btn-cyber text-sm px-4 py-2 border-cyber-border hover:bg-cyber-dark/50 flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> ABORT
                </button>
                <button onClick={cctv ? () => setPhase('geometry_done') : startGeometryAnalysis} className="btn-cyber px-8 py-3 flex items-center gap-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  PROCEED TO STAGE 2: GEOMETRY <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: GEOMETRY VIEW */}
          {phase === 'geometry_done' && cctv && (
            <motion.div key="view2" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="glass-panel p-4 flex flex-col min-h-[800px] border border-cyber-border bg-[#0a0f18]">
              
              {/* TOP HEADER BAR */}
              <div className="flex justify-between items-center border-b border-[#1a2536] pb-3 mb-4">
                <h3 className="text-xl font-bold text-white tracking-[0.2em] flex items-center gap-2">
                  <Compass className="w-6 h-6 text-cyan-400" /> CCTV GEOMETRY ANALYSIS
                </h3>
                <div className="flex gap-8 text-xs font-mono text-gray-400">
                  <span>File: <span className="text-gray-200">{fileId}</span></span>
                  <span>Frame: <span className="text-gray-200">{cctv.frame_info}</span></span>
                  <span>Timestamp: <span className="text-gray-200">{cctv.timestamp}</span></span>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col gap-4">
                {/* MAIN SPLIT ROW */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  
                  {/* LEFT COL: HUGE IMAGE VIEWER */}
                  <div className="lg:col-span-3 relative bg-black border border-[#1a2536] rounded overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] aspect-video">
                    {cctv.base_frame ? (
                      <img src={`http://localhost:8000${cctv.base_frame}`} alt="Analysis Base Frame" className="w-full h-full object-cover opacity-70" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 font-mono text-sm">[ NO SOURCE FRAME EXTRACTED ]</div>
                    )}
                    
                    {/* TACTICAL SVG OVERLAY */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_3px_rgba(0,0,0,0.8)]" viewBox="0 0 1920 1080" preserveAspectRatio="none">
                      {/* Horizon Line (Green) */}
                      <line x1="0" y1="350" x2="1920" y2="400" stroke="#10b981" strokeWidth="3" strokeDasharray="8,8" />
                      <text x="50" y="330" fill="#10b981" fontSize="28" fontFamily="monospace" fontWeight="bold">HORIZON LINE</text>
                      
                      {/* Perspective Lines */}
                      <line x1="960" y1="200" x2="-200" y2="1080" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="15,10" opacity="0.8" />
                      <line x1="960" y1="200" x2="400" y2="1080" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="15,10" opacity="0.8" />
                      <line x1="960" y1="200" x2="1400" y2="1080" stroke="#ef4444" strokeWidth="3" strokeDasharray="15,10" opacity="0.8" />
                      <line x1="960" y1="200" x2="2100" y2="1080" stroke="#ef4444" strokeWidth="3" strokeDasharray="15,10" opacity="0.8" />
                      
                      {/* Vanishing Point */}
                      <circle cx="960" cy="200" r="10" fill="#ef4444" />
                      <circle cx="960" cy="200" r="25" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,4" className="animate-[spin_4s_linear_infinite]" style={{transformOrigin: '960px 200px'}} />
                      <text x="985" y="190" fill="#ef4444" fontSize="28" fontFamily="monospace" fontWeight="bold">VANISHING POINT</text>
                      
                      {/* Ground Plane (Yellow) */}
                      <polygon points="350,1080 1550,1080 1250,550 650,550" fill="rgba(234, 179, 8, 0.15)" stroke="#eab308" strokeWidth="2" />
                      <circle cx="350" cy="1080" r="8" fill="#eab308" />
                      <circle cx="1550" cy="1080" r="8" fill="#eab308" />
                      <circle cx="1250" cy="550" r="8" fill="#eab308" />
                      <circle cx="650" cy="550" r="8" fill="#eab308" />

                      {/* Top Right Compass */}
                      <g transform="translate(1750, 150)">
                        <line x1="-40" y1="0" x2="40" y2="0" stroke="#0ea5e9" strokeWidth="3" />
                        <line x1="0" y1="-40" x2="0" y2="40" stroke="#10b981" strokeWidth="3" />
                        <polygon points="45,0 35,-5 35,5" fill="#eab308" />
                        <text x="-60" y="6" fill="#0ea5e9" fontSize="20" fontWeight="bold">W</text>
                        <text x="55" y="6" fill="#eab308" fontSize="20" fontWeight="bold">E</text>
                        <text x="-6" y="-55" fill="#10b981" fontSize="20" fontWeight="bold">N</text>
                        <text x="-6" y="70" fill="#ef4444" fontSize="20" fontWeight="bold">S</text>
                      </g>
                    </svg>
                  </div>

                  {/* RIGHT COL: SIDEBAR PARAMS */}
                  <div className="col-span-1 flex flex-col gap-4">
                    
                    {/* CAMERA PARAMETERS */}
                    <div className="bg-[#0f172a] border border-[#1e293b] rounded p-4 flex-1 flex flex-col">
                      <h4 className="text-cyan-400 text-xs font-bold tracking-widest mb-3 uppercase">CAMERA PARAMETERS (ESTIMATED)</h4>
                      <div className="space-y-2 text-xs font-mono flex-1 flex flex-col justify-center">
                        <div className="flex justify-between"><span className="text-gray-400">Camera Tilt</span><span className="text-white">{cctv.camera_parameters.tilt_angle}° (Downward)</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Pan Angle</span><span className="text-white">{cctv.camera_parameters.pan_angle}°</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Roll Angle</span><span className="text-white">{cctv.camera_parameters.roll_angle}°</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Lens</span><span className="text-white">{cctv.camera_parameters.focal_length}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Height</span><span className="text-white">{cctv.camera_parameters.estimated_height} m</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Mount Type</span><span className="text-white">{cctv.camera_parameters.mount_type}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Stability</span><span className="text-white">{cctv.camera_parameters.stability}</span></div>
                      </div>
                    </div>

                    {/* VANISHING POINT */}
                    <div className="bg-[#0f172a] border border-[#2e1065] rounded p-4 flex-1 flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-2xl"></div>
                      <h4 className="text-purple-400 text-xs font-bold tracking-widest mb-3 uppercase">VANISHING POINT</h4>
                      <div className="space-y-2 text-xs font-mono flex-1">
                        <div className="flex justify-between"><span className="text-gray-400">Coordinates (px)</span><span className="text-white">[ {cctv.perspective.vanishing_point.x}, {cctv.perspective.vanishing_point.y} ]</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Relative Position</span><span className="text-white">{cctv.perspective.relative_position}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Perspective Strength</span><span className="text-white">{cctv.perspective.perspective_strength}</span></div>
                      </div>
                      <div className="mt-2 h-12 w-full bg-black/50 border border-[#1e293b] rounded relative overflow-hidden flex items-end justify-center pb-1">
                        <div className="w-[1px] h-full bg-purple-500/50"></div>
                        <div className="w-[80%] h-[1px] bg-purple-500/50 absolute bottom-3"></div>
                        <div className="absolute top-1 text-[8px] text-purple-400 font-bold">VP</div>
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                          <line x1="50" y1="10" x2="10" y2="50" stroke="#a855f7" strokeWidth="1" opacity="0.6"/>
                          <line x1="50" y1="10" x2="30" y2="50" stroke="#a855f7" strokeWidth="1" opacity="0.6"/>
                          <line x1="50" y1="10" x2="70" y2="50" stroke="#a855f7" strokeWidth="1" opacity="0.6"/>
                          <line x1="50" y1="10" x2="90" y2="50" stroke="#a855f7" strokeWidth="1" opacity="0.6"/>
                        </svg>
                      </div>
                    </div>

                    {/* GROUND PLANE */}
                    <div className="bg-[#0f172a] border border-[#422006] rounded p-4 flex-1 flex flex-col relative overflow-hidden">
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-600/10 blur-2xl"></div>
                      <h4 className="text-yellow-500 text-xs font-bold tracking-widest mb-3 uppercase">GROUND PLANE (ESTIMATED)</h4>
                      <div className="space-y-2 text-xs font-mono flex-1">
                        <div className="flex justify-between"><span className="text-gray-400">Area (px)</span><span className="text-white">{cctv.ground_plane.area_px.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Width (est)</span><span className="text-white">{cctv.ground_plane.width_m} m</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Depth (est)</span><span className="text-white">{cctv.ground_plane.depth_m} m</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Angle</span><span className="text-white">{cctv.ground_plane.plane_angle}°</span></div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* BOTTOM ROW: TACTICAL CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  
                  {/* MOTION ANALYSIS */}
                  <div className="bg-[#0f172a] border border-[#1e293b] rounded p-4">
                    <h4 className="text-green-400 text-[10px] font-bold tracking-widest mb-3 uppercase">MOTION ANALYSIS</h4>
                    <div className="h-16 w-full bg-black border border-[#1e293b] rounded mb-3 overflow-hidden relative">
                       {/* Mock motion vector visualization */}
                       <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                       <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 50">
                          <line x1="20" y1="30" x2="40" y2="20" stroke="#10b981" strokeWidth="1" markerEnd="url(#arrow)" />
                          <line x1="30" y1="40" x2="50" y2="35" stroke="#10b981" strokeWidth="1" />
                          <line x1="60" y1="20" x2="80" y2="25" stroke="#eab308" strokeWidth="1" />
                          <line x1="40" y1="25" x2="60" y2="15" stroke="#ef4444" strokeWidth="1" />
                       </svg>
                    </div>
                    <div className="space-y-1 text-[10px] font-mono">
                      <div className="flex justify-between"><span className="text-gray-400">Direction</span><span className="text-white">{cctv.motion_flow.dominant_direction}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Strength</span><span className="text-white">{cctv.motion_flow.motion_strength}</span></div>
                    </div>
                  </div>

                  {/* LIGHTING ANALYSIS */}
                  <div className="bg-[#0f172a] border border-[#1e293b] rounded p-4">
                    <h4 className="text-yellow-500 text-[10px] font-bold tracking-widest mb-3 uppercase">LIGHTING ANALYSIS</h4>
                    <div className="space-y-2 text-[10px] font-mono">
                      <div className="flex justify-between"><span className="text-gray-400">Environment</span><span className="text-white">{cctv.lighting.environment}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Light Source</span><span className="text-white truncate pl-2">{cctv.lighting.light_source}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Brightness</span><span className="text-white">{cctv.lighting.brightness_level}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Contrast</span><span className="text-white">{cctv.lighting.contrast}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Shadows</span><span className="text-white">{cctv.lighting.shadows}</span></div>
                    </div>
                  </div>

                  {/* SCENE CLASSIFICATION */}
                  <div className="bg-[#0f172a] border border-[#1e293b] rounded p-4">
                    <h4 className="text-cyan-400 text-[10px] font-bold tracking-widest mb-3 uppercase">SCENE CLASSIFICATION</h4>
                    <div className="space-y-2 text-[10px] font-mono">
                      <div className="flex justify-between"><span className="text-gray-400">Scene Type</span><span className="text-white">{cctv.scene_type.scene_type}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Location Type</span><span className="text-white">{cctv.scene_type.location_type}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Traffic Type</span><span className="text-white">{cctv.scene_type.traffic_type}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Weather</span><span className="text-white">{cctv.scene_type.weather}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Time of Day</span><span className="text-white">{cctv.scene_type.time_of_day}</span></div>
                    </div>
                  </div>

                  {/* CAMERA FOV ANALYSIS */}
                  <div className="bg-[#0f172a] border border-[#1e293b] rounded p-4 relative">
                    <h4 className="text-green-400 text-[10px] font-bold tracking-widest mb-3 uppercase">CAMERA FOV ANALYSIS</h4>
                    <div className="space-y-2 text-[10px] font-mono">
                      <div className="flex justify-between"><span className="text-gray-400">Horiz FOV</span><span className="text-white">{cctv.lens_fov.horizontal_fov}°</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Vert FOV</span><span className="text-white">{cctv.lens_fov.vertical_fov}°</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">FOV Type</span><span className="text-white">{cctv.lens_fov.fov_type}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Distortion</span><span className="text-white">{cctv.lens_fov.distortion}</span></div>
                    </div>
                    {/* Radar cone graphic */}
                    <div className="absolute bottom-2 right-4 w-12 h-12 opacity-50 flex items-end justify-center">
                       <svg viewBox="0 0 100 100" className="w-full h-full">
                         <path d="M50 80 L10 20 A60 60 0 0 1 90 20 Z" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4,4" />
                         <rect x="45" y="78" width="10" height="8" fill="none" stroke="#10b981" strokeWidth="2" />
                       </svg>
                    </div>
                  </div>

                  {/* SUMMARY */}
                  <div className="bg-[#0f172a] border border-[#1e293b] rounded p-4">
                    <h4 className="text-blue-400 text-[10px] font-bold tracking-widest mb-3 uppercase">SUMMARY</h4>
                    <div className="space-y-2 text-[10px] font-mono">
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /><span className="text-gray-300">Vanishing Point Detected</span></div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /><span className="text-gray-300">Horizon Line Detected</span></div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /><span className="text-gray-300">Ground Plane Estimated</span></div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /><span className="text-gray-300">Camera Orientation Estimated</span></div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /><span className="text-gray-300">Motion Analyzed</span></div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /><span className="text-gray-300">Lighting Analyzed</span></div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /><span className="text-gray-300">Scene Classified</span></div>
                    </div>
                  </div>

                </div>
              </div>

              {/* NAVIGATION BUTTONS */}
              <div className="flex justify-between items-center pt-4 mt-2 border-t border-[#1a2536]">
                <span className="text-[#334155] text-xs font-mono">System: FORENSIQ | Module: CCTV Geometry Analysis | Status: Completed</span>
                <div className="flex gap-4">
                  <button onClick={() => setPhase('frames_done')} className="btn-cyber text-sm px-4 py-2 border-[#1e293b] hover:bg-black flex items-center gap-2 text-gray-400">
                    <ArrowLeft className="w-4 h-4" /> BACK TO FRAMES
                  </button>
                  <button onClick={extractedFaces.length > 0 ? () => setPhase('faces_done') : startFaceDetection} className="bg-cyan-500/10 border border-cyan-500 text-cyan-400 px-6 py-2 text-sm font-bold font-mono hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-2">
                    PROCEED TO STAGE 3: FACE EXTRACTION <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 3: FACES VIEW */}
          {phase === 'faces_done' && (
            <motion.div key="view3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass-panel p-6 border-l-4 border-l-cyber-neonGreen h-full flex flex-col relative overflow-hidden min-h-[600px]">
              <div className="absolute right-0 top-0 bottom-0 w-64 bg-cyber-neonGreen/5 blur-3xl pointer-events-none"></div>
              
              <h3 className="text-lg font-bold text-white tracking-widest border-b border-cyber-border/50 pb-4 mb-6 flex items-center justify-between relative z-10">
                <span className="flex items-center gap-2"><UserSearch className="w-5 h-5 text-cyber-neonGreen" /> STAGE 3: ISOLATED SUBJECTS (TARGET SELECTION)</span>
                <span className="text-sm font-mono text-cyber-neonGreen font-bold bg-cyber-neonGreen/10 px-3 py-1 rounded">{extractedFaces.length} FACES EXTRACTED</span>
              </h3>
              
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 relative z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar mb-8">
                {extractedFaces.map((face: FaceMetadata, idx: number) => {
                  const isSelected = selectedTargetFace?.id === face.id;
                  return (
                    <div key={idx} onClick={() => setSelectedTargetFace(face)} className={`relative group rounded-lg overflow-hidden border-2 aspect-square bg-black flex flex-col cursor-pointer transition-all duration-300 ${isSelected ? 'border-cyber-neonGreen scale-105 shadow-[0_0_15px_rgba(57,255,20,0.5)] z-20' : 'border-cyber-border hover:border-gray-400'}`}>
                      <img src={`http://localhost:8000${face.path}`} alt={`Subject ${idx}`} className={`object-cover w-full h-full transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
                      {isSelected && <div className="absolute top-1 right-1"><CheckCircle2 className="w-5 h-5 text-cyber-neonGreen drop-shadow-[0_0_5px_rgba(57,255,20,1)]" /></div>}
                      <div className={`absolute bottom-0 w-full py-1 text-center text-[10px] font-mono font-bold transition-colors ${isSelected ? 'bg-cyber-neonGreen text-black' : 'bg-black/80 text-gray-400 border-t border-cyber-border'}`}>
                        SUB_{idx.toString().padStart(3, '0')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {extractedFaces.length === 0 && (
                <div className="py-20 text-center text-gray-500 font-mono text-sm relative z-10 flex-1">
                  [NO HUMAN SUBJECTS DETECTED WITH CURRENT STRICTNESS THRESHOLDS]
                </div>
              )}

              {/* SELECTED FACE DETAILS - SHOWN BELOW GRID */}
              {selectedTargetFace && (
                <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 mt-4 mb-4 flex flex-col lg:flex-row gap-8 relative z-10 shadow-2xl">
                  
                  {/* Left: Image & Basics */}
                  <div className="flex flex-col gap-4 w-full lg:w-56 flex-shrink-0">
                    <div className="flex justify-between items-center">
                      <h4 className="text-white font-bold text-sm">Selected Face</h4>
                      <span className="text-gray-400 font-mono text-[10px]">ID: {selectedTargetFace.id}</span>
                    </div>
                    <div className="relative rounded-lg overflow-hidden border border-[#1e293b] aspect-square bg-black shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                      <img src={`http://localhost:8000${selectedTargetFace.path}`} alt="Selected" className="w-full h-full object-contain" />
                      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold text-white ${selectedTargetFace.quality_score > 85 ? 'bg-green-500' : selectedTargetFace.quality_score > 70 ? 'bg-yellow-500' : 'bg-red-500'} drop-shadow-md`}>
                        {selectedTargetFace.quality_score}
                      </div>
                      <div className="absolute bottom-0 w-full bg-black/80 backdrop-blur-sm p-2 flex justify-between items-center text-[10px] font-mono border-t border-[#1e293b]">
                        <span className="text-white">{selectedTargetFace.timestamp}</span>
                        <span className="text-gray-400">Frame {selectedTargetFace.frame_number}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Forensic Details */}
                  <div className="flex flex-col gap-4 flex-1 lg:border-l lg:border-r border-[#1e293b] lg:px-8">
                    <div className="flex gap-2 border-b border-[#1e293b] pb-2">
                      <button className="px-4 py-1 bg-purple-600 rounded-full text-xs font-bold text-white shadow-[0_0_10px_rgba(147,51,234,0.3)]">Details</button>
                      <button className="px-4 py-1 hover:bg-white/5 rounded-full text-xs font-bold text-gray-400 transition-colors">Quality Analysis</button>
                      <button className="px-4 py-1 hover:bg-white/5 rounded-full text-xs font-bold text-gray-400 transition-colors">Similar Faces</button>
                    </div>
                    <div className="space-y-3 text-xs font-mono mt-2">
                      <div className="flex justify-between"><span className="text-gray-500">Individual ID</span><span className="text-purple-400 font-bold bg-purple-900/30 px-2 rounded">{selectedTargetFace.person_id}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">First Seen</span><span className="text-white">{selectedTargetFace.timestamp} <span className="text-gray-600">(Frame {selectedTargetFace.frame_number})</span></span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Resolution</span><span className="text-white">{selectedTargetFace.resolution}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Face Angle</span><span className="text-white">{selectedTargetFace.face_angle}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Confidence Score</span><span className="text-white">0.{selectedTargetFace.quality_score}</span></div>
                    </div>
                  </div>

                  {/* Right: Quality & Actions */}
                  <div className="flex flex-col gap-4 w-full lg:w-72 flex-shrink-0">
                    <div>
                      <h4 className="text-white font-bold text-xs mb-3">Quality Analysis</h4>
                      <div className="flex items-center gap-4">
                         {/* Circular Chart */}
                         <div className="relative w-14 h-14 flex-shrink-0 flex flex-col items-center justify-center">
                           <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 36 36">
                             <path className="text-[#1e293b]" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                             <path className="text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]" strokeDasharray={`${selectedTargetFace.quality_score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                           </svg>
                           <div className="relative flex flex-col items-center justify-center z-10 pt-0.5">
                             <span className="text-white text-xs font-bold leading-none">{selectedTargetFace.quality_score}<span className="text-[8px] text-gray-500">/100</span></span>
                           </div>
                         </div>
                         
                         {/* Bars */}
                         <div className="flex-1 space-y-1.5">
                           <div className="flex items-center gap-2 text-[9px] font-mono">
                             <span className="w-14 text-gray-400">Sharpness</span>
                             <div className="flex-1 h-1 bg-black rounded overflow-hidden"><div className="h-full bg-green-500" style={{width: `${selectedTargetFace.metrics.sharpness}%`}}></div></div>
                             <span className="text-white w-6 text-right">{selectedTargetFace.metrics.sharpness}%</span>
                           </div>
                           <div className="flex items-center gap-2 text-[9px] font-mono">
                             <span className="w-14 text-gray-400">Brightness</span>
                             <div className="flex-1 h-1 bg-black rounded overflow-hidden"><div className="h-full bg-green-500" style={{width: `${selectedTargetFace.metrics.brightness}%`}}></div></div>
                             <span className="text-white w-6 text-right">{selectedTargetFace.metrics.brightness}%</span>
                           </div>
                           <div className="flex items-center gap-2 text-[9px] font-mono">
                             <span className="w-14 text-gray-400">Pose</span>
                             <div className="flex-1 h-1 bg-black rounded overflow-hidden"><div className="h-full bg-green-500" style={{width: `${selectedTargetFace.metrics.pose}%`}}></div></div>
                             <span className="text-white w-6 text-right">{selectedTargetFace.metrics.pose}%</span>
                           </div>
                         </div>
                      </div>
                      <div className="text-green-500 text-[9px] font-bold mt-1 ml-1">
                         {selectedTargetFace.quality_score > 85 ? 'Excellent Quality' : selectedTargetFace.quality_score > 70 ? 'Good Quality' : 'Poor Quality'}
                      </div>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-2">
                       <button className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold py-2 rounded flex items-center justify-center transition-colors shadow-[0_0_10px_rgba(147,51,234,0.2)]">
                         Set as Best Face
                       </button>
                       <button className="bg-[#1e293b] hover:bg-[#334155] text-white text-[10px] font-bold py-2 rounded flex items-center justify-center transition-colors">
                         Add to Gallery
                       </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-6 border-t border-cyber-border/50 relative z-10">
                <button onClick={() => setPhase('geometry_done')} className="btn-cyber text-sm px-4 py-2 border-cyber-border hover:bg-cyber-dark/50 flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> BACK TO GEOMETRY
                </button>
                <button disabled={!selectedTargetFace} onClick={() => selectedTargetFace && setPhase('choosing_action')} className={`btn-cyber px-8 py-3 flex items-center gap-2 transition-all ${selectedTargetFace ? 'bg-cyber-neonGreen/10 border-cyber-neonGreen text-cyber-neonGreen hover:bg-cyber-neonGreen hover:text-black shadow-[0_0_15px_rgba(57,255,20,0.4)]' : 'opacity-50 cursor-not-allowed border-cyber-border text-gray-500'}`}>
                  <Fingerprint className="w-5 h-5" /> LOCK TARGET — CHOOSE NEXT STEP <ArrowRight className="w-5 h-5" />
                </button>

              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* CHOOSE ACTION: Enhancement or Tracking */}
          {/* ============================================================ */}
          {phase === 'choosing_action' && selectedTargetFace && (
            <motion.div key="choosing" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-panel p-8 border-l-4 border-l-cyber-neonGreen relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(57,255,20,0.04)_0%,_transparent_60%)] pointer-events-none"></div>

              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <img src={`http://localhost:8000${selectedTargetFace.path}`} alt="Target" className="w-20 h-20 rounded-xl object-cover border-2 border-cyber-neonGreen shadow-[0_0_15px_rgba(57,255,20,0.4)]" />
                <div>
                  <div className="text-cyber-neonGreen text-xs font-bold tracking-widest mb-1">TARGET LOCKED — {selectedTargetFace.person_id}</div>
                  <h3 className="text-xl font-black text-white tracking-wider">SELECT NEXT OPERATION</h3>
                  <p className="text-gray-500 text-sm mt-1">Choose how to proceed with the selected suspect face.</p>
                </div>
              </div>

              {/* Two Action Cards */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Card 1: Face Enhancement */}
                <button onClick={startEnhancement} className="group relative bg-[#0a1628] border border-[#1e3a5f] hover:border-blue-500 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:bg-blue-900/10">
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:border-blue-500 transition-all">
                    <Zap className="w-7 h-7 text-blue-400" />
                  </div>
                  <h4 className="text-blue-300 font-bold text-base mb-2 tracking-wide">FACE ENHANCEMENT</h4>
                  <p className="text-gray-500 text-xs leading-relaxed mb-4">
                    Preserve identity while reducing noise, correcting alignment, and applying capped super-resolution before tracking.
                  </p>
                  <div className="space-y-1.5">
                    {['Eye-line alignment', 'Light denoising', 'Capped super-resolution', 'Forensic tonal normalization'].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] text-gray-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60"></div>{s}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-blue-400 text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    START ENHANCEMENT <ArrowRight className="w-3 h-3" />
                  </div>
                </button>

                {/* Card 2: Track Person */}
                <button onClick={() => startTracking()} className="group relative bg-[#0a1628] border border-[#1e3a5f] hover:border-purple-500 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,0.2)] hover:bg-purple-900/10">
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
                    <Eye className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4 group-hover:border-purple-500 transition-all">
                    <Users className="w-7 h-7 text-purple-400" />
                  </div>
                  <h4 className="text-purple-300 font-bold text-base mb-2 tracking-wide">TRACK ACROSS FRAMES</h4>
                  <p className="text-gray-500 text-xs leading-relaxed mb-4">
                    Search every video frame for this person using background subtraction and colour appearance matching.
                  </p>
                  <div className="space-y-1.5">
                    {['MOG2 Background Subtraction', 'Hair Colour Signature', 'Clothing Appearance Model', 'Detection Timeline'].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] text-gray-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500/60"></div>{s}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-purple-400 text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    START TRACKING <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              </div>

              <button onClick={() => setPhase('faces_done')} className="btn-cyber text-sm px-4 py-2 border-cyber-border hover:bg-cyber-dark/50 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> BACK TO FACE SELECTION
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* FACE ENHANCING: Loading */}
          {/* ============================================================ */}
          {phase === 'enhancing_face' && selectedTargetFace && (() => {
            const steps = [
              { label: 'Alignment', method: 'Eye-line stabilization', icon: '1' },
              { label: 'Denoising', method: 'Conservative Y-channel NLM', icon: '2' },
              { label: 'Super Resolution', method: 'RealESRGAN when available, capped to 2x', icon: '3' },
              { label: 'Normalization', method: 'Mild detail and luminance correction', icon: '4' },
            ];
            return (
              <motion.div key="enhancing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-panel p-10 border-l-4 border-l-blue-500 flex flex-col items-center justify-center min-h-[520px] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.06)_0%,_transparent_70%)] pointer-events-none"></div>

                <div className="relative flex items-center justify-center mb-8">
                  <div className="absolute w-44 h-44 rounded-full border border-blue-500/10 animate-ping"></div>
                  <div className="absolute w-32 h-32 rounded-full border border-blue-500/20 animate-[ping_2s_ease-in-out_infinite]"></div>
                  <div className="w-20 h-20 rounded-full bg-blue-900/30 border border-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                    <Zap className="w-10 h-10 text-blue-400 animate-pulse" />
                  </div>
                </div>

                <h3 className="text-xl font-black text-white tracking-widest mb-2">ENHANCING FACE QUALITY</h3>
                <p className="text-blue-400 font-mono text-sm mb-8 text-center">Running identity-preserving forensic enhancement on selected suspect face...</p>

                <div className="w-full max-w-md space-y-3">
                  {steps.map((step, idx) => {
                    const isDone    = enhancingStep > idx;
                    const isActive  = enhancingStep === idx;
                    return (
                      <div key={idx} className={`flex items-center gap-4 p-3 rounded-xl border transition-all duration-500 ${isDone ? 'border-green-500/40 bg-green-900/10' : isActive ? 'border-blue-500/60 bg-blue-900/10' : 'border-[#1e293b] bg-transparent opacity-40'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-all ${isDone ? 'bg-green-500 border-green-500 text-black' : isActive ? 'border-blue-500 text-blue-400 animate-pulse' : 'border-gray-700 text-gray-600'}`}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-bold ${isDone ? 'text-green-400' : isActive ? 'text-blue-300' : 'text-gray-600'}`}>{step.label}</div>
                          <div className="text-[10px] text-gray-600">{step.method}</div>
                        </div>
                        {isActive && <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"></div>}
                        {isDone && <div className="text-green-400 text-xs font-bold">DONE</div>}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })()}

          {/* ============================================================ */}
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
                  <div className="flex-1 flex flex-col justify-between py-2">
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
                    <div className="flex-1 flex relative items-center justify-center min-h-[160px] py-4">
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
                       <div className="absolute top-0 text-[8px] text-gray-400 text-center w-full">Sharpness<br/><span className="text-green-400 font-mono">96%</span></div>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] text-gray-400 text-right -mt-2">Detail<br/><span className="text-green-400 font-mono">94%</span></div>
                       <div className="absolute right-6 bottom-0 text-[8px] text-gray-400 text-right">Lighting<br/><span className="text-green-400 font-mono">92%</span></div>
                       <div className="absolute left-6 bottom-0 text-[8px] text-gray-400 text-left">Texture<br/><span className="text-green-400 font-mono">93%</span></div>
                       <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] text-gray-400 text-left w-20 leading-tight -mt-2">Identity Preservation<br/><span className="text-green-400 font-mono">95%</span></div>
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

                      <button onClick={() => startFaceGeometryAnalysis()} className="w-full mt-2 flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all text-left shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded bg-white/20 flex items-center justify-center backdrop-blur-sm"><Compass className="w-3.5 h-3.5 text-white" /></div>
                          <div>
                            <div className="text-xs text-white font-bold">Analyze Face Geometry</div>
                            <div className="text-[9px] text-blue-100">Calculate structural proportions</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
              
            </motion.div>
          )}

          
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
                    <button onClick={() => startFaceMatch()} className="w-full btn-cyber py-3 flex items-center justify-center gap-2 bg-blue-500/10 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all rounded-lg text-xs tracking-widest font-bold">
                      <Fingerprint className="w-4 h-4" /> EXTRACT ARCFACE EMBEDDING
                    </button>
                  </div>

                </div>

              </div>
            </motion.div>
          )}

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
                 <div className="col-span-3 bg-[#0a0d16] border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
                   <h3 className="text-[11px] font-bold text-purple-400 tracking-widest mb-1 uppercase">Quick Actions</h3>
                   <button onClick={() => startReconstruct3D()}
                     className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-500 text-white font-black tracking-widest rounded-lg transition-colors shadow-[0_0_20px_rgba(20,184,166,0.3)] text-xs">
                     <Box className="w-4 h-4"/> RECONSTRUCT 3D FACE
                   </button>
                   <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 border border-gray-800 text-gray-400 hover:text-white transition-colors text-[10px]">
                     <BookmarkPlus className="w-4 h-4 text-purple-400"/> Add to Watchlist
                   </button>
                   <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 border border-gray-800 text-gray-400 hover:text-white transition-colors text-[10px]">
                     <UserSearch className="w-4 h-4 text-purple-400"/> Open Full Profile
                   </button>
                   <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 border border-gray-800 text-gray-400 hover:text-white transition-colors text-[10px]">
                     <FileCheck className="w-4 h-4 text-gray-500"/> Export Match Report
                   </button>
                   <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 border border-gray-800 text-gray-400 hover:text-white transition-colors text-[10px]">
                     <FolderPlus className="w-4 h-4 text-gray-500"/> Add to Case
                   </button>
                 </div>

              </div>

            </motion.div>
          )}



          {/* ============================================================ */}
          {/* STAGE: REPORT DONE */}
          {/* ============================================================ */}
          {phase === 'report_done' && reportData && (
            <motion.div key="report-done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
              {/* Header */}
              <div className="flex justify-between items-center bg-[#070b14] p-3 rounded-xl border border-gray-800">
                <div>
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                    Face Analysis <ChevronRight className="w-3 h-3"/> <span className="text-purple-400">Forensic Report</span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400"/> Forensic Investigation Report
                  </h2>
                  <p className="text-[10px] text-gray-400">Comprehensive AI analysis report generated successfully</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-500/30 px-3 py-1 rounded-full">REPORT READY</span>
                  <button className="text-xs border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-gray-300 transition-colors">
                    Preview Full Screen
                  </button>
                  <button className="text-xs border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-gray-300 transition-colors">
                    Share Report
                  </button>
                  <button onClick={() => window.print()} className="text-xs bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-white transition-colors flex items-center gap-2 font-bold">
                    <Download className="w-4 h-4"/> Download Report
                  </button>
                </div>
              </div>
              <ReportViewer
                data={reportData}
                originalImage={cctv?.preview_url || undefined}
                enhancedImage={enhancementData ? `http://localhost:8000${enhancementData.enhanced_path}` : undefined}
              />
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* STAGE: GENERATING REPORT */}

          {/* ============================================================ */}
          {phase === 'generating_report' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-8 flex flex-col items-center justify-center min-h-[600px] border-l-4 border-l-purple-500">
              <FileText className="w-16 h-16 text-purple-400 mb-6 animate-pulse" />
              <h3 className="text-xl font-bold text-white tracking-widest mb-2">GENERATING FORENSIC REPORT</h3>
              <p className="text-purple-400 text-sm mb-8 text-center max-w-md">Compiling all pipeline results into a comprehensive investigation report...</p>
              <div className="w-full max-w-md space-y-3">
                {[
                  'Collecting face detection results...',
                  'Aggregating enhancement pipeline data...',
                  'Compiling geometry & biometric metrics...',
                  'Summarizing face matching evidence...',
                  'Packaging 3D reconstruction data...',
                  'Generating digital signature hash...',
                  'Finalizing PDF report document...',
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-400 animate-pulse" style={{ animationDelay: `${i * 0.25}s` }}>
                    <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                    {step}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

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
                            <span className={`font-mono font-bold ${p.color}`}>{p.value > 0 ? '+' : ''}{p.value}&deg;</span>
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


{/* ============================================================ */}
          {/* STAGE 4 LOADING: ArcFace Embedding Scan */}
          {/* ============================================================ */}
          {phase === 'tracking' && (
            <motion.div key="tracking-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-panel p-10 border-l-4 border-l-purple-500 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(147,51,234,0.08)_0%,_transparent_70%)] pointer-events-none"></div>
              
              {/* Pulsing fingerprint animation */}
              <div className="relative flex items-center justify-center mb-8">
                <div className="absolute w-48 h-48 rounded-full border border-purple-500/10 animate-ping"></div>
                <div className="absolute w-36 h-36 rounded-full border border-purple-500/20 animate-[ping_1.5s_ease-in-out_infinite]"></div>
                <div className="absolute w-24 h-24 rounded-full border border-purple-400/30"></div>
                <div className="w-20 h-20 rounded-full bg-purple-900/30 border border-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.5)]">
                  <Fingerprint className="w-10 h-10 text-purple-400 animate-pulse" />
                </div>
              </div>

              <h3 className="text-xl font-black text-white tracking-widest mb-2">GENERATING ARCFACE EMBEDDINGS</h3>
              <p className="text-purple-400 font-mono text-sm mb-8 text-center max-w-md">
                Encoding biometric features into 512-dimensional vector space<br/>
                and performing cosine similarity search across all frames...
              </p>

              {/* Simulated vector output */}
              <div className="bg-black/40 border border-purple-500/20 rounded-xl p-4 font-mono text-[10px] text-purple-300/60 max-w-xl w-full mb-6 space-y-1">
                <div className="text-purple-400/40 mb-2">&gt; insightface.ArcFace_R100.get_embedding(target_face)</div>
                <div className="animate-pulse">[0.231, -0.087, 0.412, 0.019, -0.334, 0.771, 0.092, ...]</div>
                <div className="text-purple-400/40 mt-2">&gt; cosine_similarity(target_vec, frame_embeddings) &gt; 0.82</div>
                <div className="text-green-400/60 animate-pulse">&gt; scanning frames... {selectedTargetFace?.id} → {selectedTargetFace?.person_id}</div>
              </div>

              <div className="flex items-center gap-3 text-gray-500 text-xs font-mono">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                MODEL: ArcFace R100 (InsightFace) &nbsp;|&nbsp; METRIC: Cosine Similarity &nbsp;|&nbsp; THRESHOLD: 0.82
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* STAGE 4 RESULTS: Subject Tracking Timeline */}
          {/* ============================================================ */}
          {phase === 'tracking_done' && trackingData && (
            <motion.div key="tracking-done" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass-panel p-6 border-l-4 border-l-purple-500 h-full flex flex-col relative overflow-hidden min-h-[600px]">
              <div className="absolute right-0 top-0 bottom-0 w-64 bg-purple-500/5 blur-3xl pointer-events-none"></div>

              {/* Header */}
              <h3 className="text-lg font-bold text-white tracking-widest border-b border-cyber-border/50 pb-4 mb-6 flex items-center justify-between relative z-10">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  STAGE 4: SUBJECT TRACKING — <span className="text-purple-400">{trackingData.person_id}</span>
                </span>
                <span className="text-sm font-mono text-purple-400 font-bold bg-purple-500/10 px-3 py-1 rounded">
                  {trackingData.total_appearances} APPEARANCES DETECTED
                </span>
              </h3>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4 mb-6 relative z-10">
                <div className="bg-[#0f172a] border border-[#1e293b] rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">{trackingData.total_appearances}</div>
                  <div className="text-[10px] text-gray-500 font-mono mt-1">TOTAL APPEARANCES</div>
                </div>
                <div className="bg-[#0f172a] border border-[#1e293b] rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">{(trackingData.average_confidence * 100).toFixed(1)}%</div>
                  <div className="text-[10px] text-gray-500 font-mono mt-1">AVG CONFIDENCE</div>
                </div>
                <div className="bg-[#0f172a] border border-[#1e293b] rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-400 leading-tight mt-1">{trackingData.embedding_model.split(' ')[0]}</div>
                  <div className="text-[10px] text-gray-500 font-mono mt-1">EMBEDDING MODEL</div>
                </div>
                <div className="bg-[#0f172a] border border-[#1e293b] rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{(trackingData.threshold * 100).toFixed(0)}%</div>
                  <div className="text-[10px] text-gray-500 font-mono mt-1">MATCH THRESHOLD</div>
                </div>
              </div>

              {/* Main Content: Frame Viewer + Timeline */}
              <div className="flex gap-6 flex-1 relative z-10 min-h-0">

                {/* LEFT: Frame Viewer */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="bg-black border border-[#1e293b] rounded-xl overflow-hidden flex-1 relative min-h-[300px]">
                    {selectedTrackEvent?.frame_path ? (
                      <>
                        <img
                          src={`http://localhost:8000${selectedTrackEvent.frame_path}`}
                          alt="Tracking Frame"
                          className="w-full h-full object-contain"
                        />
                        {/* Simulated bounding box overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div
                            className="absolute border-2 border-cyber-neonGreen shadow-[0_0_15px_rgba(57,255,20,0.5)] rounded"
                            style={{
                              left: `${(selectedTrackEvent.bounding_box.x / 1280) * 100}%`,
                              top: `${(selectedTrackEvent.bounding_box.y / 720) * 100}%`,
                              width: `${(selectedTrackEvent.bounding_box.w / 1280) * 100}%`,
                              height: `${(selectedTrackEvent.bounding_box.h / 720) * 100}%`,
                            }}
                          >
                            <div className="absolute -top-5 left-0 bg-cyber-neonGreen text-black text-[8px] font-bold px-1 rounded whitespace-nowrap">
                              {trackingData.person_id} — {(selectedTrackEvent.confidence * 100).toFixed(1)}% MATCH
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050914]">
                        <Fingerprint className="w-16 h-16 text-purple-500/30 mb-4" />
                        <p className="text-gray-600 font-mono text-xs text-center">Frame preview not available<br/>Select an event from the timeline</p>
                      </div>
                    )}
                    {/* Frame info bar */}
                    {selectedTrackEvent && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-2 flex justify-between items-center text-[10px] font-mono border-t border-[#1e293b]">
                        <span className="text-white">{selectedTrackEvent.timestamp}</span>
                        <span className="text-gray-400">Frame #{selectedTrackEvent.frame_number}</span>
                        <span className="text-gray-400">Pose: {selectedTrackEvent.pose}</span>
                        <span className="text-gray-400">~{selectedTrackEvent.distance_m}m away</span>
                        <span className={`font-bold ${selectedTrackEvent.confidence > 0.92 ? 'text-green-400' : selectedTrackEvent.confidence > 0.87 ? 'text-yellow-400' : 'text-orange-400'}`}>
                          {(selectedTrackEvent.confidence * 100).toFixed(1)}% match
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Target Face Reference */}
                  <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex items-center gap-4">
                    <img src={`http://localhost:8000${selectedTargetFace?.path}`} alt="Target" className="w-16 h-16 object-cover rounded-lg border border-purple-500" />
                    <div>
                      <div className="text-purple-400 text-xs font-bold mb-1">TARGET REFERENCE FACE</div>
                      <div className="text-white text-sm font-mono">{selectedTargetFace?.person_id}</div>
                      <div className="text-gray-500 text-[10px]">ID: {selectedTargetFace?.id} &nbsp;|&nbsp; Quality: {selectedTargetFace?.quality_score}/100</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-[10px] text-gray-500 mb-1">ARCFACE MODEL</div>
                      <div className="text-[10px] text-purple-400 font-mono">{trackingData.embedding_model}</div>
                      <div className="text-[10px] text-gray-600">{trackingData.similarity_metric}</div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Timeline */}
                <div className="w-72 flex-shrink-0 flex flex-col">
                  <h4 className="text-[10px] font-bold text-gray-400 tracking-widest mb-4 uppercase">Detection Timeline</h4>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                    {trackingData.timeline.map((event, idx) => {
                      const isActive = selectedTrackEvent?.event_id === event.event_id;
                      const confPct = (event.confidence * 100).toFixed(1);
                      const confColor = event.confidence > 0.92 ? 'text-green-400' : event.confidence > 0.87 ? 'text-yellow-400' : 'text-orange-400';
                      const barColor = event.confidence > 0.92 ? 'bg-green-500' : event.confidence > 0.87 ? 'bg-yellow-500' : 'bg-orange-500';
                      return (
                        <div
                          key={event.event_id}
                          onClick={() => setSelectedTrackEvent(event)}
                          className={`relative p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isActive ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_10px_rgba(147,51,234,0.2)]' : 'border-[#1e293b] bg-[#0f172a] hover:border-purple-500/40'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="text-white text-[10px] font-bold font-mono">{event.event_id}</div>
                              <div className="text-gray-500 text-[9px]">{event.timestamp} &nbsp;·&nbsp; Frame #{event.frame_number}</div>
                            </div>
                            <div className={`text-sm font-black ${confColor}`}>{confPct}%</div>
                          </div>
                          {/* Confidence bar */}
                          <div className="w-full h-1 bg-black rounded overflow-hidden mb-1">
                            <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${event.confidence * 100}%` }}></div>
                          </div>
                          <div className="flex justify-between text-[9px] text-gray-600">
                            <span>{event.pose}</span>
                            <span>~{event.distance_m}m</span>
                          </div>
                          {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-500 rounded-l"></div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-6 border-t border-cyber-border/50 relative z-10 mt-4">
                <button onClick={() => setPhase('faces_done')} className="btn-cyber text-sm px-4 py-2 border-cyber-border hover:bg-cyber-dark/50 flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> BACK TO FACE SELECTION
                </button>
                <button onClick={() => startGenerateReport()} className="btn-cyber px-8 py-3 flex items-center gap-2 bg-purple-500/10 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all">
                  <ShieldCheck className="w-5 h-5" /> GENERATE FORENSIC REPORT <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Pan/Zoom Modal */}
      {selectedFrame && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="absolute top-4 right-4 flex gap-4 z-10">
            <a href={`http://localhost:8000${selectedFrame}`} download target="_blank" rel="noreferrer" className="btn-cyber flex items-center gap-2 bg-black">
              <Download className="w-4 h-4" /> DOWNLOAD FULL RES
            </a>
            <button onClick={() => setSelectedFrame(null)} className="btn-cyber border-red-500/50 hover:border-red-500 text-red-500 bg-black">
              CLOSE VIEWER
            </button>
          </div>
          <p className="absolute top-6 left-6 text-cyber-neonBlue font-mono tracking-widest z-10 pointer-events-none flex flex-col">
            <span>[TACTICAL IMAGE ANALYSIS MODE]</span>
            <span className="text-gray-500 text-sm mt-1">SCROLL TO ZOOM • CLICK AND DRAG TO PAN</span>
          </p>
          <div className="w-full max-w-6xl h-[80vh] border border-cyber-neonBlue rounded-lg overflow-hidden bg-cyber-dark relative cursor-move shadow-[0_0_50px_rgba(0,243,255,0.1)]">
            <TransformWrapper initialScale={1} minScale={0.5} maxScale={8} centerOnInit={true} wheel={{ step: 0.1 }}>
              <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                <img src={`http://localhost:8000${selectedFrame}`} alt="Analysis" className="max-w-full max-h-full object-contain" />
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
      )}
    </div>
  );
}
