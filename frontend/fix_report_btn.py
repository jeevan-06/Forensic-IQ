SRC = "c:/Users/Jeevan Kumar/OneDrive/文档/project/frontend/src/components/AnalysisScanner.tsx"

with open(SRC, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Line 2487 (0-indexed: 2486) - fix the button onClick
for i, line in enumerate(lines):
    if 'alert(' in line and 'Generating forensic report' in line:
        lines[i] = lines[i].replace(
            "onClick={() => alert('Generating forensic report...')}",
            "onClick={() => startGenerateReport()}"
        )
        print(f"Fixed line {i+1}")

with open(SRC, "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Done.")
