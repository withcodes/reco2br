const fs = require('fs');

const path = "c:\\Users\\Gaurav\\Downloads\\knightowl-push-ready\\gst-updated\\frontend\\src\\pages\\AuthPage.tsx";
let c = fs.readFileSync(path, 'utf8');

const pattern = /import { Shield[\s\S]*?} from 'lucide-react';/;
const replacement = "import { Shield, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';\nimport { motion, AnimatePresence } from 'framer-motion';";

if (c.indexOf("from 'framer-motion'") === -1) {
    c = c.replace(pattern, replacement);
    fs.writeFileSync(path, c, 'utf8');
    console.log("Imports INJECTED successfully with Node.");
    process.exit(0);
} else {
    console.log("framer-motion imports already present.");
    process.exit(0);
}
创新
