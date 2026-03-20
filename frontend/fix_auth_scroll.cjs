const fs = require('fs');

const path = "c:\\Users\\Gaurav\\Downloads\\knightowl-push-ready\\gst-updated\\frontend\\src\\pages\\AuthPage.tsx";
let c = fs.readFileSync(path, 'utf8');

const p1 = /\{\/\* LEFT SIDE: Form \*\/\}\s*<div style=\{\{ flex: 1, padding: '40px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' \}\}>/;
const r1 = "{/* LEFT SIDE: Form */}\n        <div style={{ flex: 1, padding: '40px 60px', display: 'flex', flexDirection: 'column', position: 'relative', overflowY: 'auto' }}>\n          <div style={{ margin: 'auto 0', width: '100%', display: 'flex', flexDirection: 'column' }}>";

const p2 = /\s*<\/div>\s*\{\/\* RIGHT SIDE: Visual Art Area/;
const r2 = "\n          </div>\n        </div>\n\n        {/* RIGHT SIDE: Visual Art Area";

if (p1.test(c) && p2.test(c)) {
    c = c.replace(p1, r1).replace(p2, r2);
    fs.writeFileSync(path, c, 'utf8');
    console.log("AuthPage scroll inject injected successfully.");
} else {
    console.log("Scroll pattern injection failed or was already applied.");
}

// 创新
