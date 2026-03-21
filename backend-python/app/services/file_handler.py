from io import BytesIO
import pandas as pd
import subprocess
import os
import tempfile
import sys
from fastapi import UploadFile, HTTPException
from app.config import GSTR2B_PRIMARY_SHEET, PR_PRIMARY_SHEETS, JUNK_SHEETS

async def convert_xls_to_xlsx(file_bytes: bytes) -> bytes:
    """ Convert legacy .xls to .xlsx using a mock function - 
        In production LibreOffice 'soffice' would be required. 
        For now we attempt to load XLS with pandas if python engine supports it.
    """
    return file_bytes

async def extract_sheet_data(file: UploadFile, is_gstr2b: bool) -> pd.DataFrame:
    content = await file.read()
    
    if file.filename.endswith('.xls'):
        # Fallback to convert if required, but pandas `read_excel` can sometimes handle plain XLS
        content = await convert_xls_to_xlsx(content)
        
    try:
        xl = pd.ExcelFile(BytesIO(content), engine='openpyxl' if file.filename.endswith('xlsx') else None)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Excel format: {e}")
        
    target_sheet = None
    sheet_names = xl.sheet_names
    
    # 1. Sheet selection logic
    for name in sheet_names:
        clean_name = name.strip().upper()
        
        if clean_name in JUNK_SHEETS:
            continue
            
        if is_gstr2b:
            if clean_name == GSTR2B_PRIMARY_SHEET:
                target_sheet = name
                break
        else:
            if any(p == clean_name for p in PR_PRIMARY_SHEETS):
                target_sheet = name
                break
                
    if not target_sheet:
        raise HTTPException(status_code=400, detail="Primary data sheet (e.g., 'B2B') not found.")
        
    # 2. Dynamic header detection (scan top 20 rows)
    df_raw = pd.read_excel(xl, sheet_name=target_sheet, header=None, nrows=30)
    
    header_idx = -1
    for i, row in df_raw.iterrows():
        row_str = ' '.join([str(val).upper() for val in row.values if pd.notna(val)])
        if 'GSTIN' in row_str:
            header_idx = i
            break
            
    if header_idx == -1:
         print(f"DEBUG: Sheet {target_sheet} failed header detection.")
         for i, row in df_raw.iterrows():
             print(f"DEBUG Row {i}: {' '.join([str(val).upper() for val in row.values if pd.notna(val)])}")
         raise HTTPException(status_code=400, detail="Could not detect header row containing GSTIN/Invoice.")
         
    # 3. Read actual data
    df = pd.read_excel(xl, sheet_name=target_sheet, header=header_idx)
    print(f"DEBUG: Loaded sheet '{target_sheet}' with header at row {header_idx}. Found {len(df)} rows.")
    
    # Clean up empty rows
    df.dropna(how='all', inplace=True)
    return df
