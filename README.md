# GSTSync CA Edition — v2.0

> Full-stack GST Reconciliation Engine for CA Firms
> Built on real Lucichem May 2025 data · 22 features implemented

---

## Quick Start

### Option 1 — Windows (one click)
```
Double-click START_APP.bat
```

### Option 2 — Mac/Linux (one command)
```bash
./START_DEV.sh
```

### Option 3 — Docker (production)
```bash
docker-compose up --build
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

---

## Manual Setup

### Backend
```bash
cd backend
npm install
npm run dev          # development (nodemon)
npm start            # production
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # development (Vite)
npm run build        # production build
```

---

## Environment Variables

### backend/.env
```
PORT=3001
FRONTEND_URL=http://localhost:5173
DATA_DIR=./data
```

### frontend/.env
```
VITE_API_URL=http://localhost:3001
```

---

## What's Built (22 features)

### Engine (Backend)
- ✅ .XLS + .XLSX support (LibreOffice conversion)
- ✅ O→0 normalization (fixes IFF:029, HSS/OO31, GSTIN typos)
- ✅ Split-rate invoice aggregation (ALPS problem solved)
- ✅ 3-pass matching: Exact → Fuzzy (Levenshtein ≤2) → CDNR
- ✅ Smart flags: Transport, ITC Blocked, RCM, Prior Period
- ✅ ITC leakage detection (₹1.75L gap on Lucichem data)
- ✅ ITC Available sheet reader from GSTR-2B
- ✅ Monthly grouping for month-view
- ✅ Persistent voucher storage (JSON file, survives restart)

### Reports (Backend)
- ✅ 5-tab Excel export: Matched / PR Only / 2B Only / Mismatches / ITC Summary
- ✅ Action Taken column in all gap sheets
- ✅ Colour-coded rows per status

### Web App (Frontend)
- ✅ GSTR-2B + GSTR-1 reconciliation pages
- ✅ 5 filter chips with live counts
- ✅ Real pagination (50 rows/page)
- ✅ Action tracker: Fixed / Pending / Ignored per row
- ✅ Category column (Transport, ITC Blocked, RCM, Prior Period)
- ✅ Voucher builder (pre-fills from GSTR-2B data)
- ✅ Monthly delta view (table + chart, real data)
- ✅ GSTR-3B draft pre-fill (auto-calculated from reco)
- ✅ 5 KPI cards including ITC Leakage Gap
- ✅ Dark / Light theme

### CA Firm Modules
- ✅ Multi-client manager (GSTIN registry)
- ✅ Team workflow (Junior/Senior CA roles, task assignment, approve/rework)
- ✅ Supplier health score (ITC risk, match rate)
- ✅ GST notice tracker (deadlines, status, follow-up)
- ✅ Due date calendar (GSTR-1, 3B, 9 with countdown)

---

## Project Structure

```
gst-updated/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── reconciliationController.ts  ← core engine
│   │   │   ├── exportController.ts          ← 5-tab Excel
│   │   │   └── vouchersController.ts        ← persistent store
│   │   ├── utils/
│   │   │   ├── helpers.ts       ← O→0, levenshtein
│   │   │   ├── xlsConverter.ts  ← LibreOffice XLS→XLSX
│   │   │   ├── dataStore.ts     ← JSON file persistence
│   │   │   └── excelParser.ts   ← dynamic sheet parser
│   │   ├── routes/api.ts
│   │   └── index.ts             ← serves frontend in prod
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ReconciliationGrid.tsx  ← pagination + action tracker
│   │   │   ├── DashboardStats.tsx      ← 5 KPI cards
│   │   │   ├── MonthlyDeltaView.tsx    ← real data wired
│   │   │   ├── FileUploadArea.tsx
│   │   │   ├── AddVoucherModal.tsx
│   │   │   ├── Gstr3bDraft.tsx         ← NEW
│   │   │   ├── ClientManager.tsx       ← NEW
│   │   │   ├── TeamWorkflow.tsx        ← NEW
│   │   │   ├── SupplierHealth.tsx      ← NEW
│   │   │   ├── NoticeTracker.tsx       ← NEW
│   │   │   └── DueDateCalendar.tsx     ← NEW
│   │   ├── App.tsx
│   │   └── index.css
│   ├── Dockerfile
│   └── .env
├── docker-compose.yml
├── START_APP.bat      ← Windows one-click
└── START_DEV.sh       ← Mac/Linux one-command
```

---

## Tested On
- Lucichem May 2025 Purchase Register (.XLS)
- GSTR-2B 052025_24AAFCL3021L1ZQ_GSTR2B_16072025.xlsx
- Results: 34 matched, 3 soft-matched, 21 flagged in 4 categories
