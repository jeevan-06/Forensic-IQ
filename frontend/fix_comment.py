SRC = "c:/Users/Jeevan Kumar/OneDrive/文档/project/frontend/src/components/AnalysisScanner.tsx"

with open(SRC, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'uploadedImage' in line:
        lines[i] = line.replace('uploadedImage', 'cctv?.preview_url')
        print(f"Fixed line {i+1}")

with open(SRC, "w", encoding="utf-8") as f:
    f.writelines(lines)
print("Done.")
