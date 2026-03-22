import re
from datetime import datetime
import pandas as pd
from dateutil import parser as date_parser
from rapidfuzz import fuzz

GSTIN_PATTERN = re.compile(
    r'^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$'
)

INDIA_STATE_CODES = {
    1:'Jammu & Kashmir', 2:'Himachal Pradesh', 3:'Punjab',
    4:'Chandigarh', 5:'Uttarakhand', 6:'Haryana', 7:'Delhi',
    8:'Rajasthan', 9:'Uttar Pradesh', 10:'Bihar',
    11:'Sikkim', 12:'Arunachal Pradesh', 13:'Nagaland',
    14:'Manipur', 15:'Mizoram', 16:'Tripura', 17:'Meghalaya',
    18:'Assam', 19:'West Bengal', 20:'Jharkhand', 21:'Odisha',
    22:'Chhattisgarh', 23:'Madhya Pradesh', 24:'Gujarat',
    26:'Dadra & Nagar Haveli', 27:'Maharashtra',
    28:'Andhra Pradesh', 29:'Karnataka', 30:'Goa',
    31:'Lakshadweep', 32:'Kerala', 33:'Tamil Nadu',
    34:'Puducherry', 35:'Andaman & Nicobar',
    36:'Telangana', 37:'Andhra Pradesh (New)'
}

def validate_gstin(gstin: str) -> dict:
    """
    Validate GSTIN format locally.
    Zero API calls. Zero cost.
    Detects the real O vs 0 confusion found in production data.

    Real case: 05AAACL8910B1ZO (books) vs 05AAACL8910B1Z0 (portal)
    Position 14: letter O vs zero — same company, different GSTIN.

    Returns: {valid, state_code, state_name, pan, warnings[]}
    """
    warnings = []

    if not gstin:
        return {'valid': False, 'warnings': ['GSTIN is empty']}

    gstin = gstin.strip().upper()

    if len(gstin) != 15:
        return {
            'valid': False,
            'warnings': [f'GSTIN must be 15 characters, got {len(gstin)}']
        }

    # Scan for O vs 0 confusion at every position
    for i, char in enumerate(gstin):
        # Positions 0-1 are state code — must be digits
        if i < 2 and char == 'O':
            warnings.append(
                f"Position {i+1}: letter 'O' found in state code "
                f"— should this be zero '0'?"
            )
        # Position 14 is checksum — both O and 0 look alike
        if i == 13 and char == 'O':
            warnings.append(
                f"Position 14: letter 'O' — verify it is not zero '0'"
            )

    if not GSTIN_PATTERN.match(gstin):
        return {
            'valid': False,
            'warnings': warnings + ['GSTIN format does not match pattern']
        }

    state_code = int(gstin[:2])
    return {
        'valid':       True,
        'state_code':  state_code,
        'state_name':  INDIA_STATE_CODES.get(state_code, 'Unknown'),
        'pan':         gstin[2:12],
        'warnings':    warnings
    }

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
