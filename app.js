
/* =========================================
   LEVEL UP AT DQ — FULL APP.JS
   Admin PIN: 2112
========================================= */

/* =========================
   CONFIG
========================= */
const ADMIN_PIN = "2112";
const ADMIN_UNLOCK_KEY = "dq_admin_unlocked";
const STORAGE_KEY = "levelUpDQ_state_v1";

/* =========================
   ADMIN GATE
========================= */
function isAdminUnlocked() {
  return localStorage.getItem(ADMIN_UNLOCK_KEY) === "1";
}

function unlockAdmin() {
  const entered = prompt("Enter Admin PIN");
  if (entered === null) return false;
  if (entered.trim() === ADMIN_PIN) {
    localStorage.setItem(ADMIN_UNLOCK_KEY, "1");
    alert("Admin unlocked");
    return true;
  }
  alert("Wrong PIN");
  return false;
}

function lockAdmin() {
  localStorage.removeItem(ADMIN_UNLOCK_KEY);
  alert("Admin locked");
}

function requireAdmin() {
  if (isAdminUnlocked()) return true;
  return unlockAdmin();
}

/* =========================
   UTIL
========================= */
function uid(prefix="id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function deepClone(o) {
  return JSON.parse(JSON.stringify(o));
}

function fmt(n) {
  return (n ?? 0).toLocaleString();
}

/* =========================
   LEVEL DEFINITIONS
========================= */
const PLAYER_LEVELS = [
  { minXP: 20000, title: "The DQ Zenith 🌌" },
  { minXP: 17000, title: "Glacial God 🧊" },
  { minXP: 14500, title: "Elite Executive 💼" },
  { minXP: 12500, title: "High-Tier Hero 🦸" },
  { minXP: 10000, title: "DQ Legend 🌀" },
  { minXP: 7200, title: "Store Champion 🏆" },
  { minXP: 5200, title: "Royal Treat Artisan 👑" },
  { minXP: 3800, title: "Grill Guardian 🔥" },
  { minXP: 2800, title: "Blizzard Master 🍨" },
  { minXP: 2000, title: "Chill Zone Expert ❄️" },
  { minXP: 1400, title: "Drive-Thru Specialist 🚗" },
  { minXP: 900, title: "Kitchen Wrangler 🍳" },
  { minXP: 500, title: "Counter Cadet 🧢" },
  { minXP: 200, title: "Day One Rookie 🍦" },
  { minXP: 0, title: "Unassigned" }
];

function getPlayerLevel(xp) {
  return PLAYER_LEVELS.find(l => xp >= l.minXP);
}

/* =========================
   CORE BADGES
========================= */
const CORE_BADGES = ["🌟","🐝","⏱","🙌","🎨","🗣️","📅","⚡","🎂","🖌️","🍡","🤠","🍟","🧁","🧼","🗑️","🧹","🅿️","🛡️","🔥"];

/* =========================
   SEED DATA (LOADED ON FIRST RUN)
========================= */
const SEED = {
  teams: [],
  players: [],
  logs: []
};

/* =========================
   STATE
========================= */
let state = loadState() || deepClone(SEED);
saveState(state);

/* =========================
   VIEW SYSTEM
========================= */
function setView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
}

/* =========================
   AWARD XP (ADMIN ONLY)
========================= */
function awardXP(playerId, xp, reason="Manual Award") {
  if (!requireAdmin()) return;

  const p = state.players.find(p => p.id === playerId);
  if (!p) return;

  const beforeXP = p.xp || 0;
  p.xp = beforeXP + xp;

  state.logs.unshift({
    id: uid("log"),
    ts: new Date().toISOString(),
    text: `${p.name} earned +${xp} XP (${reason})`
  });

  saveState(state);
  renderAll();
}

/* =========================
   RENDERERS
========================= */
function renderOverview() {
  const el = document.getElementById("overview");
  if (!el) return;
  el.innerHTML = state.players.map(p => {
    const lvl = getPlayerLevel(p.xp || 0);
    return `
      <div class="card">
        <strong>${p.name}</strong><br>
        ${lvl.title}<br>
        XP: ${fmt(p.xp || 0)}
      </div>
    `;
  }).join("");
}

function renderPlayers() {
  const el = document.getElementById("players");
  if (!el) return;

  el.innerHTML = state.players.map(p => `
    <div class="card">
      <strong>${p.name}</strong><br>
      XP: ${fmt(p.xp || 0)}
      <br><br>
      <button onclick="awardXP('${p.id}',100,'Quick Award')">+100 XP</button>
    </div>
  `).join("");
}

function renderActivity() {
  const el = document.getElementById("activity");
  if (!el) return;

  el.innerHTML = state.logs.slice(0,50).map(l => `
    <div class="card">
      ${l.text}<br>
      <small>${new Date(l.ts).toLocaleString()}</small>
    </div>
  `).join("");
}

function renderAdmin() {
  const el = document.getElementById("admin");
  if (!el) return;

  el.innerHTML = `
    <h2>Admin Panel</h2>
    <button onclick="lockAdmin()">Lock Admin</button>
    <button onclick="exportJSON()">Export JSON</button>
    <input type="file" id="importFile">
  `;

  document.getElementById("importFile").addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    state = JSON.parse(text);
    saveState(state);
    renderAll();
    alert("Import complete");
  });
}

/* =========================
   EXPORT
========================= */
function exportJSON() {
  const blob = new Blob([JSON.stringify(state,null,2)], { type:"application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "levelup_backup.json";
  a.click();
}

/* =========================
   MASTER RENDER
========================= */
function renderAll() {
  renderOverview();
  renderPlayers();
  renderActivity();
  renderAdmin();
}

/* =========================
   TAB HANDLING
========================= */
document.getElementById("tabs")?.addEventListener("click", e => {
  const btn = e.target.closest(".tab");
  if (!btn) return;

  const view = btn.dataset.view;
  if (view === "adminView" && !requireAdmin()) return;

  setView(view);
});

/* =========================
   INIT
========================= */
renderAll();
setView("overviewView");
