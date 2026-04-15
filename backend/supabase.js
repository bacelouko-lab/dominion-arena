const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.log('⚠️ Supabase credentials missing. Database features will be disabled.');
  // Mock para evitar quebras de encadeamento .from().select() etc.
  supabase = {
    from: () => ({
      select: () => ({ or: () => ({ single: () => Promise.resolve({ data: null, error: null }), eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }), eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }), order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Database disabled' } }) }) }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) })
    }),
    rpc: () => Promise.resolve({ error: null })
  };
}

module.exports = { supabase };