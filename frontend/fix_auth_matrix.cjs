const fs = require('fs');

const path = "c:\\Users\\Gaurav\\Downloads\\knightowl-push-ready\\gst-updated\\frontend\\src\\pages\\AuthPage.tsx";
let c = fs.readFileSync(path, 'utf8');

const p1 = /<div style=\{\{ flex: 1, background: 'linear-gradient\(135deg, #eff6ff, #dbeafe\)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' \}\}>/;

const r1 = `<div style={{ flex: 1, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          
          {/* SVG Dot Grid Matrix Backdrop overlay */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.8, pointerEvents: 'none' }}>
            <defs>
              <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#4f46e5" opacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotGrid)" />
          </svg>`;

if (p1.test(c)) {
    c = c.replace(p1, r1);
    fs.writeFileSync(path, c, 'utf8');
    console.log("Dot matrix successfully injected with Node.");
} else {
    console.log("Pattern match failed inside file setup.");
}

// 创新
