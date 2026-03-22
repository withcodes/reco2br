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

import pytest

REAL_PR_PATH = os.path.join(
    os.path.dirname(__file__), 'tests', 'data',
    'LUCICHEM_BOOK_MAY_2025.XLS'
)
REAL_GSTR_PATH = os.path.join(
    os.path.dirname(__file__), 'tests', 'data',
    '052025_24AAFCL3021L1ZQ_GSTR2B_16072025.xlsx'
)

@pytest.mark.skipif(
    not os.path.exists(REAL_PR_PATH),
    reason="Real test files not in tests/data/ — skipping real-data test"
)
def test_real_lucichem_may_2025():
    """
    ACCEPTANCE TEST — the only proof the engine is correct.

    These exact numbers were derived by manually reading every cell
    of the real Lucichem May 2025 accountant files.
    If any assertion fails, a real accounting bug exists.
    Do not change these numbers — fix the engine instead.
    """
    with open(REAL_PR_PATH, 'rb') as f:
        pr_bytes = f.read()
    with open(REAL_GSTR_PATH, 'rb') as f:
        gstr_bytes = f.read()

    response = client.post(
        '/api/reconcile',
        data={'period': 'May 2025'},
        files={
            'prFile': (
                'LUCICHEM_BOOK_MAY_2025.XLS',
                pr_bytes,
                'application/vnd.ms-excel'
            ),
            'gstr2bFile': (
                '052025_24AAFCL3021L1ZQ_GSTR2B_16072025.xlsx',
                gstr_bytes,
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
        }
    )

    assert response.status_code == 200, \
        f"Engine returned {response.status_code}: {response.text[:500]}"

    data = response.json()
    s    = data['summary']

    # ── Input data counts ─────────────────────────────────────────
    assert s['books_raw_rows']        == 46, \
        f"books_raw_rows: expected 46, got {s['books_raw_rows']}"
    assert s['books_unique_invoices'] == 37, \
        f"books_unique: expected 37 (after split-row aggregation), got {s['books_unique_invoices']}"
    assert s['gstr2b_records']        == 55, \
        f"gstr2b_records: expected 55, got {s['gstr2b_records']}"

    # ── Matching results ──────────────────────────────────────────
    total_matched = s['exact_match'] + s['matched_normalized']
    assert total_matched              == 35, \
        f"total matched: expected 35, got {total_matched}"
    assert s['gstin_typo']            == 1, \
        f"gstin_typo: expected 1 (Lifecom Pharma O vs 0), got {s['gstin_typo']}"
    assert s['near_match']            == 1, \
        f"near_match: expected 1 (HSS/OO31/2526 vs HSS/031/2025-26), got {s['near_match']}"
    assert s['missing_in_books']      == 19, \
        f"missing_in_books: expected 19, got {s['missing_in_books']}"
    assert s['missing_in_2b']         == 0, \
        f"missing_in_2b: expected 0, got {s['missing_in_2b']}"
    assert s['prior_period_invoices'] == 1, \
        f"prior_period: expected 1 (Medioint March invoice in May 2B), got {s['prior_period_invoices']}"
    assert s['value_mismatch']        == 0, \
        f"value_mismatch: expected 0, got {s['value_mismatch']}"
    assert s['tax_mismatch']          == 0, \
        f"tax_mismatch: expected 0, got {s['tax_mismatch']}"

    # ── ITC numbers ───────────────────────────────────────────────
    assert abs(s['itc_at_risk'] - 30625.28) < 1.0, \
        f"itc_at_risk: expected ₹30625.28, got ₹{s['itc_at_risk']:.2f}"

    # ── Specific case: GSTIN typo detail ─────────────────────────
    typo_cases = data['gstin_typo_cases']
    assert len(typo_cases) == 1, "Expected exactly 1 GSTIN typo case"
    typo_pr   = typo_cases[0]['pr_rec']
    typo_gstr = typo_cases[0]['gstr_rec']

    pr_gstin   = typo_pr['gstin']   if isinstance(typo_pr,   dict) else typo_pr.gstin
    gstr_gstin = typo_gstr['gstin'] if isinstance(typo_gstr, dict) else typo_gstr.gstin

    assert 'AAACL8910B1Z' in pr_gstin, \
        f"Wrong GSTIN typo case — PR GSTIN: {pr_gstin}"
    assert pr_gstin != gstr_gstin, \
        "GSTIN typo case: both GSTINs are identical — typo not detected"

    # ── Specific case: prior period detail ───────────────────────
    prior = data['prior_period']
    assert len(prior) == 1, "Expected exactly 1 prior period invoice"
    prior_rec = prior[0]['gstr_rec']
    prior_gstin = prior_rec['gstin'] if isinstance(prior_rec, dict) else prior_rec.gstin
    assert '23AANCM6521G1ZJ' in prior_gstin, \
        f"Expected Medioint GSTIN in prior period, got {prior_gstin}"

    print("\n[PASS] All 12 real-data assertions passed.")

if __name__ == "__main__":
    test_reconciliation_pipeline()
    print("\n[OK] Verification Test Script Complete.")
