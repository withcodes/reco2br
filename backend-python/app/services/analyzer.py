from typing import List, Dict, Any
from datetime import datetime, timedelta
from dateutil import parser as date_parser
from app.models import ReconciliationResponse, ReconciliationSummary
from app.config import PRIOR_PERIOD_MAX_DAYS

def analyze_results(period: str, results: Dict[str, List[Any]], raw_pr_count: int, unique_pr_count: int, gstr_count: int, processing_log: List[str]) -> ReconciliationResponse:
    
    # Check for Prior Period
    missing_in_books = []
    prior_period = []
    
    # Try to parse period to get a baseline date (default to 1st of the month)
    try:
        # If period is "May 2025", this will parse to datetime(2025, 5, 1)
        period_dt = date_parser.parse(period, default=datetime(datetime.now().year, datetime.now().month, 1))
        # Ensure it's the first of the month
        period_dt = period_dt.replace(day=1)
    except:
        # Fallback to current date
        period_dt = datetime.now().replace(day=1)
        
    cutoff_date = period_dt - timedelta(days=PRIOR_PERIOD_MAX_DAYS) # e.g. 45 days
    
    for item in results['missing_in_books']:
        rec = item['gstr_rec']
        is_prior = False
        
        if rec.invoice_date:
            try:
                inv_dt = datetime.strptime(rec.invoice_date, '%Y-%m-%d')
                if inv_dt < cutoff_date:
                     is_prior = True
            except:
                pass
                
        if is_prior:
            rec.category = 'Prior Period'
            prior_period.append(item)
        else:
            rec.category = 'Missing in Books'
            missing_in_books.append(item)

    results['missing_in_books'] = missing_in_books

    def get_tax(rec):
        return (rec.igst or 0.0) + (rec.cgst or 0.0) + (rec.sgst or 0.0)

    itc_at_risk = sum(get_tax(item['gstr_rec']) for item in results['missing_in_books'])
    
    # Total tax matched includes exact, normalized, gstin typo, near match
    matched_buckets = results['exact_match'] + results['matched_normalized'] + results['gstin_typo_cases'] + results['near_match_cases']
    total_tax_matched = sum(get_tax(item['gstr_rec']) for item in matched_buckets)
    
    total_tax_saved = total_tax_matched # Symmetrical for mapping fallback
    
    # Total 2B is the sum of ALL invoices ever placed into a bucket with a gstr_rec
    all_gstr_items = matched_buckets + results['value_mismatch'] + results['tax_mismatch'] + results['missing_in_books'] + prior_period
    total_2b_itc = sum(get_tax(item['gstr_rec']) for item in all_gstr_items)

    itc_leakage = sum(get_tax(item['pr_rec']) for item in results['missing_in_2b'])

    summary = ReconciliationSummary(
        books_raw_rows=raw_pr_count,
        books_unique_invoices=unique_pr_count,
        gstr2b_records=gstr_count,
        exact_match=len(results['exact_match']),
        matched_normalized=len(results['matched_normalized']),
        gstin_typo=len(results['gstin_typo_cases']),
        near_match=len(results['near_match_cases']),
        value_mismatch=len(results['value_mismatch']),
        tax_mismatch=len(results['tax_mismatch']),
        missing_in_books=len(results['missing_in_books']),
        missing_in_2b=len(results['missing_in_2b']),
        prior_period_invoices=len(prior_period),
        itc_at_risk=itc_at_risk,
        total_tax_saved=total_tax_saved,
        total_tax_matched=total_tax_matched,
        total_2b_itc=total_2b_itc,
        itc_leakage=itc_leakage
    )
    
    res = ReconciliationResponse(
        status="success",
        period=period,
        processing_log=processing_log,
        summary=summary,
        matched=results['exact_match'],
        matched_normalized=results['matched_normalized'],
        gstin_typo_cases=results['gstin_typo_cases'],
        near_match_cases=results['near_match_cases'],
        mismatched=results['value_mismatch'] + results['tax_mismatch'],
        missing_in_books=results['missing_in_books'],
        missing_in_2b=results['missing_in_2b'],
        prior_period=prior_period
    )
    
    return res
