import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

// Base client for public use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for bypass RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
