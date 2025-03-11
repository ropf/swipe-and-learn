
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Check for environment variables in Vite
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If not available, check if we're in development and use placeholder values
if ((!supabaseUrl || !supabaseAnonKey) && import.meta.env.DEV) {
  console.warn('Supabase environment variables not found. Using placeholder values for development.');
  
  // These are just placeholder values for development - they won't actually work
  supabaseUrl = supabaseUrl || 'https://your-supabase-project-url.supabase.co';
  supabaseAnonKey = supabaseAnonKey || 'your-supabase-anon-key';
  
  // Show guidance to the user
  console.info('Please add your Supabase URL and anon key to your environment variables:');
  console.info('VITE_SUPABASE_URL=https://your-project-id.supabase.co');
  console.info('VITE_SUPABASE_ANON_KEY=your-anon-key');
}

// Only throw an error in production to allow development without Supabase
if ((!supabaseUrl || !supabaseAnonKey) && !import.meta.env.DEV) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
