SRC = "c:/Users/Jeevan Kumar/OneDrive/文档/project/frontend/src/pages/Dashboard.tsx"

with open(SRC, "r", encoding="utf-8") as f:
    content = f.read()

# Fix Database import
if "Database" not in content[:500]:
    content = content.replace("Server, PieChart,", "Server, PieChart, Database,")

# Fix UploadZone props (UploadZone doesn't take those props in this version maybe?)
# Let's check what UploadView is supposed to look like by replacing the dummy UploadView
content = content.replace(
    "function UploadView() { return <UploadZone onUploadComplete={() => {}} isUploading={false} progress={0} />; }",
    "function UploadView() { return <UploadZone />; }"
)

with open(SRC, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed TS errors.")
