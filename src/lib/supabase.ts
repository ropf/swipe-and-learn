
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Use fixed values for Supabase URL and anon key
const supabaseUrl = 'https://vlvlbyzusihtrpevqbxb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsdmxieXp1c2lodHJwZXZxYnhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2ODI1OTUsImV4cCI6MjA1NzI1ODU5NX0.jAo5TiTtjxS0PmJgxYa_tVzvLnUcQukM9IxbOfpZBsc';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
