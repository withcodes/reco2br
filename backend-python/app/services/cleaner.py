import pandas as pd
from typing import List, Dict
from app.models import InvoiceRecord
from app.utils.normalizer import normalize_gstin, normalize_invoice, parse_amount, normalize_date
from app.config import GSTR2B_COLUMNS, PR_COLUMNS

def map_columns(df: pd.DataFrame, mapping_dict: dict, required_fields=['gstin', 'invoice_no']) -> pd.DataFrame:
    """ Maps dynamic excel columns to standard schema fields """
    # Lowercase all actual columns for loose matching
    actual_cols = {str(col).lower().strip(): col for col in df.columns}
    
    renames = {}
    for std_field, possible_names in mapping_dict.items():
        found_col = next((actual_cols[name] for name in possible_names if name in actual_cols), None)
        if found_col:
            renames[found_col] = std_field
            
    # Validate critical columns to prevent silent empty data loads
    missing_critical = [f for f in required_fields if f not in renames.values()]
    if missing_critical:
        actual_heads = [str(c) for c in df.columns]
        raise ValueError(
            f"Unable to match column headers for: {', '.join(missing_critical)}. "
            f"Expected synonyms like { {f: mapping_dict[f] for f in missing_critical} }. "
            f"Found columns in file: {actual_heads}"
        )

    # Keep only mapped columns + raw index
    df_mapped = df[list(renames.keys())].rename(columns=renames)
    df_mapped['_raw_index'] = df.index + 2 # Add 2 for actual excel row approximate (1-based + headers)
    return df_mapped

def clean_pr_data(df: pd.DataFrame) -> List[InvoiceRecord]:
    """ Clean Purchase Register and apply RULE 1: Multi-rate split invoice aggregation """
    df_std = map_columns(df, PR_COLUMNS)
    
    records = []
    
    # 1. First Pass - Convert types & initial normalization
    for i, row in df_std.iterrows():
        gstin = normalize_gstin(row.get('gstin'))
        inv = str(row.get('invoice_no', ''))
        inv_norm = normalize_invoice(inv)
        
        if not gstin and not inv_norm:
             continue # Skip empty rows
             
        val = parse_amount(row.get('invoice_value'))
        taxable = parse_amount(row.get('taxable_value'))
        igst = parse_amount(row.get('igst'))
        cgst = parse_amount(row.get('cgst'))
        sgst = parse_amount(row.get('sgst'))
        
        rec = {
            'gstin': gstin,
            'vendor_name': str(row.get('supplier', '')),
            'invoice_no': inv_norm,
            'invoice_no_raw': inv,
            'invoice_date': normalize_date(row.get('invoice_date')),
            'invoice_value': val,
            'taxable_value': taxable,
            'igst': igst,
            'cgst': cgst,
            'sgst': sgst,
            'rate': parse_amount(row.get('rate')),
            'source': 'books',
            'raw_row_numbers': [row.get('_raw_index')],
            'itc_availability': row.get('eligibility for itc', ''),
            '_group_key': f"{gstin}||{inv_norm}"
        }
        records.append(rec)
        
    if not records:
        return []

    # 2. RULE 1: Group by GSTIN + Normalized Invoice
    df_processed = pd.DataFrame(records)
    grouped = df_processed.groupby('_group_key')
    
    final_records = []
    rec_id = 1
    
    for key, group in grouped:
        r = group.iloc[0].to_dict() # Take first row as base
        del r['_group_key']
        
        # Override aggregations
        r['id'] = rec_id
        r['invoice_value'] = group['invoice_value'].iloc[0] # Take FIRST
        r['taxable_value'] = group['taxable_value'].sum()   # SUM
        r['igst'] = group['igst'].sum()                     # SUM
        r['cgst'] = group['cgst'].sum()                     # SUM
        r['sgst'] = group['sgst'].sum()                     # SUM
        r['raw_row_numbers'] = group['raw_row_numbers'].sum()
        r['split_rows_count'] = len(group)
        
        final_records.append(InvoiceRecord(**r))
        rec_id += 1
        
    return final_records

def clean_gstr2b_data(df: pd.DataFrame) -> List[InvoiceRecord]:
    """ Clean GSTR-2B Data - usually one row per invoice already """
    df_std = map_columns(df, GSTR2B_COLUMNS)
    records = []
    rec_id = 1000000 # GSTR IDs start higher to avoid collision
    
    for i, row in df_std.iterrows():
        gstin = normalize_gstin(row.get('gstin'))
        inv = str(row.get('invoice_no', ''))
        inv_norm = normalize_invoice(inv)
        
        if not gstin and not inv_norm:
             # print(f"DEBUG: Skipping row - gstin='{gstin}', inv_norm='{inv_norm}', raw={row.to_dict()}")
             continue 
             
        # GSTR-2B specific adjustments: Negative amounts for Credit Notes
        inv_type = str(row.get('invoice_type', '')).upper()
        multiplier = -1 if 'CDNR' in inv_type or 'REVERSAL' in inv_type else 1
        
        val = parse_amount(row.get('invoice_value')) * multiplier
        taxable = parse_amount(row.get('taxable_value')) * multiplier
        igst = parse_amount(row.get('igst')) * multiplier
        cgst = parse_amount(row.get('cgst')) * multiplier
        sgst = parse_amount(row.get('sgst')) * multiplier
        
        r = {
            'id': rec_id,
            'gstin': gstin,
            'vendor_name': str(row.get('supplier', '')),
            'invoice_no': inv_norm,
            'invoice_no_raw': inv,
            'invoice_date': normalize_date(row.get('invoice_date')),
            'invoice_value': val,
            'taxable_value': taxable,
            'igst': igst,
            'cgst': cgst,
            'sgst': sgst,
            'itc_availability': str(row.get('itc_availability', '')),
            'filing_period': str(row.get('period', '')),
            'source': '2b',
            'raw_row_numbers': [row.get('_raw_index')],
            'split_rows_count': 1
        }
        records.append(InvoiceRecord(**r))
        rec_id += 1
        
    return records
