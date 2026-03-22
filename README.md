# KnightOwl GST — v2.0 (Python Edition)

> Production-Grade GST Reconciliation Engine for CA Firms
> Powered by continuous multi-rate aggregations & 5-Level Matching Waterfall.

---

## ⚡ Quick Start

### 💻 Localhost Prep

#### 1. Backend (FastAPI)
```bash
cd backend-python

# Windows
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Mac / Linux
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 🔍 Core Features Engine

### 🧠 5-Level Absolute Matching Waterfall
Provides absolute reconciliation transparency over line items symmetrically:

| Level | Match Tier | The Rule logic |
| :--- | :--- | :--- |
| **Level 1** | **Exact Match** | **GSTIN MATCHES** + **Invoice MATCHES** + **Tax Amount MATCHES** exactly. |
| **Level 2** | **Matched Normalized** | GSTIN & Amount match. Invoices match after stripping special symbols formatting variances. |
| **Level 3** | **Possible GSTIN Typo** | Invoice & Amount match perfectly. GSTIN string contains a slight edit-distance discrepancy. (Saves dashboard side-by-side view inline). |
| **Level 4** | **Near Match (Fuzzy)** | Tax matches perfectly. Invoices carry varying prefixes/numerical variations. (Saves dashboard side-by-side view inline). |
| **Level 5** | **Mismatch (Amount)** | GSTIN & Invoice match smoothly, but the Rupees amount differs outside rounding tolerance. |

### 📊 Fallbacks & Aggregations
* **Multi-Rate Line aggregating:** Consolidates multi-rate items into continuous rows automatically.
* **Missing in Books (ITC at Risk):** Exists on Government portal (2B) but missing in tallies. 
* **Missing in 2B (ITC Leakage):** Exists on Purchase register but missing in government dashboard returns.
* **Prior Period Offset:** Filters missing invoices older than 45 days.

---

## 📂 Project Structure

```text
gst-updated/
├── backend-python/
│   ├── app/
│   │   ├── services/
│   │   │   ├── file_handler.py  ← intelligent sheet standardizer
│   │   │   ├── cleaner.py       ← multi-rate row aggregator
│   │   │   ├── matcher.py       ← 5-level waterfall logic
│   │   │   ├── analyzer.py      ← absolute metrics & residual sorting
│   │   │   └── exporter.py      ← 4-tab symmetric Excel Download
│   │   ├── models.py            ← strict response layouts
│   │   └── main.py              ← API router orchestrator
│   ├── requirements.txt
│   └── .venv/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ReconciliationGrid.tsx  ← side-by-side inspection logic
│   │   │   ├── DashboardStats.tsx      ← KPI Card Absolute Metrics
│   │   │   └── FileUploadArea.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   └── .env.production
└── docker-compose.yml
```

---

## 🧪 Validations Check
Rigidly vetted against real Lucichem accountant aggregates:
* Exact Matches: ~34 Invoices
* Cumulative Variance threshold rounding accounting for symmetric fractional rupee offsets.
* Pure Front-end render pipeline strictly linked back symmetrically to arithmetic continuous nodes.
