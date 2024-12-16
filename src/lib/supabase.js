// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Ganti dengan URL Supabase Anda
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Ganti dengan Kunci Anon Anda

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
