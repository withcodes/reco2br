const fs = require('fs');

const path1 = "c:\\Users\\Gaurav\\Downloads\\knightowl-push-ready\\gst-updated\\frontend\\src\\components\\DashboardMockup.tsx";
let c1 = fs.readFileSync(path1, 'utf8');

const p1 = /import React from 'react';\s*import { motion } from 'framer-motion';\s*import {[\s\S]*?} from 'lucide-react';/;
const r1 = "import { motion } from 'framer-motion';\nimport { Shield, Zap, Users, FileCheck, TrendingUp, Search, Bell, Plus, CheckCircle } from 'lucide-react';";

c1 = c1.replace(p1, r1);
c1 = c1.replace(/创新/g, '');
fs.writeFileSync(path1, c1, 'utf8');
console.log("DashboardMockup.tsx cleaned up.");

const path2 = "c:\\Users\\Gaurav\\Downloads\\knightowl-push-ready\\gst-updated\\frontend\\src\\pages\\LandingPage.tsx";
let c2 = fs.readFileSync(path2, 'utf8');

const p2 = /import { Shield[\s\S]*?Wallet } from 'lucide-react';/;
const r2 = "import { Shield, Zap, Users, FileCheck, TrendingUp, CheckCircle, ArrowRight, Star, Building2, Phone, Clock, Brain } from 'lucide-react';";

c2 = c2.replace(p2, r2);
fs.writeFileSync(path2, c2, 'utf8');
console.log("LandingPage.tsx cleaned up.");

