import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno: PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY deben estar definidas.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    transport: ws,
  },
});
