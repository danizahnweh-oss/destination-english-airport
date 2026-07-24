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

  // Dashboard: load every row of every group → { groupId: { fields, updated } }
  async function loadEverything() {
    const c = getClient();
    if (!c) throw new Error("no-config");
    const { data, error } = await c
      .from("entries")
      .select("group_id,field_key,value,updated_at");
    if (error) throw error;
    const map = {};
    (data || []).forEach((r) => {
      if (!map[r.group_id]) map[r.group_id] = { fields: {}, updated: 0 };
      map[r.group_id].fields[r.field_key] = r.value;
      const t = Date.parse(r.updated_at) || 0;
      if (t > map[r.group_id].updated) map[r.group_id].updated = t;
    });
    return map;
  }

  // Dashboard: delete every row of one group (needs the delete policy,
  // see supabase-setup.sql). Without that policy Postgres reports success
  // but deletes nothing — so ask for the deleted rows and verify.
  async function deleteGroup(groupId) {
    const c = getClient();
    if (!c) throw new Error("no-config");
    const { data, error } = await c
      .from("entries")
      .delete()
      .eq("group_id", groupId)
      .select("field_key");
    if (error) throw error;
    if (!data || !data.length) {
      throw new Error("The database refused the delete (0 rows removed). " +
        "Run the delete policy from supabase-setup.sql once in the Supabase SQL editor.");
    }
  }

  // Dashboard realtime: every change of every group (no group filter)
  let allChannel = null;
  function subscribeAll(onChange, onStatus) {
    const c = getClient();
    if (!c) return;
    if (allChannel) { c.removeChannel(allChannel); allChannel = null; }
    allChannel = c
      .channel("dashboard-all")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "entries" },
        (payload) => {
          const row = payload.new && payload.new.field_key ? payload.new : payload.old;
          if (row) onChange(row.group_id, row.field_key, row.value, row.updated_at);
        }
      )
      .subscribe((status) => { if (onStatus) onStatus(status); });
  }

  return { ready, loadAll, upsert, subscribe, loadEverything, subscribeAll, deleteGroup };
})();
