const fs = require('fs');

const path = "c:\\Users\\Gaurav\\Downloads\\knightowl-push-ready\\gst-updated\\frontend\\src\\pages\\AuthPage.tsx";
let c = fs.readFileSync(path, 'utf8');

const imp1 = "import { Shield, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';";
const imp2 = "import { Shield, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';\nimport { motion, AnimatePresence } from 'framer-motion';";

if (c.indexOf("AnimatePresence") === -1) {
    c = c.replace(imp1, imp2);
}

const pattern = /创新[\s\S]*?\);[\s\S]*?}/;
if (pattern.test(c)) {
    c = c.replace(pattern, '}');
    console.log("Found pattern and replaced.");
} else {
    console.log("Pattern not found.");
}

c = c.replace(/创新/g, '');

fs.writeFileSync(path, c, 'utf8');
console.log("AuthPage.tsx repaired successfully.");
创新
