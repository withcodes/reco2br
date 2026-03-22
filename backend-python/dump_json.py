import sys, json, asyncio
from app.services.file_handler import extract_sheet_data
from app.services.cleaner import clean_pr_data, clean_gstr2b_data
from app.services.matcher import match_invoices
from app.services.analyzer import analyze_results

class MockUploadFile:
    def __init__(self, filename, content):
        self.filename = filename; self.content = content
    async def read(self): return self.content

async def main():
    with open('TEST/LUCICHEM BOOK MAY 2025.XLS', 'rb') as f: pr_mock = MockUploadFile('pr', f.read())
    with open('TEST/052025_24AAFCL3021L1ZQ_GSTR2B_16072025.xlsx', 'rb') as f: b2b_mock = MockUploadFile('b2b', f.read())
    pr_raw = await extract_sheet_data(pr_mock, is_gstr2b=False)
    b2b_raw = await extract_sheet_data(b2b_mock, is_gstr2b=True)
    pr_clean = clean_pr_data(pr_raw)
    b2b_clean = clean_gstr2b_data(b2b_raw)
    results = match_invoices(pr_clean, b2b_clean)
    res = analyze_results('05-2025', results, len(pr_raw), len(pr_clean), len(b2b_clean), [])
    
    # Dump just the first matched item
    first_match = res.matched[0] if res.matched else None
    if first_match:
        # Pydantic items inside 'first_match' dictionary
        out_dict = {}
        for k, v in first_match.items():
            out_dict[k] = v.model_dump() if hasattr(v, 'model_dump') else v
        print(json.dumps(out_dict, indent=2))
    else:
        print("No exact matches found in test dataset.")

asyncio.run(main())
