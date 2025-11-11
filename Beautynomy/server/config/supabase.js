import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase credentials not configured. Using fallback mode.');
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false // Server-side, no session persistence needed
      }
    })
  : null;

// Database connection check
export const checkConnection = async () => {
  if (!supabase) {
    return { connected: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });

    if (error) throw error;

    return { connected: true };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};

export default supabase;
