// store.jsx — data model, phase plan, persistence, derived stats
const { useState, useEffect, useCallback } = React;

const STORE_KEY = 'tinycub_v4';
const DAY = 86400000;
const WEEK = 7 * DAY;
const TWO_MONTHS = 60 * DAY;

const DEFAULT_MASTER_PROMPT = `TinyCub is a small, round baby cub with soft caramel-brown fur, a cream-colored muzzle and inner ears, big round dark eyes with tiny highlights, small rosy cheeks, a little dark nose, and short stubby limbs. Always illustrated in a warm hand-drawn children\u2019s-book style: soft colored-pencil texture, gentle rounded outlines, a cream + sage-green palette with warm peach accents, flat soft lighting, and lots of cozy negative space. Keep TinyCub\u2019s proportions, fur color, face, and art style EXACTLY consistent in every image.`;

// ── Statuses ──────────────────────────────────────────────
const STATUS = {
  idea:   { key: 'idea',   label: 'Idea drafted',  short: 'Idea',   bg: '#DBEDF5', fg: '#246F8B', dot: '#5FB3D4' },
  scene:  { key: 'scene',  label: 'Scene created', short: 'Scene',  bg: '#E6EBCD', fg: '#5E7A2B', dot: '#8DA84B' },
  ready:  { key: 'ready',  label: 'Ready to post', short: 'Ready',  bg: '#FBE7BD', fg: '#A0700F', dot: '#ECA728' },
  posted: { key: 'posted', label: 'Posted',        short: 'Posted', bg: '#C9842F', fg: '#ffffff', dot: '#ffffff' },
};
const STATUS_ORDER = ['idea', 'scene', 'ready', 'posted'];

// ── Phase plan ────────────────────────────────────────────
const PHASES = [
  {
    key: 'p1', n: 1, name: 'Build & Exist', months: '1–3', startMonth: 1, endMonth: 3,
    tagline: 'Make the brand real. Not perfect — just present & consistent.',
    color: '#C9842F', soft: '#F5E3C8',
    goals: [
      { id: 'p1a', text: 'Finalize TinyCub — 1 reusable version + 3 base poses' },
      { id: 'p1b', text: 'Write bio + define the Instagram grid mood' },
      { id: 'p1c', text: 'Lock posting rhythm: 1 post / week (Sundays)' },
      { id: 'p1d', text: 'Keep static : reel ratio around 3 : 1' },
      { id: 'p1e', text: 'Lock the workflow: observe → draft → scan → post' },
    ],
    truth: 'It will be quiet. Low engagement now is normal — every brand passes through here.',
  },
  {
    key: 'p2', n: 2, name: 'Find What Works', months: '4–8', startMonth: 4, endMonth: 8,
    tagline: 'Learn what people love about TinyCub. Earn the first baht.',
    color: '#2A8FB5', soft: '#DBEDF5',
    goals: [
      { id: 'p2a', text: 'Review Instagram insights every 2 weeks' },
      { id: 'p2b', text: 'Repeat the posts that win saves & reach' },
      { id: 'p2c', text: 'Post ≥ 1 Reel / month (drawing time-lapse)' },
      { id: 'p2d', text: 'Launch the first digital sticker pack (฿49–99)' },
    ],
    truth: 'Don\u2019t wait for a big following — sell small, early, and learn.',
  },
  {
    key: 'p3', n: 3, name: 'Grow & Earn', months: '9+', startMonth: 9, endMonth: 18,
    tagline: 'Real income from TinyCub. Start expanding the IP.',
    color: '#5E7A2B', soft: '#E6EBCD',
    goals: [
      { id: 'p3a', text: 'Sell digital products — stickers, printables, wallpapers' },
      { id: 'p3b', text: 'Print-on-demand merch (no stock to hold)' },
      { id: 'p3c', text: 'Make an illustrated mini-book / zine' },
      { id: 'p3d', text: 'Collab with cafés or parenting brands that feel aligned' },
    ],
    truth: 'Expand only what already resonates. Let the audience lead the IP.',
  },
];

// ── Day-based notifications ───────────────────────────────
// 0 Sun · 1 Mon · 2 Tue · 3 Wed · 4 Thu · 5 Fri · 6 Sat
const DAY_TASKS = {
  0: { tag: 'Post day', emoji: '🌿', title: 'Post today!', body: 'Your weekly TinyCub post goes live today. Pick a Ready-to-post piece and share it.', tone: 'post', action: 'ready' },
  1: { tag: 'Spot moments', emoji: '👀', title: 'Find a new moment', body: 'Watch Tawan\u2019s day. Jot down a small moment worth drawing — just 1–2 lines.', tone: 'observe', action: 'idea' },
  2: { tag: 'Spot moments', emoji: '👀', title: 'Collect fresh ideas', body: 'Keep noticing little moments. Add any new idea to your drafts.', tone: 'observe', action: 'idea' },
  3: { tag: 'Spot moments', emoji: '👀', title: 'Last call for ideas', body: 'Lock the idea you\u2019ll draw this week before sketching starts tomorrow.', tone: 'observe', action: 'idea' },
  4: { tag: 'Make scenes', emoji: '✏️', title: 'Think scenes & draw', body: 'Turn an idea into scenes and start sketching the drawing.', tone: 'draw', action: 'scene' },
  5: { tag: 'Make scenes', emoji: '✏️', title: 'Keep drawing', body: 'Finish the sketch and refine the scenes — don\u2019t leave it for Sunday.', tone: 'draw', action: 'scene' },
  6: { tag: 'Polish', emoji: '🎨', title: 'Scan, edit & caption', body: 'Scan the drawing, tweak the tone a little, and write the caption so it\u2019s ready.', tone: 'polish', action: 'ready' },
};
const TONE_COLOR = {
  observe: { bg: '#DBEDF5', fg: '#246F8B', accent: '#5FB3D4' },
  draw:    { bg: '#E6EBCD', fg: '#5E7A2B', accent: '#8DA84B' },
  polish:  { bg: '#FBE7BD', fg: '#A0700F', accent: '#ECA728' },
  post:    { bg: '#F5E3C8', fg: '#9C641C', accent: '#C9842F' },
};

// ── Date helpers ──────────────────────────────────────────
const now = () => new Date();
function lastSunday(from) {
  const d = new Date(from); d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}
function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function fmtDay(ts) {
  return new Date(ts).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}
function relTime(ts) {
  const diff = Date.now() - ts;
  if (diff < DAY) return 'today';
  const d = Math.round(diff / DAY);
  if (d === 1) return 'yesterday';
  if (d < 7) return d + 'd ago';
  return Math.round(d / 7) + 'w ago';
}

// ── Seed data ─────────────────────────────────────────────
function makeSeed() {
  const t = Date.now();
  const items = [
    // ready to post
    { id: 'c5', title: 'Stomping in tiny puddles', status: 'ready',
      idea: { text: 'First rain — Tawan stomping every puddle on the way home.', image: null },
      scenes: [{ id: 's1', text: 'mid-jump over a puddle' }, { id: 's2', text: 'ripples splashing out' }, { id: 's3', text: 'tiny boots soaked' }],
      caption: 'Puddle inspector, reporting for duty 🌧️ #TinyCub #rainyday',
      kind: 'static', createdAt: t - 2 * DAY, postedAt: null },
    // scene created
    { id: 'c6', title: 'Building a blanket fort', status: 'scene',
      idea: { text: 'An ambitious blanket-and-chair fort that keeps collapsing.', image: null },
      scenes: [{ id: 's1', text: 'draping the blanket over chairs' }, { id: 's2', text: 'fort collapsing mid-build' }],
      caption: '', kind: 'static', createdAt: t - 1 * DAY, postedAt: null },
    // idea drafted
    { id: 'c7', title: 'Sharing a snack with a stray cat', status: 'idea',
      idea: { text: 'Tawan splitting a cracker with a neighborhood cat — half each, very fair.', image: null },
      scenes: [], caption: '', kind: 'static', createdAt: t - 4 * 3600000, postedAt: null },
    { id: 'c8', title: 'Counting the stars out loud', status: 'idea',
      idea: { text: 'Lying on the balcony at night, counting stars and losing count.', image: null },
      scenes: [], caption: '', kind: 'static', createdAt: t - 90 * 60000, postedAt: null },
  ];
  return {
    brandStart: t,                         // fresh start → Phase 1, Week 1
    items,
    goals: {},
    promptHistory: [],
    masterPrompt: DEFAULT_MASTER_PROMPT,
    character: null,    // null → use DEFAULT_CHARACTER (set lazily by app)
    style: null,        // null → use DEFAULT_STYLE
    scene: null,        // null → use DEFAULT_SCENE
    override: { enabled: false, hat: '', accessory: '', age: '' },
    library: null,      // null → use DEFAULT_LIBRARY
    activeCharacter: 'classic',
    dismissedBanner: null,
    seededAt: t,
  };
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s.masterPrompt === undefined) s.masterPrompt = DEFAULT_MASTER_PROMPT;
      if (s.override === undefined) s.override = { enabled: false, hat: '', accessory: '', age: '' };
      if (s.activeCharacter === undefined) s.activeCharacter = 'classic';
      // prune prompt history older than 2 months
      if (Array.isArray(s.promptHistory)) {
        const cut = Date.now() - TWO_MONTHS;
        s.promptHistory = s.promptHistory.filter(h => (h.at || 0) >= cut);
      }
      return s;
    }
  } catch (e) {}
  const seed = makeSeed();
  try { localStorage.setItem(STORE_KEY, JSON.stringify(seed)); } catch (e) {}
  return seed;
}

function useStore() {
  const [state, setState] = useState(loadStore);
  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }, [state]);
  const update = useCallback((fn) => setState(prev => fn({ ...prev })), []);
  const reset = useCallback(() => { const s = makeSeed(); setState(s); }, []);
  return [state, update, reset];
}

// ── Derived stats ─────────────────────────────────────────
function computeStats(state) {
  const items = state.items || [];
  const counts = { idea: 0, scene: 0, ready: 0, posted: 0 };
  items.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1; });

  const start = state.brandStart;
  const elapsedDays = Math.max(0, Math.floor((Date.now() - start) / DAY));
  const monthsElapsed = elapsedDays / 30.4;
  const monthNum = Math.floor(monthsElapsed) + 1;          // 1-indexed month
  const weeksElapsed = Math.max(1, Math.ceil(elapsedDays / 7));

  const phase = PHASES.find(p => monthNum >= p.startMonth && monthNum <= p.endMonth) || PHASES[0];
  const phaseIndex = PHASES.indexOf(phase);
  const monthInPhase = monthNum - phase.startMonth + 1;
  const phaseLenMonths = phase.endMonth - phase.startMonth + 1;
  const phaseTimePct = Math.min(100, Math.round((monthsElapsed - (phase.startMonth - 1)) / phaseLenMonths * 100));

  const goalsDone = phase.goals.filter(g => state.goals && state.goals[g.id]).length;
  const goalsPct = Math.round(goalsDone / phase.goals.length * 100);

  // schedule: target 1 post per Sunday — “expected” = post-days (Sundays) elapsed since start
  const postedCount = counts.posted;
  const expected = (() => {
    const d = new Date(start); d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7));   // first Sunday on/after start
    if (d.getTime() > Date.now()) return 0;
    return Math.floor((Date.now() - d.getTime()) / WEEK) + 1;
  })();
  const delta = postedCount - expected;                     // +ahead / -behind

  // streak: consecutive weeks (ending this week) with a posted item
  const postedWeeks = new Set(
    items.filter(i => i.status === 'posted' && i.postedAt)
         .map(i => Math.floor(lastSunday(i.postedAt).getTime() / WEEK))
  );
  let streak = 0;
  let cursor = Math.floor(lastSunday(Date.now()).getTime() / WEEK);
  while (postedWeeks.has(cursor)) { streak++; cursor--; }

  const reels = items.filter(i => i.kind === 'reel').length;
  const statics = items.filter(i => i.kind === 'static').length;

  return {
    counts, monthNum, monthsElapsed, weeksElapsed, phase, phaseIndex,
    monthInPhase, phaseLenMonths, phaseTimePct, goalsDone, goalsPct,
    postedCount, expected, delta, streak, reels, statics,
    activeTotal: counts.idea + counts.scene + counts.ready,
  };
}

function todayTask(d = new Date()) { return DAY_TASKS[d.getDay()]; }

Object.assign(window, {
  STORE_KEY, STATUS, STATUS_ORDER, PHASES, DAY_TASKS, TONE_COLOR,
  useStore, computeStats, makeSeed, todayTask, DEFAULT_MASTER_PROMPT, TWO_MONTHS,
  fmtDate, fmtDay, relTime, lastSunday, DAY, WEEK,
});
