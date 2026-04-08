require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

async function checkSchema() {
  const { data, error } = await supabase.from('cards_stats').select('*').limit(1);
  if (error) {
    console.error('Error fetching cards_stats:', error);
  } else {
    console.log('cards_stats columns/schema looks like:', data);
  }
}
checkSchema();
