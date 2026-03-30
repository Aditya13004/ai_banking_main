import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fvnmkynsndgaxcuaffcs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bm1reW5zbmRnYXhjdWFmZmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNDU0MTUsImV4cCI6MjA4OTkyMTQxNX0.s0mC0mkv8Zt0_dZN5hgVJHxqOM51TEzfAz21BfxuqZE';

export const supabase = createClient(supabaseUrl, supabaseKey);
