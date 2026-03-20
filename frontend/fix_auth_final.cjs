const fs = require('fs');

const path = "c:\\Users\\Gaurav\\Downloads\\knightowl-push-ready\\gst-updated\\frontend\\src\\pages\\AuthPage.tsx";
let c = fs.readFileSync(path, 'utf8');

const imp1 = "import { useState } from 'react';";
const imp2 = "import { useState } from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';";

if (c.indexOf("framer-motion") === -1) {
    c = c.replace(imp1, imp2);
    fs.writeFileSync(path, c, 'utf8');
    console.log("Imports INJECTED successfully.");
} else {
    console.log("Imports already there.");
}

/* 创新
