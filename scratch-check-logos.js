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
    .order('posted_date', { ascending: false })
    .limit(50);
  if (error) {
    console.error(error);
  } else {
    const domains = data.map(j => {
      const m = j.company_logo.match(/domain=([^&]+)/);
      const d = j.company_logo.match(/ip3\/([^.]+\.[^.]+)\.ico/);
      return { company: j.company, domain: (m && m[1]) || (d && d[1]) || j.company_logo };
    });
    // Show domains ending in patterns from the error
    domains.forEach(d => console.log(`${d.company} → ${d.domain}`));
  }
}
check();
