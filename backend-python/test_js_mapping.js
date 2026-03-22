const testItem = {
  "pr_rec": {
    "id": 1,
    "gstin": "01AAUCA9727B1ZQ",
    "vendor_name": "",
    "invoice_no": "ABPL2500298",
    "invoice_no_raw": "ABPL25/00298",
    "invoice_date": "2025-05-31",
    "invoice_value": 78624,
    "taxable_value": 70200,
    "igst": 8424,
    "cgst": 0,
    "sgst": 0,
    "rate": 12,
    "prAmount": 8424,
    "gstrAmount": 8424
  },
  "gstr_rec": {
    "id": 1000016,
    "gstin": "01AAUCA9727B1ZQ",
    "vendor_name": "ASSOCIATED BIOPHARMA PRIVATE LIMITED",
    "invoice_no": "ABPL2500298",
    "invoice_no_raw": "ABPL25/00298",
    "invoice_date": "2025-05-31",
    "invoice_value": 78624,
    "taxable_value": 70200,
    "igst": 8424,
    "cgst": 0,
    "sgst": 0
  }
};

const getTax = (rec) => (rec.igst || 0) + (rec.cgst || 0) + (rec.sgst || 0);

const item = testItem;
const pr = item.pr_rec || item.gstr_rec || item;
const gstr = item.gstr_rec || item.pr_rec || item;

const prAmount = getTax(pr) || pr.taxable_value || 0;
const gstrAmount = getTax(gstr) || gstr.taxable_value || 0;

console.log("Simulated Frontend mapping for item Row 1:");
console.log(`getTax(pr):   ${getTax(pr)}  -> prAmount: ${prAmount}`);
console.log(`getTax(gstr): ${getTax(gstr)} -> gstrAmount: ${gstrAmount}`);
console.log("\nIf it were USING THE OLD CODE (BEFORE FIX):");
console.log(`prAmount Old: ${pr.prAmount || pr.taxable_value}`);
console.log(`gstrAmount Old: ${gstr.gstrAmount || gstr.taxable_value}`);
