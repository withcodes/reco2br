const fs = require('fs');

const filePath = "c:\\Users\\Gaurav\\Downloads\\knightowl-push-ready\\gst-updated\\frontend\\src\\pages\\LandingPage.tsx";

let content = fs.readFileSync(filePath, 'utf8');

const pattern = /Fuzzy matching<br \/>[\s\S]*?── FEATURES ──/;

const replacement = 'Fuzzy matching<br /><strong style={{ color: "#fbbf24" }}>engine</strong></p>} />\n      </div>\n\n      <DashboardMockup />\n\n      {/* ── FEATURES ──';

if (!pattern.test(content)) {
    // If StatCard 4 was already partially fixed, try matching the remaining leftovers
    const leftPattern = /创新[\s\S]*?── FEATURES ──/;
    if (leftPattern.test(content)) {
        const leftRepl = '</div>\n\n      <DashboardMockup />\n\n      {/* ── FEATURES ──';
        fs.writeFileSync(filePath, content.replace(leftPattern, leftRepl), 'utf8');
        console.log("Leftover leftovers repaired.");
        process.exit(0);
    }
    console.error("Pattern not found in file!");
    process.exit(1);
}

const updatedContent = content.replace(pattern, replacement);
fs.writeFileSync(filePath, updatedContent, 'utf8');

console.log("Fix Applied Successfully with Node.js!");

