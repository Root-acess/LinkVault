import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eltgvwvmrqsqipxpgmyv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-B9QTE-nGwNDnEMWcMv4uQ_DzeC_xq8";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
