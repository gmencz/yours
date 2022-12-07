import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = "https://xrqbjevrqsljaqnzjybb.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhycWJqZXZycXNsamFxbnpqeWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njc2NTI1NzksImV4cCI6MTk4MzIyODU3OX0.q43MWCFK4_QkeK31udeQ9DxoF3FQEhA2D8u5VZ7o2BQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: false,
    // persistSession: true,
    detectSessionInUrl: false,
  },
});
