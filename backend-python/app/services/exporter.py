import pandas as pd
from io import BytesIO
from app.models import ReconciliationResponse

def generate_excel_report(res: ReconciliationResponse) -> bytes:
    output = BytesIO()
    
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        
        # 1. Summary Sheet
        summary_data = {
            'Metric': [
                'Period',
                'Total PR Invoices (Raw)',
                'Total PR Unique (Grouped)',
                'Total GSTR-2B Records',
                'Exact Matches',
                'Matched (Normalized)',
                'GSTIN Typo Cases',
                'Near Matches',
                'Value Mismatch',
                'Tax Mismatch',
                'Missing in PR (Books)',
                'Missing in GSTR-2B',
                'Prior Period Documents',
                'ITC at Risk (₹)',
                'Total Tax Saved (₹)'
            ],
            'Value': [
                res.period,
                res.summary.books_raw_rows,
                res.summary.books_unique_invoices,
                res.summary.gstr2b_records,
                res.summary.exact_match,
                res.summary.matched_normalized,
                res.summary.gstin_typo,
                res.summary.near_match,
                res.summary.value_mismatch,
                res.summary.tax_mismatch,
                res.summary.missing_in_books,
                res.summary.missing_in_2b,
                res.summary.prior_period_invoices,
                res.summary.itc_at_risk,
                res.summary.total_tax_saved
            ]
        }
        pd.DataFrame(summary_data).to_excel(writer, sheet_name='Summary', index=False)
        
        # Helper to dump list of dictionaries to sheet
        def write_sheet(data_list, sheet_name):
            if not data_list:
                pd.DataFrame([{'Info': 'No records found'}]).to_excel(writer, sheet_name=sheet_name, index=False)
                return
                
            flat_data = []
            for item in data_list:
                row = {}
                # Flatten nested models (pr_rec / gstr_rec)
                if isinstance(item, dict):
                    if 'pr_rec' in item:
                        for k,v in item['pr_rec'].model_dump().items():
                            row[f"PR_{k}"] = v
                    if 'gstr_rec' in item:
                        for k,v in item['gstr_rec'].model_dump().items():
                            row[f"2B_{k}"] = v
                else: 
                     # If flat model
                     row = item.model_dump()
                flat_data.append(row)
                
            pd.DataFrame(flat_data).to_excel(writer, sheet_name=sheet_name, index=False)

        # Write all classification sheets
        write_sheet(res.matched, 'Exact Match')
        write_sheet(res.gstin_typo_cases, 'GSTIN Typo')
        write_sheet(res.near_match_cases, 'Near Match')
        write_sheet(res.mismatched, 'Mismatched Value-Tax')
        write_sheet(res.missing_in_books, 'Missing in Books')
        write_sheet(res.missing_in_2b, 'Missing in 2B')
        write_sheet(res.prior_period, 'Prior Period')

    output.seek(0)
    return output.getvalue()
