/* Level Up at DQ — Full LocalStorage App (NO ADMIN PIN)
   - Uses state.json as first-run seed (fetch)
   - Persists to LocalStorage
   - Awards create hard audit logs with timestamp + deviceId + before/after
*/

const STORAGE_KEY = "levelUpDQ_appState_v2";
const DEVICE_KEY  = "levelUpDQ_deviceId_v1";

/* ---------- Device Fingerprint (simple per-device ID) ---------- */
function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = `dev_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}
const DEVICE_ID = getDeviceId();

/* ---------- Helpers ---------- */
function uid(prefix="id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}
function deepClone(o){ return JSON.parse(JSON.stringify(o)); }
function fmt(n){ return (n ?? 0).toLocaleString(); }

function nowMeta() {
  const d = new Date();
  return {
    iso: d.toISOString(),
    local: d.toLocaleString(),
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    epochMs: d.getTime()
  };
}

/* ---------- Levels ---------- */
const PLAYER_LEVELS = [
  { minXP: 20000, title: "The DQ Zenith 🌌" },
  { minXP: 18500, title: "Glacial God 🧊" },
  { minXP: 17000, title: "Paramount Professional 🎖️" },
  { minXP: 15500, title: "Elite Executive 💼" },
  { minXP: 14500, title: "Prestige Principal 💎" },
  { minXP: 13500, title: "Superior Server ⚡" },
  { minXP: 12500, title: "High-Tier Hero 🦸" },
  { minXP: 11500, title: "Master of Mixes 🌪️" },
  { minXP: 10700, title: "Senior Superstar ⭐" },
  { minXP: 10000, title: "DQ Legend 🌀" },
  { minXP: 7200,  title: "Store Champion 🏆" },
  { minXP: 5200,  title: "Royal Treat Artisan 👑" },
  { minXP: 3800,  title: "Grill Guardian 🔥" },
  { minXP: 2800,  title: "Blizzard Master 🍨" },
  { minXP: 2000,  title: "Chill Zone Expert ❄️" },
  { minXP: 1400,  title: "Drive-Thru Specialist 🚗" },
  { minXP: 900,   title: "Kitchen Wrangler 🍳" },
  { minXP: 500,   title: "Counter Cadet 🧢" },
  { minXP: 200,   title: "Day One Rookie 🍦" },
  { minXP: 0,     title: "Unassigned" }
];

const TEAM_LEVELS = [
  { minXP: 150000, title: "🪐 (Universal Architect)" },
  { minXP: 140000, title: "☀️ (Solar Overlord)" },
  { minXP: 130000, title: "🛸 (Void Walker)" },
  { minXP: 120000, title: "💠 (Quasar Elite)" },
  { minXP: 115000, title: "⚡ (Electric Ether)" },
  { minXP: 110000, title: "🧬 (Primal Pulse)" },
  { minXP: 105000, title: "☄️ (Astro Warden)" },
  { minXP: 100000, title: "🌟 (Supernova)" },
  { minXP: 90000,  title: "🌋 (Magma Titan)" },
  { minXP: 80000,  title: "🦅 (Sky Sovereign)" },
  { minXP: 70000,  title: "🛡️ (Iron Aegis)" },
  { minXP: 50000,  title: "🔮 (Legend)" },
  { minXP: 40000,  title: "🔱 (Imperial)" },
  { minXP: 30000,  title: "💫 (Nebula)" },
  { minXP: 20000,  title: "🌌 (Galaxy)" },
  { minXP: 10000,  title: "⚜️ (Regal)" },
  { minXP: 9000,   title: "✨ (Cosmic)" },
  { minXP: 8000,   title: "🏆 (Champion)" },
  { minXP: 7000,   title: "🚀 (Rocket)" },
  { minXP: 6000,   title: "👑 (Crown)" },
  { minXP: 5000,   title: "💎 (Diamond)" },
  { minXP: 4000,   title: "🔥 (On Fire)" },
  { minXP: 3000,   title: "🌳 (Tree)" },
  { minXP: 2000,   title: "💪 (Flex)" },
  { minXP: 1000,   title: "🌿 (Sproutling)" },
  { minXP: 0,      title: "🌱 (Seedling)" }
];

function getLevelIndex(levels, xp) {
  for (let i=0;i<levels.length;i++){
    if (xp >= levels[i].minXP) return i;
  }
  return levels.length-1;
}
function getLevelTitle(levels, xp) {
  return levels[getLevelIndex(levels, xp)].title;
}
function progressToNext(levels, xp) {
  const idx = getLevelIndex(levels, xp);
  const curMin = levels[idx].minXP;
  const nextIdx = idx - 1;
  if (nextIdx < 0) return { pct:100, curMin, nextMin:curMin, isMax:true };
  const nextMin = levels[nextIdx].minXP;
  const span = Math.max(1, nextMin - curMin);
  const into = Math.min(span, Math.max(0, xp - curMin));
  return { pct: Math.round((into/span)*100), curMin, nextMin, isMax:false };
}

/* ---------- Badges / Actions ---------- */
const CORE_BADGES = ["🌟","🐝","⏱","🙌","🎨","🗣️","📅","⚡","🎂","🖌️","🍡","🤠","🍟","🧁","🧼","🗑️","🧹","🅿️","🛡️","🔥"];

const ACTIONS = [
  { symbol:"🌟", label:"Customer Shoutout", xp:250, badgeType:"core", desc:"Guest mentions them in survey or to manager." },
  { symbol:"🐝", label:"Busy Bee", xp:200, badgeType:"core", desc:"Great attitude + hustle, manager approved." },
  { symbol:"⏱", label:"Speed & Accuracy", xp:100, badgeType:"core", desc:"Zero mistakes + under window-time target." },
  { symbol:"🙌", label:"Team Spirit", xp:50, badgeType:"core", desc:"2 manager-approved recognition cards." },
  { symbol:"🎨", label:"Presentation", xp:50, badgeType:"core", desc:"Perfect build; chill within ±0.5oz; photo posted." },
  { symbol:"🗣️", label:"Huddle Participation", xp:30, badgeType:"core", desc:"Participate in pre-shift huddles." },
  { symbol:"📅", label:"Schedule Check", xp:20, badgeType:"core", desc:"Schedule/readiness behavior." },
  { symbol:"⚡", label:"Quick Response", xp:50, badgeType:"core", desc:"Fast, reliable response." },
  { symbol:"🎂", label:"Cakes/Novelties", xp:50, badgeType:"core", desc:"Positive cakes/novelties contribution." },
  { symbol:"🧼", label:"Wash Dishes", xp:30, badgeType:"core", desc:"Wash dishes; sink cleaned; stored upside down." },
  { symbol:"🧹", label:"Deep Cleaning", xp:100, badgeType:"core", desc:"Deep clean with equipment pulled out; verified." },
  { symbol:"🗑️", label:"Take Out Trash", xp:30, badgeType:"core", desc:"Trash out; photo as needed." },
  { symbol:"🅿️", label:"Parking Lot Check", xp:75, badgeType:"core", desc:"15-minute lot check (shorter if cold)." },
  { symbol:"🤠", label:"Cup Ranch", xp:75, badgeType:"core", desc:"Cup 2 pans of ranch; manager verifies." },
  { symbol:"🍟", label:"Hot Food Excellence", xp:50, badgeType:"core", desc:"Hot food station excellence." },
  { symbol:"🧁", label:"Cupcake Selling", xp:50, badgeType:"core", desc:"Suggestive selling cupcakes." },
  { symbol:"🍡", label:"Chill Excellence", xp:50, badgeType:"core", desc:"Chill station excellence." },
  { symbol:"🖌️", label:"Detail/Finish", xp:50, badgeType:"core", desc:"Detail work; finishing." },
  { symbol:"🛡️", label:"Trifecta Bonus", xp:50, badgeType:"core", desc:"3 badges in separate categories in a day." },
  { symbol:"🔥", label:"On Fire Streak", xp:125, badgeType:"core", desc:"5+ badges in separate categories in a day." },

  { symbol:"🔮", label:"Name Your Team", xp:250, badgeType:"specialty", desc:"Team names as a group; managers vote." },
  { symbol:"🎓", label:"Train Someone", xp:250, badgeType:"specialty", desc:"Train a new person; manager approved." },
  { symbol:"🤝", label:"Cover a Shift", xp:250, badgeType:"specialty", desc:"Cover a shift (policy applies)." },
  { symbol:"🧨", label:"Last-4 Power Play", xp:500, badgeType:"specialty", desc:"Option A: stay on assigned team." },
  { symbol:"🎉", label:"Celebration Alert", xp:500, badgeType:"specialty", desc:"Double XP window event." },
  { symbol:"☄️", label:"Celebration Bonus", xp:750, badgeType:"specialty", desc:"Bonus XP window event." },
  { symbol:"💯", label:"100 Tasks", xp:2000, badgeType:"specialty", desc:"Hit 100 tasks overall." },
  { symbol:"🌈", label:"Rainbow Champion", xp:800, badgeType:"specialty", desc:"Earn all 20 core badges." }
];

const QUICK_EMOJIS = ["🌟","🐝","⏱","🙌","🎨","🗣️","⚡","🎂","🧼","🧹"];

function actionBySymbol(sym){ return ACTIONS.find(a => a.symbol===sym) || null; }

/* ---------- State ---------- */
let state = null;
let selectedTeamId = null;
let modalContext = null;

/* ---------- Load seed then LocalStorage ---------- */
async function loadSeedJSON() {
  const res = await fetch("state.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load state.json");
  return await res.json();
}

function loadStateFromLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ---------- Finders ---------- */
function findTeam(id){ return state.teams.find(t => t.id===id) || null; }
function findPlayer(id){ return state.players.find(p => p.id===id) || null; }

function rainbowCount(player) {
  const set = new Set((player.coreBadges||[]).filter(b=>CORE_BADGES.includes(b)));
  return set.size;
}
function ensureRainbowBadge(player){
  if (rainbowCount(player) >= 20) {
    player.specialtyBadges = player.specialtyBadges || [];
    if (!player.specialtyBadges.includes("🌈")) player.specialtyBadges.push("🌈");
  }
}

/* ---------- Spins on level up (rank jump) ---------- */
function computeSpinsOnLevelUp(player, oldXP, newXP) {
  const oldIdx = getLevelIndex(PLAYER_LEVELS, oldXP);
  const newIdx = getLevelIndex(PLAYER_LEVELS, newXP);
  const oldRank = PLAYER_LEVELS.length - oldIdx;
  const newRank = PLAYER_LEVELS.length - newIdx;
  const gained = Math.max(0, newRank - oldRank);
  if (gained > 0) player.spinsAvailable = (player.spinsAvailable || 0) + gained;
  return gained;
}

/* ---------- Award (NO ADMIN) + AUDIT LOG ---------- */
function awardEmojiToPlayer(playerId, symbol, qty=1) {
  const player = findPlayer(playerId);
  if (!player) return;

  const team = findTeam(player.teamId);
  const act = actionBySymbol(symbol);
  const xpEach = act ? act.xp : 0;
  const xpDelta = xpEach * qty;

  const beforeXP = player.xp || 0;
  const beforeSpins = player.spinsAvailable || 0;

  const oldXP = player.xp || 0;
  player.xp = oldXP + xpDelta;

  // badge placement
  if (act) {
    if (act.badgeType === "core") {
      player.coreBadges = player.coreBadges || [];
      if (CORE_BADGES.includes(symbol) && !player.coreBadges.includes(symbol)) player.coreBadges.push(symbol);
    } else {
      player.specialtyBadges = player.specialtyBadges || [];
      if (!player.specialtyBadges.includes(symbol)) player.specialtyBadges.push(symbol);
    }
  } else if (CORE_BADGES.includes(symbol)) {
    player.coreBadges = player.coreBadges || [];
    if (!player.coreBadges.includes(symbol)) player.coreBadges.push(symbol);
  }

  ensureRainbowBadge(player);
  const gainedSpins = computeSpinsOnLevelUp(player, oldXP, player.xp || 0);

  const m = nowMeta();
  const awardedBy = (document.getElementById("awardedByInput")?.value || "").trim();

  state.logs = state.logs || [];
  state.logs.unshift({
    id: uid("log"),
    kind: "award",
    tsISO: m.iso,
    tsLocal: m.local,
    tz: m.tz,
    epochMs: m.epochMs,

    deviceId: DEVICE_ID,
    userAgent: navigator.userAgent,

    awardedBy: awardedBy || null,

    playerId: player.id,
    playerName: player.name,
    teamId: player.teamId,
    teamName: team ? team.name : "",

    symbol,
    actionLabel: act ? act.label : "Award",
    qty,
    xpEach,
    xpDelta,

    beforeXP,
    afterXP: player.xp || 0,

    beforeSpins,
    gainedSpins,
    afterSpins: player.spinsAvailable || 0
  });

  // cap logs
  if (state.logs.length > 1000) state.logs = state.logs.slice(0, 1000);

  saveState();
  renderAll();
  showToast(`+${fmt(xpDelta)} ${symbol}`, `${player.name} • ${act ? act.label : "Award"} • ${m.local}`, null);
}

/* ---------- Views ---------- */
function setView(viewId) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(viewId).classList.add("active");

  document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
  document.querySelector(`.tab[data-view="${viewId}"]`)?.classList.add("active");

  if (viewId === "activityView") renderActivity();
}

/* ---------- Toast ---------- */
function showToast(title, subtitle) {
  const wrap = document.getElementById("toastWrap");
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `
    <div>
      <strong>${title}</strong>
      <div class="sub">${subtitle}</div>
    </div>
    <div class="btns">
      <button class="mini">OK</button>
    </div>
  `;
  el.querySelector("button.mini").addEventListener("click", () => el.remove());
  wrap.prepend(el);
  setTimeout(() => el.remove(), 7000);
}

/* ---------- Render ---------- */
function renderOverview() {
  const teamTiles = document.getElementById("overviewTeamTiles");
  teamTiles.innerHTML = "";

  state.teams.forEach(t => {
    const prog = progressToNext(TEAM_LEVELS, t.xp || 0);
    const title = getLevelTitle(TEAM_LEVELS, t.xp || 0);

    const el = document.createElement("div");
    el.className = "team-tile";
    el.innerHTML = `
      <div class="team-top">
        <div>
          <div class="team-name">${t.name}</div>
          <div class="team-row-sub">${title}</div>
        </div>
        <div class="team-emoji">${t.mascot || "🍦"}</div>
      </div>
      <div class="progress"><div style="width:${prog.pct}%"></div></div>
      <div class="small muted">${prog.isMax ? "Max Team Level" : `Next: ${fmt(prog.nextMin)} XP`}</div>
      <div class="small" style="margin-top:8px;">
        <strong>${fmt(t.xp||0)}</strong> XP • Bank <strong>${fmt(t.teamBankXp||0)}</strong>
      </div>
    `;
    el.addEventListener("click", () => {
      setView("teamsView");
      selectedTeamId = t.id;
      renderTeams();
    });
    teamTiles.appendChild(el);
  });

  const rainbowList = document.getElementById("overviewRainbowList");
  const sorted = [...state.players].sort((a,b) => {
    const am = 20 - rainbowCount(a);
    const bm = 20 - rainbowCount(b);
    if (am !== bm) return am - bm;
    return (b.xp||0) - (a.xp||0);
  }).slice(0, 10);

  rainbowList.innerHTML = "";
  sorted.forEach(p => {
    const missing = 20 - rainbowCount(p);
    const el = document.createElement("div");
    el.className = "list-item";
    el.innerHTML = `
      <div class="list-left">
        <div class="avatar">${findTeam(p.teamId)?.mascot || "🍦"}</div>
        <div>
          <div class="list-name">${p.name}</div>
          <div class="list-sub">${getLevelTitle(PLAYER_LEVELS, p.xp||0)} • Missing ${missing}</div>
        </div>
      </div>
      <div class="right-strong">${rainbowCount(p)}/20</div>
    `;
    rainbowList.appendChild(el);
  });

  const spinsList = document.getElementById("overviewSpinsList");
  const spinsSorted = [...state.players].filter(p => (p.spinsAvailable||0) > 0)
    .sort((a,b) => (b.spinsAvailable||0) - (a.spinsAvailable||0))
    .slice(0, 15);

  spinsList.innerHTML = "";
  if (spinsSorted.length === 0) {
    spinsList.innerHTML = `<div class="list-item"><div class="list-left"><div class="avatar">🎰</div><div><div class="list-name">No spins pending</div><div class="list-sub">Level-ups add spins automatically.</div></div></div><div class="right-strong">0</div></div>`;
  } else {
    spinsSorted.forEach(p => {
      const el = document.createElement("div");
      el.className = "list-item";
      el.innerHTML = `
        <div class="list-left">
          <div class="avatar">🎰</div>
          <div>
            <div class="list-name">${p.name}</div>
            <div class="list-sub">${findTeam(p.teamId)?.name || ""}</div>
          </div>
        </div>
        <div class="right-strong">${p.spinsAvailable}</div>
      `;
      spinsList.appendChild(el);
    });
  }
}

function renderTeams() {
  const list = document.getElementById("teamList");
  list.innerHTML = "";

  state.teams.forEach(t => {
    const active = t.id === selectedTeamId;
    const el = document.createElement("div");
    el.className = `team-row ${active ? "active" : ""}`;
    el.innerHTML = `
      <div class="team-row-left">
        <div class="avatar">${t.mascot || "🍦"}</div>
        <div>
          <div class="team-row-title">${t.name}</div>
          <div class="team-row-sub">${getLevelTitle(TEAM_LEVELS, t.xp||0)}</div>
        </div>
      </div>
      <div class="team-row-xp">${fmt(t.xp||0)} XP</div>
    `;
    el.addEventListener("click", () => {
      selectedTeamId = t.id;
      renderTeams();
    });
    list.appendChild(el);
  });

  const detail = document.getElementById("teamDetail");
  const team = selectedTeamId ? findTeam(selectedTeamId) : null;

  if (!team) {
    detail.innerHTML = `
      <div class="empty-state">
        <div class="empty-emoji">🧭</div>
        <div class="empty-title">Pick a team</div>
        <div class="empty-sub">You’ll see the roster + award buttons.</div>
      </div>`;
    return;
  }

  const prog = progressToNext(TEAM_LEVELS, team.xp || 0);
  const teamLevelTitle = getLevelTitle(TEAM_LEVELS, team.xp || 0);

  const rosterPlayers = state.players
    .filter(p => p.teamId === team.id)
    .sort((a,b) => (b.xp||0) - (a.xp||0));

  detail.innerHTML = `
    <div class="team-detail-inner">
      <div class="team-detail-head">
        <div class="detail-title">
          <div class="avatar">${team.mascot || "🍦"}</div>
          <div>
            <div class="player-name">${team.name}</div>
            <div class="small muted">${teamLevelTitle} • ${prog.isMax ? "MAX" : `Next: ${fmt(prog.nextMin)} XP`}</div>
          </div>
        </div>

        <div class="badge-row" style="justify-content:flex-end;">
          <span class="badge">Team XP: ${fmt(team.xp||0)}</span>
          <span class="badge">Bank XP: ${fmt(team.teamBankXp||0)}</span>
          <span class="badge">Captain: ${team.captain||"-"}</span>
          <span class="badge">Mentor: ${team.mentor||"-"}</span>
        </div>
      </div>

      <div class="progress"><div style="width:${prog.pct}%"></div></div>

      <div class="roster" style="margin-top:12px;">
        ${rosterPlayers.map(p => renderPlayerCard(p)).join("")}
      </div>
    </div>
  `;

  bindPlayerCardEvents(detail);
}

function renderPlayerCard(player) {
  const prog = progressToNext(PLAYER_LEVELS, player.xp || 0);
  const levelTitle = getLevelTitle(PLAYER_LEVELS, player.xp || 0);
  const coreCount = rainbowCount(player);
  const missing = 20 - coreCount;

  const team = findTeam(player.teamId);
  const spins = player.spinsAvailable || 0;

  const coreBadges = (player.coreBadges || []).filter(b => CORE_BADGES.includes(b)).slice(0, 14);
  const specialtyBadges = (player.specialtyBadges || []).slice(0, 12);
  const negatives = (player.negatives || []).slice(0, 12);

  const quickBtns = QUICK_EMOJIS.map(sym =>
    `<button class="quick-btn" data-award="${sym}" title="${actionBySymbol(sym)?.label || ""}">${sym}</button>`
  ).join("");
  const moreBtn = `<button class="quick-btn more" data-more="1">More…</button>`;

  return `
    <div class="player-card" data-player-id="${player.id}">
      <div class="player-top">
        <div>
          <div class="player-name">${player.name}</div>
          <div class="small muted">${team?.name || ""}</div>
        </div>
        <div class="role">${player.role}</div>
      </div>

      <div class="stat-row"><span>XP</span><div class="right-strong">${fmt(player.xp||0)}</div></div>

      <div class="level-row">
        <div>
          <div class="level-title">${levelTitle}</div>
          <div class="level-sub">${prog.isMax ? "MAX level" : `Next: ${fmt(prog.nextMin)} XP`}</div>
        </div>
        <div class="right-strong">${prog.pct}%</div>
      </div>
      <div class="progress"><div style="width:${prog.pct}%"></div></div>

      <div class="stat-row">
        <span>Rainbow</span>
        <div class="right-strong">${coreCount}/20 ${coreCount>=20 ? "🌈" : ""} <span class="small muted">(missing ${missing})</span></div>
      </div>

      <div class="stat-row">
        <span>🎰 Spins</span>
        <div class="right-strong">${spins}</div>
      </div>

      <div style="margin-top:10px;">
        <div class="small muted" style="margin-bottom:6px;">Quick Award</div>
        <div class="quick-row">${quickBtns}${moreBtn}</div>
      </div>

      <div style="margin-top:10px;">
        <div class="small muted" style="margin-bottom:6px;">Core Badges</div>
        ${coreBadges.length ? `<div class="badge-row">${coreBadges.map(b=>`<span class="badge">${b}</span>`).join("")}</div>` : `<div class="small muted">None</div>`}
      </div>

      <div style="margin-top:10px;">
        <div class="small muted" style="margin-bottom:6px;">Specialty</div>
        ${specialtyBadges.length ? `<div class="badge-row">${specialtyBadges.map(b=>`<span class="badge">${b}</span>`).join("")}</div>` : `<div class="small muted">None</div>`}
      </div>

      <div style="margin-top:10px;">
        <div class="small muted" style="margin-bottom:6px;">Negatives</div>
        ${negatives.length ? `<div class="badge-row">${negatives.map(b=>`<span class="badge">${b}</span>`).join("")}</div>` : `<div class="small muted">None</div>`}
      </div>
    </div>
  `;
}

function bindPlayerCardEvents(rootEl=document) {
  rootEl.querySelectorAll(".player-card").forEach(card => {
    const playerId = card.getAttribute("data-player-id");
    if (!playerId) return;

    card.querySelectorAll("button[data-award]").forEach(btn => {
      btn.addEventListener("click", () => {
        const sym = btn.getAttribute("data-award");
        awardEmojiToPlayer(playerId, sym, 1);
      });
    });

    const moreBtn = card.querySelector("button[data-more]");
    if (moreBtn) {
      moreBtn.addEventListener("click", () => openActionPicker(playerId));
    }
  });
}

function populatePlayersTeamFilter() {
  const sel = document.getElementById("playersFilterTeam");
  sel.innerHTML = `<option value="all">All</option>` + state.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join("");
}

function renderPlayers() {
  const teamSel = document.getElementById("playersFilterTeam");
  const roleSel = document.getElementById("playersFilterRole");
  const q = (document.getElementById("playersSearch").value || "").trim().toLowerCase();

  const teamFilter = teamSel.value || "all";
  const roleFilter = roleSel.value || "all";

  const list = state.players
    .filter(p => teamFilter === "all" ? true : p.teamId === teamFilter)
    .filter(p => roleFilter === "all" ? true : p.role === roleFilter)
    .filter(p => q ? p.name.toLowerCase().includes(q) : true)
    .sort((a,b) => (b.xp||0) - (a.xp||0));

  const grid = document.getElementById("playersGrid");
  grid.innerHTML = list.map(p => renderPlayerCard(p)).join("");
  bindPlayerCardEvents(grid);
}

function renderActivity() {
  const list = document.getElementById("activityList");
  const q = (document.getElementById("logSearch").value || "").trim().toLowerCase();
  const limit = parseInt(document.getElementById("logLimit").value, 10) || 100;

  const logs = (state.logs || []).slice(0, limit).filter(l => {
    if (!q) return true;
    const blob = [
      l.playerName, l.teamName, l.symbol, l.actionLabel, l.awardedBy,
      l.tsISO, l.tsLocal, l.deviceId
    ].join(" ").toLowerCase();
    return blob.includes(q);
  });

  if (logs.length === 0) {
    list.innerHTML = `<div class="activity-row"><div><div><strong>No log entries</strong></div><div class="meta">Award points to generate audit logs.</div></div></div>`;
    return;
  }

  list.innerHTML = logs.map(l => {
    const who = l.awardedBy ? `Awarded by: <strong>${escapeHtml(l.awardedBy)}</strong>` : `Awarded by: <span class="muted">Unknown</span>`;
    return `
      <div class="activity-row">
        <div>
          <div><strong>+${fmt(l.xpDelta)} ${l.symbol}</strong> → <strong>${escapeHtml(l.playerName)}</strong> <span class="muted">(${escapeHtml(l.teamName)})</span></div>
          <div class="meta">
            ${escapeHtml(l.actionLabel)} • ${who}<br/>
            Time: <strong>${escapeHtml(l.tsLocal)}</strong> <span class="muted">(${escapeHtml(l.tz || "")})</span><br/>
            ISO: <span class="muted">${escapeHtml(l.tsISO)}</span><br/>
            Device: <span class="muted">${escapeHtml(l.deviceId)}</span><br/>
            XP: <strong>${fmt(l.beforeXP)}</strong> → <strong>${fmt(l.afterXP)}</strong>
            ${l.gainedSpins ? ` • Spins: <strong>${fmt(l.beforeSpins)}</strong> → <strong>${fmt(l.afterSpins)}</strong> (+${l.gainedSpins})` : ``}
          </div>
        </div>
        <div class="right-strong">${fmt(l.xpDelta)}</div>
      </div>
    `;
  }).join("");
}

function escapeHtml(s){
  if (s === null || s === undefined) return "";
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}

/* ---------- Modal Action Picker ---------- */
const modalOverlay = document.getElementById("modalOverlay");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalCancelBtn = document.getElementById("modalCancelBtn");
const actionGrid = document.getElementById("actionGrid");
const actionSearch = document.getElementById("actionSearch");

function openActionPicker(playerId){
  modalContext = { playerId };
  actionSearch.value = "";
  renderActionGrid("");
  modalOverlay.classList.add("show");
  setTimeout(() => actionSearch.focus(), 50);
}
function closeModal(){
  modalOverlay.classList.remove("show");
  modalContext = null;
}
function renderActionGrid(filter){
  const q = (filter||"").trim().toLowerCase();
  const list = ACTIONS
    .filter(a => !q ? true : (a.label + " " + a.symbol + " " + (a.desc||"")).toLowerCase().includes(q))
    .sort((a,b) => b.xp - a.xp);

  actionGrid.innerHTML = "";
  list.forEach(a => {
    const el = document.createElement("div");
    el.className = "action-item";
    el.innerHTML = `
      <div class="action-emoji">${a.symbol}</div>
      <div class="action-label">${a.label}</div>
      <div class="action-xp">+${fmt(a.xp)} XP</div>
      <div class="tiny muted" style="margin-top:6px;line-height:1.25;">${escapeHtml(a.desc||"")}</div>
    `;
    el.addEventListener("click", () => {
      if (!modalContext) return;
      awardEmojiToPlayer(modalContext.playerId, a.symbol, 1);
      closeModal();
    });
    actionGrid.appendChild(el);
  });
}

modalCloseBtn?.addEventListener("click", closeModal);
modalCancelBtn?.addEventListener("click", closeModal);
modalOverlay?.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
actionSearch?.addEventListener("input", (e) => renderActionGrid(e.target.value));

/* ---------- Export / Import ---------- */
function downloadJSON(filename, obj){
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportState(){
  downloadJSON("LevelUpDQ_export.json", state);
}
async function copyExport(){
  const txt = JSON.stringify(state, null, 2);
  await navigator.clipboard.writeText(txt);
  showToast("Copied", "Export JSON copied to clipboard.", null);
}

function importStateObject(obj){
  // minimal sanity checks
  if (!obj || !Array.isArray(obj.teams) || !Array.isArray(obj.players)) {
    alert("Invalid JSON: expected { teams:[], players:[] }");
    return;
  }
  state = obj;
  state.logs = state.logs || [];
  saveState();
  selectedTeamId = state.teams[0]?.id || null;
  renderAll();
  showToast("Imported", "State loaded successfully.", null);
}

/* ---------- Render All ---------- */
function renderAll(){
  document.getElementById("deviceLine").textContent =
    `Device ID: ${DEVICE_ID} • ${new Date().toLocaleString()}`;

  renderOverview();
  renderTeams();
  renderPlayers();
  renderActivity();
}

/* ---------- Boot ---------- */
(async function boot(){
  // Wire tabs
  document.getElementById("tabs")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab");
    if (!btn) returnùreturn;
    setView(btn.getAttribute("data-view"));
  });

  // Quick top buttons
  document.getElementById("btnQuickExport")?.addEventListener("click", exportState);
  document.getElementById("btnQuickImport")?.addEventListener("click", () => setView("settingsView"));
  document.getElementById("btnHardRefresh")?.addEventListener("click", () => location.reload(true));

  // Settings buttons
  document.getElementById("btnExport")?.addEventListener("click", exportState);
  document.getElementById("btnCopyExport")?.addEventListener("click", copyExport);
  document.getElementById("btnClearPaste")?.addEventListener("click", () => (document.getElementById("importText").value=""));

  document.getElementById("btnImportPaste")?.addEventListener("click", () => {
    const txt = document.getElementById("importText").value.trim();
    if (!txt) return alert("Paste JSON first.");
    try {
      importStateObject(JSON.parse(txt));
    } catch {
      alert("Invalid JSON.");
    }
  });

  document.getElementById("importFile")?.addEventListener("change", async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const txt = await f.text();
    try { importStateObject(JSON.parse(txt)); }
    catch { alert("Invalid JSON file."); }
    e.target.value = "";
  });

  document.getElementById("btnReset")?.addEventListener("click", async () => {
    if (!confirm("Reset this device to seed? This wipes LocalStorage.")) return;
    localStorage.removeItem(STORAGE_KEY);
    const seed = await loadSeedJSON();
    state = seed;
    state.logs = state.logs || [];
    saveState();
    selectedTeamId = state.teams[0]?.id || null;
    renderAll();
    showToast("Reset complete", "Seed restored to this device.", null);
  });

  // Filters
  document.getElementById("playersFilterTeam")?.addEventListener("change", renderPlayers);
  document.getElementById("playersFilterRole")?.addEventListener("change", renderPlayers);
  document.getElementById("playersSearch")?.addEventListener("input", renderPlayers);

  document.getElementById("logSearch")?.addEventListener("input", renderActivity);
  document.getElementById("logLimit")?.addEventListener("change", renderActivity);

  // Load state: local first, else seed.json
  const local = loadStateFromLocal();
  if (local) {
    state = local;
    state.logs = state.logs || [];
  } else {
    state = await loadSeedJSON();
    state.logs = state.logs || [];
    saveState();
  }

  // Ensure selected team
  selectedTeamId = state.teams[0]?.id || null;

  populatePlayersTeamFilter();
  renderAll();
  setView("overviewView");
})();
