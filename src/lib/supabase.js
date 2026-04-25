import { createClient } from "@supabase/supabase-js";

// This runs in the browser — NEXT_PUBLIC_ vars are safe here
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
