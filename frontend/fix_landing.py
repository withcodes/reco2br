import re, sys

path = r"c:\Users\Gaurav\Downloads\knightowl-push-ready\gst-updated\frontend\src\pages\LandingPage.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Match from 'Fuzzy ma' up to the next section header
pattern = r"Fuzzy ma[\s\S]*?/\* ── FEATURES ── \*/"

# Restore StatCard footer + correct placeholder
replacement = 'Fuzzy matching<br /><strong style={{ color: "#fbbf24" }}>engine</strong></p>} />\n      </div>\n\n      <DashboardMockup />\n\n      {/* ── FEATURES ── */'

if not re.search(pattern, content):
    print("Pattern not found")
    sys.exit(1)

new_content = re.sub(pattern, replacement, content)

with open(path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Fix applied successfully")

