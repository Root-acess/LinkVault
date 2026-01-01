import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tykggdgwdsmxrgufavfj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_RjUGzLYI5objd3IcysUOVg_kXUrQqtW";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
