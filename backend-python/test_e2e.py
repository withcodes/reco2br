import sys
import os

# Add the project root to sys.path so 'app' can be found
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
from io import BytesIO
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def generate_mock_excel(data, sheet_name):
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        pd.DataFrame(data).to_excel(writer, sheet_name=sheet_name, index=False)
    output.seek(0)
    return output

def test_reconciliation_pipeline():
    print("Generating Mock PR File...")
    # Books (Raw Rows). To simulate 37 unique invoices and 46 raw rows:
    # 35 exact matches (we will just make 35 standard rows).
    pr_data = []
    
    # 1. 35 Exact matches (Simplified loop)
    for i in range(1, 36):
        pr_data.append({
            'GSTIN of Supplier': f'27AADCT4568J{i:03d}',
            'Party Name': f'Vendor {i}',
            'Voucher Number': f'INV-E-{i}',
            'Voucher Date': '01-May-2025',
            'Invoice Value': 11800.0,
            'Taxable Value': 10000.0,
            'IGST': 0.0,
            'CGST': 900.0,
            'SGST': 900.0,
            'Rate': 18
        })
        
    # 2. GSTIN Typo (1 record in Books: O, 2B: 0)
    pr_data.append({
        'GSTIN of Supplier': '05AAACL8910B1ZO',
        'Party Name': 'M/S LIFECOM PHARMACEUTICALS',
        'Voucher Number': 'LIF/001',
        'Voucher Date': '05-May-2025',
        'Invoice Value': 50027.0,
        'Taxable Value': 42395.76,
        'IGST': 7631.24,
        'CGST': 0, 'SGST': 0, 'Rate': 18
    })

    # 3. Format mismatch / Near Match (1 record: Books HSS/OO31/2526)
    pr_data.append({
        'GSTIN of Supplier': '24AAHHH1234H1Z1',
        'Party Name': 'Harsh S Shah',
        'Voucher Number': 'HSS/OO31/2526',
        'Voucher Date': '10-May-2025',
        'Invoice Value': 2360.0,
        'Taxable Value': 2000.0,
        'IGST': 0.0, 'CGST': 180.0, 'SGST': 180.0, 'Rate': 18
    })

    print(f"Total Unique Invoices created in PR: {len(pr_data)}") # Should be 37

    print("Generating Mock GSTR-2B File...")
    gstr_data = []
    # 1. 35 Exact matches
    for i in range(1, 36):
        gstr_data.append({
            'GSTIN of supplier': f'27AADCT4568J{i:03d}',
            'Trade/Legal name': f'Vendor {i}',
            'Invoice number': f'INV-E-{i}',
            'Invoice Date': '01-May-2025',
            'Invoice Value(₹)': 11800.0,
            'Taxable Value (₹)': 10000.0,
            'Integrated Tax(₹)': 0.0,
            'Central Tax(₹)': 900.0,
            'State/UT Tax(₹)': 900.0,
            'ITC Availability': 'Yes'
        })
        
    # 2. GSTIN Typo (1 record in 2B: 0)
    gstr_data.append({
        'GSTIN of supplier': '05AAACL8910B1Z0',
        'Trade/Legal name': 'M/S LIFECOM PHARMACEUTICALS',
        'Invoice number': 'LIF/001',
        'Invoice Date': '05-May-2025',
        'Invoice Value(₹)': 50027.0,
        'Taxable Value (₹)': 42395.76,
        'Integrated Tax(₹)': 7631.24,
        'Central Tax(₹)': 0, 'State/UT Tax(₹)': 0,
        'ITC Availability': 'Yes'
    })

    # 3. Format mismatch / Near Match (1 record: 2B HSS/031/2025-26)
    gstr_data.append({
        'GSTIN of supplier': '24AAHHH1234H1Z1',
        'Trade/Legal name': 'Harsh S Shah',
        'Invoice number': 'HSS/031/2025-26',
        'Invoice Date': '10-May-2025',
        'Invoice Value(₹)': 2360.0,
        'Taxable Value (₹)': 2000.0,
        'Integrated Tax(₹)': 0.0, 'Central Tax(₹)': 180.0, 'State/UT Tax(₹)': 180.0,
        'ITC Availability': 'Yes'
    })
    
    # 4. Missing in books: 19 invoices (Summing up to roughly 30625 ITC at risk)
    # ITC = 30625.28 / 19 = 1611.85 tax per invoice
    for i in range(1, 20):
        gstr_data.append({
            'GSTIN of supplier': f'29ABCDE1234A{i:03d}',
            'Trade/Legal name': f'Missing Books Vendor {i}',
            'Invoice number': f'MISS/{i}',
            'Invoice Date': '20-May-2025',
            'Invoice Value(₹)': 10565.35, # Example value
            'Taxable Value (₹)': 8953.5,
            'Integrated Tax(₹)': 1611.85, # 19 * 1611.85 = ~30625.15
            'Central Tax(₹)': 0.0, 'State/UT Tax(₹)': 0.0,
            'ITC Availability': 'Yes'
        })
        
    # 5. Prior period (March invoice in May 2B) -> included in Missing in Books logic
    # Actually wait, prior period is a sub-flag of missing in books. Let's make one of the 19 a prior period.
    gstr_data[-1]['Invoice Date'] = '15-Mar-2025'
    gstr_data[-1]['GSTIN of supplier'] = '23AANCM6521G1ZJ'
    gstr_data[-1]['Trade/Legal name'] = 'MEDIOINT LIFESCIENCE'
        
    print(f"Total Records created in 2B: {len(gstr_data)}") # Should be 35+1+1+19 = 56

    # Convert to bytes
    pr_bytes = generate_mock_excel(pr_data, 'B2B').getvalue()
    gstr_bytes = generate_mock_excel(gstr_data, 'B2B').getvalue()
    
    print("\n--- Running API Pipeline ---")

    response = client.post(
        "/api/reconcile",
        data={"period": "May 2025"},
        files={
            "prFile": ("pr.xlsx", pr_bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
            "gstr2bFile": ("gstr2b.xlsx", gstr_bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        }
    )
    
    assert response.status_code == 200
    res_data = response.json()
    summary = res_data['summary']
    
    print("\n[ RESULT SUMMARY ]")
    print(f"Books Unique: {summary['books_unique_invoices']}")
    print(f"GSTR-2B Total: {summary['gstr2b_records']}")
    print(f"Exact Matches: {summary['exact_match']}")
    print(f"GSTIN Typos: {summary['gstin_typo']}")
    print(f"Near Matches: {summary['near_match']}")
    print(f"Missing in Books: {summary['missing_in_books']}")
    print(f"Prior Period: {summary['prior_period_invoices']}")
    print(f"ITC at Risk: {summary['itc_at_risk']:.2f}")

if __name__ == "__main__":
    test_reconciliation_pipeline()
    print("\n[OK] Verification Test Script Complete.")
