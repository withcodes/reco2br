import os

# Reconciliation rules
TOLERANCE_AMT = 2.0
PRIOR_PERIOD_MAX_DAYS = 45

# Sheet Detection
GSTR2B_PRIMARY_SHEET = 'B2B'
PR_PRIMARY_SHEETS = ['B2B', 'B2BUR', 'IMPG', 'IMPS', 'CDNR']
JUNK_SHEETS = ['SHEET1', 'SHEET2', 'PIVOT TABEL', 'QUERY LIST WORK', 'HOLU DATA', 
               'SUMMARY', 'PIVOT', 'WORKING', 'INDEX', 'TOC', 'COVER', 'READ ME']

# Common column name mappings 
GSTR2B_COLUMNS = {
    'gstin': ['gstin of supplier', 'gstin'],
    'supplier': ['trade/legal name', 'supplier name'],
    'invoice_no': ['invoice number', 'document number', 'note number'],
    'invoice_type': ['invoice type'],
    'invoice_date': ['invoice date', 'document date'],
    'invoice_value': ['invoice value(₹)', 'invoice value'],
    'taxable_value': ['taxable value (₹)', 'taxable value'],
    'igst': ['integrated tax(₹)', 'integrated tax', 'igst'],
    'cgst': ['central tax(₹)', 'central tax', 'cgst'],
    'sgst': ['state/ut tax(₹)', 'state tax', 'sgst'],
    'cess': ['cess(₹)', 'cess'],
    'period': ['gstr-1/iff period', 'period'],
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
    'rate': ['rate']
}
