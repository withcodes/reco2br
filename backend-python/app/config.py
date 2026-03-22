import os

# Reconciliation rules
TOLERANCE_AMT = 2.0  # ₹2 tolerance for rounded amounts

# Rule 4: Prior Period cutoff days
PRIOR_PERIOD_MAX_DAYS = 45

# Sheet configurations
JUNK_SHEETS = ['SHEET1', 'SHEET2', 'PIVOT TABEL', 'QUERY LIST WORK', 'HOLU DATA', 'SUMMARY', 'PIVOT', 'WORKING', 'INDEX', 'TOC', 'COVER', 'READ ME']
GSTR2B_PRIMARY_SHEET = 'B2B'
PR_PRIMARY_SHEETS = ['B2B', 'B2BUR', 'IMPS', 'IMPG', 'CDNR']

# Common column name mappings 
GSTR2B_COLUMNS = {
    'gstin': ['gstin of supplier', 'gstin/uin', 'gstin'],
    'supplier': ['trade/legal name', 'supplier name'], # Kept from original as it's not explicitly removed/changed in the provided snippet
    'invoice_no': ['invoice number', 'document number', 'note number', 'invoice details invoice number'],
    'invoice_type': ['invoice type', 'document type'],
    'invoice_date': ['invoice date', 'document date', 'note date'],
    'invoice_value': ['invoice value(₹)', 'invoice value', 'invoice value (₹)'],
    'taxable_value': ['taxable value (₹)', 'taxable value'],
    'igst': ['integrated tax(₹)', 'tax amount integrated tax(₹)', 'integrated tax (₹)'],
    'cgst': ['central tax(₹)', 'central tax (₹)'],
    'sgst': ['state/ut tax(₹)', 'state/ut tax (₹)'],
    'cess': ['cess(₹)', 'cess'], # Kept from original as it's not explicitly removed/changed in the provided snippet
    'period': ['gstr-1/iff/gstr-5 period', 'period'],
    'itc_availability': ['itc availability']
}

PR_COLUMNS = {
    'gstin': ['gstin of supplier', 'gstin/uin', 'gstin'],
    'supplier': ['party name', 'supplier name'],
    'invoice_no': ['invoice number', 'voucher number', 'invoice no'],
    'invoice_date': ['invoice date', 'voucher date'],
    'invoice_value': ['invoice value'],
    'taxable_value': ['taxable value', 'taxable amount'],
    'igst': ['integrated tax paid', 'igst'],
    'cgst': ['central tax paid', 'cgst'],
    'sgst': ['state/ut tax paid', 'sgst'],
    'cess': ['cess paid', 'cess'],
    'rate': ['rate'],
    'itc_availability': [
        'eligibility for itc',
        'itc eligibility',
        'eligible',
        'eligibility',
        'availed',
        'itc type',
        'eligibility for input tax credit'
    ]
}
