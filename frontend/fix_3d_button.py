SRC = "c:/Users/Jeevan Kumar/OneDrive/文档/project/frontend/src/components/AnalysisScanner.tsx"

with open(SRC, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Find the line with "8. QUICK ACTIONS" in face_match_done
start_idx = None
for i, line in enumerate(lines):
    if '8. QUICK ACTIONS' in line:
        start_idx = i
        break

if start_idx is None:
    print("Could not find QUICK ACTIONS block")
    exit(1)

# Find the closing </div> of this block (look for the col-span-3 div close)
# The block starts at start_idx (comment line)
# Next line is the div with col-span-3
# Count div open/close to find end
depth = 0
end_idx = None
for i in range(start_idx + 1, len(lines)):
    opens = lines[i].count('<div') + lines[i].count('<button')
    closes = lines[i].count('</div>') + lines[i].count('</button>')
    depth += opens - closes
    if i > start_idx + 1 and depth <= 0:
        end_idx = i
        break

print(f"Block spans lines {start_idx+1} to {end_idx+1}")

NEW_BLOCK = '''                {/* 8. QUICK ACTIONS */}
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
'''

new_lines = lines[:start_idx] + [NEW_BLOCK] + lines[end_idx + 1:]

with open(SRC, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print(f"SUCCESS: Replaced lines {start_idx+1} to {end_idx+1} with RECONSTRUCT 3D FACE button.")
