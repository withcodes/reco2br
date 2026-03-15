import { Router } from 'express';
import multer from 'multer';
import { reconcileGstr2b, reconcileGstr1 } from '../controllers/reconciliationController';
import { exportReconciliation } from '../controllers/exportController';
import { createVoucher, getVouchers } from '../controllers/vouchersController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Apply auth to all routes
router.use(authMiddleware as any);

router.post('/reconcile',       upload.fields([{ name: 'prFile' }, { name: 'gstr2bFile' }]),  reconcileGstr2b);
router.post('/reconcile/gstr1', upload.fields([{ name: 'salesFile' }, { name: 'gstr1File' }]), reconcileGstr1);
router.post('/export',          exportReconciliation);
router.post('/vouchers',        createVoucher);
router.get('/vouchers',         getVouchers);

export default router;
