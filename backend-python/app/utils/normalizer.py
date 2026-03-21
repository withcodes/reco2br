import re
from datetime import datetime
import pandas as pd

def normalize_string(s: str | None) -> str:
    if pd.isna(s) or s is None:
        return ""
    # Strip non-alphanumeric, uppercase, replace O with 0
    return re.sub(r'[^A-Z0-9]', '', str(s).upper().replace('O', '0'))

def normalize_gstin(s: str | None) -> str:
    if pd.isna(s) or s is None:
        return ""
    return str(s).upper().strip()

def normalize_invoice(s: str | None) -> str:
    """
    CRITICAL RULE 3: Invoice Normalization
    - uppercase, strip spaces
    - Remove colons, slashes, hyphens
    - Strip year formats: 2025-26, 2526
    - Strip leading zeros
    """
    if pd.isna(s) or s is None:
        return ""
    cleaned = str(s).upper().replace('O', '0')
    cleaned = re.sub(r'\b(20\d{2}(-\d{2})?)\b', '', cleaned)
    cleaned = re.sub(r'\b(25\d{2})\b', '', cleaned)
    cleaned = re.sub(r'[^A-Z0-9]', '', cleaned)
    return cleaned.lstrip('0')

def parse_amount(val: any) -> float:
    if pd.isna(val) or val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    try:
        num_str = str(val).replace(',', '').strip()
        return float(num_str) if num_str else 0.0
    except ValueError:
        return 0.0

def normalize_date(val: any) -> str:
    """ Parse excel serial date or string to YYYY-MM-DD """
    if pd.isna(val) or val is None:
        return ""
    
    if isinstance(val, datetime):
        return val.strftime('%Y-%m-%d')
        
    try:
        # Check if it's an excel serial date
        serial = float(val)
        return pd.to_datetime(serial, unit='D', origin='1899-12-30').strftime('%Y-%m-%d')
    except ValueError:
        pass
        
    s = str(val).strip()
    # Try parsing DD/MM/YYYY or DD-MM-YYYY
    match = re.search(r'^(\d{2})[/\-](\d{2})[/\-](\d{4})$', s)
    if match:
        return f"{match.group(3)}-{match.group(2)}-{match.group(1)}"
        
    return s
