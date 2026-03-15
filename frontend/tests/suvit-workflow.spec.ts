import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Suvit Workflow Automation', () => {
  test('Upload GSTR-2B data, verify Not In Portal status, and Add Voucher', async ({ page }) => {
    // 1. Intercept the reconcile endpoint to return our mock mismatch data
    await page.route('**/api/reconcile', async route => {
      const mockResponse = {
        success: true,
        summary: { totalReconciled: 0, itcAtRisk: 1000, pendingInvoices: 1, totalTaxSaved: 0 },
        data: [
          {
            id: 1,
            vendor: 'Amazon Web Services',
            gstin: '27AAAAA0000A1Z5',
            invoiceNo: 'AWS-2026-001',
            date: '2026-03-01',
            prAmount: 0,
            gstrAmount: 1000,
            status: 'Missing in PR' // Backend raw string, normalise() maps to 'Not In Tally'
          }
        ]
      };
      await route.fulfill({ json: mockResponse });
    });

    // Intercept the /api/vouchers endpoint
    await page.route('**/api/vouchers', async route => {
      await route.fulfill({
        json: {
          success: true,
          voucher: { id: Date.now(), voucherNo: 'VOU-123' },
          updatedRow: { id: 1, status: 'Manual-Matched' }
        }
      });
    });

    // 2. Load the App
    await page.goto('http://localhost:5174/');

    // Wait for the app to render
    await expect(page.locator('text=Welcome back')).toBeVisible();

    // 3. Navigate to GSTR-2B Reco tab
    await page.click('text=GSTR-2B Reco');

    // 4. Upload dummy files to bypass UI checks
    const file1Path = './tests/fixtures/dummy1.xlsx';
    const file2Path = './tests/fixtures/dummy2.xlsx';
    
    // There are two hidden file inputs in FileZone
    const fileInputs = page.locator('input[type="file"]');
    await fileInputs.nth(0).setInputFiles(file1Path);
    await fileInputs.nth(1).setInputFiles(file2Path);

    // Click the Run button
    await page.click('button:has-text("Run GSTR-2B Reconciliation")');

    // 5. Verify the results table loaded and rendered the Not In Tally pill
    await expect(page.locator('.pill-not-tally')).toContainText('Not In Tally');

    // 6. Click + Add Voucher button on the Missing in PR row
    await page.click('button:has-text("Add Voucher")');

    // 7. Verify modal opens
    await expect(page.locator('h2:has-text("Add Missing Voucher")')).toBeVisible();
    
    // Fill the strictly required empty fields to unblock form validation
    await page.fill('input[placeholder="e.g. Raw Material – Steel"]', 'Cloud Services');
    await page.fill('input[placeholder="e.g. 7208"]', '9984');
    
    // Click Save & Close button
    await page.click('button:has-text("Save & Close")');

    // 8. Wait for popup to close and verify row changed to Manual-Matched
    await expect(page.locator('h2:has-text("Add Missing Voucher")')).toBeHidden();
    
    // Check if the pill updated to Manual-Matched
    await expect(page.locator('.pill-manual')).toContainText('Manual-Matched');
  });
});
