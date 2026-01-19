// FILE: supabase/functions/_shared/supabaseAdmin.ts
// PURPOSE: Privileged database access for background tasks.

import { createClient } from "supabase";

export const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);