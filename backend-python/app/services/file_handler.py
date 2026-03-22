from io import BytesIO
import pandas as pd
import subprocess
import os
import tempfile
import sys
from fastapi import UploadFile, HTTPException
from app.config import GSTR2B_PRIMARY_SHEET, PR_PRIMARY_SHEETS, JUNK_SHEETS

async def convert_xls_to_xlsx(file_bytes: bytes) -> bytes:
    """ Convert legacy .xls to .xlsx using a mock function """
    return file_bytes

def is_junk_sheet(df_sample: pd.DataFrame) -> bool:
    """ RULE 6: Junk sheet detection. Check if first 3 columns lack core GST keywords. """
    if len(df_sample.columns) == 0:
        return True
    
    # Get all text from top rows of first 3 columns
    text_corpus = ""
    for col in df_sample.columns[:3]:
        text_corpus += " " + str(col).upper()
        if len(df_sample) > 0:
            text_corpus += " " + " ".join([str(v).upper() for v in df_sample[col].head(15).values if pd.notna(v)])
            
    keywords = ['GSTIN', 'INVOICE', 'TAX', 'VALUE', 'SUPPLIER', 'PARTY', 'AMOUNT', 'VOUCHER']
    if not any(kw in text_corpus for kw in keywords):
        return True
    return False

async def extract_sheet_data(file: UploadFile, is_gstr2b: bool) -> pd.DataFrame:
    content = await file.read()
    
    if file.filename.endswith('.xls'):
        content = await convert_xls_to_xlsx(content)
        
    try:
        xl = pd.ExcelFile(BytesIO(content), engine='openpyxl' if file.filename.endswith('xlsx') else None)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Excel format: {e}")
        
    target_sheet = None
    
    # 1. Sheet selection logic
    for name in xl.sheet_names:
        clean_name = name.strip().upper()
        
        # Hard junk checks
        if any(j.upper() in clean_name for j in JUNK_SHEETS):
            continue
            
        if is_gstr2b:
            if clean_name == GSTR2B_PRIMARY_SHEET:
                target_sheet = name
                break
        else:
            if clean_name == 'B2B': # Prioritize B2B strictly for PR
                target_sheet = name
                break
            elif any(p == clean_name for p in PR_PRIMARY_SHEETS):
                target_sheet = name
                
    if not target_sheet:
        raise HTTPException(status_code=400, detail="Primary data sheet 'B2B' not found.")
        
    # 2. Dynamic header detection with fallback
    df_raw = pd.read_excel(xl, sheet_name=target_sheet, header=None, nrows=20)
    
    if is_junk_sheet(df_raw):
        raise HTTPException(status_code=400, detail=f"Sheet '{target_sheet}' appears to be missing GST columns (Junk Sheet).")

    header_idx = -1
    for i, row in df_raw.iterrows():
        row_str = ' '.join([str(val).upper() for val in row.values if pd.notna(val)])
        if 'GSTIN' in row_str and ('INVOICE' in row_str or 'VOUCHER' in row_str or 'AMOUNT' in row_str or 'DATE' in row_str):
            header_idx = i
            break
            
    if header_idx == -1:
         # Fallback based on rules
         header_idx = 5 if is_gstr2b else 3
         
    # 3. Read actual data
    df = pd.read_excel(xl, sheet_name=target_sheet, header=header_idx)
    
    # 4. GSTR-2B Merged Header Resolution
    # In GSTR-2B, 'Invoice Details' is merged above 'Invoice number'. 
    # If the sub-headers leaked into the first data row, merge them up into the column names.
    if len(df) > 0:
        first_row_str = ' '.join([str(val).upper() for val in df.iloc[0].values if pd.notna(val)])
        if 'INVOICE NUMBER' in first_row_str or 'CENTRAL TAX' in first_row_str or 'INTEGRATED TAX' in first_row_str:
            new_cols = []
            for col, val in zip(df.columns, df.iloc[0]):
                col_str = str(col).strip()
                val_str = str(val).strip() if pd.notna(val) else ''
                if 'Unnamed' in col_str:
                    new_cols.append(val_str)
                else:
                    new_cols.append(col_str + ' ' + val_str if val_str else col_str)
            df.columns = new_cols
            df = df.iloc[1:].reset_index(drop=True)
            
    # Clean up empty rows
    df.dropna(how='all', inplace=True)
    return df
