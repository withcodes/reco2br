import * as xlsx from 'xlsx';
import FormData from 'form-data';
import fetch from 'node-fetch';
import * as fs from 'fs';

async function generateAndTest() {
    // 1. Generate Dummy Tally PR Data (Messy ERP Data)
    const prData = [
        { 'GSTIN/UIN': '27AADCT4568J1ZD', 'Party Name': 'TechNova Solutions', 'Voucher Number': 'INV-041', 'Voucher Date': '15-Oct-2023', 'Tax Amount': '45,000.50' }, 
        { 'GSTIN/UIN': '07BBPFG2391Q1Z4', 'Party Name': 'Global Logistics', 'Voucher Number': '9921', 'Voucher Date': '18-Oct-2023', 'Tax Amount': 12501 }, // Missing Prefix + 1 rupee rounding
        { 'GSTIN/UIN': '29CDEFA4512R2Z5', 'Party Name': 'Apex Office', 'Voucher Number': 'AOS-1004', 'Voucher Date': '22-Oct-2023', 'Tax Amount': 8500 }, // Will be missing in 2B
        { 'GSTIN/UIN': '33AABBC1234D1Z2', 'Party Name': 'CloudHost', 'Voucher Number': '00010', 'Voucher Date': '28-Oct-2023', 'Tax Amount': 10500 } // Leading zeros
    ];

    // 2. Generate Dummy GSTR-2B Data (Clean Portal Data)
    const gstrData = [
        { 'GSTIN of supplier': '27AADCT4568J1ZD', 'Trade/Legal name': 'TechNova Pvt Ltd', 'Invoice number': 'INV041', 'Invoice date': '15-Oct-2023', 'Tax Amount': 45000.50 }, 
        { 'GSTIN of supplier': '07BBPFG2391Q1Z4', 'Trade/Legal name': 'Global Logistics Co', 'Invoice number': 'GL/9921/23-24', 'Invoice date': '18-Oct-2023', 'Tax Amount': 12500 }, // Full prefix + FY extension 
        { 'GSTIN of supplier': '24XYXYZ9876A1Z3', 'Trade/Legal name': 'Sunrise Ent', 'Invoice number': 'SE-908', 'Invoice date': '05-Oct-2023', 'Tax Amount': 15400 }, // Missing in PR
        { 'GSTIN of supplier': '33AABBC1234D1Z2', 'Trade/Legal name': 'CloudHost Web', 'Invoice number': 'CW-10', 'Invoice date': '28-Oct-2023', 'Tax Amount': 10500 } // Fuzzy Catch 
    ];

    const prSheet = xlsx.utils.json_to_sheet(prData);
    const prWb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(prWb, prSheet, "Purchase Register");
    xlsx.writeFile(prWb, "PR_Test.xlsx");

    const gstrSheet = xlsx.utils.json_to_sheet(gstrData);
    const gstrWb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(gstrWb, gstrSheet, "GSTR-2B");
    xlsx.writeFile(gstrWb, "GSTR2B_Test.xlsx");

    console.log("Excel files generated. Uploading to backend...");

    const formData = new FormData();
    formData.append('prFile', fs.createReadStream('PR_Test.xlsx'));
    formData.append('gstr2bFile', fs.createReadStream('GSTR2B_Test.xlsx'));

    try {
        const res = await fetch('http://localhost:3001/api/reconcile', {
            method: 'POST',
            body: formData,
        });
        
        const json = await res.json();
        console.log("STATUS:", res.status);
        console.log(JSON.stringify(json, null, 2));

    } catch (e) {
        console.error("Test failed:", e);
    }
}

generateAndTest();
