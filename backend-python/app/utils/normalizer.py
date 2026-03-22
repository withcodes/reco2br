import re
from datetime import datetime
import pandas as pd
from dateutil import parser as date_parser
from rapidfuzz import fuzz

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
    - Remove colons, slashes, hyphens, extra spaces
    - Remove leading zeros
    """
    if pd.isna(s) or s is None:
        return ""
        
    cleaned = str(s).upper().strip()
    # Handle pure float strings exported from excel (e.g. "12345.0" -> "12345")
    if cleaned.endswith(".0"):
        cleaned = cleaned[:-2]
        
    cleaned = re.sub(r'[:/\- ]', '', cleaned)
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
    if pd.isna(val) or val is None or str(val).strip() == "":
        return ""
    
    if isinstance(val, datetime):
        return val.strftime('%Y-%m-%d')
        
    try:
        # Check if it's an excel serial date (float/int)
        serial = float(val)
        # Note: pandas unit='D' origin='1899-12-30' is standard for Excel
        return pd.to_datetime(serial, unit='D', origin='1899-12-30').strftime('%Y-%m-%d')
    except (ValueError, TypeError):
        pass
        
    s = str(val).strip()
    
    try:
        # Use python-dateutil for robust parsing
        # dayfirst=True because Indian dates are typically DD/MM/YYYY
        dt = date_parser.parse(s, dayfirst=True)
        return dt.strftime('%Y-%m-%d')
    except (ValueError, TypeError, OverflowError):
        return s

def compute_similarity(s1: str, s2: str) -> float:
    """ Computes similarity percentage between two strings using RapidFuzz """
    if not s1 or not s2:
        return 0.0
    return fuzz.ratio(s1.upper(), s2.upper())
