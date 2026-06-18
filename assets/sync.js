/* ============================================================
   Destination English — Supabase sync layer
   Thin wrapper around the Supabase JS client (loaded via CDN).
   Falls back gracefully: if no config, App runs in local-only mode.
   ============================================================ */
window.Sync = (function () {
  let client = null;
  let channel = null;

  function ready() {
    return window.CONFIG && window.CONFIG.isReady() && !!window.supabase;
  }

  function getClient() {
    if (!ready()) return null;
    if (!client) {
      client = window.supabase.createClient(
        window.CONFIG.SUPABASE_URL,
        window.CONFIG.SUPABASE_ANON_KEY,
        { realtime: { params: { eventsPerSecond: 6 } } }
      );
    }
    return client;
  }

  // Load every field of a group → { field_key: value }
  async function loadAll(groupId) {
    const c = getClient();
    if (!c) throw new Error("no-config");
    const { data, error } = await c
      .from("entries")
      .select("field_key,value")
      .eq("group_id", groupId);
    if (error) throw error;
    const map = {};
    (data || []).forEach((r) => (map[r.field_key] = r.value));
    return map;
  }

  // Write a single field (last-write-wins per key)
  async function upsert(groupId, key, value) {
    const c = getClient();
    if (!c) throw new Error("no-config");
    const { error } = await c.from("entries").upsert(
      { group_id: groupId, field_key: key, value: value, updated_at: new Date().toISOString() },
      { onConflict: "group_id,field_key" }
    );
    if (error) throw error;
  }

  // Realtime: call onChange(key, value) for every remote change in this group
  function subscribe(groupId, onChange, onStatus) {
    const c = getClient();
    if (!c) return;
    if (channel) { c.removeChannel(channel); channel = null; }
    channel = c
      .channel("grp-" + groupId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "entries", filter: "group_id=eq." + groupId },
        (payload) => {
          const row = payload.new && payload.new.field_key ? payload.new : payload.old;
          if (row) onChange(row.field_key, row.value);
        }
      )
      .subscribe((status) => { if (onStatus) onStatus(status); });
  }

  return { ready, loadAll, upsert, subscribe };
})();
