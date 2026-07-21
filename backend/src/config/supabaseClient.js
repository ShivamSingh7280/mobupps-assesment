const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

// Service-role client: used only server-side. It bypasses Row Level Security,
// which is fine here because this backend is the sole authorized caller —
// authorization is enforced by our own JWT middleware, not by Supabase.
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = supabase;
