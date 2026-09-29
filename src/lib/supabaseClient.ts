import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yoummvsjxuhomfurseym.supabase.co';
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qDhinvz2nEw8XwuJ-1mFaQ_fabl4BsV';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
