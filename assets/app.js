/* ============================================================
   Destination English · app engine
   - builds the top navigation + group modal + toast
   - manages group profiles (create / join by code / switch)
   - binds every [data-key] field to the store
   - syncs live via Supabase when configured, else local-only
   ============================================================ */
window.App = (function () {
  const CFG = window.CONFIG;
  const P = (CFG && CFG.STORAGE_PREFIX) || "destEN_";
  const cloud = window.Sync && window.Sync.ready();

  let page = "index";
  let group = null;                 // { id, name }
  const store = {};                 // field_key -> value (in-memory)
  const dataCbs = [];               // callbacks fired on any data change
  const debounce = {};              // per-key debounce timers

  /* ---------- localStorage helpers ---------- */
  const lsGet = (k, def) => { try { return JSON.parse(localStorage.getItem(P + k)) ?? def; } catch (e) { return def; } };
  const lsSet = (k, v) => { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {} };

  function knownGroups() { return lsGet("groups", []); }
  function rememberGroup(g) {
    const list = knownGroups().filter((x) => x.id !== g.id);
    list.unshift({ id: g.id, name: g.name });
    lsSet("groups", list);
  }
  function forgetGroup(id) {
    lsSet("groups", knownGroups().filter((x) => x.id !== id));
    localStorage.removeItem(P + "data_" + id);
  }
  const cacheGet = (id) => lsGet("data_" + id, {});
  const cacheSet = (id, map) => lsSet("data_" + id, map);

  /* ---------- field element helpers ---------- */
  const fieldEls = () => Array.prototype.slice.call(document.querySelectorAll("[data-key]"));
  function applyToEl(el, val) {
    if (el.type === "checkbox") el.checked = val === "1" || val === true;
    else el.value = val == null ? "" : val;
  }
  function readEl(el) {
    if (el.type === "checkbox") return el.checked ? "1" : "";
    return el.value;
  }

  /* ---------- public store access ---------- */
  function getVal(key) { return store[key] || ""; }
  function getAll() { return Object.assign({}, store); }
  function onData(cb) { dataCbs.push(cb); }
  function fireData() { dataCbs.forEach((cb) => { try { cb(); } catch (e) {} }); }

  // write a value: memory + cache + cloud
  function setVal(key, value) {
    store[key] = value;
    if (group) {
      const c = cacheGet(group.id);
      c[key] = value;
      cacheSet(group.id, c);
      if (cloud) {
        window.Sync.upsert(group.id, key, value).then(setOnline.bind(null, true)).catch(() => setOnline(false));
      }
    }
    fireData();
  }

  /* ---------- binding ---------- */
  function bindFields() {
    fieldEls().forEach((el) => {
      const key = el.getAttribute("data-key");
      applyToEl(el, store[key]);
      if (el.dataset.bound) return;
      el.dataset.bound = "1";
      const handler = () => {
        const v = readEl(el);
        clearTimeout(debounce[key]);
        debounce[key] = setTimeout(() => setVal(key, v), el.type === "checkbox" ? 0 : 380);
        // keep counters snappy without waiting for debounce
        store[key] = v; fireData();
      };
      el.addEventListener("input", handler);
      el.addEventListener("change", handler);
    });
  }

  // apply a remote change to UI + store (skip the field if user is typing in it)
  function applyRemote(key, value) {
    store[key] = value;
    if (group) { const c = cacheGet(group.id); c[key] = value; cacheSet(group.id, c); }
    fieldEls().forEach((el) => {
      if (el.getAttribute("data-key") === key && el !== document.activeElement) applyToEl(el, value);
    });
    fireData();
  }

  /* ---------- group lifecycle ---------- */
  function randCode() {
    const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "";
    for (let i = 0; i < 4; i++) s += a[Math.floor(Math.random() * a.length)];
    return "MUC-" + s;
  }

  async function activateGroup(g, opts) {
    group = g;
    lsSet("active", g.id);
    rememberGroup(g);
    // start from local cache (instant)
    Object.keys(store).forEach((k) => delete store[k]);
    Object.assign(store, cacheGet(g.id));
    bindFields();
    paintGroupPill();
    fireData();
    // then pull from cloud + subscribe
    if (cloud) {
      try {
        const remote = await window.Sync.loadAll(g.id);
        Object.assign(store, remote);
        cacheSet(g.id, store);
        // adopt name from cloud if present
        if (remote._group_name && remote._group_name !== g.name) {
          group.name = remote._group_name; rememberGroup(group); paintGroupPill();
        }
        fieldEls().forEach((el) => { if (el !== document.activeElement) applyToEl(el, store[el.getAttribute("data-key")]); });
        fireData();
        window.Sync.subscribe(g.id, applyRemote, (status) => setOnline(status === "SUBSCRIBED"));
        setOnline(true);
      } catch (e) { setOnline(false); }
    }
    if (opts && opts.toast) toast(opts.toast);
  }

  function createGroup(name) {
    const g = { id: randCode(), name: name || "Our team" };
    // seed name field so other devices can read it
    activateGroup(g, { toast: "Group created · code " + g.id }).then(() => setVal("_group_name", g.name));
    return g;
  }

  async function joinGroup(code) {
    code = (code || "").trim().toUpperCase();
    if (!/^MUC-[A-Z0-9]{4}$/.test(code)) throw new Error("Please enter a code like MUC-7Q2X.");
    let name = "Team " + code.slice(4);
    const existing = knownGroups().find((x) => x.id === code);
    if (existing) name = existing.name;
    await activateGroup({ id: code, name: name });
    return group;
  }

  /* ============================================================
     UI: nav, group pill, modal, toast
     ============================================================ */
  function navHTML() {
    const links = [
      ["index.html", "Home", "index"],
      ["missions.html", "Missions", "missions"],
      ["interviews.html", "Interviews", "interviews"],
      ["map.html", "World map", "map"],
      ["report.html", "Report", "report"]
    ];
    return (
      '<div class="nav-inner">' +
        '<a class="brand" href="index.html"><span class="logo" aria-hidden="true">✈</span><span>Destination&nbsp;English</span></a>' +
        '<nav class="nav-links" aria-label="Sections">' +
          links.map((l) => '<a href="' + l[0] + '" class="' + (l[2] === page ? "active" : "") + '"' + (l[2] === page ? ' aria-current="page"' : "") + ">" + l[1] + "</a>").join("") +
        "</nav>" +
        '<button class="group-pill" id="groupPill" type="button">' +
          '<span class="sync-dot" aria-hidden="true"></span><span class="gname">No group</span>' +
          '<span class="switch">Switch</span>' +
          '<span class="sr-only" id="syncStatus" aria-live="polite"></span>' +
        "</button>" +
      "</div>"
    );
  }

  function paintGroupPill() {
    const pill = document.getElementById("groupPill");
    if (!pill) return;
    pill.querySelector(".gname").textContent = group ? group.name : "Choose group";
    const status = pill.querySelector("#syncStatus");
    if (!group) {
      pill.classList.remove("online", "offline");
      if (status) status.textContent = "No group selected";
    }
  }
  function setOnline(ok) {
    const pill = document.getElementById("groupPill");
    if (!pill || !group) return;
    const live = !!ok && cloud;
    pill.classList.toggle("online", live);
    pill.classList.toggle("offline", !ok || !cloud);
    const status = pill.querySelector("#syncStatus");
    if (status) status.textContent = live ? "Live sync on" : "Sync offline, saved on this device";
  }

  function modalHTML() {
    return (
      '<div class="modal-back" id="grpBack"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="grpTitle">' +
        '<h2 id="grpTitle">Your group</h2>' +
        '<p class="sub">One group, many iPads. Share your group code so your team-mates join the same group.</p>' +
        '<div class="tabs" role="tablist" aria-label="Group options">' +
          '<button type="button" role="tab" aria-selected="true" data-tab="mine" class="active">My groups</button>' +
          '<button type="button" role="tab" aria-selected="false" data-tab="new">New</button>' +
          '<button type="button" role="tab" aria-selected="false" data-tab="join">Join</button>' +
        "</div>" +

        '<div class="pane active" role="tabpanel" data-pane="mine"><div class="group-list" id="grpList"></div>' +
          '<p class="muted">Tip: pick a group to keep working, or create / join one.</p></div>' +

        '<div class="pane" role="tabpanel" data-pane="new">' +
          '<div class="field"><label>Group name</label><input id="newName" placeholder="The Jet Setters" autocomplete="off"></div>' +
          '<button class="btn btn-primary btn-block" id="newBtn">Create group</button>' +
          '<div id="newResult" style="display:none">' +
            '<p class="muted" style="margin-top:16px">Share this code with your team:</p>' +
            '<div class="code-display" id="newCode">MUC-····</div>' +
            '<button class="btn btn-ghost btn-block" id="copyCode">Copy code</button>' +
            '<button class="btn btn-amber btn-block" id="newDone" style="margin-top:10px">Start →</button>' +
          "</div>" +
        "</div>" +

        '<div class="pane" role="tabpanel" data-pane="join">' +
          '<div class="field"><label>Group code</label><input id="joinCode" placeholder="MUC-7Q2X" autocomplete="off" style="text-transform:uppercase"></div>' +
          '<div class="err" id="joinErr"></div>' +
          '<button class="btn btn-primary btn-block" id="joinBtn">Join group</button>' +
        "</div>" +
      "</div></div>"
    );
  }

  let lastFocus = null;
  function openModal() {
    renderGroupList();
    lastFocus = document.activeElement;
    const back = document.getElementById("grpBack");
    back.classList.add("show");
    // move focus into the dialog (first focusable in the active pane)
    const first = back.querySelector(".pane.active input, .pane.active button, .tabs button");
    if (first) setTimeout(() => first.focus(), 30);
  }
  function closeModal() {
    document.getElementById("grpBack").classList.remove("show");
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }

  function renderGroupList() {
    const host = document.getElementById("grpList");
    const list = knownGroups();
    if (!list.length) { host.innerHTML = '<p class="muted">No groups on this device yet.</p>'; return; }
    host.innerHTML = list.map((g) => {
      const isActive = group && g.id === group.id;
      return '<div class="gl-row">' +
        '<button type="button" class="gl ' + (isActive ? "active" : "") + '" data-id="' + g.id + '"' +
          (isActive ? ' aria-current="true"' : "") + ">" +
          '<span class="gl-name">' + escapeHTML(g.name) + "</span>" +
          '<span class="gl-code">' + g.id + "</span>" +
        "</button>" +
        '<button type="button" class="gl-del" data-del="' + g.id + '" title="Remove from this device" aria-label="Remove ' + escapeHTML(g.name) + ' from this device">✕</button>' +
      "</div>";
    }).join("");
    host.querySelectorAll(".gl").forEach((btn) => {
      btn.addEventListener("click", () => joinGroup(btn.getAttribute("data-id")).then(() => closeModal()));
    });
    host.querySelectorAll(".gl-del").forEach((btn) => {
      btn.addEventListener("click", () => { forgetGroup(btn.getAttribute("data-del")); renderGroupList(); });
    });
  }

  function wireModal() {
    document.body.insertAdjacentHTML("beforeend", modalHTML());
    document.body.insertAdjacentHTML("beforeend", '<div class="toast" id="toast" role="status" aria-live="polite"><span class="t-ic" aria-hidden="true">✈</span><span id="toastMsg"></span></div>');

    const back = document.getElementById("grpBack");
    back.addEventListener("click", (e) => { if (e.target === back) closeModal(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && back.classList.contains("show")) closeModal();
    });
    back.querySelectorAll(".tabs button").forEach((b) =>
      b.addEventListener("click", () => {
        back.querySelectorAll(".tabs button").forEach((x) => { x.classList.remove("active"); x.setAttribute("aria-selected", "false"); });
        back.querySelectorAll(".pane").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        b.setAttribute("aria-selected", "true");
        back.querySelector('[data-pane="' + b.getAttribute("data-tab") + '"]').classList.add("active");
      })
    );

    document.getElementById("newBtn").addEventListener("click", () => {
      const name = document.getElementById("newName").value.trim() || "Our team";
      const g = createGroup(name);
      document.getElementById("newResult").style.display = "block";
      document.getElementById("newCode").textContent = g.id;
      document.getElementById("newBtn").style.display = "none";
    });
    document.getElementById("copyCode").addEventListener("click", () => {
      const code = document.getElementById("newCode").textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(code);
      toast("Code copied: " + code);
    });
    document.getElementById("newDone").addEventListener("click", closeModal);

    document.getElementById("joinBtn").addEventListener("click", () => {
      const err = document.getElementById("joinErr"); err.textContent = "";
      joinGroup(document.getElementById("joinCode").value)
        .then(() => closeModal())
        .catch((e) => (err.textContent = e.message));
    });

    document.getElementById("groupPill").addEventListener("click", openModal);
  }

  /* ---------- toast ---------- */
  let toastTimer = null;
  function toast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    document.getElementById("toastMsg").textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  function escapeHTML(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  /* ---------- decorative airport sky (planes drifting in the background + hero) ---------- */
  // side-view jet silhouette, nose pointing RIGHT (so it matches left→right travel)
  const PLANE_SVG =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M22 12c0-.83-.67-1.5-1.5-1.5H15L9 4H6.5l3 6.5H4l-2-2.5H.5L2 12 .5 16.5H2l2-2.5h5.5L6.5 20H9l6-6.5h5.5c.83 0 1.5-.67 1.5-1.5z"/>' +
    "</svg>";
  function addPlanes() {
    // full-page background sky, behind the content column
    if (!document.querySelector(".sky")) {
      const sky = document.createElement("div");
      sky.className = "sky";
      sky.setAttribute("aria-hidden", "true");
      const lanes = [
        { y: "12vh", dur: 30, delay: 0,  s: 1 },
        { y: "40vh", dur: 46, delay: 9,  s: 0.7 },
        { y: "66vh", dur: 36, delay: 19, s: 1.1 },
        { y: "88vh", dur: 54, delay: 27, s: 0.6 }
      ];
      sky.innerHTML = lanes.map((l) =>
        '<span class="p" style="--y:' + l.y + ';--dur:' + l.dur + 's;--delay:' + l.delay + 's;--sz:' + (26 * l.s) + 'px">' + PLANE_SVG + "</span>"
      ).join("");
      document.body.insertBefore(sky, document.body.firstChild);
    }
    // planes flying across each departures-board hero + real airplane photo behind it
    document.querySelectorAll(".board").forEach((b) => {
      b.classList.add("has-photo");
      if (b.querySelector(".sky-plane")) return;
      [{ y: "16%", dur: 15, delay: 0, sz: 26 },
       { y: "62%", dur: 22, delay: 7, sz: 20 },
       { y: "40%", dur: 18, delay: 12, sz: 17 }].forEach((l) => {
        const p = document.createElement("span");
        p.className = "sky-plane";
        p.innerHTML = PLANE_SVG;
        p.style.cssText = "--y:" + l.y + ";--dur:" + l.dur + "s;--delay:" + l.delay + "s;--sz:" + l.sz + "px";
        b.appendChild(p);
      });
    });
  }

  /* ---------- PDF ---------- */
  function exportPDF() { window.print(); }

  /* ---------- config banner ---------- */
  function configWarn() {
    if (cloud) return;
    const host = document.querySelector("main.wrap") || document.body;
    const div = document.createElement("div");
    div.className = "config-warn no-print";
    div.innerHTML = "⚠️ <b>Local preview mode.</b> Live sync across devices is off because Supabase isn't configured yet. " +
      "Your answers are saved on <b>this device only</b>. See <code>README.md</code> → fill in <code>assets/config.js</code> to enable team sync.";
    host.insertBefore(div, host.firstChild);
  }

  /* ============================================================
     init
     ============================================================ */
  function init(opts) {
    opts = opts || {};
    page = opts.page || "index";

    const navHost = document.getElementById("topnav");
    if (navHost) { navHost.className = "nav"; navHost.innerHTML = navHTML(); }
    wireModal();
    addPlanes();
    configWarn();

    // restore last active group
    const activeId = lsGet("active", null);
    const known = knownGroups();
    const found = activeId && known.find((g) => g.id === activeId);
    if (found) {
      activateGroup(found);
    } else {
      paintGroupPill();
      bindFields(); // bind anyway so the page is interactive
      // student pages need a group → nudge the user
      if (["missions", "interviews", "map", "report"].indexOf(page) >= 0) {
        setTimeout(openModal, 350);
      }
    }
  }

  return { init, onData, getVal, getAll, exportPDF, toast, openModal, hasGroup: () => !!group, group: () => (group ? { id: group.id, name: group.name } : null) };
})();
