import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Plus, Search, Filter, Download, Upload, X, CheckCircle2,
  AlertTriangle, ShieldAlert, User, Fingerprint, Eye, Trash2, ChevronDown,
  Loader2, RefreshCw
} from 'lucide-react';
import api from '../services/api';

const RISK_COLORS: Record<string, string> = {
  HIGH:   'bg-red-500/20 text-red-400 border-red-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  LOW:    'bg-green-500/20 text-green-400 border-green-500/30',
};
const STATUS_COLORS: Record<string, string> = {
  Active:   'text-green-400',
  Inactive: 'text-gray-400',
  Wanted:   'text-red-400',
};
const EXTRACTION_STEPS = [
  'Initializing ArcFace ResNet100 Engine…',
  'Preprocessing facial image…',
  'Detecting facial landmarks (468 pts)…',
  'Extracting 512D embedding vector…',
  'Applying L2 normalization…',
  'Computing identity hash…',
  'Encrypting vector payload…',
  'Saving to forensic database…',
];

export default function DatabaseManagement() {
  const [criminals, setCriminals]             = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [search, setSearch]                   = useState('');
  const [filterRisk, setFilterRisk]           = useState('ALL');
  const [showPanel, setShowPanel]             = useState(false);
  const [extractionPhase, setExtractionPhase] = useState<'idle'|'extracting'|'done'>('idle');
  const [extractionStep, setExtractionStep]   = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [viewProfile, setViewProfile]         = useState(false);
  const [errorMsg, setErrorMsg]               = useState('');

  const [form, setForm] = useState({ name:'', alias:'', age:'', gender:'Male', risk:'HIGH', nationality:'', notes:'' });
  const [mugshot, setMugshot]   = useState<string|null>(null);   // data-URL
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- load from backend ----------
  const fetchCriminals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pipeline/criminals');
      setCriminals(res.data.criminals || []);
    } catch {
      setCriminals([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchCriminals(); }, []);

  // ---------- drag-drop / file pick ----------
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => setMugshot(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setMugshot(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ---------- enroll ----------
  const handleEnroll = async () => {
    if (!form.name || !mugshot) return;
    setErrorMsg('');
    setExtractionPhase('extracting');
    setExtractionStep(0);

    // Animate steps
    for (let i = 0; i < EXTRACTION_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 350));
      setExtractionStep(i + 1);
    }

    try {
      await api.post('/pipeline/enroll_criminal', {
        name:        form.name,
        alias:       form.alias,
        age:         parseInt(form.age) || 0,
        gender:      form.gender,
        nationality: form.nationality,
        risk:        form.risk,
        notes:       form.notes,
        image_data:  mugshot,
      });
      setExtractionPhase('done');
      await new Promise(r => setTimeout(r, 800));
      setShowPanel(false);
      setExtractionPhase('idle');
      setExtractionStep(0);
      setForm({ name:'', alias:'', age:'', gender:'Male', risk:'HIGH', nationality:'', notes:'' });
      setMugshot(null);
      fetchCriminals();
    } catch (err: any) {
      setExtractionPhase('idle');
      setErrorMsg(err?.response?.data?.detail || 'Enrollment failed.');
    }
  };

  // ---------- delete ----------
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/pipeline/criminals/${id}`);
      setCriminals(prev => prev.filter(c => c.id !== id));
    } catch { /* ignore */ }
  };

  const filtered = criminals.filter(c => {
    const q = search.toLowerCase();
    const matchS = c.name?.toLowerCase().includes(q) || c.id?.toLowerCase().includes(q);
    const matchR = filterRisk === 'ALL' || c.risk === filterRisk;
    return matchS && matchR;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-10">

      {/* ── Header ── */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-3">
            <Database className="w-6 h-6 text-purple-400" /> Database Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage and enroll criminal profiles in the forensic identification database.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchCriminals} className="flex items-center gap-2 text-xs border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-gray-300 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => setShowPanel(true)} className="flex items-center gap-2 text-xs bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-lg font-bold transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]">
            <Plus className="w-4 h-4" /> Enroll New Profile
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:'Total Profiles',    value: criminals.length,                              icon: User,       color:'text-purple-400', bg:'bg-purple-500/10' },
          { label:'High Risk',         value: criminals.filter(c=>c.risk==='HIGH').length,   icon: ShieldAlert, color:'text-red-400',    bg:'bg-red-500/10'    },
          { label:'Wanted',            value: criminals.filter(c=>c.status==='Wanted').length, icon: AlertTriangle, color:'text-yellow-400', bg:'bg-yellow-500/10' },
          { label:'Embedded Vectors',  value: criminals.length,                              icon: Fingerprint, color:'text-green-400', bg:'bg-green-500/10'  },
        ].map((s,i) => (
          <div key={i} className="bg-[#0a0d16] border border-gray-800 rounded-xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${s.bg}`}>
              <s.icon className={`w-6 h-6 ${s.color}`} />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase mb-1">{s.label}</p>
              <p className="text-2xl font-black text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="bg-[#0a0d16] border border-gray-800 rounded-xl overflow-hidden">
        {/* controls */}
        <div className="p-4 border-b border-gray-800 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or ID…"
              className="w-full bg-black/40 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors" />
          </div>
          <div className="flex gap-2">
            {['ALL','HIGH','MEDIUM','LOW'].map(r=>(
              <button key={r} onClick={()=>setFilterRisk(r)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-colors ${filterRisk===r?'bg-purple-600 text-white border-purple-500':'border-gray-700 text-gray-400 hover:text-white'}`}>
                {r}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-500 ml-auto">
            <Filter className="w-3 h-3" /> {filtered.length} records
          </div>
        </div>

        {/* header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800/50 bg-black/20">
          <div className="col-span-3">Profile</div>
          <div className="col-span-1 text-center">Risk</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-center">Age</div>
          <div className="col-span-2">Nationality</div>
          <div className="col-span-2">Date Added</div>
          <div className="col-span-1 text-center">Vector</div>
          <div className="col-span-1 text-center">Actions</div>
        </div>

        {/* rows */}
        {loading ? (
          <div className="py-16 flex flex-col items-center text-gray-600">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Loading database…</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {filtered.map((c,idx)=>(
              <motion.div key={c.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:idx*0.04}}
                className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors group">
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-700 bg-black flex-shrink-0">
                    <img src={`http://localhost:8000${c.image_path}`} className="w-full h-full object-cover" alt={c.name}
                      onError={e=>{(e.target as HTMLImageElement).src='/database/db_mugshot_1.png';}} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{c.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{c.id} · {c.alias||'—'}</div>
                  </div>
                </div>
                <div className="col-span-1 flex justify-center">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${RISK_COLORS[c.risk]||RISK_COLORS.LOW}`}>{c.risk}</span>
                </div>
                <div className="col-span-1 text-center text-[11px] font-semibold">
                  <span className={STATUS_COLORS[c.status||'Active']}>{c.status||'Active'}</span>
                </div>
                <div className="col-span-1 text-center text-xs text-gray-300">{c.age||'—'}</div>
                <div className="col-span-2 text-xs text-gray-400">{c.nationality||'Unknown'}</div>
                <div className="col-span-2 text-xs text-gray-400">{c.added||'—'}</div>
                <div className="col-span-1 flex justify-center">
                  <span title="512D vector enrolled"><CheckCircle2 className="w-4 h-4 text-green-500" /></span>
                </div>
                <div className="col-span-1 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>{setSelectedProfile(c);setViewProfile(true);}}
                    className="p-1.5 rounded hover:bg-purple-500/20 text-gray-400 hover:text-purple-400 transition-colors">
                    <Eye className="w-3.5 h-3.5"/>
                  </button>
                  <button onClick={()=>handleDelete(c.id)}
                    className="p-1.5 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5"/>
                  </button>
                </div>
              </motion.div>
            ))}
            {filtered.length===0 && !loading && (
              <div className="py-16 flex flex-col items-center justify-center text-gray-600">
                <Database className="w-10 h-10 mb-3 opacity-30"/>
                <p className="text-sm">No profiles found. Enroll your first suspect above.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Enroll panel ── */}
      <AnimatePresence>
        {showPanel && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={()=>extractionPhase==='idle'&&setShowPanel(false)} />

            <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',damping:25,stiffness:200}}
              className="fixed right-0 top-0 bottom-0 w-[480px] bg-[#08091a] border-l border-gray-800 z-50 flex flex-col overflow-y-auto">

              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <div>
                  <h2 className="text-white font-black text-lg tracking-wide flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-purple-400"/> Enroll New Profile
                  </h2>
                  <p className="text-gray-500 text-xs mt-1">Add a new suspect to the forensic database</p>
                </div>
                <button onClick={()=>extractionPhase==='idle'&&setShowPanel(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5"/>
                </button>
              </div>

              <div className="flex-1 p-6 space-y-5">
                {/* Mugshot */}
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Mugshot Photo *</label>
                  <div
                    onDragOver={e=>{e.preventDefault();setDragging(true);}}
                    onDragLeave={()=>setDragging(false)}
                    onDrop={handleDrop}
                    onClick={()=>fileInputRef.current?.click()}
                    className={`relative h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${dragging?'border-purple-400 bg-purple-500/10':'border-gray-700 hover:border-gray-600 bg-black/30'}`}>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                    {mugshot
                      ? <img src={mugshot} className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-80"/>
                      : (<>
                          <Upload className="w-10 h-10 text-gray-600 mb-3"/>
                          <p className="text-xs text-gray-400">Drop mugshot here or click to browse</p>
                          <p className="text-[10px] text-gray-600 mt-1">PNG, JPG, WEBP supported</p>
                        </>)
                    }
                  </div>
                </div>

                {/* Fields */}
                {([{label:'Full Name *',key:'name',ph:'Enter full name'},{label:'Alias / Nickname',key:'alias',ph:'e.g., John D.'},{label:'Age',key:'age',ph:'e.g., 28'},{label:'Nationality',key:'nationality',ph:'e.g., Unknown'}] as const).map(f=>(
                  <div key={f.key}>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">{f.label}</label>
                    <input value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph}
                      className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-gray-700"/>
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4">
                  {[{label:'Gender',key:'gender',opts:['Male','Female','Unknown']},{label:'Risk Level',key:'risk',opts:['HIGH','MEDIUM','LOW']}].map(s=>(
                    <div key={s.key}>
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">{s.label}</label>
                      <div className="relative">
                        <select value={(form as any)[s.key]} onChange={e=>setForm(p=>({...p,[s.key]:e.target.value}))}
                          className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer">
                          {s.opts.map(o=><option key={o}>{o}</option>)}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Notes</label>
                  <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} rows={3}
                    placeholder="Any additional notes…"
                    className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors resize-none placeholder:text-gray-700"/>
                </div>

                {errorMsg && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg p-3">{errorMsg}</p>}
              </div>

              {/* Extraction progress */}
              {extractionPhase!=='idle' && (
                <div className="mx-6 mb-4 bg-black/60 border border-purple-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {extractionPhase==='extracting'
                      ? <Loader2 className="w-5 h-5 text-purple-400 animate-spin"/>
                      : <CheckCircle2 className="w-5 h-5 text-green-400"/>}
                    <span className="text-sm font-bold text-white">
                      {extractionPhase==='done'?'Profile Enrolled Successfully!':'Extracting ArcFace Embedding…'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {EXTRACTION_STEPS.map((step,i)=>(
                      <div key={i} className={`flex items-center gap-2 text-[10px] transition-colors ${i<extractionStep?'text-green-400':i===extractionStep?'text-purple-300 animate-pulse':'text-gray-700'}`}>
                        {i<extractionStep
                          ? <CheckCircle2 className="w-3 h-3 flex-shrink-0"/>
                          : <div className="w-3 h-3 rounded-full border border-current flex-shrink-0"/>}
                        {step}
                      </div>
                    ))}
                  </div>
                  {extractionPhase==='extracting' && (
                    <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 transition-all duration-300" style={{width:`${(extractionStep/EXTRACTION_STEPS.length)*100}%`}}/>
                    </div>
                  )}
                </div>
              )}

              {/* Submit */}
              {extractionPhase==='idle' && (
                <div className="p-6 border-t border-gray-800">
                  <button onClick={handleEnroll} disabled={!form.name||!mugshot}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black tracking-widest rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                    <Fingerprint className="w-5 h-5"/> EXTRACT EMBEDDING &amp; SAVE
                  </button>
                  <p className="text-center text-[10px] text-gray-600 mt-2">ArcFace ResNet100 · 512D embedding extraction</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── View Profile modal ── */}
      <AnimatePresence>
        {viewProfile && selectedProfile && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" onClick={()=>setViewProfile(false)}/>
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] bg-[#08091a] border border-gray-800 rounded-2xl z-50 overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-gray-800 flex justify-between items-center">
                <h3 className="font-black text-white text-lg tracking-wide">Criminal Profile</h3>
                <button onClick={()=>setViewProfile(false)} className="p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white"><X className="w-4 h-4"/></button>
              </div>
              <div className="p-6 flex gap-6">
                <div className="w-32 h-44 rounded-xl overflow-hidden border border-gray-700 bg-black flex-shrink-0">
                  <img src={`http://localhost:8000${selectedProfile.image_path}`} className="w-full h-full object-cover"
                    onError={e=>{(e.target as HTMLImageElement).src='/database/db_mugshot_1.png';}}/>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="text-xl font-black text-white">{selectedProfile.name}</div>
                    <div className="text-sm text-gray-400 font-mono">{selectedProfile.id}</div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${RISK_COLORS[selectedProfile.risk]||RISK_COLORS.LOW}`}>{selectedProfile.risk} RISK</span>
                  {[['Alias',selectedProfile.alias||'—'],['Age',selectedProfile.age||'—'],['Gender',selectedProfile.gender],['Nationality',selectedProfile.nationality||'Unknown'],['Date Added',selectedProfile.added]].map(([k,v])=>(
                    <div key={String(k)} className="flex justify-between text-sm">
                      <span className="text-gray-500">{k}</span><span className="text-gray-200">{v}</span>
                    </div>
                  ))}
                  {selectedProfile.notes && <p className="text-xs text-gray-400 border-t border-gray-800 pt-2">{selectedProfile.notes}</p>}
                  <div className="pt-3 border-t border-gray-800 flex items-center gap-2 text-[10px] text-green-400">
                    <CheckCircle2 className="w-3 h-3"/> 512D ArcFace Embedding Enrolled
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
