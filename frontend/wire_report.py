"""
Wire the Forensic Report phase into AnalysisScanner.tsx
- Add 'generating_report' and 'report_done' phases to PipelinePhase type
- Import ReportViewer
- Add reportData state
- Add startGenerateReport() function
- Add "GENERATE FORENSIC REPORT" button to tracking_done panel
- Add generating_report loading UI
- Add report_done UI
"""

SRC = "c:/Users/Jeevan Kumar/OneDrive/文档/project/frontend/src/components/AnalysisScanner.tsx"

with open(SRC, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add phases
if "'generating_report'" not in content:
    content = content.replace(
        "| '3d_done'\n  | 'tracking'\n  | 'tracking_done'",
        "| '3d_done'\n  | 'tracking'\n  | 'tracking_done'\n  | 'generating_report'\n  | 'report_done'"
    )
    print("Phases added")
else:
    print("Phases already exist")

# 2. Import ReportViewer
if "ReportViewer" not in content:
    content = content.replace(
        "import { FaceViewer3D } from './FaceViewer3D';",
        "import { FaceViewer3D } from './FaceViewer3D';\nimport { ReportViewer } from './ReportViewer';\nimport type { ReportData } from './ReportViewer';"
    )
    print("Import added")

# 3. Add state
if "const [reportData, setReportData]" not in content:
    content = content.replace(
        "const [data3D, setData3D] = useState<SuspectData3D | null>(null);",
        "const [data3D, setData3D] = useState<SuspectData3D | null>(null);\n  const [reportData, setReportData] = useState<ReportData | null>(null);"
    )
    print("State added")

# 4. Add startGenerateReport function - insert before startReconstruct3D
REPORT_FUNC = """
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
"""

if "const startGenerateReport" not in content:
    content = content.replace(
        "  const startReconstruct3D = async",
        REPORT_FUNC + "\n  const startReconstruct3D = async"
    )
    print("Function added")

# 5. Add "GENERATE REPORT" button to tracking_done panel
# Find a button that leads out of tracking_done
if "startGenerateReport" not in content or "GENERATE FORENSIC REPORT" not in content:
    content = content.replace(
        "STAGE 4: SUBJECT TRACKING",
        "STAGE 4: SUBJECT TRACKING"
    )
    # Find the tracking_done section close and add button before closing motion.div
    # We'll look for a unique string in the tracking_done block
    OLD_TRACKING_END = "trackingData.similarity_metric}\n                    </div>\n"
    if OLD_TRACKING_END in content:
        content = content.replace(
            OLD_TRACKING_END,
            OLD_TRACKING_END + """                  </div>

                  {/* Generate Report CTA */}
                  <button onClick={() => startGenerateReport()} className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-500 hover:to-teal-500 text-white font-black tracking-widest rounded-lg transition-all shadow-[0_0_25px_rgba(147,51,234,0.4)] text-sm">
                    <FileText className="w-5 h-5"/> GENERATE FORENSIC REPORT
                  </button>
"""
        )
        print("Generate button added to tracking_done")
    else:
        print("WARNING: Could not find tracking_done end marker")

# 6. Add generating_report loading phase UI
REPORT_LOADING_UI = """
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

"""

if "phase === 'generating_report'" not in content:
    # Insert before the closing of the component
    content = content.replace(
        "          {/* ============================================================ */}\n          {/* STAGE: 3D RECONSTRUCTION */}",
        REPORT_LOADING_UI + "          {/* ============================================================ */}\n          {/* STAGE: 3D RECONSTRUCTION */"
    )
    print("Loading UI added")

# 7. Add report_done UI
REPORT_DONE_UI = """
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
                originalImage={uploadedImage || undefined}
                enhancedImage={enhancementData ? `http://localhost:8000${enhancementData.enhanced_path}` : undefined}
              />
            </motion.div>
          )}

"""

if "phase === 'report_done'" not in content:
    content = content.replace(
        "          {/* ============================================================ */}\n          {/* STAGE: GENERATING REPORT */}",
        REPORT_DONE_UI + "          {/* ============================================================ */}\n          {/* STAGE: GENERATING REPORT */"
    )
    print("Report done UI added")

# 8. Add FileText and Download to imports if missing
if "FileText" not in content:
    content = content.replace(
        "import { ", 
        "import { FileText, Download, "
    )

with open(SRC, "w", encoding="utf-8") as f:
    f.write(content)

print("DONE - AnalysisScanner.tsx updated successfully")
