from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import traceback

from app.models import ReconciliationResponse
from app.services.file_handler import extract_sheet_data
from app.services.cleaner import clean_pr_data, clean_gstr2b_data
from app.services.matcher import match_invoices
from app.services.analyzer import analyze_results
from app.services.exporter import generate_excel_report

app = FastAPI(title="GSTSync Python Backend - Real-world Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "version": "2.1.0",
        "engine": "GSTSync Python Advanced Reconciler"
    }

@app.post("/api/reconcile", response_model=ReconciliationResponse)
async def api_reconcile(
    prFile: UploadFile = File(...),
    gstr2bFile: UploadFile = File(...),
    period: str = Form("Detection Fallback")
):
    try:
        log = []
        
        # 1. Sheet Detection & Load
        log.append(f"Received PR File: {prFile.filename}, GSTR File: {gstr2bFile.filename}")
        df_pr = await extract_sheet_data(prFile, is_gstr2b=False)
        df_gstr = await extract_sheet_data(gstr2bFile, is_gstr2b=True)
        log.append(f"Loaded {len(df_pr)} raw rows from Books, {len(df_gstr)} raw rows from GSTR-2B.")

        # 2. Aggregation & Cleaning
        pr_records = clean_pr_data(df_pr)
        gstr_records = clean_gstr2b_data(df_gstr)
        log.append(f"Aggregated Books to {len(pr_records)} unique transactions. Cleaned GSTR to {len(gstr_records)} records.")

        # 3. Matching Engine
        matched_results = match_invoices(pr_records, gstr_records)
        log.append("Classification complete across 5 matching levels.")

        # 4. Analysis
        response = analyze_results(
            period=period,
            results=matched_results,
            raw_pr_count=len(df_pr),
            unique_pr_count=len(pr_records),
            gstr_count=len(gstr_records),
            processing_log=log
        )
        
        return response

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Reconciliation Failed: {str(e)}")

@app.post("/api/export")
async def api_export(data: dict):
    # Depending on frontend design, they might pass JSON summary back 
    # OR we cache the last Reconciled Response model internally and fetch via Token.
    # For a stateless API, passing back standard JSON enables quick exports.
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
