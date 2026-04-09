const clickSound = new Audio('sfx/click.mp3');

function playClick() {
  clickSound.currentTime = 0;
  clickSound.play().catch(() => {});
}

const DAYS = [
  {
    id: 'monday', name: 'Monday', type: 'Shoulders', icon: '🏋️',
    exercises: [
      { name: 'Warmup', warmup: true, info: '5 min' },
      { name: 'Shoulder Press', sets: 4, reps: '10' },
      { name: 'Lateral Raises', sets: 3, reps: '15' },
      { name: 'Reverse Fly', sets: 3, reps: '15' },
      { name: 'Bicep Curls', sets: 3, reps: '12' }
    ]
  },
  {
    id: 'tuesday', name: 'Tuesday', type: 'Legs', icon: '🦵',
    exercises: [
      { name: 'Warmup', warmup: true, info: '5 min' },
      { name: 'Squats', sets: 4, reps: '10' },
      { name: 'Lunges', sets: 3, reps: '12 ea' },
      { name: 'Romanian Deadlifts', sets: 3, reps: '10' },
      { name: 'Calf Raises', sets: 4, reps: '20' }
    ]
  },
  {
    id: 'wednesday', name: 'Wednesday', type: 'Back', icon: '🔙',
    exercises: [
      { name: 'Warmup', warmup: true, info: '5 min' },
      { name: 'Chin-ups', sets: 3, reps: '8' },
      { name: 'Dumbbell Rows', sets: 4, reps: '10' },
      { name: 'Face Pulls', sets: 3, reps: '15' },
      { name: 'Hammer Curls', sets: 3, reps: '12' }
    ]
  },
  {
    id: 'thursday', name: 'Thursday', type: 'Arms', icon: '💪',
    exercises: [
      { name: 'Warmup', warmup: true, info: '5 min' },
      { name: 'Dumbbell Curls', sets: 3, reps: '12' },
      { name: 'Skull Crushers', sets: 3, reps: '10' },
      { name: 'Overhead DB Extensions', sets: 3, reps: '12' },
      { name: 'Hammer Curls', sets: 3, reps: '12' },
      { name: 'Wrist Curls', sets: 3, reps: '20' },
      { name: 'Leg Raises', sets: 3, reps: '15' }
    ]
  },
  {
    id: 'friday', name: 'Friday', type: 'Chest', icon: '🫁',
    exercises: [
      { name: 'Warmup', warmup: true, info: '5 min' },
      { name: 'Bench Press', sets: 4, reps: '10' },
      { name: 'Incline Press', sets: 3, reps: '10' },
      { name: 'Push Ups', sets: 3, reps: '15' },
      { name: 'Overhead DB Extensions', sets: 3, reps: '12' },
      { name: 'TRX Push Up / Row', sets: 3, reps: '10' }
    ]
  }
];

const STORAGE_KEY = 'workout-v4';
const DOW_MAP = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday' };
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const ICONS = {
  Arms: 'Images/Arms.png',
  Back: 'Images/Back.png',
  Chest: 'Images/Chest.png',
  Legs: 'Images/Legs.png',
  Shoulders: 'Images/Shoulders.png'
};
const ACCENT = '#ff5a1f';

let timerInterval = null;
const TAB_KEY = 'workout-tab-v1';
let activeTab = (() => {
  try { return localStorage.getItem(TAB_KEY) || 'workout'; }
  catch { return 'workout'; }
})();

const CURRENT_WEEK_KEY = 'workout-current-week';
const WEEK_START_KEY = 'workout-week-start-date';

function getWeekStartDate() {
  try {
    const stored = localStorage.getItem(WEEK_START_KEY);
    return stored ? parseInt(stored, 10) : null;
  } catch (e) {
    return null;
  }
}

function setWeekStartDate(timestamp) {
  try {
    localStorage.setItem(WEEK_START_KEY, timestamp.toString());
  } catch (e) {
  }
}

function getCurrentWeekNumber() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDays = (now - startOfYear) / 86400000;
  return Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
}

function checkAndAdvanceWeek() {
  const storedWeekStart = getWeekStartDate();
  const now = new Date();
  
  if (!storedWeekStart) {
    setWeekStartDate(Date.now());
    return false;
  }
  
  const storedDate = new Date(storedWeekStart);
  
  // Get ISO week number for current date
  const getISOWeek = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };
  
  const currentWeek = getISOWeek(now);
  const storedWeek = getISOWeek(storedDate);
  const currentYear = now.getFullYear();
  const storedYear = storedDate.getFullYear();
  
  const currentIdentifier = `${currentYear}-${currentWeek}`;
  const storedIdentifier = `${storedYear}-${storedWeek}`;
  
  if (currentIdentifier !== storedIdentifier) {
    const previousWeek = getCurrentWeek();
    saveCurrentWeekStats();
    setCurrentWeek(previousWeek + 1);
    saveState({});
    setWeekStartDate(Date.now());
    return true;
  }
  
  return false;
}

function getCurrentWeek() {
  try {
    const stored = localStorage.getItem(CURRENT_WEEK_KEY);
    return stored ? parseInt(stored, 10) : 1;
  } catch (e) {
    return 1;
  }
}

function setCurrentWeek(week) {
  try {
    localStorage.setItem(CURRENT_WEEK_KEY, week.toString());
  } catch (e) {
  }
}

function saveCurrentWeekStats() {
  try {
    // Calculate current week's completion based on finished days
    const totalDays = DAYS.length;
    const completedDays = DAYS.reduce((sum, day) => {
      const ds = getDayState(day.id);
      return sum + (ds.status === 'finished' ? 1 : 0);
    }, 0);

    const completion = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    const weeklyStats = getWeeklyStats();
    const currentWeekNumber = getCurrentWeek();
    
    const existingWeek = weeklyStats.find(w => w.week === currentWeekNumber);
    
    if (!existingWeek) {
      weeklyStats.push({
        week: currentWeekNumber,
        completion: completion,
        completedDays: completedDays,
        totalDays: totalDays,
        timestamp: Date.now()
      });
      
      // Keep only last 52 weeks (1 year)
      if (weeklyStats.length > 52) {
        weeklyStats.shift();
      }
      
      localStorage.setItem('workout-weekly-stats', JSON.stringify(weeklyStats));
    } else {
      existingWeek.completion = completion;
      existingWeek.completedDays = completedDays;
      existingWeek.totalDays = totalDays;
      existingWeek.timestamp = Date.now();
      localStorage.setItem('workout-weekly-stats', JSON.stringify(weeklyStats));
    }
    
    return weeklyStats;
  } catch (e) {
    return [];
  }
}

function getWeeklyStats() {
  try {
    const stored = localStorage.getItem('workout-weekly-stats');
    if (stored) {
      let stats = JSON.parse(stored);
      
      // Clean up data older than 1 year (52 weeks)
      const oneYearAgo = Date.now() - (52 * 7 * 24 * 60 * 60 * 1000);
      const cleanedStats = stats.filter(w => w.timestamp && w.timestamp > oneYearAgo);
      
      // If we removed old data, save the cleaned stats
      if (cleanedStats.length < stats.length) {
        localStorage.setItem('workout-weekly-stats', JSON.stringify(cleanedStats));
      }
      
      return cleanedStats;
    }
  } catch (e) {
  }
  return [];
}

function getState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}

function saveState(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

function getDayState(dayId) {
  const s = getState();
  return s[dayId] || { status: 'idle', checks: {}, startTime: null, duration: 0, skipped: [] };
}

function setDayState(dayId, patch) {
  const s = getState();
  s[dayId] = { ...getDayState(dayId), ...patch };
  saveState(s);
}

function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

function pad(n) { return String(n).padStart(2, '0'); }

function getElapsed(startTime) { return Math.floor((Date.now() - startTime) / 1000); }

function lerpColor(r1, g1, b1, r2, g2, b2, t) {
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `${r}, ${g}, ${b}`;
}

function finishColor(completionRatio) {
  return ACCENT;
}

function formatMinutes(sec) {
  return `${Math.max(0, Math.round(sec / 60))}m`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}


function setActiveTab(tab) {
  activeTab = tab;
  try { localStorage.setItem(TAB_KEY, tab); } catch {}

  document.querySelectorAll('.tab-button').forEach(btn => {
    const isActive = btn.dataset.tab === tab;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('is-active', panel.dataset.panel === tab);
  });

  if (tab === 'statistics') {
    renderStatistics();
  }
  
  if (tab === 'achievements') {
    renderAchievements();
  }
}

function startTimer(dayId) {
  const day = DAYS.find(d => d.id === dayId);
  const bar = document.getElementById('timer-bar');
  const label = document.getElementById('timer-day-label');
  const display = document.getElementById('timer-display');

  bar.classList.remove('hidden');
  label.textContent = day.type;
  clearInterval(timerInterval);

  const tick = () => {
    const ds = getDayState(dayId);
    if (ds.startTime) display.textContent = formatTime(getElapsed(ds.startTime));
  };
  tick();
  timerInterval = setInterval(tick, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  document.getElementById('timer-bar').classList.add('hidden');
}

function updateRing(ringEl, ratio, color) {
  const circumference = 82;
  const offset = circumference - ratio * circumference;
  ringEl.style.strokeDashoffset = offset;
  ringEl.style.stroke = color || 'url(#grad)';
}

function buildRing(dayId, exercises) {
  const ds = getDayState(dayId);
  const done = exercises.filter((_, i) => ds.checks[i]).length;
  const ratio = exercises.length ? done / exercises.length : 0;

  const wrap = document.createElement('div');
  wrap.className = 'progress-ring-wrap';

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '34');
  svg.setAttribute('height', '34');
  svg.setAttribute('viewBox', '0 0 34 34');

  const defs = document.createElementNS(svgNS, 'defs');
  const grad = document.createElementNS(svgNS, 'linearGradient');
  grad.setAttribute('id', `grad-${dayId}`);
  grad.setAttribute('x1', '0%');
  grad.setAttribute('y1', '0%');
  grad.setAttribute('x2', '100%');
  grad.setAttribute('y2', '0%');

  const stop1 = document.createElementNS(svgNS, 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', ACCENT);

  const stop2 = document.createElementNS(svgNS, 'stop');
  stop2.setAttribute('offset', '100%');
  stop2.setAttribute('stop-color', ACCENT);

  grad.appendChild(stop1);
  grad.appendChild(stop2);
  defs.appendChild(grad);
  svg.appendChild(defs);

  const bgCircle = document.createElementNS(svgNS, 'circle');
  bgCircle.setAttribute('class', 'ring-bg');
  bgCircle.setAttribute('cx', '17');
  bgCircle.setAttribute('cy', '17');
  bgCircle.setAttribute('r', '13');

  const fillCircle = document.createElementNS(svgNS, 'circle');
  fillCircle.setAttribute('class', 'ring-fill');
  fillCircle.setAttribute('cx', '17');
  fillCircle.setAttribute('cy', '17');
  fillCircle.setAttribute('r', '13');
  fillCircle.style.strokeDashoffset = 82 - ratio * 82;
  fillCircle.style.stroke = ACCENT;

  svg.appendChild(bgCircle);
  svg.appendChild(fillCircle);

  const label = document.createElement('div');
  label.className = 'ring-label';
  label.textContent = Math.round(ratio * 100) + '%';

  wrap.appendChild(svg);
  wrap.appendChild(label);

  return { wrap, fillCircle, label };
}

function buildExerciseRow(day, exIndex, ex, isFinished) {
  const ds = getDayState(day.id);
  const isDone = !!ds.checks[exIndex];
  const isSkipped = ds.skipped.includes(exIndex);

  const row = document.createElement('div');
  row.className = 'exercise' + (isDone ? ' done' : '') + (isSkipped ? ' skipped' : '');

  const check = document.createElement('div');
  check.className = 'check';

  const doneIcon = document.createElement('span');
  doneIcon.className = 'check-icon done-icon';
  doneIcon.innerHTML = `<svg viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const skipIcon = document.createElement('span');
  skipIcon.className = 'check-icon skip-icon';
  skipIcon.innerHTML = `<svg viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2L8 8M8 2L2 8" stroke="rgba(210,80,60,0.7)" stroke-width="1.5" stroke-linecap="round"/></svg>`;

  check.appendChild(doneIcon);
  check.appendChild(skipIcon);

  const body = document.createElement('div');
  body.className = 'ex-body';

  const name = document.createElement('span');
  name.className = 'ex-name' + (ex.warmup ? ' is-warmup' : '');
  name.textContent = ex.name;

  const info = document.createElement('span');
  info.className = 'ex-info' + (ex.warmup ? ' is-warmup' : '');
  info.textContent = ex.warmup ? ex.info : `${ex.sets}×${ex.reps}`;

  body.appendChild(name);
  body.appendChild(info);
  row.appendChild(check);
  row.appendChild(body);

  if (!isFinished) {
    row.addEventListener('click', () => {
      playClick();
      const ds = getDayState(day.id);
      if (ds.status !== 'active') return;
      const newChecked = !ds.checks[exIndex];
      const newChecks = { ...ds.checks, [exIndex]: newChecked };
      setDayState(day.id, { checks: newChecks });
      row.classList.toggle('done', newChecked);

      const allDone = day.exercises.every((_, i) => newChecks[i]);
      if (allDone) finishDay(day.id, true);
      else {
        refreshRing(day.id, day.exercises);
        refreshStatisticsIfVisible();
      }
    });
  }

  return row;
}

function refreshRing(dayId, exercises) {
  const el = document.querySelector(`.day[data-id="${dayId}"]`);
  if (!el) return;
  const ds = getDayState(dayId);
  const done = exercises.filter((_, i) => ds.checks[i]).length;
  const ratio = exercises.length ? done / exercises.length : 0;
  const fill = el.querySelector('.ring-fill');
  const label = el.querySelector('.ring-label');
  if (fill) fill.style.strokeDashoffset = 82 - ratio * 82;
  if (label) label.textContent = Math.round(ratio * 100) + '%';
}

function applyFinishStyling(el, day) {
  const ds = getDayState(day.id);
  const workExercises = day.exercises.filter(e => !e.warmup);
  const workIndices = day.exercises.map((e, i) => e.warmup ? null : i).filter(i => i !== null);
  const completedWork = workIndices.filter(i => ds.checks[i] && !ds.skipped.includes(i)).length;
  const ratio = workExercises.length ? completedWork / workExercises.length : 1;
  const rgb = finishColor(ratio);

  el.style.borderColor = rgb;
  el.style.boxShadow = 'none';

  const header = el.querySelector('.day-header');
  if (header) header.style.background = 'transparent';

  const stripe = el.querySelector('.day-stripe');
  if (stripe) stripe.style.background = rgb;

  const fill = el.querySelector('.ring-fill');
  if (fill) fill.style.stroke = rgb;

  const badge = el.querySelector('.day-status-badge');
  if (badge) badge.style.color = rgb;
}

function svgEl(name, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}













function finishDay(dayId) {
  const ds = getDayState(dayId);
  const day = DAYS.find(d => d.id === dayId);
  const duration = ds.startTime ? getElapsed(ds.startTime) : 0;
  const skipped = day.exercises.map((_, i) => i).filter(i => !ds.checks[i]);
  setDayState(dayId, { status: 'finished', duration, skipped });
  stopTimer();
  rebuildDayEl(dayId);
  // Save week stats live every time a day is finished
  saveCurrentWeekStats();
  // Check for newly unlocked achievements
  if (typeof checkAndShowAchievements === 'function') {
    checkAndShowAchievements();
  }
  if (isWeekComplete()) {
    setTimeout(renderWeekSummary, 400);
  }
  refreshStatisticsIfVisible();
}

function startDay(dayId) {
  const active = DAYS.find(d => getDayState(d.id).status === 'active');
  if (active && active.id !== dayId) return;
  setDayState(dayId, { status: 'active', startTime: Date.now() });
  rebuildDayEl(dayId);
  startTimer(dayId);
}

function rebuildDayEl(dayId) {
  const container = document.getElementById('days-container');
  const existing = container.querySelector(`.day[data-id="${dayId}"]`);
  const wasOpen = existing?.classList.contains('open');
  const newEl = buildDayEl(DAYS.find(d => d.id === dayId), wasOpen);
  if (existing) existing.replaceWith(newEl);
  else container.appendChild(newEl);
}

function isWeekComplete() {
  return DAYS.every(d => getDayState(d.id).status === 'finished');
}

function buildDayEl(day, startOpen = false) {
  const ds = getDayState(day.id);
  const todayId = DOW_MAP[new Date().getDay()] || null;
  const isToday = day.id === todayId;
  const isFinished = ds.status === 'finished';
  const weekDone = isWeekComplete();

  const el = document.createElement('div');
  el.className = ['day', isToday ? 'active-day' : '', ds.status !== 'idle' ? `status-${ds.status}` : ''].filter(Boolean).join(' ');
  el.dataset.id = day.id;

  const header = document.createElement('div');
  header.className = 'day-header';

  const tint = document.createElement('div');
  tint.className = 'day-header-tint';
  header.appendChild(tint);

  const left = document.createElement('div');
  left.className = 'day-left';

  const stripe = document.createElement('div');
  stripe.className = 'day-stripe';

  const iconEl = document.createElement('div');
  iconEl.className = 'day-icon';
  
  const img = document.createElement('img');
  img.src = ICONS[day.type];
  iconEl.appendChild(img);

  const text = document.createElement('div');
  text.className = 'day-text';

  const nameEl = document.createElement('span');
  nameEl.className = 'day-name';
  nameEl.textContent = day.name;

  const typeEl = document.createElement('span');
  typeEl.className = 'day-type';
  typeEl.textContent = day.type;

  text.appendChild(nameEl);
  text.appendChild(typeEl);
  left.appendChild(stripe);
  left.appendChild(iconEl);
  left.appendChild(text);

  const right = document.createElement('div');
  right.className = 'day-right';

  const { wrap: ringWrap } = buildRing(day.id, day.exercises);

  const badge = document.createElement('span');
  badge.className = 'day-status-badge';
  if (ds.status === 'active') badge.textContent = 'Active';
  else if (isFinished) {
    const skipCount = ds.skipped.filter(i => !day.exercises[i]?.warmup).length;
    badge.textContent = skipCount > 0 ? `${skipCount} skipped` : 'Done';
  } else {
    badge.textContent = `${day.exercises.filter(e => !e.warmup).length} sets`;
  }

  right.appendChild(ringWrap);
  right.appendChild(badge);

  header.appendChild(left);
  header.appendChild(right);

  const exercises = document.createElement('div');
  exercises.className = 'exercises';

  const list = document.createElement('div');
  list.className = 'exercises-list';

  day.exercises.forEach((ex, i) => {
    list.appendChild(buildExerciseRow(day, i, ex, isFinished));
  });

  exercises.appendChild(list);

  const actions = document.createElement('div');
  actions.className = 'day-actions';

  if (ds.status === 'idle') {
    const startBtn = document.createElement('button');
    startBtn.className = 'btn btn-start';
    startBtn.textContent = 'Start';
    startBtn.addEventListener('click', e => { playClick(); e.stopPropagation(); startDay(day.id); });
    actions.appendChild(startBtn);
  } else if (ds.status === 'active') {
    const finishBtn = document.createElement('button');
    finishBtn.className = 'btn btn-finish';
    finishBtn.textContent = 'Finish';
    finishBtn.addEventListener('click', e => { playClick(); e.stopPropagation(); finishDay(day.id); });
    actions.appendChild(finishBtn);
  } else if (isFinished) {
    const dur = document.createElement('span');
    dur.className = 'finished-duration';
    dur.textContent = formatTime(ds.duration || 0);
    actions.appendChild(dur);

    if (!weekDone) {
      const resetBtn = document.createElement('button');
      resetBtn.className = 'btn btn-reset';
      resetBtn.textContent = 'Reset';
      resetBtn.addEventListener('click', e => {
        playClick();
        e.stopPropagation();
        setDayState(day.id, { status: 'idle', checks: {}, startTime: null, duration: 0, skipped: [] });
        rebuildDayEl(day.id);
        refreshStatisticsIfVisible();
      });
      actions.appendChild(resetBtn);
    }
  }

  exercises.appendChild(actions);

  header.addEventListener('click', () => {
    playClick();
    const isOpen = el.classList.contains('open');
    document.querySelectorAll('.day.open').forEach(d => d.classList.remove('open'));
    if (!isOpen) el.classList.add('open');
  });

  el.appendChild(header);
  el.appendChild(exercises);
  if (startOpen) el.classList.add('open');

  if (isFinished) requestAnimationFrame(() => applyFinishStyling(el, day));

  return el;
}

function renderWeekSummary() {
  const modal = document.getElementById('week-modal');
  const container = document.getElementById('modal-inner');

  modal.classList.remove('hidden');
  container.innerHTML = '';

  const totalSec = DAYS.reduce((a, d) => a + (getDayState(d.id).duration || 0), 0);

  const inner = document.createElement('div');
  inner.className = 'week-summary-inner';

  const hdr = document.createElement('div');
  hdr.className = 'summary-header';

  const title = document.createElement('span');
  title.className = 'summary-title';
  title.textContent = 'Week Complete';

  const totalEl = document.createElement('span');
  totalEl.className = 'summary-total';
  totalEl.textContent = formatTime(totalSec) + ' total';

  hdr.appendChild(title);
  hdr.appendChild(totalEl);

  const rows = document.createElement('div');
  rows.className = 'summary-rows';

  DAYS.forEach(d => {
    const ds = getDayState(d.id);
    const row = document.createElement('div');
    row.className = 'summary-row';

    // Add performance indicator
    const workExercises = d.exercises.filter(e => !e.warmup);
    const workIndices = d.exercises.map((e, i) => e.warmup ? null : i).filter(i => i !== null);
    const completedWork = workIndices.filter(i => ds.checks[i] && !ds.skipped.includes(i)).length;
    const ratio = workExercises.length ? completedWork / workExercises.length : 1;
    
    const perfIndicator = document.createElement('div');
    perfIndicator.className = 'summary-performance';
    
    if (ratio >= 0.9) {
      perfIndicator.classList.add('excellent');
    } else if (ratio >= 0.6) {
      perfIndicator.classList.add('good');
    } else {
      perfIndicator.classList.add('poor');
    }

    const sDayEl = document.createElement('span');
    sDayEl.className = 's-day';
    sDayEl.textContent = d.name;

    const sTypeEl = document.createElement('span');
    sTypeEl.className = 's-type';
    sTypeEl.textContent = d.type;

    const sStat = document.createElement('span');
    sStat.className = 's-stat';
    sStat.textContent = formatTime(ds.duration || 0);

    row.appendChild(perfIndicator);
    row.appendChild(sDayEl);
    row.appendChild(sTypeEl);
    row.appendChild(sStat);
    rows.appendChild(row);
  });

  const footer = document.createElement('div');
  footer.className = 'summary-footer';

  const newWeekBtn = document.createElement('button');
  newWeekBtn.className = 'btn-new-week';
  newWeekBtn.textContent = 'New Week';
  newWeekBtn.addEventListener('click', () => {
    playClick();
    // Save current week stats before advancing
    saveCurrentWeekStats();
    // Advance to next week
    const currentWeek = getCurrentWeek();
    setCurrentWeek(currentWeek + 1);
    // Clear workout state for new week
    saveState({});
    modal.classList.add('hidden');
    document.getElementById('days-container').innerHTML = '';
    render();
    refreshStatisticsIfVisible();
  });

  footer.appendChild(newWeekBtn);
  inner.appendChild(hdr);
  inner.appendChild(rows);
  inner.appendChild(footer);
  container.appendChild(inner);
}

let tabsBound = false;
function bindTabs() {
  if (tabsBound) return;
  tabsBound = true;

  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      playClick();
      setActiveTab(btn.dataset.tab || 'workout');
    });
  });
}

function showResetModal() {
  const modal1 = document.getElementById('reset-modal-1');
  const modal2 = document.getElementById('reset-modal-2');
  const input = document.getElementById('reset-confirm-input');
  const yesBtn2 = document.getElementById('reset-yes-2');
  const resetsfx = new Audio('sfx/reset.mp3');
  
  // Show first modal
  modal1.classList.remove('hidden');
  
  // Handle No button on first modal
  document.getElementById('reset-no-1').onclick = () => {
    modal1.classList.add('hidden');
  };
  
  // Handle Yes button on first modal - show second modal
  document.getElementById('reset-yes-1').onclick = () => {
    modal1.classList.add('hidden');
    modal2.classList.remove('hidden');
    input.value = '';
    yesBtn2.disabled = true;
    input.focus();
  };
  
  // Handle input validation on second modal
  input.oninput = () => {
    yesBtn2.disabled = input.value.toLowerCase() !== 'reset';
  };
  
  // Handle No button on second modal
  document.getElementById('reset-no-2').onclick = () => {
    modal2.classList.add('hidden');
  };
  
  // Handle Yes button on second modal
  yesBtn2.onclick = () => {
    if (input.value.toLowerCase() === 'reset') {
      performReset();
      modal2.classList.add('hidden');
      resetsfx.play()
    }
  };
  
  // Close on backdrop click for both modals
  modal1.querySelector('.modal-backdrop').onclick = () => {
    modal1.classList.add('hidden');
  };
  modal2.querySelector('.modal-backdrop').onclick = () => {
    modal2.classList.add('hidden');
  };
}

function performReset() {
  try {
    localStorage.clear();
    
    setCurrentWeek(1);
    
    render();
    
  } catch (e) {
    alert('Error resetting data. Please try again.');
  }
}

function render() {
  const didAdvance = checkAndAdvanceWeek();
  
  const todayIndex = new Date().getDay();
  const todayId = DOW_MAP[todayIndex] || null;

  document.getElementById('today-label').textContent = `${DAY_NAMES[todayIndex]} | Week ${getCurrentWeek()}`;

  // Add click handler to week number for reset
  const todayLabel = document.getElementById('today-label');
  todayLabel.style.cursor = 'pointer';
  todayLabel.addEventListener('click', () => { playClick(); showResetModal(); });

  const container = document.getElementById('days-container');
  container.innerHTML = '';

  DAYS.forEach(day => {
    const isToday = day.id === todayId;
    container.appendChild(buildDayEl(day, isToday));
  });

  const activeDay = DAYS.find(d => getDayState(d.id).status === 'active');
  if (activeDay) startTimer(activeDay.id);

  // Timer scroll behavior - single timer with header/sticky mode switching and fade
  const timerBar = document.getElementById('timer-bar');
  const header = document.querySelector('header');
  let ticking = false;
  let lastMode = 'header';
  
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const headerHeight = header ? header.offsetHeight : 60;
        const fadeStart = headerHeight * 0.1;
        const fadeEnd = headerHeight * 0.6;
        
        if (timerBar && !timerBar.classList.contains('hidden')) {
          if (scrollY <= fadeStart) {
            // At top - header mode, fully visible
            if (lastMode !== 'header') {
              timerBar.classList.remove('sticky-mode');
              timerBar.classList.add('header-mode');
              timerBar.style.opacity = '1';
              lastMode = 'header';
            }
          } else if (scrollY >= fadeEnd) {
            // Fully scrolled - sticky mode, fully visible
            if (lastMode !== 'sticky') {
              timerBar.style.opacity = '0';
              setTimeout(() => {
                timerBar.classList.remove('header-mode');
                timerBar.classList.add('sticky-mode');
                timerBar.style.opacity = '1';
              }, 200);
              lastMode = 'sticky';
            }
          }
        } else {
          // Timer hidden
          if (header) {
            header.style.opacity = '1';
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check

  if (isWeekComplete()) renderWeekSummary();
  bindTabs();
  setActiveTab(activeTab);
}

render();
