/* LEVEL UP AT DQ — Full App JS (LocalStorage App)
   Admin PIN: 2112
*/

/* =========================
   ADMIN PIN GATE
========================= */
const ADMIN_PIN = "2112";
const ADMIN_FLAG_KEY = "levelUpDQ_adminUnlocked_v1"; // device-specific unlock

function isAdminUnlocked() {
  return localStorage.getItem(ADMIN_FLAG_KEY) === "yes";
}

function lockAdmin() {
  localStorage.removeItem(ADMIN_FLAG_KEY);
  showToast("Admin locked", "This device is now view-only.", null);
  renderAllWithBindings();
}

function requireAdminPin(onSuccess) {
  if (isAdminUnlocked()) {
    onSuccess?.();
    return true;
  }
  const pin = prompt("Enter Admin PIN");
  if (pin === null) return false;
  if (String(pin).trim() === ADMIN_PIN) {
    localStorage.setItem(ADMIN_FLAG_KEY, "yes");
    showToast("Admin unlocked", "Editing enabled on this device.", null);
    onSuccess?.();
    renderAllWithBindings();
    return true;
  }
  alert("Incorrect PIN");
  return false;
}

/* =========================
   Storage
========================= */
const STORAGE_KEY = "levelUpDQ_appState_v1";

function uid(prefix="id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/* =========================
   Levels (from Column J)
========================= */
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
  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i].minXP) return i; // 0 is highest
  }
  return levels.length - 1;
}

function getLevelTitle(levels, xp) {
  return levels[getLevelIndex(levels, xp)].title;
}

function progressToNext(levels, xp) {
  const idx = getLevelIndex(levels, xp);
  const curMin = levels[idx].minXP;
  const nextIdx = idx - 1;
  if (nextIdx < 0) return { pct: 100, curMin, nextMin: curMin, isMax: true };
  const nextMin = levels[nextIdx].minXP;
  const span = Math.max(1, nextMin - curMin);
  const into = Math.min(span, Math.max(0, xp - curMin));
  return { pct: Math.round((into / span) * 100), curMin, nextMin, isMax: false };
}

/* =========================
   Badges / Actions
========================= */
const CORE_BADGES = ["🌟","🐝","⏱","🙌","🎨","🗣️","📅","⚡","🎂","🖌️","🍡","🤠","🍟","🧁","🧼","🗑️","🧹","🅿️","🛡️","🔥"];

const ACTIONS = [
  { symbol:"🌟", label:"Customer Shoutout", xp:250, isBadge:true, badgeType:"core", desc:"Guest mentions them in survey or to manager." },
  { symbol:"🐝", label:"Busy Bee", xp:200, isBadge:true, badgeType:"core", desc:"Great attitude + hustle, manager approved." },
  { symbol:"⏱", label:"Speed & Accuracy", xp:100, isBadge:true, badgeType:"core", desc:"Zero mistakes + under window-time target." },
  { symbol:"🙌", label:"Team Spirit", xp:50, isBadge:true, badgeType:"core", desc:"2 manager-approved recognition cards." },
  { symbol:"🎨", label:"Presentation", xp:50, isBadge:true, badgeType:"core", desc:"Perfect build; chill within ±0.5oz; photo posted." },
  { symbol:"🗣️", label:"Huddle Participation", xp:30, isBadge:true, badgeType:"core", desc:"Participate in pre-shift huddles." },
  { symbol:"📅", label:"Schedule Check", xp:20, isBadge:true, badgeType:"core", desc:"Schedule/readiness behavior." },
  { symbol:"⚡", label:"Quick Response", xp:50, isBadge:true, badgeType:"core", desc:"Fast, reliable response." },
  { symbol:"🎂", label:"Cakes/Novelties", xp:50, isBadge:true, badgeType:"core", desc:"Positive cakes/novelties contribution." },
  { symbol:"🧼", label:"Wash Dishes", xp:30, isBadge:true, badgeType:"core", desc:"Wash dishes; sink cleaned; stored upside down." },
  { symbol:"🧹", label:"Deep Cleaning", xp:100, isBadge:true, badgeType:"core", desc:"Deep clean with equipment pulled out; verified." },
  { symbol:"🗑️", label:"Take Out Trash", xp:30, isBadge:true, badgeType:"core", desc:"Trash out; photo as needed." },
  { symbol:"🅿️", label:"Parking Lot Check", xp:75, isBadge:true, badgeType:"core", desc:"15-minute lot check (shorter if cold)." },
  { symbol:"🤠", label:"Cup Ranch", xp:75, isBadge:true, badgeType:"core", desc:"Cup 2 pans of ranch; manager verifies." },
  { symbol:"🍟", label:"Hot Food Excellence", xp:50, isBadge:true, badgeType:"core", desc:"Hot food station excellence." },
  { symbol:"🧁", label:"Cupcake Selling", xp:50, isBadge:true, badgeType:"core", desc:"Suggestive selling cupcakes." },
  { symbol:"🍡", label:"Chill Excellence", xp:50, isBadge:true, badgeType:"core", desc:"Chill station excellence." },
  { symbol:"🖌️", label:"Detail/Finish", xp:50, isBadge:true, badgeType:"core", desc:"Detail work; finishing." },
  { symbol:"🛡️", label:"Trifecta Bonus", xp:50, isBadge:true, badgeType:"core", desc:"3 badges in separate categories in a day." },
  { symbol:"🔥", label:"On Fire Streak", xp:125, isBadge:true, badgeType:"core", desc:"5+ badges in separate categories in a day." },

  { symbol:"🔮", label:"Name Your Team", xp:250, isBadge:true, badgeType:"specialty", desc:"Team names as a group; managers vote." },
  { symbol:"🎓", label:"Train Someone", xp:250, isBadge:true, badgeType:"specialty", desc:"Train a new person; manager approved." },
  { symbol:"🤝", label:"Cover a Shift", xp:250, isBadge:true, badgeType:"specialty", desc:"Cover a shift (policy applies)." },
  { symbol:"🧨", label:"Last-4 Power Play", xp:500, isBadge:true, badgeType:"specialty", desc:"Option A: stay on assigned team." },
  { symbol:"🎉", label:"Celebration Alert", xp:500, isBadge:true, badgeType:"specialty", desc:"Double XP window event." },
  { symbol:"☄️", label:"Celebration Bonus", xp:750, isBadge:true, badgeType:"specialty", desc:"Bonus XP window event." },
  { symbol:"💯", label:"100 Tasks", xp:2000, isBadge:true, badgeType:"specialty", desc:"Hit 100 tasks overall." },
  { symbol:"🌈", label:"Rainbow Champion", xp:800, isBadge:true, badgeType:"specialty", desc:"Earn all 20 core badges." },
];

const QUICK_EMOJIS = ["🌟","🐝","⏱","🙌","🎨","🗣️","⚡","🎂","🧼","🧹"];

function actionBySymbol(sym) {
  return ACTIONS.find(a => a.symbol === sym) || null;
}

/* =========================
   Seed data (current state)
========================= */
const SEED = {
  version: 1,
  compactCards: false,
  teams: [
    { id:"team_choc", name:"🍫The Chocaholics", mascot:"🍫", xp:33050, items:262, teamBankXp:3400, teamBankItems:5235, captain:"Grace Paytes", mentor:"Lizzy Shelton" },
    { id:"team_allstars", name:"⭐ The All Stars🍦", mascot:"⭐", xp:30275, items:220, teamBankXp:4400, teamBankItems:7230, captain:"Alayna Channels", mentor:"McKenna Mackey" },
    { id:"team_cherry", name:"🍒Cherry Dippers", mascot:"🍒", xp:23950, items:166, teamBankXp:2200, teamBankItems:7390, captain:"Devon Turner", mentor:"Brooke Taulbee" },
    { id:"team_dynasty", name:"🐲DQ Dynasty", mascot:"🐲", xp:28400, items:212, teamBankXp:5100, teamBankItems:10630, captain:"Brealyn Jackson", mentor:"Kaden Kennedy" },
  ],
  players: [
    { id: uid("p"), name:"Grace Paytes", teamId:"team_choc", role:"Captain", xp:3325, items:22, coreBadges: ["🎂","🐝","🛡️","🍟","🤠"].filter(b=>CORE_BADGES.includes(b)), specialtyBadges:["🕹️","🎓","⏰","🔮","🥁","💳"], negatives:[], spinsAvailable: 1 },
    { id: uid("p"), name:"Lizzy Shelton", teamId:"team_choc", role:"Manager Mentor", xp:4140, items:37, coreBadges:["📅","🧼","🖌️","🅿️","🌟","🍡","🛡️","🐝","⚡","⏱","🤠"], specialtyBadges:["⏰","🧨","🔮"], negatives:[], spinsAvailable: 1 },
    { id: uid("p"), name:"Sonya Morris", teamId:"team_choc", role:"Player", xp:6790, items:54, coreBadges:["🎂","🤠","🧹","🛡️","🐝","🍡","🎨","🅿️","🌟","🔥","🧼","⏱","🙌"], specialtyBadges:["⏰","🧨","🔮"], negatives:[], spinsAvailable: 1 },
    { id: uid("p"), name:"Lariyah Dalton", teamId:"team_choc", role:"Player", xp:1900, items:9, coreBadges:["🌟","🐝"], specialtyBadges:["🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Faith Gillis", teamId:"team_choc", role:"Player", xp:5565, items:77, coreBadges:["🎂","🧼","🔥","🧹","🐝","🍡","🛡️","🍟","🖌️","🅿️","🌟","⚡","🎨","🤠","⏱"], specialtyBadges:["⏰","🎉","🔮","🥁","💳"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Victoria Johnson", teamId:"team_choc", role:"Player", xp:1825, items:10, coreBadges:["📅","🍡","🐝"], specialtyBadges:["🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Lucas Smithson", teamId:"team_choc", role:"Player", xp:2275, items:15, coreBadges:["🌟","🐝","📅","🍟","⚡"], specialtyBadges:["🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Jillian Allen", teamId:"team_choc", role:"Player", xp:2130, items:16, coreBadges:["📅","🐝"], specialtyBadges:["🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Emily Keniston", teamId:"team_choc", role:"Player", xp:2900, items:15, coreBadges:["🌟","🎂","🐝"], specialtyBadges:["🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Chloe Richardson", teamId:"team_choc", role:"Player", xp:2200, items:7, coreBadges:["🍟","⚡"], specialtyBadges:["🎓","⏰","🧨","🔮"], negatives:[], spinsAvailable: 0 },

    { id: uid("p"), name:"Alayna Channels", teamId:"team_allstars", role:"Captain", xp:7455, items:70, coreBadges:["🗣️","📅","⚡","🛡️","🐝","🍡","🧁","🧹","🔥","🗑️","🎨","🧼","⏱","🌟","🅿️","🍟","🖌️","🎂"], specialtyBadges:["🎓","⏰","🔮","💳"], negatives:[], spinsAvailable: 1 },
    { id: uid("p"), name:"McKenna Mackey", teamId:"team_allstars", role:"Manager Mentor", xp:2830, items:28, coreBadges:["🍡","🧼","🐝","⚡","🗣️","🍟","🎂","📅"], specialtyBadges:["⏰","🧨","🔮"], negatives:[], spinsAvailable: 1 },
    { id: uid("p"), name:"Hannah Barrett", teamId:"team_allstars", role:"Player", xp:4255, items:33, coreBadges:["🎂","🍟","🧼","🛡️","🐝","🧹","🌟"], specialtyBadges:["⏰","🧨","🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Ryan Smith", teamId:"team_allstars", role:"Player", xp:975, items:9, coreBadges:["🐝","🤠","🧹","🌟"], specialtyBadges:["🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Tyler Hart", teamId:"team_allstars", role:"Player", xp:1600, items:8, coreBadges:["🌟","🧁"], specialtyBadges:["🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Kenzie Davis", teamId:"team_allstars", role:"Player", xp:480, items:4, coreBadges:["🧼"], specialtyBadges:[], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Ava Furnish", teamId:"team_allstars", role:"Player", xp:6165, items:37, coreBadges:["🅿️","🖌️","🐝","🧼","🗑️","🛡️","🎂","🍟"], specialtyBadges:["⏰","🧨","🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Ethan Humphries", teamId:"team_allstars", role:"Player", xp:1850, items:8, coreBadges:["🐝"], specialtyBadges:["🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Jazmine Brown", teamId:"team_allstars", role:"Player", xp:2565, items:15, coreBadges:["🧼","🤠","🌟","🧁","🗣️"], specialtyBadges:["🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Dominic Allen", teamId:"team_allstars", role:"Player", xp:2100, items:8, coreBadges:["🌟","🧁"], specialtyBadges:["🔮"], negatives:[], spinsAvailable: 0 },

    { id: uid("p"), name:"Devon Turner", teamId:"team_cherry", role:"Captain", xp:5190, items:39, coreBadges:["🧹","📅","🖌️","🛡️","🤠","🍟","🔥","🌟","🙌","🅿️","🍡","🐝","🧼","🗣️","🗑️","🧁","🎂","⏱","🎨","⚡"], specialtyBadges:["🕹️","🎉","🎓","⏰","🔮","💳"], negatives:[], spinsAvailable: 1 },
    { id: uid("p"), name:"Brooke Taulbee", teamId:"team_cherry", role:"Manager Mentor", xp:8220, items:62, coreBadges:["🌟","🐝","🎂","📅","⚡","🍡","🛡️","🧼","🍟","🗑️","🅿️","🔥","🧁","⏱"], specialtyBadges:["🎓","⏰","🧨","🔮","🥁","💳"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Annie Keaton", teamId:"team_cherry", role:"Player", xp:2955, items:21, coreBadges:["🌟","📅","🗣️","⚡","🛡️","🍟","🍡","🐝"], specialtyBadges:["⏰","🧨","🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Seth Dixon", teamId:"team_cherry", role:"Player", xp:1885, items:11, coreBadges:["🌟","🐝","🖌️","🅿️","📅"], specialtyBadges:["🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Alivia Brewster", teamId:"team_cherry", role:"Player", xp:2385, items:12, coreBadges:["🌟","🧹","🐝","🍡","🎂"], specialtyBadges:["🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Kameryn Harris", teamId:"team_cherry", role:"Player", xp:1535, items:7, coreBadges:["🐝","🍡"], specialtyBadges:["🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Peyton Murphy", teamId:"team_cherry", role:"Player", xp:980, items:10, coreBadges:[], specialtyBadges:["🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Riley Hull", teamId:"team_cherry", role:"Player", xp:800, items:4, coreBadges:[], specialtyBadges:["🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Michael Willhite", teamId:"team_cherry", role:"Player", xp:1800, items:9, coreBadges:["🎂"], specialtyBadges:["🔮"], negatives:[], spinsAvailable: 0 },

    { id: uid("p"), name:"Brealyn Jackson", teamId:"team_dynasty", role:"Captain", xp:2355, items:17, coreBadges:["🧼","🎂","🅿️","🌟","🗣️","🧁"], specialtyBadges:["⏰","🧨","🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Kaden Kennedy", teamId:"team_dynasty", role:"Manager Mentor", xp:5530, items:44, coreBadges:["🅿️","📅","⚡","🧹","🖌️","🛡️","🗣️","🐝","🧁","🎂"], specialtyBadges:["⏰","🧨","🔮","💳"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Hannah Lanning", teamId:"team_dynasty", role:"Player", xp:1500, items:11, coreBadges:["🧹","📅"], specialtyBadges:["🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Vivian Moore", teamId:"team_dynasty", role:"Player", xp:6850, items:65, coreBadges:["🍡","🗣️","🧹","🅿️","🛡️","⚡","🖌️","🔥","🍟","🌟","🧼","⏱","🙌","🎨","🤠"], specialtyBadges:["🕹️","🎓","⏰","🧨","🔮","💳"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Conner Smithson", teamId:"team_dynasty", role:"Player", xp:2590, items:20, coreBadges:["🎂","🅿️","🗑️","🧼","🛡️","📅","🌟"], specialtyBadges:["⏰","🧨","🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Madden McAllister", teamId:"team_dynasty", role:"Player", xp:3150, items:15, coreBadges:["🎨"], specialtyBadges:["⏰","🧨","🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Nevaeh Nance", teamId:"team_dynasty", role:"Player", xp:2325, items:14, coreBadges:["🐝","🖌️","🍟"], specialtyBadges:["🔮"], negatives:[], spinsAvailable: 0 },
    { id: uid("p"), name:"Emma Brooks", teamId:"team_dynasty", role:"Player", xp:2725, items:16, coreBadges:["📅","🐝","🌟","🧼","🎂"], specialtyBadges:["🕹️","⏰","🎓"], negatives:["🦺"], spinsAvailable: 0 },
    { id: uid("p"), name:"Colton Zeiher", teamId:"team_dynasty", role:"Player", xp:1375, items:10, coreBadges:["📅"], specialtyBadges:["🕹️","⏰"], negatives:[], spinsAvailable: 1 }
  ],
  logs: [],
  wheelLogs: []
};

/* =========================
   App State
========================= */
let state = loadState() || deepClone(SEED);
saveState(state);

let selectedTeamId = null;
let lastUndoPayload = null;
let wheelLastUndo = null;

/* =========================
   Helpers
========================= */
function findTeam(teamId) {
  return state.teams.find(t => t.id === teamId) || null;
}
function findPlayer(playerId) {
  return state.players.find(p => p.id === playerId) || null;
}
function rainbowCount(player) {
  const set = new Set((player.coreBadges || []).filter(b => CORE_BADGES.includes(b)));
  return set.size;
}
function ensureRainbowBadge(player) {
  if (rainbowCount(player) >= 20) {
    if (!player.specialtyBadges) player.specialtyBadges = [];
    if (!player.specialtyBadges.includes("🌈")) player.specialtyBadges.push("🌈");
  }
}
function computeSpinsOnLevelUp(player, oldXP, newXP) {
  const oldIdx = getLevelIndex(PLAYER_LEVELS, oldXP);
  const newIdx = getLevelIndex(PLAYER_LEVELS, newXP);
  const oldRank = PLAYER_LEVELS.length - oldIdx;
  const newRank = PLAYER_LEVELS.length - newIdx;
  const gained = Math.max(0, newRank - oldRank);
  if (gained > 0) player.spinsAvailable = (player.spinsAvailable || 0) + gained;
  return gained;
}
function getTeamProgress(team) {
  return progressToNext(TEAM_LEVELS, team.xp || 0);
}
function getPlayerProgress(player) {
  return progressToNext(PLAYER_LEVELS, player.xp || 0);
}

/* =========================
   View
========================= */
function setView(viewId) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(viewId)?.classList.add("active");

  document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
  document.querySelector(`.tab[data-view="${viewId}"]`)?.classList.add("active");

  if (viewId === "wheelView") {
    renderWheel();
    wheelInitIfNeeded();
  }
}

/* =========================
   Toast
========================= */
function showToast(title, subtitle, onUndo) {
  const wrap = document.getElementById("toastWrap");
  if (!wrap) return;

  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `
    <div>
      <strong>${title}</strong>
      <div class="sub">${subtitle}</div>
    </div>
    <div class="btns">
      ${onUndo ? `<button class="mini">Undo</button>` : ``}
      <button class="mini">OK</button>
    </div>
  `;
  const btns = el.querySelectorAll("button.mini");
  const undoBtn = onUndo ? btns[0] : null;
  const okBtn = onUndo ? btns[1] : btns[0];

  if (undoBtn) {
    undoBtn.addEventListener("click", () => {
      onUndo();
      el.remove();
    });
  }
  okBtn.addEventListener("click", () => el.remove());

  wrap.prepend(el);
  setTimeout(() => { el.remove(); }, 8000);
}

/* =========================
   Award Logic (Admin-only)
========================= */
function awardEmojiToPlayer(playerId, symbol, qty = 1) {
  // Any state-changing action requires admin PIN
  if (!requireAdminPin(() => {})) return;

  const player = findPlayer(playerId);
  if (!player) return;

  const team = findTeam(player.teamId);
  const act = actionBySymbol(symbol);
  const xpEach = act ? act.xp : 0;
  const xpDelta = xpEach * qty;

  const snap = {
    type: "award",
    playerId,
    before: deepClone(player),
    teamBefore: team ? deepClone(team) : null,
    logsLenBefore: state.logs.length
  };

  const oldXP = player.xp || 0;
  player.xp = oldXP + xpDelta;

  if (act?.isBadge) {
    if (act.badgeType === "core" || CORE_BADGES.includes(symbol)) {
      player.coreBadges = player.coreBadges || [];
      if (!player.coreBadges.includes(symbol) && CORE_BADGES.includes(symbol)) player.coreBadges.push(symbol);
    } else if (act.badgeType === "specialty") {
      player.specialtyBadges = player.specialtyBadges || [];
      if (!player.specialtyBadges.includes(symbol)) player.specialtyBadges.push(symbol);
    }
  } else {
    if (CORE_BADGES.includes(symbol)) {
      player.coreBadges = player.coreBadges || [];
      if (!player.coreBadges.includes(symbol)) player.coreBadges.push(symbol);
    }
  }

  ensureRainbowBadge(player);

  const gainedSpins = computeSpinsOnLevelUp(player, oldXP, player.xp);

  const now = new Date();
  state.logs.unshift({
    id: uid("log"),
    ts: now.toISOString(),
    kind: "award",
    playerId,
    teamId: player.teamId,
    symbol,
    qty,
    xpDelta,
    label: act ? act.label : "Award",
    gainedSpins
  });
  if (state.logs.length > 250) state.logs.pop();

  saveState(state);
  renderAllWithBindings();

  lastUndoPayload = snap;

  const title = `+${fmt(xpDelta)} ${symbol} ${act ? act.label : ""}`.trim();
  const sub = gainedSpins > 0
    ? `Level up! +${gainedSpins} spin${gainedSpins===1?"":"s"} added.`
    : `Applied to ${player.name}.`;

  showToast(title, sub, () => undoLastAward());
}

function undoLastAward() {
  if (!lastUndoPayload || lastUndoPayload.type !== "award") return;
  if (!requireAdminPin(() => {})) return;

  const { playerId, before, teamBefore, logsLenBefore } = lastUndoPayload;
  const player = findPlayer(playerId);
  if (!player) return;

  Object.assign(player, before);

  if (teamBefore) {
    const team = findTeam(teamBefore.id);
    if (team) Object.assign(team, teamBefore);
  }

  state.logs = state.logs.slice(0, logsLenBefore);

  saveState(state);
  renderAllWithBindings();
  showToast("Undone", "Last award reverted.", null);
  lastUndoPayload = null;
}

/* =========================
   Modal: Action Picker (Admin-only)
========================= */
const modalOverlay = document.getElementById("modalOverlay");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalCancelBtn = document.getElementById("modalCancelBtn");
const actionGrid = document.getElementById("actionGrid");
const actionSearch = document.getElementById("actionSearch");
let modalContext = null;

function openActionPicker(playerId) {
  if (!requireAdminPin(() => {})) return;

  modalContext = { playerId };
  actionSearch.value = "";
  renderActionGrid("");
  modalOverlay.classList.add("show");
  setTimeout(() => actionSearch.focus(), 50);
}

function closeModal() {
  modalOverlay.classList.remove("show");
  modalContext = null;
}

function renderActionGrid(filter) {
  const q = (filter || "").trim().toLowerCase();
  const list = ACTIONS
    .filter(a => {
      if (!q) return true;
      return (a.label + " " + a.symbol + " " + (a.desc||"")).toLowerCase().includes(q);
    })
    .sort((a,b) => b.xp - a.xp);

  actionGrid.innerHTML = "";
  list.forEach(a => {
    const el = document.createElement("div");
    el.className = "action-item";
    el.innerHTML = `
      <div class="action-emoji">${a.symbol}</div>
      <div class="action-label">${a.label}</div>
      <div class="action-xp">+${fmt(a.xp)} XP</div>
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

/* =========================
   Render: Overview / Teams / Players / Activity
========================= */
function renderOverview() {
  const teamTiles = document.getElementById("overviewTeamTiles");
  if (!teamTiles) return;

  teamTiles.innerHTML = "";
  state.teams.forEach(t => {
    const prog = getTeamProgress(t);
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

      <div class="team-meta">
        <div class="meta-row"><span>Team XP</span><div>${fmt(t.xp||0)}</div></div>
        <div class="meta-row"><span>Team Bank</span><div>${fmt(t.teamBankXp||0)}</div></div>
        <div class="meta-row"><span>Captain</span><div>${t.captain || "-"}</div></div>
        <div class="meta-row"><span>Mentor</span><div>${t.mentor || "-"}</div></div>
        <div class="progress"><div style="width:${prog.pct}%"></div></div>
        <div class="small muted">${prog.isMax ? "Max Team Level" : `Next: ${fmt(prog.nextMin)} XP`}</div>
      </div>
    `;
    el.addEventListener("click", () => {
      setView("teamsView");
      selectedTeamId = t.id;
      renderTeamsWithBindings();
    });
    teamTiles.appendChild(el);
  });

  // Rainbow list
  const rainbowList = document.getElementById("overviewRainbowList");
  if (rainbowList) {
    const sorted = [...state.players].sort((a,b) => {
      const am = 20 - rainbowCount(a);
      const bm = 20 - rainbowCount(b);
      if (am !== bm) return am - bm;
      return (b.xp||0) - (a.xp||0);
    }).slice(0, 8);

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
  }

  // Spins list
  const spinsList = document.getElementById("overviewSpinsList");
  if (spinsList) {
    const spinsSorted = [...state.players].filter(p => (p.spinsAvailable||0) > 0)
      .sort((a,b) => (b.spinsAvailable||0) - (a.spinsAvailable||0))
      .slice(0, 10);

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
        el.addEventListener("click", () => {
          setView("wheelView");
          document.getElementById("wheelPlayerSelect").value = p.id;
          renderWheel();
        });
        spinsList.appendChild(el);
      });
    }
  }

  // Optional: show admin state somewhere if you have #adminStatus
  const adminStatus = document.getElementById("adminStatus");
  if (adminStatus) {
    adminStatus.textContent = isAdminUnlocked() ? "Admin: ON" : "Admin: OFF";
  }
}

function renderTeams() {
  const list = document.getElementById("teamList");
  if (!list) return;
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
      renderTeamsWithBindings();
    });
    list.appendChild(el);
  });

  const detail = document.getElementById("teamDetail");
  if (!detail) return;

  const team = selectedTeamId ? findTeam(selectedTeamId) : null;
  if (!team) {
    detail.innerHTML = `
      <div class="empty-state">
        <div class="empty-emoji">🧭</div>
        <div class="empty-title">Pick a team</div>
        <div class="empty-sub">You’ll see roster + quick award buttons.</div>
      </div>
    `;
    return;
  }

  const prog = getTeamProgress(team);
  const teamLevelTitle = getLevelTitle(TEAM_LEVELS, team.xp||0);

  const rosterPlayers = state.players
    .filter(p => p.teamId === team.id)
    .sort((a,b) => (b.xp||0) - (a.xp||0));

  const rosterHtml = rosterPlayers.map(p => renderPlayerCard(p)).join("");

  detail.innerHTML = `
    <div class="team-detail-inner">
      <div class="team-detail-head">
        <div>
          <div class="detail-title">
            <div class="emoji">${team.mascot || "🍦"}</div>
            <div>
              <div>${team.name}</div>
              <div class="detail-sub">${teamLevelTitle} • Next: ${prog.isMax ? "MAX" : fmt(prog.nextMin)} XP</div>
            </div>
          </div>
          <div style="margin-top:10px" class="progress"><div style="width:${prog.pct}%"></div></div>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <div class="badge-chip">Team XP: ${fmt(team.xp||0)}</div>
          <div class="badge-chip">Bank XP: ${fmt(team.teamBankXp||0)}</div>
          <div class="badge-chip">Captain: ${team.captain||"-"}</div>
          <div class="badge-chip">Mentor: ${team.mentor||"-"}</div>
        </div>
      </div>

      <div class="roster ${state.compactCards ? "compact" : ""}">
        ${rosterHtml}
      </div>
    </div>
  `;
}

function renderPlayerCard(player) {
  const prog = getPlayerProgress(player);
  const levelTitle = getLevelTitle(PLAYER_LEVELS, player.xp || 0);
  const coreCount = rainbowCount(player);
  const missing = 20 - coreCount;
  const team = findTeam(player.teamId);

  const spins = player.spinsAvailable || 0;

  const coreBadges = (player.coreBadges || [])
    .filter(b => CORE_BADGES.includes(b))
    .slice(0, 12);

  const specialtyBadges = (player.specialtyBadges || []).slice(0, 10);
  const negatives = (player.negatives || []).slice(0, 10);

  const canEdit = isAdminUnlocked();

  const quickBtns = QUICK_EMOJIS.map(sym =>
    `<button class="quick-btn" data-award="${sym}" title="${actionBySymbol(sym)?.label || ""}" ${canEdit ? "" : "disabled"}>${sym}</button>`
  ).join("");

  const moreBtn = `<button class="quick-btn more" data-more="1" ${canEdit ? "" : "disabled"}>More…</button>`;

  const negRow = negatives.length
    ? `<div class="badge-row">${negatives.map(n => `<span class="badge">${n}</span>`).join("")}</div>`
    : `<div class="small muted">No negatives</div>`;

  const specRow = specialtyBadges.length
    ? `<div class="badge-row">${specialtyBadges.map(b => `<span class="badge">${b}</span>`).join("")}</div>`
    : `<div class="small muted">No specialty badges</div>`;

  const coreRow = coreBadges.length
    ? `<div class="badge-row">${coreBadges.map(b => `<span class="badge">${b}</span>`).join("")}</div>`
    : `<div class="small muted">No core badges yet</div>`;

  const rainbowGlow = coreCount >= 20 ? ` style="outline:2px solid rgba(255,0,255,0.6); box-shadow:0 0 18px rgba(0,255,255,0.35)"` : "";

  return `
    <div class="player-card" data-player-id="${player.id}"${rainbowGlow}>
      <div class="player-top">
        <div>
          <div class="player-name">${player.name} ${coreCount>=20 ? "🌈" : ""}</div>
          <div class="small muted">${team?.name || ""}</div>
        </div>
        <div class="role">${player.role}</div>
      </div>

      <div class="stat-row"><span>XP</span><div>${fmt(player.xp||0)}</div></div>

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

      <div class="spin-mini">
        <div><strong>🎰 Spins</strong> <span class="small muted">(level-ups add spins)</span></div>
        <div class="right-strong">${spins}</div>
      </div>

      <div>
        <div class="small muted" style="margin-bottom:6px;">Quick Award ${canEdit ? "" : "• (Admin locked)"}</div>
        <div class="quick-row">${quickBtns}${moreBtn}</div>
      </div>

      <div>
        <div class="small muted" style="margin-bottom:6px;">Core Badges</div>
        ${coreRow}
      </div>

      <div>
        <div class="small muted" style="margin-bottom:6px;">Specialty</div>
        ${specRow}
      </div>

      <div>
        <div class="small muted" style="margin-bottom:6px;">Negatives</div>
        ${negRow}
      </div>

      <div class="quick-row">
        <button class="quick-btn more" data-wheel="1">Wheel →</button>
        <button class="quick-btn more" data-clearspins="1" ${canEdit ? "" : "disabled"}>Clear Spins</button>
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
        if (!requireAdminPin(() => {})) return;
        const sym = btn.getAttribute("data-award");
        awardEmojiToPlayer(playerId, sym, 1);
      });
    });

    const more = card.querySelector("button[data-more]");
    if (more) {
      more.addEventListener("click", () => {
        if (!requireAdminPin(() => {})) return;
        openActionPicker(playerId);
      });
    }

    const wheelBtn = card.querySelector("button[data-wheel]");
    if (wheelBtn) {
      wheelBtn.addEventListener("click", () => {
        setView("wheelView");
        document.getElementById("wheelPlayerSelect").value = playerId;
        renderWheel();
      });
    }

    const clearBtn = card.querySelector("button[data-clearspins]");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (!requireAdminPin(() => {})) return;
        const p = findPlayer(playerId);
        if (!p) return;
        const before = p.spinsAvailable || 0;
        p.spinsAvailable = 0;
        state.logs.unshift({
          id: uid("log"),
          ts: new Date().toISOString(),
          kind: "spin_adjust",
          playerId,
          teamId: p.teamId,
          symbol: "🎰",
          qty: 0,
          xpDelta: 0,
          label: "Clear Spins",
          gainedSpins: 0
        });
        saveState(state);
        renderAllWithBindings();
        showToast("Spins cleared", `${p.name}: ${before} → 0`, null);
      });
    }
  });
}

function renderPlayers() {
  const teamSel = document.getElementById("playersFilterTeam");
  const roleSel = document.getElementById("playersFilterRole");
  const searchEl = document.getElementById("playersSearch");
  const grid = document.getElementById("playersGrid");
  if (!teamSel || !roleSel || !searchEl || !grid) return;

  const q = (searchEl.value || "").trim().toLowerCase();
  const teamFilter = teamSel.value || "all";
  const roleFilter = roleSel.value || "all";

  const list = state.players
    .filter(p => teamFilter === "all" ? true : p.teamId === teamFilter)
    .filter(p => roleFilter === "all" ? true : p.role === roleFilter)
    .filter(p => q ? p.name.toLowerCase().includes(q) : true)
    .sort((a,b) => (b.xp||0) - (a.xp||0));

  grid.innerHTML = list.map(p => renderPlayerCard(p)).join("");
  bindPlayerCardEvents(grid);
}

function renderActivity() {
  const list = document.getElementById("activityList");
  if (!list) return;
  const logs = state.logs.slice(0, 60);

  if (logs.length === 0) {
    list.innerHTML = `<div class="activity-row"><div><div><strong>No activity yet</strong></div><div class="meta">Go to Teams → tap an emoji (Admin).</div></div></div>`;
    return;
  }

  list.innerHTML = logs.map(l => {
    const p = l.playerId ? findPlayer(l.playerId) : null;
    const t = l.teamId ? findTeam(l.teamId) : null;
    const when = new Date(l.ts).toLocaleString();
    return `
      <div class="activity-row">
        <div>
          <div><strong>${l.kind === "award" ? `+${fmt(l.xpDelta)} ${l.symbol}` : `${l.label || l.kind}`}</strong> ${p ? `→ ${p.name}` : ""}</div>
          <div class="meta">${t ? t.name : ""} • ${when}${l.gainedSpins ? ` • +${l.gainedSpins} spin(s)` : ""}</div>
        </div>
        <div class="right-strong">${l.kind === "award" ? fmt(l.xpDelta) : ""}</div>
      </div>
    `;
  }).join("");
}

function renderAll() {
  renderOverview();
  renderTeams();
  renderPlayers();
  renderActivity();
  renderWheelSelectors();
  renderWheelFeed();
}

/* =========================
   Wheel (Prize Roller integration)
========================= */
const wheelPrizes = [
  { text: "+$200 Team Bank", weight: 25, bg: "#7f8c8d", desc: "A solid contribution to the team funds." },
  { text: "+$500 Team Bank", weight: 8, bg: "#27ae60", desc: "Big money! A huge boost for the budget." },
  { text: "+$1000 Team Bank", weight: 3, bg: "#8e44ad", desc: "Make it rain! Serious cash injection.", textCol:"#fff" },
  { text: "$5 Starbucks Card", weight: 5, bg: "#2980b9", desc: "Caffeine fix! Get a $5 gift card.", textCol:"#fff" },
  { text: "Forced Trade", weight: 2, bg: "#c0392b", textCol:"#fff", desc: "OH NO. Swap places with another team.", isBad:true },
  { text: "Double XP Today", weight: 8, bg: "#27ae60", desc: "Grind mode. Points earned today are doubled." },
  { text: "Manager's Badge Pick", weight: 25, bg: "#7f8c8d", desc: "Manager chooses 1 Green Badge for you." },
  { text: "Super Sticker Power", weight: 8, bg: "#27ae60", desc: "3 Green badges distributed to your team." },
  { text: "Steal 1 Green Badge", weight: 8, bg: "#27ae60", desc: "Yoink! Take a green badge from a player." },
  { text: "Immunity Card", weight: 3, bg: "#8e44ad", textCol:"#fff", desc: "Untouchable. Gain immunity for 1 week." },
  { text: "Sabotage Block", weight: 8, bg: "#27ae60", desc: "Defense! Erase one ❌ or ⚠️." },
  { text: "Legendary: Remove 1 ☠️", weight: 0.5, bg: "#f1c40f", textCol:"#000", border:"4px solid white", desc: "THE HOLY GRAIL. Remove a skull.", isLegendary:true },
  { text: "Free 2 for $5", weight: 8, bg: "#27ae60", desc: "Snack time. Free 2 for $5 deal." },
  { text: "Steal Manager Meal", weight: 8, bg: "#27ae60", desc: "Dakota's lunch is now your lunch." }
];

const wheelEls = {
  belt: document.getElementById("wheelBelt"),
  spinBtn: document.getElementById("wheelSpinBtn"),
  refreshBtn: document.getElementById("wheelRefreshBtn"),
  resultTitle: document.getElementById("wheelResultTitle"),
  resultDesc: document.getElementById("wheelResultDesc"),
  rarityBadge: document.getElementById("wheelRarityBadge"),
  lootGrid: document.getElementById("wheelLootGrid"),
  feed: document.getElementById("wheelFeed"),
  playerSelect: document.getElementById("wheelPlayerSelect"),
  spinChip: document.getElementById("wheelSpinChip"),
  clearSpinsBtn: document.getElementById("wheelClearSpinsBtn"),
  clearHistoryBtn: document.getElementById("wheelClearHistoryBtn"),
  applyBox: document.getElementById("wheelApplyBox"),
  applySub: document.getElementById("wheelApplySub"),
  applyNowBtn: document.getElementById("wheelApplyNowBtn"),
  logOnlyBtn: document.getElementById("wheelLogOnlyBtn"),
  undoSpinBtn: document.getElementById("wheelUndoSpinBtn"),
  modalOverlay: document.getElementById("wheelModalOverlay"),
  modalTitle: document.getElementById("wheelModalTitle"),
  modalRarity: document.getElementById("wheelModalRarity"),
  modalDesc: document.getElementById("wheelModalDesc"),
  modalClose: document.getElementById("wheelModalCloseBtn"),
  modalOk: document.getElementById("wheelModalOkBtn")
};

let wheelInited = false;
let wheelRenderList = [];
const WHEEL_CARD_HEIGHT = 160;
const WHEEL_MULTIPLIER = 80;
let wheelPendingPrize = null;
let wheelPendingEffect = null;

function renderWheelSelectors() {
  const sel = wheelEls.playerSelect;
  if (!sel) return;

  const cur = sel.value;
  sel.innerHTML = state.players
    .slice()
    .sort((a,b) => a.name.localeCompare(b.name))
    .map(p => `<option value="${p.id}">${p.name} (${findTeam(p.teamId)?.mascot || "🍦"})</option>`)
    .join("");

  if (cur && state.players.some(p => p.id === cur)) sel.value = cur;
}

function selectedWheelPlayer() {
  const id = wheelEls.playerSelect?.value;
  return id ? findPlayer(id) : null;
}

function updateWheelSpinUI() {
  const p = selectedWheelPlayer();
  const spins = p ? (p.spinsAvailable || 0) : 0;
  if (wheelEls.spinChip) wheelEls.spinChip.textContent = `Spins Available: ${spins}`;
  if (wheelEls.spinBtn) wheelEls.spinBtn.disabled = spins <= 0;
  if (wheelEls.applyBox) wheelEls.applyBox.style.display = "none";
}

function wheelInitIfNeeded() {
  if (wheelInited) return;
  wheelInited = true;

  initWheelRoller();
  initWheelLootTable();
  renderWheelFeed();
  updateWheelSpinUI();

  wheelEls.playerSelect?.addEventListener("change", () => {
    resetWheelUI();
    updateWheelSpinUI();
  });

  wheelEls.spinBtn?.addEventListener("click", () => spinWheel());
  wheelEls.refreshBtn?.addEventListener("click", () => resetWheelUI());

  // Clearing spins is ADMIN-only
  wheelEls.clearSpinsBtn?.addEventListener("click", () => {
    if (!requireAdminPin(() => {})) return;
    const p = selectedWheelPlayer();
    if (!p) return;
    const before = p.spinsAvailable || 0;
    p.spinsAvailable = 0;
    saveState(state);
    updateWheelSpinUI();
    renderAllWithBindings();
    showToast("Spins cleared", `${p.name}: ${before} → 0`, null);
  });

  wheelEls.clearHistoryBtn?.addEventListener("click", () => {
    if (!requireAdminPin(() => {})) return;
    if (!confirm("Delete wheel history?")) return;
    state.wheelLogs = [];
    saveState(state);
    renderWheelFeed();
    showToast("Wheel history cleared", "Deleted.", null);
  });

  wheelEls.applyNowBtn?.addEventListener("click", () => applyWheelEffect(true));
  wheelEls.logOnlyBtn?.addEventListener("click", () => applyWheelEffect(false));
  wheelEls.undoSpinBtn?.addEventListener("click", () => undoLastWheelSpin());

  wheelEls.modalClose?.addEventListener("click", () => wheelEls.modalOverlay?.classList.remove("show"));
  wheelEls.modalOk?.addEventListener("click", () => wheelEls.modalOverlay?.classList.remove("show"));
  wheelEls.modalOverlay?.addEventListener("click", (e) => {
    if (e.target === wheelEls.modalOverlay) wheelEls.modalOverlay?.classList.remove("show");
  });
}

function initWheelRoller() {
  if (!wheelEls.belt) return;
  wheelEls.belt.innerHTML = "";
  wheelRenderList = [];
  for (let i=0; i<WHEEL_MULTIPLIER; i++) wheelRenderList = wheelRenderList.concat(wheelPrizes);

  wheelRenderList.forEach(item => {
    const card = document.createElement("div");
    card.className = "wheel-prize-card";
    card.style.backgroundColor = item.bg;
    if (item.textCol) card.style.color = item.textCol;
    if (item.border) card.style.border = item.border;
    if (item.isBad) card.style.border = "4px solid #ff003c";
    card.innerText = item.text;
    wheelEls.belt.appendChild(card);
  });
}

function wheelRarityInfo(prize) {
  if (prize.isLegendary) return { label: "LEGENDARY", color: "#f1c40f" };
  if (prize.isBad) return { label: "NEGATIVE", color: "#ff3355" };
  if (prize.weight <= 3) return { label: "EPIC", color: "#8e44ad" };
  if (prize.weight <= 5) return { label: "RARE", color: "#2980b9" };
  if (prize.weight <= 8) return { label: "UNCOMMON", color: "#2ecc71" };
  return { label: "COMMON", color: "#7f8c8d" };
}

function initWheelLootTable() {
  if (!wheelEls.lootGrid) return;
  wheelEls.lootGrid.innerHTML = "";
  const sorted = [...wheelPrizes].sort((a,b) => a.weight - b.weight);
  sorted.forEach(pr => {
    const info = wheelRarityInfo(pr);
    const el = document.createElement("div");
    el.className = "wheel-loot-item";
    el.innerHTML = `
      <div class="wheel-loot-name" style="color:${pr.textCol || "#fff"}">${pr.text}</div>
      <div class="wheel-loot-rarity" style="color:${info.color}">${info.label}</div>
      <div class="wheel-loot-bar" style="background:${pr.bg}"></div>
    `;
    el.addEventListener("click", () => {
      if (!wheelEls.modalOverlay) return;
      wheelEls.modalTitle.textContent = pr.text;
      wheelEls.modalRarity.textContent = info.label;
      wheelEls.modalRarity.style.color = info.color;
      wheelEls.modalDesc.textContent = pr.desc;
      wheelEls.modalOverlay.classList.add("show");
    });
    wheelEls.lootGrid.appendChild(el);
  });
}

function getWheelWeightedWinner() {
  const total = wheelPrizes.reduce((s,p) => s + p.weight, 0);
  let r = Math.random() * total;
  let idx = 0;
  for (let i=0; i<wheelPrizes.length; i++) {
    if (r < wheelPrizes[i].weight) { idx = i; break; }
    r -= wheelPrizes[i].weight;
  }
  const randomDepth = 0.6 + (Math.random() * 0.3);
  const targetSet = Math.floor(WHEEL_MULTIPLIER * randomDepth);
  const finalIndex = (targetSet * wheelPrizes.length) + idx;
  return { index: finalIndex, data: wheelPrizes[idx] };
}

function spinWheel() {
  const p = selectedWheelPlayer();
  if (!p) return;

  // Player spinning is allowed without admin
  const spins = p.spinsAvailable || 0;
  if (spins <= 0) {
    showToast("No spins available", "Level up to earn spins.", null);
    return;
  }

  if (!wheelEls.spinBtn || !wheelEls.belt) return;

  wheelEls.spinBtn.disabled = true;
  wheelEls.resultTitle.textContent = "SPINNING…";
  wheelEls.resultTitle.style.color = "#fff";
  wheelEls.resultDesc.textContent = "Good luck!";
  wheelEls.rarityBadge.textContent = "";
  if (wheelEls.applyBox) wheelEls.applyBox.style.display = "none";

  wheelEls.belt.style.transition = "none";
  wheelEls.belt.style.transform = "translateY(0px)";
  void wheelEls.belt.offsetWidth;
  wheelEls.belt.style.transition = "transform 6s cubic-bezier(0.1, 0.7, 0.1, 1)";

  const winner = getWheelWeightedWinner();
  const targetY = -(winner.index * WHEEL_CARD_HEIGHT);
  wheelEls.belt.style.transform = `translateY(${targetY}px)`;

  setTimeout(() => {
    handleWheelWin(winner.data);
  }, 6000);
}

function parseWheelEffect(prizeText) {
  const m = prizeText.match(/^\+\$(\d+)\s+Team Bank/i);
  if (m) return { kind: "teamBankXp", amount: parseInt(m[1], 10) || 0 };
  return null;
}

function handleWheelWin(prize) {
  const p = selectedWheelPlayer();
  if (!p) return;

  const info = wheelRarityInfo(prize);
  wheelEls.resultTitle.textContent = prize.text;
  wheelEls.resultDesc.textContent = prize.desc;
  wheelEls.rarityBadge.textContent = info.label;
  wheelEls.rarityBadge.style.color = info.color;
  wheelEls.resultTitle.style.color = info.color;

  wheelLastUndo = {
    type: "wheelSpin",
    playerId: p.id,
    beforePlayer: deepClone(p),
    beforeTeam: deepClone(findTeam(p.teamId)),
    wheelLogsLenBefore: state.wheelLogs.length
  };

  // consume spin (this changes state; allow without admin because it's "player action")
  p.spinsAvailable = Math.max(0, (p.spinsAvailable || 0) - 1);

  const now = new Date();
  const entry = {
    id: uid("wheel"),
    ts: now.toISOString(),
    playerId: p.id,
    playerName: p.name,
    teamId: p.teamId,
    teamName: findTeam(p.teamId)?.name || "",
    prizeText: prize.text,
    rarity: info.label,
    color: info.color
  };
  state.wheelLogs.unshift(entry);
  if (state.wheelLogs.length > 80) state.wheelLogs.pop();

  saveState(state);

  wheelPendingPrize = prize;
  wheelPendingEffect = parseWheelEffect(prize.text);

  renderWheelFeed();
  updateWheelSpinUI();
  renderAllWithBindings();

  wheelEls.spinBtn.style.display = "none";
  wheelEls.refreshBtn.style.display = "inline-block";

  if (wheelEls.applyBox) {
    wheelEls.applyBox.style.display = "block";
    wheelEls.applySub.textContent =
      wheelPendingEffect
        ? `This can add +${fmt(wheelPendingEffect.amount)} to the selected player's Team Bank XP. (Admin required to apply)`
        : `No automatic effect for this prize. You can leave it logged, or undo.`;
  }

  showToast("Spin recorded", `${p.name} → ${prize.text} (${info.label})`, null);
}

function applyWheelEffect(applyNow) {
  // Applying effects changes team state => ADMIN only
  if (!requireAdminPin(() => {})) return;

  const p = selectedWheelPlayer();
  if (!p) return;

  if (!wheelPendingEffect) {
    if (wheelEls.applyBox) wheelEls.applyBox.style.display = "none";
    return;
  }
  if (!applyNow) {
    if (wheelEls.applyBox) wheelEls.applyBox.style.display = "none";
    return;
  }

  const team = findTeam(p.teamId);
  if (!team) return;

  if (wheelPendingEffect.kind === "teamBankXp") {
    team.teamBankXp = (team.teamBankXp || 0) + wheelPendingEffect.amount;

    state.logs.unshift({
      id: uid("log"),
      ts: new Date().toISOString(),
      kind: "wheel_effect",
      playerId: p.id,
      teamId: p.teamId,
      symbol: "🎰",
      qty: 1,
      xpDelta: 0,
      label: `Wheel: ${wheelPendingPrize?.text || "Effect"}`,
      gainedSpins: 0
    });

    saveState(state);
    renderAllWithBindings();
    showToast("Effect applied", `${team.name}: +${fmt(wheelPendingEffect.amount)} Team Bank XP`, null);
  }

  if (wheelEls.applyBox) wheelEls.applyBox.style.display = "none";
}

function undoLastWheelSpin() {
  // Undo changes state => ADMIN only
  if (!requireAdminPin(() => {})) return;

  if (!wheelLastUndo) return;
  const { playerId, beforePlayer, beforeTeam, wheelLogsLenBefore } = wheelLastUndo;

  const p = findPlayer(playerId);
  if (p) Object.assign(p, beforePlayer);

  if (beforeTeam) {
    const t = findTeam(beforeTeam.id);
    if (t) Object.assign(t, beforeTeam);
  }

  state.wheelLogs = state.wheelLogs.slice(0, wheelLogsLenBefore);

  saveState(state);
  renderWheelFeed();
  updateWheelSpinUI();
  renderAllWithBindings();

  if (wheelEls.applyBox) wheelEls.applyBox.style.display = "none";
  wheelEls.spinBtn.style.display = "inline-block";
  wheelEls.refreshBtn.style.display = "none";
  wheelEls.resultTitle.textContent = "READY TO SPIN";
  wheelEls.resultTitle.style.color = "#00f3ff";
  wheelEls.resultDesc.textContent = "Select a player, then roll.";
  wheelEls.rarityBadge.textContent = "";

  showToast("Spin undone", "Restored spin count and removed the wheel log.", null);
  wheelLastUndo = null;
}

function resetWheelUI() {
  if (!wheelEls.spinBtn) return;
  wheelEls.spinBtn.style.display = "inline-block";
  if (wheelEls.refreshBtn) wheelEls.refreshBtn.style.display = "none";
  wheelEls.spinBtn.disabled = false;
  wheelEls.resultTitle.textContent = "READY TO SPIN";
  wheelEls.resultTitle.style.color = "#00f3ff";
  wheelEls.resultDesc.textContent = "Select a player, then roll.";
  wheelEls.rarityBadge.textContent = "";
  if (wheelEls.applyBox) wheelEls.applyBox.style.display = "none";
  updateWheelSpinUI();
}

function renderWheelFeed() {
  const box = wheelEls.feed;
  if (!box) return;

  const logs = state.wheelLogs || [];
  if (logs.length === 0) {
    box.innerHTML = `<div class="wheel-feed-item"><span style="color:#666">No spins recorded yet…</span><span class="t"></span></div>`;
    return;
  }

  box.innerHTML = logs.map(l => {
    const time = new Date(l.ts).toLocaleString([], { month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit" });
    return `
      <div class="wheel-feed-item">
        <span style="color:${l.color}"><strong>${l.playerName}</strong> → ${l.prizeText}</span>
        <span class="t">${time}</span>
      </div>
    `;
  }).join("");
}

function renderWheel() {
  renderWheelSelectors();
  updateWheelSpinUI();
  renderWheelFeed();
}

/* =========================
   Export / Import / Reset
========================= */
function downloadJSON(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function resetToSeed() {
  if (!requireAdminPin(() => {})) return;
  if (!confirm("Reset everything to seed data? This cannot be undone.")) return;
  state = deepClone(SEED);
  saveState(state);
  selectedTeamId = null;
  renderAllWithBindings();
  showToast("Reset complete", "Seed data restored.", null);
}

/* =========================
   Event wiring
========================= */
document.getElementById("tabs")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  const view = btn.getAttribute("data-view");

  // Only gate if it’s an "admin-style" section (you can change this list)
  const viewsThatRequireAdminToEnter = ["settingsView"];
  if (viewsThatRequireAdminToEnter.includes(view)) {
    requireAdminPin(() => setView(view));
  } else {
    setView(view);
  }
});

document.getElementById("btnQuickBackup")?.addEventListener("click", () => {
  // exporting is fine without admin
  downloadJSON("LevelUpDQ_backup.json", state);
});

document.getElementById("btnQuickLog")?.addEventListener("click", () => {
  setView("activityView");
});

document.getElementById("btnTeamsCompactToggle")?.addEventListener("click", () => {
  if (!requireAdminPin(() => {})) return;
  state.compactCards = !state.compactCards;
  saveState(state);
  renderTeamsWithBindings();
  showToast("Layout updated", state.compactCards ? "Compact cards enabled." : "Compact cards disabled.", null);
});

const filterTeamSel = document.getElementById("playersFilterTeam");
const filterRoleSel = document.getElementById("playersFilterRole");
const playersSearch = document.getElementById("playersSearch");

function populatePlayersTeamFilter() {
  if (!filterTeamSel) return;
  filterTeamSel.innerHTML = `<option value="all">All</option>` + state.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join("");
}

filterTeamSel?.addEventListener("change", renderPlayers);
filterRoleSel?.addEventListener("change", renderPlayers);
playersSearch?.addEventListener("input", renderPlayers);

document.getElementById("btnClearActivity")?.addEventListener("click", () => {
  if (!requireAdminPin(() => {})) return;
  if (!confirm("Clear award activity history? (Wheel history is separate)")) return;
  state.logs = [];
  saveState(state);
  renderActivity();
  showToast("Activity cleared", "Awards history cleared.", null);
});

document.getElementById("btnExport")?.addEventListener("click", () => downloadJSON("LevelUpDQ_backup.json", state));

document.getElementById("btnReset")?.addEventListener("click", resetToSeed);

document.getElementById("importFile")?.addEventListener("change", async (e) => {
  if (!requireAdminPin(() => {})) return;
  const file = e.target.files?.[0];
  if (!file) return;
  const txt = await file.text();
  try {
    const obj = JSON.parse(txt);
    if (!confirm("Import this JSON and overwrite current data?")) return;
    state = obj;
    saveState(state);
    selectedTeamId = null;
    renderAllWithBindings();
    showToast("Import complete", "Data loaded from file.", null);
  } catch {
    showToast("Import failed", "That file isn't valid JSON.", null);
  }
});

document.getElementById("btnImportPaste")?.addEventListener("click", () => {
  if (!requireAdminPin(() => {})) return;
  const txt = document.getElementById("importText")?.value?.trim();
  if (!txt) return showToast("Nothing to import", "Paste JSON first.", null);
  try {
    const obj = JSON.parse(txt);
    if (!confirm("Import this JSON and overwrite current data?")) return;
    state = obj;
    saveState(state);
    selectedTeamId = null;
    renderAllWithBindings();
    showToast("Import complete", "Data loaded from pasted JSON.", null);
  } catch {
    showToast("Import failed", "Pasted text isn't valid JSON.", null);
  }
});

// Optional: if you have a button with id="btnAdminLock"
document.getElementById("btnAdminLock")?.addEventListener("click", lockAdmin);

/* =========================
   Initial Render
========================= */
function renderTeamListDefaults() {
  if (!selectedTeamId && state.teams.length) selectedTeamId = state.teams[0].id;
}

function bindAfterRender() {
  const detail = document.getElementById("teamDetail");
  if (detail) bindPlayerCardEvents(detail);
}

function renderAllWithBindings() {
  renderAll();
  bindAfterRender();
}

function renderTeamsWithBindings() {
  renderTeams();
  bindAfterRender();
}

// Patch renderTeams to bind card events after it changes DOM
const _renderTeams = renderTeams;
renderTeams = function() {
  _renderTeams();
  bindAfterRender();
};

populatePlayersTeamFilter();
renderTeamListDefaults();
renderAllWithBindings();
setView("overviewView");
