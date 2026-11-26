SRC = "c:/Users/Jeevan Kumar/OneDrive/文档/project/frontend/src/components/AnalysisScanner.tsx"

with open(SRC, "r", encoding="utf-8", errors="replace") as f:
    lines = f.readlines()

fixed = 0
for i, line in enumerate(lines):
    if "p.value}" in line and "span" in line and ("font-mono" in line or "font-bold" in line):
        # Replace the bad line with the correct one
        lines[i] = "                            <span className={`font-mono font-bold ${p.color}`}>{p.value > 0 ? '+' : ''}{p.value}&deg;</span>\n"
        print(f"Fixed line {i+1}")
        fixed += 1

if fixed == 0:
    # Try to find it differently
    for i, line in enumerate(lines):
        if "p.value}" in line:
            print(f"Found p.value at {i+1}: {repr(line[:100])}")

with open(SRC, "w", encoding="utf-8") as f:
    f.writelines(lines)

print(f"Done. Fixed {fixed} lines.")
