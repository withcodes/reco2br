from typing import List, Dict, Any
from collections import defaultdict
from app.models import InvoiceRecord
from app.config import TOLERANCE_AMT
from app.utils.normalizer import compute_similarity

def calculate_tax(r: InvoiceRecord) -> float:
    return r.igst + r.cgst + r.sgst

def is_amount_match(amt1: float, amt2: float) -> bool:
    return abs(amt1 - amt2) <= TOLERANCE_AMT

def match_invoices(pr_records: List[InvoiceRecord], gstr_records: List[InvoiceRecord]) -> Dict[str, List[Any]]:
    unmatched_pr = list(pr_records)
    unmatched_gstr = list(gstr_records)
    
    results = {
        'exact_match': [],
        'matched_normalized': [],
        'gstin_typo_cases': [],
        'near_match_cases': [],
        'value_mismatch': [],
        'tax_mismatch': [],
        'missing_in_books': [],
        'missing_in_2b': []
    }

    # Helper maps
    gstr_by_exact_key = defaultdict(list)
    gstr_by_invoice = defaultdict(list)
    gstr_by_gstin = defaultdict(list)

    for r in unmatched_gstr:
        gstr_by_exact_key[f"{r.gstin}||{r.invoice_no}"].append(r)
        gstr_by_invoice[r.invoice_no].append(r)
        gstr_by_gstin[r.gstin].append(r)

    # --- LEVEL 1 & 2: EXACT MATCH & NORMALIZED MATCH ---
    still_unmatched_pr_l12 = []
    
    for pr in unmatched_pr:
        key = f"{pr.gstin}||{pr.invoice_no}"
        candidates = gstr_by_exact_key.get(key, [])
        
        matched_gstr = None
        for gstr in candidates:
            if gstr in unmatched_gstr and is_amount_match(calculate_tax(pr), calculate_tax(gstr)) and is_amount_match(pr.invoice_value, gstr.invoice_value):
                matched_gstr = gstr
                break
                
        if matched_gstr:
            _pr_raw = str(pr.invoice_no_raw).upper().strip()
            _gstr_raw = str(matched_gstr.invoice_no_raw).upper().strip()
            
            if _pr_raw == _gstr_raw:
                pr.status = "Exact Match"
                bucket = 'exact_match'
            else:
                pr.status = "Matched Normalized"
                bucket = 'matched_normalized'
                
            pr.gstrAmount = calculate_tax(matched_gstr)
            pr.prAmount = calculate_tax(pr)
            results[bucket].append({'pr_rec': pr, 'gstr_rec': matched_gstr})
            unmatched_gstr.remove(matched_gstr)
        else:
            still_unmatched_pr_l12.append(pr)

    # --- VALUE OR TAX MISMATCH (Sub-level of Level 1/2) ---
    still_unmatched_pr_mismatch = []
    for pr in still_unmatched_pr_l12:
        key = f"{pr.gstin}||{pr.invoice_no}"
        candidates = gstr_by_exact_key.get(key, [])
        
        matched_gstr = None
        mismatch_type = None
        for gstr in candidates:
            if gstr in unmatched_gstr:
                pr_tax = calculate_tax(pr)
                gstr_tax = calculate_tax(gstr)
                if not is_amount_match(pr_tax, gstr_tax):
                    mismatch_type = 'tax_mismatch'
                elif not is_amount_match(pr.invoice_value, gstr.invoice_value):
                    mismatch_type = 'value_mismatch'
                
                if mismatch_type:
                    matched_gstr = gstr
                    break

        if matched_gstr:
            pr.status = "Tax Mismatch" if mismatch_type == 'tax_mismatch' else "Value Mismatch"
            pr.gstrAmount = calculate_tax(matched_gstr)
            pr.prAmount = calculate_tax(pr)
            pr.warnings.append(pr.status)
            results[mismatch_type].append({'pr_rec': pr, 'gstr_rec': matched_gstr})
            unmatched_gstr.remove(matched_gstr)
        else:
            still_unmatched_pr_mismatch.append(pr)

    # --- LEVEL 3: GSTIN TYPO ---
    still_unmatched_pr_l3 = []
    
    for pr in still_unmatched_pr_mismatch:
        candidates = gstr_by_invoice.get(pr.invoice_no, [])
        matched_gstr = None
        
        for gstr in candidates:
            if gstr in unmatched_gstr and is_amount_match(calculate_tax(pr), calculate_tax(gstr)):
                # RapidFuzz similarity %
                sim = compute_similarity(pr.gstin, gstr.gstin)
                if sim >= 85.0: # Approx 1-2 chars diff out of 15
                    matched_gstr = gstr
                    break
                    
        if matched_gstr:
            pr.status = "Possible GSTIN Typo"
            pr.gstrAmount = calculate_tax(matched_gstr)
            pr.prAmount = calculate_tax(pr)
            pr.warnings.append(f"PR GSTIN: {pr.gstin} vs GSTR GSTIN: {matched_gstr.gstin}")
            results['gstin_typo_cases'].append({'pr_rec': pr, 'gstr_rec': matched_gstr})
            unmatched_gstr.remove(matched_gstr)
        else:
            still_unmatched_pr_l3.append(pr)

    # --- LEVEL 4: NEAR MISS (INVOICE) ---
    still_unmatched_pr_l4 = []
    
    for pr in still_unmatched_pr_l3:
        candidates = gstr_by_gstin.get(pr.gstin, [])
        matched_gstr = None
        
        for gstr in candidates:
            if gstr in unmatched_gstr and is_amount_match(calculate_tax(pr), calculate_tax(gstr)):
                sim = compute_similarity(pr.invoice_no_raw, gstr.invoice_no_raw)
                if 70.0 <= sim <= 95.0:
                    matched_gstr = gstr
                    break
                    
        if matched_gstr:
            pr.status = "Near Match"
            pr.gstrAmount = calculate_tax(matched_gstr)
            pr.prAmount = calculate_tax(pr)
            pr.warnings.append(f"PR Inv: {pr.invoice_no_raw} vs GSTR Inv: {matched_gstr.invoice_no_raw}")
            results['near_match_cases'].append({'pr_rec': pr, 'gstr_rec': matched_gstr})
            unmatched_gstr.remove(matched_gstr)
        else:
            still_unmatched_pr_l4.append(pr)

    # --- LEVEL 5: UNMATCHED ---
    for pr in still_unmatched_pr_l4:
        pr.status = "Missing in 2B"
        pr.prAmount = calculate_tax(pr)
        results['missing_in_2b'].append({'pr_rec': pr})
        
    for gstr in unmatched_gstr:
        gstr.status = "Missing in PR"
        gstr.gstrAmount = calculate_tax(gstr)
        results['missing_in_books'].append({'gstr_rec': gstr})

    return results
