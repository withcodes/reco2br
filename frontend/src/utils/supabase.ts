import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || '';
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type UserProfile = {
  id: string;
  email: string;
  firm_name: string;
  firm_id: string;
  role: 'admin' | 'senior_ca' | 'junior_ca';
  plan: 'starter' | 'professional' | 'enterprise';
  created_at: string;
};
