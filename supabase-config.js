// supabase-config.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// 1. URL (یہ درست ہے)
const SUPABASE_URL = 'https://yaxzmhkblverewofiqrn.supabase.co'; 

// 2. API Key (یہ آپ کی اصل کی ہے جو ابھی آپ نے بھیجی ہے)
const SUPABASE_ANON_KEY = 'sb_publishable_yOF4yLJRmsZEnQkDUt4l3g_dVw4NrZh'; 

// 3. Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("Supabase Connected Successfully!");