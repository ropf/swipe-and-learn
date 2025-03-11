
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Check for environment variables in Vite
const supabaseUrl = 'https://vlvlbyzusihtrpevqbxb.supabase.co';
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If not available, check if we're in development and use placeholder values
if (!supabaseAnonKey && import.meta.env.DEV) {
  console.warn('Supabase anon key not found. Using placeholder value for development.');
  
  // This is just a placeholder value for development - it won't actually work
  supabaseAnonKey = 'your-supabase-anon-key';
  
  // Show guidance to the user
  console.info('Please add your Supabase anon key to your environment variables:');
  console.info('VITE_SUPABASE_ANON_KEY=your-anon-key');
}

// Only throw an error in production to allow development without Supabase
if (!supabaseAnonKey && !import.meta.env.DEV) {
  throw new Error('Missing Supabase anon key environment variable');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
