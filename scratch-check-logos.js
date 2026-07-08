import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase
    .from('jobs')
    .select('company, company_logo')
    .not('company_logo', 'is', null)
    .neq('company_logo', '')
    .limit(25);
  if (error) {
    console.error(error);
  } else {
    data.forEach(j => {
      console.log(`[${j.company}]  company_logo=${j.company_logo}`);
    });
  }
}
check();
