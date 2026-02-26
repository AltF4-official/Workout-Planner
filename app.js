/* ══════════════════════════════════════════════════════════════
   CALORIE DATA  (kcal per set/exercise · ~70 kg person, moderate effort)
══════════════════════════════════════════════════════════════ */
const CALS = {
  'Arm circles – 1 min':              3,
  'Bodyweight squats – 2 × 12':       8,
  'Light push-ups – 2 × 8':           5,
  'Pull-ups – 5–8':                   10,
  'Pull-ups – 6–10':                  12,
  'Dumbbell curls – 10–12':           6,
  'Push-ups – 10':                    6,
  'Plank – 40 sec':                   3,
  'Rest 45 sec':                      0,
  'Rest 40 sec':                      0,
  'Rest 30 sec':                      0,
  'Wall sit – 3 × 45 sec':            8,
  'Dumbbell floor press – 10–12':     8,
  'Bicep curls – 10–12':              6,
  'Pike push-ups – 8–10':             7,
  'Slow push-ups – max reps × 2 sets':10,
  'Goblet squats – 12':               9,
  'Goblet squats – 15':              10,
  'Knee push-ups – 12':               5,
  'Hanging knee raises – 12–15':      8,
  'Side plank – 30 sec each side':    4,
  'Dead hang from pull-up bar – 3 × 30 sec': 4,
  'Dumbbell shoulder press – 10–12':  9,
  'Hanging leg raises – 12–15':       9,
  'Bicep curls burnout set':          8,
  'Immediately → push-ups max':      12,
  'Repeat once':                      0,
};

function getCal(exerciseName) {
  return CALS[exerciseName] ?? 0;
}

/* ══════════════════════════════════════════════════════════════
   SHARED WARM-UP
══════════════════════════════════════════════════════════════ */
const WARM_UP_EXERCISES = [
  'Arm circles – 1 min',
  'Bodyweight squats – 2 × 12',
  'Light push-ups – 2 × 8',
];

/* ══════════════════════════════════════════════════════════════
   WORKOUT DATA
══════════════════════════════════════════════════════════════ */
const WORKOUTS = [
  {
    id: 'monday', day: 'Monday',
    subtitle: 'Light Strength · Jiu-Jitsu Day', time: '6:00–6:30 PM',
    sections: [
      { id: 'mon-wu',   title: 'Warm-up',          dur: '5 min',  rounds: 1,
        exercises: WARM_UP_EXERCISES },
      { id: 'mon-circ', title: 'Strength Circuit',  dur: '20 min', rounds: 4,
        exercises: ['Pull-ups – 5–8', 'Dumbbell curls – 10–12', 'Push-ups – 10', 'Plank – 40 sec', 'Rest 45 sec'] },
      { id: 'mon-fin',  title: 'Finisher',          dur: '5 min',  rounds: 1,
        exercises: ['Wall sit – 3 × 45 sec'] }
    ]
  },
  {
    id: 'tuesday', day: 'Tuesday',
    subtitle: 'Upper Body Size · Key Day', time: '6:00–6:30 PM',
    sections: [
      { id: 'tue-wu',  title: 'Warm-up',   dur: '5 min',  rounds: 1,
        exercises: WARM_UP_EXERCISES },
      { id: 'tue-a',   title: 'Block A',   dur: '10 min', rounds: 2,
        exercises: ['Pull-ups – 6–10', 'Dumbbell floor press – 10–12', 'Rest 40 sec'] },
      { id: 'tue-b',   title: 'Block B',   dur: '10 min', rounds: 2,
        exercises: ['Bicep curls – 10–12', 'Pike push-ups – 8–10', 'Rest 40 sec'] },
      { id: 'tue-fin', title: 'Finisher',  dur: '5 min',  rounds: 1,
        exercises: ['Slow push-ups – max reps × 2 sets'] }
    ]
  },
  {
    id: 'wednesday', day: 'Wednesday',
    subtitle: 'Light Recovery Strength', time: '6:00–6:30 PM',
    sections: [
      { id: 'wed-wu',   title: 'Warm-up',       dur: '5 min',  rounds: 1,
        exercises: WARM_UP_EXERCISES },
      { id: 'wed-circ', title: 'Main Circuit',   dur: '20 min', rounds: 4,
        exercises: ['Goblet squats – 12', 'Knee push-ups – 12', 'Hanging knee raises – 12–15', 'Side plank – 30 sec each side', 'Rest 40 sec'] },
      { id: 'wed-fin',  title: 'Finisher',       dur: '5 min',  rounds: 1,
        exercises: ['Dead hang from pull-up bar – 3 × 30 sec'] }
    ]
  },
  {
    id: 'thursday', day: 'Thursday',
    subtitle: 'Heavy Muscle Builder', time: '6:00–6:30 PM',
    sections: [
      { id: 'thu-wu',   title: 'Warm-up',               dur: '5 min',  rounds: 1,
        exercises: WARM_UP_EXERCISES },
      { id: 'thu-circ', title: 'Main Strength Circuit',  dur: '20 min', rounds: 5,
        exercises: ['Pull-ups – 6–10', 'Goblet squats – 15', 'Dumbbell shoulder press – 10–12', 'Hanging leg raises – 12–15', 'Rest 30 sec'] },
      { id: 'thu-fin',  title: 'Finisher',               dur: '5 min',  rounds: 1,
        exercises: ['Bicep curls burnout set', 'Immediately → push-ups max', 'Repeat once'] }
    ]
  }
];

/* ══════════════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════════════ */
const state = {};

function freshSectionState(sec) {
  return {
    round:         1,
    checked:       sec.exercises.map(() => false),
    skipped:       sec.exercises.map(() => false),
    burnedCals:    0,
    checkedRounds: {},
    skippedRounds: {},
  };
}

function initState() {
  WORKOUTS.forEach(w => {
    w.sections.forEach(s => {
      state[s.id] = freshSectionState(s);
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   LOCAL STORAGE KEYS
══════════════════════════════════════════════════════════════ */
const LS_STATE    = 'wk_state_v2';
const LS_OPEN     = 'wk_open_v2';
const LS_TIMER    = 'wk_timer_v2';
const LS_PREVWEEK = 'wk_prevweek_v2';
const LS_HISTORY  = 'wk_history_v2';   // NEW: array of weekly stats
const LS_STREAK   = 'wk_streak_v2';    // NEW: streak counter
const LS_WORKOUT_TIME = 'wk_workout_time_v2'; // NEW: separate workout time

/* ══════════════════════════════════════════════════════════════
   STORAGE HELPERS
══════════════════════════════════════════════════════════════ */
function saveState() {
  try { localStorage.setItem(LS_STATE, JSON.stringify(state)); } catch(e) {}
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_STATE) || 'null');
    if (!saved) return;
    WORKOUTS.forEach(w => {
      w.sections.forEach(s => {
        if (saved[s.id]) {
          const sv = saved[s.id];
          state[s.id] = {
            round:         sv.round         ?? 1,
            checked:       sv.checked       ?? s.exercises.map(() => false),
            skipped:       sv.skipped       ?? s.exercises.map(() => false),
            burnedCals:    sv.burnedCals    ?? 0,
            checkedRounds: sv.checkedRounds ?? {},
            skippedRounds: sv.skippedRounds ?? {},
          };
          while (state[s.id].checked.length < s.exercises.length)
            state[s.id].checked.push(false);
          while (state[s.id].skipped.length < s.exercises.length)
            state[s.id].skipped.push(false);
          const st = state[s.id];
          if (st.checkedRounds[st.round]) {
            st.checked = st.checkedRounds[st.round].slice();
            st.skipped = st.skippedRounds[st.round].slice();
          }
        }
      });
    });
  } catch(e) {}
}

function saveOpenState(openMap) {
  try { localStorage.setItem(LS_OPEN, JSON.stringify(openMap)); } catch(e) {}
}

function loadOpenState() {
  try { return JSON.parse(localStorage.getItem(LS_OPEN) || '{}'); } catch(e) { return {}; }
}

function saveTimerState() {
  try { localStorage.setItem(LS_TIMER, JSON.stringify({ timeLeft, timerTarget, restTimeLeft, isRestActive, restTarget })); } catch(e) {}
}

function loadTimerState() {
  try {
    const t = JSON.parse(localStorage.getItem(LS_TIMER) || 'null');
    if (t && typeof t.timeLeft === 'number') timeLeft = t.timeLeft;
    if (t && typeof t.timerTarget === 'number') timerTarget = t.timerTarget;
    if (t && typeof t.restTimeLeft === 'number') restTimeLeft = t.restTimeLeft;
    if (t && typeof t.isRestActive === 'boolean') isRestActive = t.isRestActive;
    if (t && typeof t.restTarget === 'number') restTarget = t.restTarget;
  } catch(e) {}
}

function savePrevWeek(stats) {
  try { localStorage.setItem(LS_PREVWEEK, JSON.stringify(stats)); } catch(e) {}
}

function loadPrevWeek() {
  try { return JSON.parse(localStorage.getItem(LS_PREVWEEK) || 'null'); } catch(e) { return null; }
}

// NEW: weekly history (array, max 8)
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(LS_HISTORY) || '[]'); } catch(e) { return []; }
}

function saveHistory(arr) {
  try { localStorage.setItem(LS_HISTORY, JSON.stringify(arr)); } catch(e) {}
}

// NEW: streak
function loadStreak() {
  try { return JSON.parse(localStorage.getItem(LS_STREAK) || 'null'); } catch(e) { return null; }
}

function saveStreak(data) {
  try { localStorage.setItem(LS_STREAK, JSON.stringify(data)); } catch(e) {}
}

/* ══════════════════════════════════════════════════════════════
   NEW — SOUND EFFECTS  (Web Audio API, synthesised)
══════════════════════════════════════════════════════════════ */
let _audioCtx = null;

function getSoundCtx() {
  if (!_audioCtx) {
    try {
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) { return null; }
  }
  // Resume if suspended (browser autoplay policy)
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

/**
 * type: 'tick' | 'day' | 'week'
 */
function playSound(type) {
  const ctx = getSoundCtx();
  if (!ctx) return;

  if (type === 'tick') {
    // Short pleasant ping on exercise check
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.0,  ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);

  } else if (type === 'rest') {
    // Softer, lower double-beep for rest start
    [0, 0.15].forEach(offset => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime + offset);
      gain.gain.setValueAtTime(0.0,  ctx.currentTime + offset);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + offset + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.18);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.22);
    });

  } else if (type === 'day') {
    // Ascending 4-note fanfare for day completion
    const freqs  = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6
    const delays = [0, 0.11, 0.22, 0.33];
    freqs.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      const t = ctx.currentTime + delays[i];
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0,  t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.start(t);
      osc.stop(t + 0.45);
    });

  } else if (type === 'week') {
    // Triumphant chord swell for week complete
    const chord = [261.63, 329.63, 392.0, 523.25]; // C4 E4 G4 C5
    chord.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.05 + i * 0.04);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    });

  } else if (type === 'timerDone') {
    // Three descending beeps when rest timer finishes
    [0, 0.18, 0.36].forEach((offset, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(880 - i * 110, ctx.currentTime + offset);
      gain.gain.setValueAtTime(0.0,  ctx.currentTime + offset);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + offset + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.15);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.18);
    });
  }
}

/* ══════════════════════════════════════════════════════════════
   NEW — CONFETTI BURST
══════════════════════════════════════════════════════════════ */
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx    = confettiCanvas ? confettiCanvas.getContext('2d') : null;
let   confettiParticles = [];
let   confettiAnimId    = null;

const CONFETTI_COLORS = [
  '#FF4D00', '#FF9500', '#FFD700',
  '#00D9FF', '#10B981', '#FF6B9D',
  '#A78BFA', '#34D399',
];

function spawnConfetti(originEl) {
  if (!confettiCanvas || !confettiCtx) return;

  // Size canvas to viewport
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  // Origin: centre-top of the day card
  let ox = confettiCanvas.width  / 2;
  let oy = confettiCanvas.height / 2;
  if (originEl) {
    const rect = originEl.getBoundingClientRect();
    ox = rect.left + rect.width  / 2;
    oy = rect.top  + rect.height / 2;
  }

  const COUNT = 90;
  for (let i = 0; i < COUNT; i++) {
    const angle = (Math.random() * Math.PI * 2);
    const speed = 4 + Math.random() * 9;
    confettiParticles.push({
      x:     ox + (Math.random() - 0.5) * 60,
      y:     oy,
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed - 6, // bias upward
      rot:   Math.random() * 360,
      rotV:  (Math.random() - 0.5) * 14,
      w:     5 + Math.random() * 7,
      h:     3 + Math.random() * 5,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      life:  1.0,
      decay: 0.007 + Math.random() * 0.007,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    });
  }

  if (!confettiAnimId) animateConfetti();
}

function animateConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  let alive = false;
  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];
    p.x   += p.vx;
    p.y   += p.vy;
    p.vy  += 0.28;   // gravity
    p.vx  *= 0.995;
    p.rot += p.rotV;
    p.life -= p.decay;

    if (p.life <= 0) {
      confettiParticles.splice(i, 1);
      continue;
    }
    alive = true;

    confettiCtx.save();
    confettiCtx.globalAlpha = Math.max(0, p.life);
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate(p.rot * Math.PI / 180);
    confettiCtx.fillStyle = p.color;

    if (p.shape === 'circle') {
      confettiCtx.beginPath();
      confettiCtx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
      confettiCtx.fill();
    } else {
      confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    }
    confettiCtx.restore();
  }

  if (alive) {
    confettiAnimId = requestAnimationFrame(animateConfetti);
  } else {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiAnimId = null;
  }
}

/* ══════════════════════════════════════════════════════════════
   NEW — STREAK COUNTER
══════════════════════════════════════════════════════════════ */
function renderStreak() {
  const el = document.getElementById('streak-display');
  if (!el) return;
  const data = loadStreak();
  const count = data ? data.count : 0;
  if (count > 0) {
    el.style.display = '';
    el.innerHTML = `
      <span class="streak-flame">🔥</span>
      <span class="streak-num">${count}</span>
      <span class="streak-label">${count === 1 ? 'Week' : 'Week'} Streak</span>
    `;
  } else {
    el.style.display = 'none';
  }
}

/**
 * Called when starting a new week. pct = this week's completion percentage.
 */
function updateStreak(pct) {
  const existing = loadStreak() || { count: 0 };
  const newCount = pct >= 50 ? existing.count + 1 : 0;
  saveStreak({ count: newCount, lastUpdated: Date.now() });
  renderStreak();
}

/* ══════════════════════════════════════════════════════════════
   NEW — 8-WEEK PROGRESS CHART
══════════════════════════════════════════════════════════════ */
/**
 * Draw a bar chart on #weekChart canvas.
 * history: array of { pct } (past weeks, oldest first)
 * currentPct: number (this week being summarised)
 */
function drawWeekChart(history, currentPct) {
  const canvas = document.getElementById('weekChart');
  if (!canvas) return;

  const dpr  = window.devicePixelRatio || 1;
  const W    = canvas.offsetWidth  || 360;
  const H    = canvas.offsetHeight || 80;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // Assemble up to 7 past + current = 8 bars
  const pastSlice = history.slice(-7);
  const allBars   = [];
  // Pad left with nulls if fewer than 7 past weeks
  for (let i = 0; i < 7 - pastSlice.length; i++) allBars.push(null);
  pastSlice.forEach(h => allBars.push(h));
  allBars.push({ pct: currentPct, current: true });

  const n       = allBars.length;   // always 8
  const BOTTOM  = H - 18;           // reserve space for labels
  const TOP_PAD = 14;               // reserve space for % labels
  const chartH  = BOTTOM - TOP_PAD;
  const padX    = 4;
  const gapX    = 4;
  const barW    = (W - padX * 2 - gapX * (n - 1)) / n;

  // Helper: draw a rounded rect
  function rRect(x, y, w, h, r) {
    if (w <= 0 || h <= 0) return;
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  allBars.forEach((bar, i) => {
    const x = padX + i * (barW + gapX);

    if (!bar) {
      // Empty ghost bar
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      rRect(x, BOTTOM - 3, barW, 3, 2);
      ctx.fill();
      // Week label
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.font      = `500 8px Syne, sans-serif`;
      ctx.textAlign = 'center';
      const weeksAgo = n - 1 - i;
      ctx.fillText(`W-${weeksAgo}`, x + barW / 2, H - 3);
      return;
    }

    const barH = Math.max(3, (bar.pct / 100) * chartH);
    const y    = BOTTOM - barH;

    // Bar gradient
    const grad = ctx.createLinearGradient(0, y, 0, BOTTOM);
    if (bar.current) {
      grad.addColorStop(0, 'rgba(255,77,0,0.95)');
      grad.addColorStop(1, 'rgba(255,149,0,0.35)');
    } else {
      grad.addColorStop(0, 'rgba(0,217,255,0.75)');
      grad.addColorStop(1, 'rgba(0,217,255,0.18)');
    }

    ctx.fillStyle = grad;
    rRect(x, y, barW, barH, 3);
    ctx.fill();

    // % label above bar (only if bar has room)
    if (bar.pct > 0) {
      ctx.fillStyle = bar.current
        ? 'rgba(255,120,0,0.95)'
        : 'rgba(0,217,255,0.65)';
      ctx.font      = `500 8px Syne, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${bar.pct}%`, x + barW / 2, y - 3);
    }

    // Week label below
    const weeksAgo = n - 1 - i;
    const label    = bar.current ? 'Now' : `W-${weeksAgo}`;
    ctx.fillStyle  = bar.current ? 'rgba(255,120,0,0.75)' : 'rgba(255,255,255,0.22)';
    ctx.font       = `500 8px Syne, sans-serif`;
    ctx.textAlign  = 'center';
    ctx.fillText(label, x + barW / 2, H - 3);
  });
}

/* ══════════════════════════════════════════════════════════════
   NEW — REST TIMER AUTO-TRIGGER
   Parses exercise names like "Rest 45 sec", "Rest 2 min"
   Returns seconds (number) or null
══════════════════════════════════════════════════════════════ */
function parseRestDuration(exerciseName) {
  const match = exerciseName.match(/^Rest\s+(\d+)\s*(sec|min)/i);
  if (!match) return null;
  const val = parseInt(match[1], 10);
  return match[2].toLowerCase().startsWith('min') ? val * 60 : val;
}

/* ══════════════════════════════════════════════════════════════
   CALORIE HELPERS
══════════════════════════════════════════════════════════════ */
function sectionCalsBurned(sec) {
  const st = state[sec.id];
  const currentCals = sec.exercises.reduce((sum, ex, i) =>
    sum + (st.checked[i] ? getCal(ex) : 0), 0);
  return st.burnedCals + currentCals;
}

function sectionMaxCalsPerRound(sec) {
  return sec.exercises.reduce((sum, ex) => sum + getCal(ex), 0);
}

function sectionTotalMaxCals(sec) {
  return sectionMaxCalsPerRound(sec) * sec.rounds;
}

function weekCalsBurned() {
  let total = 0;
  WORKOUTS.forEach(w => w.sections.forEach(s => { total += sectionCalsBurned(s); }));
  return total;
}

/* ══════════════════════════════════════════════════════════════
   GRID DISTORTION CANVAS (spring-physics per dot)
══════════════════════════════════════════════════════════════ */
function initGrid() {
  const canvas = document.getElementById('canvas');
  const ctx    = canvas.getContext('2d');

  const GAP          = 38;
  const INFLUENCE    = 160;
  const MAX_PUSH     = 9;
  const SPRING       = 0.08;
  const DAMPING      = 0.72;
  const BASE_R       = 1.1;
  const HOVER_R      = 2.8;
  const CLICK_PUSH   = 5;
  const CLICK_RADIUS = 200;

  let W, H;
  const mouse  = { x: -999, y: -999 };
  const clicks = [];
  let   dots   = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildDots();
  }

  function buildDots() {
    dots = [];
    for (let ox = 0; ox < W + GAP; ox += GAP)
      for (let oy = 0; oy < H + GAP; oy += GAP)
        dots.push({ ox, oy, px: ox, py: oy, vx: 0, vy: 0 });
  }

  function spawnClick(x, y) {
    clicks.push({ x, y, t: 0, life: 1.0 });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = clicks.length - 1; i >= 0; i--) {
      clicks[i].t   += 0.045;
      clicks[i].life = Math.max(0, 1 - clicks[i].t);
      if (clicks[i].life <= 0) clicks.splice(i, 1);
    }

    dots.forEach(d => {
      let fx = 0, fy = 0;

      const mDx   = d.ox - mouse.x;
      const mDy   = d.oy - mouse.y;
      const mDist = Math.sqrt(mDx * mDx + mDy * mDy);

      if (mDist < INFLUENCE && mDist > 0) {
        const strength = (1 - mDist / INFLUENCE);
        const push = strength * strength * MAX_PUSH;
        fx += (mDx / mDist) * push * 0.55;
        fy += (mDy / mDist) * push * 0.55;
      }

      clicks.forEach(ck => {
        const cDx   = d.ox - ck.x;
        const cDy   = d.oy - ck.y;
        const cDist = Math.sqrt(cDx * cDx + cDy * cDy);
        const ringR = ck.t * CLICK_RADIUS;
        const ringW = CLICK_RADIUS * 0.35;
        const delta = Math.abs(cDist - ringR);
        if (delta < ringW && cDist > 0) {
          const wave  = (1 - delta / ringW) * ck.life;
          const force = wave * CLICK_PUSH;
          fx += (cDx / cDist) * force;
          fy += (cDy / cDist) * force;
        }
      });

      fx += (d.ox - d.px) * SPRING;
      fy += (d.oy - d.py) * SPRING;

      d.vx = (d.vx + fx) * DAMPING;
      d.vy = (d.vy + fy) * DAMPING;
      d.px += d.vx;
      d.py += d.vy;

      const dispX = d.px - d.ox;
      const dispY = d.py - d.oy;
      const disp  = Math.sqrt(dispX * dispX + dispY * dispY);
      const r     = BASE_R + Math.min(disp * 0.22, HOVER_R - BASE_R);
      const t     = Math.min(disp / MAX_PUSH, 1);
      const alpha = 0.12 + t * 0.2;
      const nearMouse = mDist < INFLUENCE * 0.6 ? (1 - mDist / (INFLUENCE * 0.6)) : 0;

      if (nearMouse > 0) {
        const gAlpha = alpha + nearMouse * 0.4;
        ctx.beginPath();
        ctx.arc(d.px, d.py, r + nearMouse * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,${Math.round(77 + nearMouse * 80)},0,${Math.min(gAlpha, 0.9)})`;
        ctx.fill();
      } else if (t > 0.05) {
        ctx.beginPath();
        ctx.arc(d.px, d.py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,${Math.round(160 + t * 60)},${Math.round(t * 40)},${alpha})`;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(d.px, d.py, BASE_R, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,210,230,0.09)`;
        ctx.fill();
      }
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize',    () => resize());
  window.addEventListener('mousemove', e  => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('click', e => {
    if (e.target.closest('.ex-item') || e.target.closest('.ex-skip-btn')) return;
    spawnClick(e.clientX, e.clientY);
  });

  resize();
  draw();
  return { spawnClick };
}

/* ══════════════════════════════════════════════════════════════
   CLICK RIPPLE (Apple-style bouncy DOM rings)
══════════════════════════════════════════════════════════════ */
function initClickRipple() {
  const container = document.getElementById('ripple-container');

  function spawnRipple(x, y) {
    [0, 30, 60].forEach((delay, i) => {
      setTimeout(() => {
        const ring = document.createElement('div');
        ring.className = 'click-ring';
        const size = 24 + i * 14;
        ring.style.cssText = `
          left: ${x}px; top: ${y}px;
          width: ${size}px; height: ${size}px;
          margin-left: ${-size / 2}px; margin-top: ${-size / 2}px;
          animation-duration: ${0.65 + i * 0.12}s;
          opacity: ${0.35 - i * 0.09};
          border-width: ${2 - i * 0.4}px;
        `;
        container.appendChild(ring);
        ring.addEventListener('animationend', () => ring.remove(), { once: true });
      }, delay);
    });

    const dot = document.createElement('div');
    dot.className = 'click-dot';
    dot.style.cssText = `left: ${x}px; top: ${y}px;`;
    container.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove(), { once: true });
  }

  window.addEventListener('click', e => {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'button' || tag === 'input' || tag === 'select') return;
    spawnRipple(e.clientX, e.clientY);
  });
}

/* ══════════════════════════════════════════════════════════════
   TIMER  (MODIFIED: timerTarget for dynamic max duration)
══════════════════════════════════════════════════════════════ */
const TOTAL_SECS = 30 * 60;          // default 30-min workout timer
const CIRC       = 2 * Math.PI * 68; // r=68  ≈ 427.26

let timeLeft     = TOTAL_SECS;
let timerTarget  = TOTAL_SECS;       // NEW: max for arc %; changes for rest timers
let timerRunning = false;
let timerTick    = null;
let isRestMode   = false;             // NEW: visual flag
let restTimeLeft = 0;                // NEW: background rest timer
let restTick = null;                 // NEW: interval for rest timer
let isRestActive = false;            // NEW: flag for background rest
let restTarget = 0;                  // NEW: target for rest arc

const arcEl     = document.getElementById('timerArc');
const timeEl    = document.getElementById('timerTime');
const statusEl  = document.getElementById('timerStatus');
const svgWrap   = document.getElementById('timerSvgWrap');
const playBtn   = document.getElementById('timerPlayBtn');
const resetBtn  = document.getElementById('timerResetBtn');
const playIcon  = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const labelEl   = document.getElementById('timerLabel');

function renderTimer() {
  if (isRestActive) {
    const m = String(Math.floor(restTimeLeft / 60)).padStart(2, '0');
    const s = String(restTimeLeft % 60).padStart(2, '0');
    timeEl.textContent = `${m}:${s}`;
    const pct = restTarget > 0 ? restTimeLeft / restTarget : 1;
    const dash = CIRC * pct;
    arcEl.setAttribute('stroke-dasharray', `${dash} ${CIRC}`);
    const g = Math.round(180 + pct * 37);
    const b = Math.round(200 + pct * 55);
    arcEl.setAttribute('stroke', `rgb(0,${g},${b})`);
    timeEl.style.color = `rgba(0,217,255,0.95)`;
    statusEl.textContent = 'REST';
    svgWrap.classList.add('rest-mode');
    if (labelEl) {
      labelEl.textContent = 'REST TIMER';
      labelEl.classList.add('rest-active');
    }
    resetBtn.title = 'Stop Rest';
    resetBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1"/></svg>`;
    playBtn.style.display = 'none';
    pauseIcon.style.display = 'none';
    resetBtn.style.display = 'block';
    return;
  }

  svgWrap.classList.remove('rest-mode');
  if (labelEl) {
    labelEl.textContent = 'WORKOUT TIMER';
    labelEl.classList.remove('rest-active');
  }

  resetBtn.style.display = 'block';
  resetBtn.title = 'Reset';
  resetBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7A6 6 0 1 0 7 1"/><polyline points="1,1 1,5 5,5"/></svg>`;

  playBtn.style.display = 'block';

  const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const s = String(timeLeft % 60).padStart(2, '0');
  timeEl.textContent = `${m}:${s}`;

  const pct  = timerTarget > 0 ? timeLeft / timerTarget : 1;
  const dash = CIRC * pct;
  arcEl.setAttribute('stroke-dasharray', `${dash} ${CIRC}`);

  if (isRestMode) {
    const g = Math.round(180 + pct * 37);
    const b = Math.round(200 + pct * 55);
    arcEl.setAttribute('stroke', `rgb(0,${g},${b})`);
    timeEl.style.color = `rgba(0,217,255,0.95)`;
  } else {
    const hue   = 20 + Math.round(pct * 12);
    const light = 48 + Math.round(pct * 8);
    arcEl.setAttribute('stroke', `hsl(${hue},100%,${light}%)`);
    timeEl.style.color = `hsl(${hue},100%,${light}%)`;
  }

  if (timerRunning) {
    playIcon.style.display  = 'none';
    pauseIcon.style.display = '';
    statusEl.textContent = isRestMode ? 'REST' : 'RUNNING';
  } else {
    playIcon.style.display  = '';
    pauseIcon.style.display = 'none';
    if (timeLeft === timerTarget) {
      statusEl.textContent = isRestMode ? 'REST READY' : 'READY';
    } else {
      statusEl.textContent = 'PAUSED';
    }
  }

  if (isRestActive) statusEl.textContent = 'REST ACTIVE';

  resetBtn.title = isRestActive ? 'Stop Rest' : 'Reset';
  resetBtn.innerHTML = isRestActive ? `<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1"/></svg>` : `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7A6 6 0 1 0 7 1"/><polyline points="1,1 1,5 5,5"/></svg>`;
}

function startTimer() {
  timerRunning = true;
  svgWrap.classList.add('timer-running');
  if (isRestMode) svgWrap.classList.add('rest-mode');

  timerTick = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      renderTimer();
      saveTimerState();
    } else {
      // Timer complete
      clearInterval(timerTick);
      timerRunning = false;
      svgWrap.classList.remove('timer-running');

      timerTarget = TOTAL_SECS;
      timeLeft    = TOTAL_SECS;

      renderTimer();
      saveTimerState();
      svgWrap.classList.add('timer-pulse');
      svgWrap.addEventListener('animationend', () => svgWrap.classList.remove('timer-pulse'), { once: true });
    }
  }, 1000);
  renderTimer();
}

function pauseTimer() {
  clearInterval(timerTick);
  timerRunning = false;
  svgWrap.classList.remove('timer-running');
  renderTimer();
  saveTimerState();
}

function resetTimer() {
  pauseTimer();
  isRestMode  = false;
  svgWrap.classList.remove('rest-mode');
  if (labelEl) { labelEl.textContent = 'WORKOUT TIMER'; labelEl.classList.remove('rest-active'); }
  timerTarget = TOTAL_SECS;
  timeLeft    = TOTAL_SECS;
  renderTimer();
  saveTimerState();
}

function stopRestAndResume() {
  if (timerRunning) pauseTimer();
  stopWorkoutTick();
  isRestMode = false;
  svgWrap.classList.remove('rest-mode');
  if (labelEl) {
    labelEl.textContent = 'WORKOUT TIMER';
    labelEl.classList.remove('rest-active');
  }
  timerTarget = TOTAL_SECS;
  timeLeft = workoutTimeLeft;
  if (workoutWasRunning) startTimer();
  renderTimer();
  saveTimerState();
}

function startWorkoutTick() {
  stopWorkoutTick();
  workoutTick = setInterval(() => {
    if (workoutTimeLeft > 0) {
      workoutTimeLeft--;
    } else {
      clearInterval(workoutTick);
      workoutTick = null;
    }
  }, 1000);
}

function stopWorkoutTick() {
  if (workoutTick) {
    clearInterval(workoutTick);
    workoutTick = null;
  }
}

/**
 * NEW: Auto-start a rest countdown.
 * @param {number} secs  Duration in seconds
 * @param {string} label Display label e.g. "REST · 45 SEC"
 */
function startRestTimer(secs, label) {
  // Force unpause main timer if paused
  if (!timerRunning) {
    startTimer();
  }
  // Start rest in background without pausing main timer
  isRestActive = true;
  restTimeLeft = secs;
  restTarget = secs;
  restTick = setInterval(() => {
    restTimeLeft--;
    if (restTimeLeft <= 0) {
      playSound('timerDone');
      isRestActive = false;
      clearInterval(restTick);
      restTick = null;
      restTarget = 0;
      renderTimer();
    }
  }, 1000);
  renderTimer();
}

function initTimer() {
  loadTimerState();
  // Resume rest timer if it was active
  if (isRestActive && restTimeLeft > 0) {
    restTick = setInterval(() => {
      restTimeLeft--;
      if (restTimeLeft <= 0) {
        playSound('timerDone');
        isRestActive = false;
        clearInterval(restTick);
        restTick = null;
        restTarget = 0;
        renderTimer();
      }
    }, 1000);
  }
  renderTimer();
  playBtn.addEventListener('click',  () => { timerRunning ? pauseTimer() : startTimer(); });
  resetBtn.addEventListener('click', () => {
    if (isRestActive) {
      isRestActive = false;
      clearInterval(restTick);
      restTick = null;
      restTarget = 0;
      renderTimer();
    } else {
      resetTimer();
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   STATS BAR
══════════════════════════════════════════════════════════════ */
function updateStats() {
  let total = 0, done = 0;
  WORKOUTS.forEach(w => {
    w.sections.forEach(s => {
      total += s.exercises.length * s.rounds;
      const st   = state[s.id];
      const doneN = st.checked.filter(Boolean).length;
      done += (st.round - 1) * s.exercises.length + doneN;
    });
  });
  document.getElementById('s-progress').textContent = `${done}/${total}`;
  document.getElementById('s-cals').textContent     = weekCalsBurned();
  document.getElementById('s-pct').textContent      =
    total ? `${Math.round(done / total * 100)}%` : '0%';
}

/* ══════════════════════════════════════════════════════════════
   DAY STATUS HELPERS
══════════════════════════════════════════════════════════════ */
function isDayComplete(workout) {
  return workout.sections.every(s => {
    const st = state[s.id];
    const totalDone = (st.round - 1) * s.exercises.length + st.checked.filter(Boolean).length;
    return totalDone === s.exercises.length * s.rounds;
  });
}

function isDaySkipped(workout) {
  let hasSkip = false, hasRemaining = false;
  workout.sections.forEach(s => {
    const st = state[s.id];
    s.exercises.forEach((_, i) => {
      if (st.skipped[i]) hasSkip = true;
      if (!st.checked[i] && !st.skipped[i]) hasRemaining = true;
    });
  });
  return hasSkip && !hasRemaining;
}

function dayCalsBurned(workout) {
  return workout.sections.reduce((sum, s) => sum + sectionCalsBurned(s), 0);
}

/* ══════════════════════════════════════════════════════════════
   BUILD SECTION
══════════════════════════════════════════════════════════════ */
function buildSection(workout, sec) {
  const st           = state[sec.id];
  const totalExercises = sec.exercises.length * sec.rounds;
  const totalDone    = (st.round - 1) * sec.exercises.length + st.checked.filter(Boolean).length;
  const barPct       = totalExercises ? (totalDone / totalExercises) * 100 : 0;
  const allDone      = totalDone === totalExercises;
  const multi        = sec.rounds > 1;
  const maxCals      = sectionTotalMaxCals(sec);

  const el = document.createElement('div');
  el.className = `section${allDone ? ' all-done' : ''}`;
  el.id = `sec-${sec.id}`;

  const head = document.createElement('div');
  head.className = 'section-head';

  const left = document.createElement('div');
  left.className = 'section-left';
  left.innerHTML = `
    <div class="sec-pip"></div>
    <span class="sec-title">${sec.title}</span>
    <span class="sec-meta">
      <span class="sec-dur">${sec.dur}</span>
      ${maxCals > 0 ? `<span class="sec-total-cal">~${maxCals} kcal</span>` : ''}
    </span>
  `;
  head.appendChild(left);

  if (multi) {
    const ctrl = document.createElement('div');
    ctrl.className = 'round-ctrl';
    ctrl.innerHTML = `
      <button class="round-btn round-prev" ${st.round <= 1 ? 'disabled' : ''}>&#8249;</button>
      <span class="round-label">Round ${st.round}/${sec.rounds}</span>
      <button class="round-btn round-next" ${st.round >= sec.rounds ? 'disabled' : ''}>&#8250;</button>
    `;

    ctrl.querySelector('.round-prev').addEventListener('click', e => {
      e.stopPropagation();
      if (st.round > 1) {
        st.checkedRounds[st.round] = st.checked.slice();
        st.skippedRounds[st.round] = st.skipped.slice();
        const partialCals = sec.exercises.reduce((sum, ex, i) => sum + (st.checked[i] ? getCal(ex) : 0), 0);
        st.burnedCals -= partialCals;
        st.round--;
        st.checked = st.checkedRounds[st.round] ? st.checkedRounds[st.round].slice() : sec.exercises.map(() => false);
        st.skipped = st.skippedRounds[st.round] ? st.skippedRounds[st.round].slice() : sec.exercises.map(() => false);
        rebuildSectionAnimated(workout, sec, 'right');
        updateStats();
        saveState();
      }
    });

    ctrl.querySelector('.round-next').addEventListener('click', e => {
      e.stopPropagation();
      if (st.round < sec.rounds) {
        st.checkedRounds[st.round] = st.checked.slice();
        st.skippedRounds[st.round] = st.skipped.slice();
        const partialCals = sec.exercises.reduce((sum, ex, i) => sum + (st.checked[i] ? getCal(ex) : 0), 0);
        st.burnedCals += partialCals;
        st.round++;
        st.checked = st.checkedRounds[st.round] ? st.checkedRounds[st.round].slice() : sec.exercises.map(() => false);
        st.skipped = st.skippedRounds[st.round] ? st.skippedRounds[st.round].slice() : sec.exercises.map(() => false);
        rebuildSectionAnimated(workout, sec, 'left');
        updateStats();
        saveState();
      }
    });

    head.appendChild(ctrl);
  }

  el.appendChild(head);

  const bar = document.createElement('div');
  bar.className = 'sec-bar';
  bar.innerHTML = `<div class="sec-bar-fill" style="width:${barPct}%"></div>`;
  el.appendChild(bar);

  const ul = buildExerciseList(workout, sec);
  el.appendChild(ul);

  return el;
}

function buildExerciseList(workout, sec) {
  const st = state[sec.id];
  const ul = document.createElement('ul');
  ul.className = 'ex-list';

  sec.exercises.forEach((text, i) => {
    const isDone    = st.checked[i];
    const isSkipped = st.skipped[i] && !isDone;
    const cal       = getCal(text);
    const calLabel  = cal > 0 ? `${cal} kcal` : '';

    const li = document.createElement('li');
    li.className = `ex-item${isDone ? ' done' : isSkipped ? ' skipped' : ''}`;

    li.innerHTML = `
      <div class="ex-check">
        ${isDone
          ? `<svg class="check-svg" width="11" height="9" viewBox="0 0 11 9" fill="none">
               <path d="M1 4L4 7.5L10 1" stroke="white" stroke-width="1.8"
                     stroke-linecap="round" stroke-linejoin="round"/>
             </svg>`
          : isSkipped
          ? `<span class="skip-icon">–</span>`
          : `<svg class="check-svg" width="11" height="9" viewBox="0 0 11 9" fill="none">
               <path d="M1 4L4 7.5L10 1" stroke="white" stroke-width="1.8"
                     stroke-linecap="round" stroke-linejoin="round"/>
             </svg>`
        }
      </div>
      <div class="ex-text-wrap">
        <span class="ex-text">${text}</span>
        <span class="strike-line"></span>
      </div>
      ${calLabel ? `<span class="ex-cal">${calLabel}</span>` : ''}
      <button class="ex-skip-btn" data-idx="${i}">${isSkipped ? 'UNDO' : 'SKIP'}</button>
    `;

    li.addEventListener('click', e => {
      if (e.target.closest('.ex-skip-btn')) return;
      if (isSkipped) return;
      handleExerciseClick(workout, sec, i, li);
    });

    const skipBtn = li.querySelector('.ex-skip-btn');
    skipBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (isDone) return;
      handleSkipClick(workout, sec, i);
    });

    ul.appendChild(li);
  });

  return ul;
}

/* ══════════════════════════════════════════════════════════════
   REBUILD HELPERS
══════════════════════════════════════════════════════════════ */
function rebuildSection(workout, sec) {
  const old = document.getElementById(`sec-${sec.id}`);
  if (old) old.replaceWith(buildSection(workout, sec));
}

function rebuildSectionAnimated(workout, sec, direction) {
  const secEl = document.getElementById(`sec-${sec.id}`);
  if (!secEl) return;

  const oldList = secEl.querySelector('.ex-list');
  if (!oldList) { rebuildSection(workout, sec); return; }

  const outClass = direction === 'left' ? 'slide-out-left' : 'slide-out-right';
  const inClass  = direction === 'left' ? 'slide-in-right' : 'slide-in-left';

  oldList.classList.add(outClass);

  setTimeout(() => {
    const newSecEl = buildSection(workout, sec);
    secEl.replaceWith(newSecEl);
    const newList = newSecEl.querySelector('.ex-list');
    if (newList) newList.classList.add(inClass);
  }, 190);
}

/* ══════════════════════════════════════════════════════════════
   EXERCISE CLICK  (toggle done)
   MODIFIED: adds sound + rest timer auto-trigger
══════════════════════════════════════════════════════════════ */
function handleExerciseClick(workout, sec, idx, li) {
  const st = state[sec.id];
  st.checked[idx] = !st.checked[idx];

  if (st.checked[idx]) {
    // ── Sound: exercise tick ──
    playSound('tick');

    // ── Rest timer auto-trigger ──
    const restSecs = parseRestDuration(sec.exercises[idx]);
    if (restSecs) {
      const label = `REST · ${restSecs}S`;
      // Small delay so the check animation plays first
      setTimeout(() => {
        playSound('rest');
        startRestTimer(restSecs, label);
      }, 180);
    }

    // ── Round auto-advance for multi-round sections ──
    if (sec.rounds > 1 && st.checked.every(Boolean)) {
      if (st.round < sec.rounds) {
        const roundCals = sec.exercises.reduce((sum, ex, i) =>
          sum + (st.checked[i] ? getCal(ex) : 0), 0);
        st.burnedCals += roundCals;

        setTimeout(() => {
          st.checkedRounds[st.round] = sec.exercises.map(() => true);
          st.skippedRounds[st.round] = sec.exercises.map(() => false);
          st.round++;
          st.checked = st.checkedRounds[st.round] ? st.checkedRounds[st.round].slice() : sec.exercises.map(() => false);
          st.skipped = st.skippedRounds[st.round] ? st.skippedRounds[st.round].slice() : sec.exercises.map(() => false);
          rebuildSectionAnimated(workout, sec, 'left');
          updateStats();
          updateDayCard(workout);
          saveState();
        }, 420);

        rebuildSection(workout, sec);
        // ── Animation: just completed ──
        const sectionEl = document.getElementById(`sec-${sec.id}`);
        const exList = sectionEl.querySelector('.ex-list');
        const newLi = exList.children[idx];
        newLi.classList.add('just-completed');
        setTimeout(() => newLi.classList.remove('just-completed'), 500);
        updateStats();
        saveState();
        return;
      }
    }

    // ── Animation: just completed ──
    rebuildSection(workout, sec);
    const sectionEl = document.getElementById(`sec-${sec.id}`);
    const exList = sectionEl.querySelector('.ex-list');
    const newLi = exList.children[idx];
    newLi.classList.add('just-completed');
    setTimeout(() => newLi.classList.remove('just-completed'), 500);
  } else {
    rebuildSection(workout, sec);
  }

  updateStats();
  updateDayCard(workout);
  checkDayComplete(workout);
  saveState();
}

/* ══════════════════════════════════════════════════════════════
   SKIP CLICK
══════════════════════════════════════════════════════════════ */
function handleSkipClick(workout, sec, idx) {
  const st = state[sec.id];
  if (st.checked[idx]) return;

  st.skipped[idx] = !st.skipped[idx];

  rebuildSection(workout, sec);
  updateStats();
  updateDayCard(workout);
  checkDayComplete(workout);
  saveState();
}

/* ══════════════════════════════════════════════════════════════
   COMPLETION CHECKS
   MODIFIED: adds confetti + sound
══════════════════════════════════════════════════════════════ */
function checkDayComplete(workout) {
  const card = document.getElementById(`day-${workout.id}`);
  if (!card) return;

  if (isDayComplete(workout)) {
    setTimeout(() => {
      card.classList.remove('day-skipped');
      card.classList.add('finished');
      card.classList.remove('open');
      saveOpenState(getOpenMap());
      // ── Confetti burst from the day card ──
      spawnConfetti(card);
      // ── Fanfare sound ──
      playSound('day');
      checkWeekComplete();
    }, 600);
  } else if (isDaySkipped(workout)) {
    setTimeout(() => {
      card.classList.add('day-skipped');
      card.classList.remove('finished');
      card.classList.remove('open');
      saveOpenState(getOpenMap());
      checkWeekComplete();
    }, 400);
  }
}

function updateDayCard(workout) {
  const card = document.getElementById(`day-${workout.id}`);
  if (!card) return;
  if (isDayComplete(workout)) {
    card.classList.remove('day-skipped');
    card.classList.add('finished');
  } else if (isDaySkipped(workout)) {
    card.classList.add('day-skipped');
    card.classList.remove('finished');
  } else {
    card.classList.remove('day-skipped', 'finished');
  }
  const badge = card.querySelector('.day-cal-badge');
  if (badge) {
    const cals = dayCalsBurned(workout);
    badge.textContent = cals > 0 ? `${cals} kcal` : '';
  }
}

function checkWeekComplete() {
  const allDone = WORKOUTS.every(w => isDayComplete(w) || isDaySkipped(w));
  if (!allDone) return;
  setTimeout(() => forceEndWeek(), 800);
}

function getOpenMap() {
  const map = {};
  WORKOUTS.forEach(w => {
    const card = document.getElementById(`day-${w.id}`);
    if (card) map[w.id] = card.classList.contains('open');
  });
  return map;
}

/* ══════════════════════════════════════════════════════════════
   BUILD DAY CARD
══════════════════════════════════════════════════════════════ */
function buildDayCard(workout, openByDefault) {
  const card = document.createElement('div');
  card.id = `day-${workout.id}`;

  const isComplete = isDayComplete(workout);
  const isSkipped  = isDaySkipped(workout);
  card.className = `day-card${openByDefault ? ' open' : ''}${isComplete ? ' finished' : isSkipped ? ' day-skipped' : ''}`;

  const header = document.createElement('div');
  header.className = 'day-header';

  const calsBurned = dayCalsBurned(workout);

  header.innerHTML = `
    <div class="day-left">
      <div class="day-name">${workout.day}</div>
      <div class="day-meta">
        <span class="day-sub">${workout.subtitle}</span>
        <span class="day-cal-badge">${calsBurned > 0 ? `${calsBurned} kcal` : ''}</span>
      </div>
    </div>
    <div class="day-right">
    </div>
  `;

  const dayRight = header.querySelector('.day-right');

  const completeBtn = document.createElement('button');
  completeBtn.className = 'day-action-btn complete-day-icon';
  completeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg>';
  completeBtn.addEventListener('click', e => {
    e.stopPropagation();
    completeDay(workout);
  });
  dayRight.appendChild(completeBtn);

  const skipBtn = document.createElement('button');
  skipBtn.className = 'day-action-btn skip-day-icon';
  skipBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/></svg>';
  skipBtn.addEventListener('click', e => {
    e.stopPropagation();
    skipDay(workout);
  });
  dayRight.appendChild(skipBtn);

  const chevron = document.createElement('div');
  chevron.className = 'chevron';
  chevron.textContent = '↓';
  chevron.addEventListener('click', (e) => {
    e.stopPropagation();
    card.classList.toggle('open');
    saveOpenState(getOpenMap());
  });
  dayRight.appendChild(chevron);

  header.addEventListener('click', () => {
    card.classList.toggle('open');
    saveOpenState(getOpenMap());
  });

  card.appendChild(header);

  const body    = document.createElement('div');
  body.className = 'day-body';
  const inner   = document.createElement('div');
  inner.className = 'day-inner';
  const sections = document.createElement('div');
  sections.className = 'day-sections';

  workout.sections.forEach(sec => sections.appendChild(buildSection(workout, sec)));

  inner.appendChild(sections);
  body.appendChild(inner);
  card.appendChild(body);

  return card;
}

/* ══════════════════════════════════════════════════════════════
   COMPLETE DAY
══════════════════════════════════════════════════════════════ */
function skipDay(workout) {
  workout.sections.forEach(sec => {
    const st = state[sec.id];
    sec.exercises.forEach((_, i) => {
      if (!st.checked[i]) {
        st.skipped[i] = true;
      }
    });
    rebuildSection(workout, sec);
  });
  updateStats();
  updateDayCard(workout);
  checkDayComplete(workout);
  saveState();
}
function completeDay(workout) {
  workout.sections.forEach(sec => {
    const st = state[sec.id];
    if (sec.rounds === 1) {
      // Single round: just check all unchecked
      sec.exercises.forEach((_, i) => {
        if (!st.checked[i] && !st.skipped[i]) {
          st.checked[i] = true;
        }
      });
      st.burnedCals = sectionTotalMaxCals(sec);
    } else {
      // Multi-round: complete all rounds
      // First, complete the current round
      sec.exercises.forEach((_, i) => {
        if (!st.checked[i] && !st.skipped[i]) {
          st.checked[i] = true;
        }
      });
      // Save current round
      st.checkedRounds[st.round] = st.checked.slice();
      st.skippedRounds[st.round] = st.skipped.slice();
      // Now, for remaining rounds, mark them as completed
      for (let r = st.round + 1; r <= sec.rounds; r++) {
        st.checkedRounds[r] = sec.exercises.map(() => true);
        st.skippedRounds[r] = sec.exercises.map(() => false);
      }
      // Set to last round
      st.round = sec.rounds;
      st.checked = st.checkedRounds[st.round].slice();
      st.skipped = st.skippedRounds[st.round].slice();
      // Set burned cals to total
      st.burnedCals = sectionTotalMaxCals(sec);
    }
    rebuildSection(workout, sec);
  });
  updateStats();
  updateDayCard(workout);
  checkDayComplete(workout);
  saveState();
}

/* ══════════════════════════════════════════════════════════════
   NEW WEEK / RESET
   MODIFIED: saves history + updates streak before resetting
══════════════════════════════════════════════════════════════ */

// Holds stats computed in forceEndWeek, consumed in resetWeek
let pendingWeekStats = null;

function resetWeek() {
  // ── Persist history & update streak ──
  if (pendingWeekStats) {
    const history = loadHistory();
    history.push({ pct: pendingWeekStats.pct, cals: pendingWeekStats.cals, date: Date.now() });
    if (history.length > 8) history.splice(0, history.length - 8);
    saveHistory(history);
    updateStreak(pendingWeekStats.pct);
    pendingWeekStats = null;
  }

  WORKOUTS.forEach(w => {
    w.sections.forEach(s => {
      state[s.id] = freshSectionState(s);
    });
  });

  const today     = new Date().toLocaleString('en-US', { weekday: 'long' });
  const container = document.getElementById('days-container');
  container.innerHTML = '';
  WORKOUTS.forEach(w => container.appendChild(buildDayCard(w, w.day === today)));

  updateStats();
  document.getElementById('weekModal').classList.remove('show');
  saveState();
}

/* ══════════════════════════════════════════════════════════════
   WEEK SUMMARY MODAL
   MODIFIED: saves pendingWeekStats, draws chart, plays week sound
══════════════════════════════════════════════════════════════ */
function forceEndWeek() {
  let completedEx = 0, totalEx = 0, completedDays = 0;
  let skippedEx = 0, totalCalsBurned = 0;

  WORKOUTS.forEach(w => {
    let dayDone = true;
    w.sections.forEach(s => {
      totalEx += s.exercises.length;
      const st    = state[s.id];
      const doneN = st.checked.filter(Boolean).length;
      const skipN = st.skipped.filter(Boolean).length;
      completedEx  += doneN;
      skippedEx    += skipN;
      totalCalsBurned += sectionCalsBurned(s);
      if (doneN < s.exercises.length) dayDone = false;
    });
    if (dayDone) completedDays++;
  });

  const totalDays = WORKOUTS.length;
  const pct       = totalEx > 0 ? Math.round(completedEx / totalEx * 100) : 0;

  let completedRounds = 0;
  WORKOUTS.forEach(w => {
    w.sections.forEach(s => {
      if (s.rounds > 1) {
        const st = state[s.id];
        const allChecked = st.checked.every(Boolean);
        completedRounds += allChecked ? st.round : Math.max(0, st.round - 1);
      }
    });
  });

  // Store for resetWeek to consume
  pendingWeekStats = { pct, cals: totalCalsBurned, completedEx, completedDays };

  // Populate modal stats
  document.getElementById('m-days').textContent    = `${completedDays}/${totalDays}`;
  document.getElementById('m-exer').textContent    = `${completedEx}/${totalEx}`;
  document.getElementById('m-cals').textContent    = totalCalsBurned;
  document.getElementById('m-skipped').textContent = skippedEx;
  document.getElementById('m-pct').textContent     = `${pct}%`;
  document.getElementById('m-rounds').textContent  = completedRounds;

  const msgs = [
    [100, '🔥 Perfect week. Absolute beast mode.'],
    [80,  '💪 Strong week. Nearly flawless.'],
    [60,  '👊 Solid effort. Keep pushing.'],
    [30,  '⚡ Every rep counts. Build the habit.'],
    [1,   '😤 Tough week. Come back stronger.'],
    [0,   '💀 Zero reps. Time to get serious.'],
  ];
  const msg = msgs.find(([threshold]) => pct >= threshold);
  document.getElementById('m-msg').textContent = msg[1];

  // Previous week comparison
  const prevWeek = loadPrevWeek();
  const prevRow  = document.getElementById('prevWeekRow');
  if (prevWeek && typeof prevWeek.pct === 'number') {
    const delta  = pct - prevWeek.pct;
    const deltaEl = document.getElementById('pw-delta');
    deltaEl.className  = 'pw-delta ' + (delta > 0 ? 'up' : delta < 0 ? 'down' : 'same');
    deltaEl.textContent = delta === 0 ? '= Same' : (delta > 0 ? `↑ +${delta}%` : `↓ ${delta}%`);
    prevRow.style.display = '';
  } else {
    prevRow.style.display = 'none';
  }

  savePrevWeek({ pct, completedEx, totalCalsBurned, completedDays });

  // ── Draw 8-week chart ──
  const history = loadHistory();
  // Draw after modal is visible so canvas has layout dimensions
  setTimeout(() => drawWeekChart(history, pct), 60);

  // ── Week completion sound ──
  playSound('week');

  document.getElementById('weekModal').classList.add('show');
}

/* ══════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initState();
  loadState();
  initGrid();
  initClickRipple();
  initTimer();
  renderStreak(); // NEW

  const today     = new Date().toLocaleString('en-US', { weekday: 'long' });
  const openMap   = loadOpenState();
  const container = document.getElementById('days-container');

  WORKOUTS.forEach(w => {
    const shouldOpen = Object.keys(openMap).length
      ? !!openMap[w.id]
      : w.day === today;
    container.appendChild(buildDayCard(w, shouldOpen));
  });

  updateStats();

  document.getElementById('newWeekBtn').addEventListener('click', resetWeek);

  // Re-draw chart on modal show (handles resize after display:flex)
  document.getElementById('weekModal').addEventListener('click', e => {
    if (e.target === document.getElementById('weekModal')) {
      document.getElementById('weekModal').classList.remove('show');
    }
  });

  // Reset modal
  document.getElementById('resetModal').addEventListener('click', e => {
    if (e.target === document.getElementById('resetModal')) {
      document.getElementById('resetModal').classList.remove('show');
    }
  });
  document.getElementById('resetCancel').addEventListener('click', () => {
    document.getElementById('resetModal').classList.remove('show');
  });
  document.getElementById('resetConfirm').addEventListener('click', () => {
    localStorage.clear();
    location.reload();
  });

  window.addEventListener('keydown', evt => {
    if (evt.key === 'e' || evt.key === 'E') forceEndWeek();
    if (evt.key === '.') {
      document.getElementById('resetModal').classList.add('show');
    }
  });
});
