import { Response } from 'express';
import { readStore, appendStore } from '../utils/dataStore';
import type { AuthRequest } from '../middleware/auth';

interface Voucher {
  id: number; createdAt: string; invoiceId: number;
  voucherNo: string; partyName: string; firmId: string;
  [key: string]: any;
}

export const createVoucher = (req: AuthRequest, res: Response) => {
  try {
    const firmId = req.firmId || 'dev_firm';
    const body   = req.body;
    if (!body.invoiceId || !body.voucherNo || !body.partyName)
      return res.status(400).json({ error: 'invoiceId, voucherNo, and partyName are required.' });

    const voucher: Voucher = { id: Date.now(), createdAt: new Date().toISOString(), firmId, ...body };
    appendStore<Voucher>('vouchers', voucher, firmId);
    res.json({ success: true, voucher, updatedRow: { id: body.invoiceId, status: 'Manual-Matched' } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save voucher.' });
  }
};

export const getVouchers = (req: AuthRequest, res: Response) => {
  const firmId   = req.firmId || 'dev_firm';
  const vouchers = readStore<Voucher>('vouchers', firmId);
  res.json({ count: vouchers.length, vouchers });
};
