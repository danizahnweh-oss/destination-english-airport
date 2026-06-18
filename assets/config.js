/* ============================================================
   Destination English — configuration
   ------------------------------------------------------------
   STEP 1: Create a free Supabase project at https://supabase.com
   STEP 2: Run the SQL in  supabase-setup.sql  (SQL editor)
   STEP 3: Settings → API → copy "Project URL" and the "anon public" key
   STEP 4: Paste them below (between the quotes) and save.

   The anon key is meant to be public in the browser. Do NOT paste
   the "service_role" key here.
   ============================================================ */
window.CONFIG = {
  SUPABASE_URL: "https://dtedxefupvwwcbwocplv.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_MN8DrEdOp4Il5z50YNQRfg_EQkT-IVM",

  // localStorage namespace + app title (usually leave as-is)
  STORAGE_PREFIX: "destEN_",
  APP_TITLE: "Destination English"
};

// true once both values are filled in
window.CONFIG.isReady = function () {
  return !!(window.CONFIG.SUPABASE_URL && window.CONFIG.SUPABASE_ANON_KEY);
};
