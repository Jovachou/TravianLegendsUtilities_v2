
import { createClient } from '@supabase/supabase-js';

// URL obtained from your project settings screenshot
const SUPABASE_URL = 'https://wjjoehtomioasngmdgci.supabase.co';

// Your public anon key for secure client-side communication with Supabase
const SUPABASE_ANON_KEY = 'sb_publishable_UAb_2wlKHv2p7N-G6V_OFA_5PhhqoZC';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
