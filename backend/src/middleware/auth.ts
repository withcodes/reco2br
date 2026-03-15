import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  firmId?: string;
  userId?: string;
  userEmail?: string;
  plan?: string;
}

/**
 * Auth middleware — validates Supabase JWT and attaches firmId.
 * Falls back to dev mode if SUPABASE_URL not configured.
 */
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;

  // Dev mode — no Supabase configured
  if (!supabaseUrl || !serviceKey) {
    req.firmId = 'dev_firm';
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing auth token.' });
  }

  try {
    // Dynamically import to avoid startup crash if @supabase not installed
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceKey);
    const token = authHeader.slice(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token.' });
    req.userId    = user.id;
    req.userEmail = user.email;
    req.firmId    = user.user_metadata?.firm_id || user.id;
    req.plan      = user.user_metadata?.plan || 'starter';
    next();
  } catch {
    // If @supabase not installed, allow through in dev
    req.firmId = 'dev_firm';
    next();
  }
};
