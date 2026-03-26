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

let timerInterval = null;

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
  const red = [200, 35, 20];
  const amber = [220, 120, 0];
  const green = [30, 180, 90];

  let rgb;
  if (completionRatio < 0.5) {
    const t = completionRatio * 2;
    rgb = lerpColor(...red, ...amber, t);
  } else {
    const t = (completionRatio - 0.5) * 2;
    rgb = lerpColor(...amber, ...green, t);
  }
  return rgb;
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
  stop1.setAttribute('stop-color', '#ff4d1a');

  const stop2 = document.createElementNS(svgNS, 'stop');
  stop2.setAttribute('offset', '100%');
  stop2.setAttribute('stop-color', '#ff9100');

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
  fillCircle.style.stroke = `url(#grad-${dayId})`;

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
      const ds = getDayState(day.id);
      if (ds.status !== 'active') return;
      const newChecked = !ds.checks[exIndex];
      const newChecks = { ...ds.checks, [exIndex]: newChecked };
      setDayState(day.id, { checks: newChecks });
      row.classList.toggle('done', newChecked);

      const allDone = day.exercises.every((_, i) => newChecks[i]);
      if (allDone) finishDay(day.id, true);
      else refreshRing(day.id, day.exercises);
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

  el.style.borderColor = `rgba(${rgb}, 0.35)`;
  el.style.boxShadow = `0 4px 24px rgba(${rgb}, 0.12)`;

  const header = el.querySelector('.day-header');
  if (header) header.style.background = `rgba(${rgb}, 0.08)`;

  const stripe = el.querySelector('.day-stripe');
  if (stripe) stripe.style.background = `rgb(${rgb})`;

  const fill = el.querySelector('.ring-fill');
  if (fill) fill.style.stroke = `rgb(${rgb})`;

  const badge = el.querySelector('.day-status-badge');
  if (badge) badge.style.color = `rgba(${rgb}, 0.8)`;
}

function finishDay(dayId) {
  const ds = getDayState(dayId);
  const day = DAYS.find(d => d.id === dayId);
  const duration = ds.startTime ? getElapsed(ds.startTime) : 0;
  const skipped = day.exercises.map((_, i) => i).filter(i => !ds.checks[i]);
  setDayState(dayId, { status: 'finished', duration, skipped });
  stopTimer();
  rebuildDayEl(dayId);
  if (isWeekComplete()) setTimeout(renderWeekSummary, 400);
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
    startBtn.addEventListener('click', e => { e.stopPropagation(); startDay(day.id); });
    actions.appendChild(startBtn);
  } else if (ds.status === 'active') {
    const finishBtn = document.createElement('button');
    finishBtn.className = 'btn btn-finish';
    finishBtn.textContent = 'Finish';
    finishBtn.addEventListener('click', e => { e.stopPropagation(); finishDay(day.id); });
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
        e.stopPropagation();
        setDayState(day.id, { status: 'idle', checks: {}, startTime: null, duration: 0, skipped: [] });
        rebuildDayEl(day.id);
      });
      actions.appendChild(resetBtn);
    }
  }

  exercises.appendChild(actions);

  header.addEventListener('click', () => {
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
    saveState({});
    modal.classList.add('hidden');
    document.getElementById('days-container').innerHTML = '';
    render();
  });

  footer.appendChild(newWeekBtn);
  inner.appendChild(hdr);
  inner.appendChild(rows);
  inner.appendChild(footer);
  container.appendChild(inner);

  // close on backdrop click
  modal.querySelector('.modal-backdrop').onclick = () => {
    modal.classList.add('hidden');
  };
}

function render() {
  const todayIndex = new Date().getDay();
  const todayId = DOW_MAP[todayIndex] || null;

  document.getElementById('today-label').textContent = DAY_NAMES[todayIndex];

  const container = document.getElementById('days-container');
  container.innerHTML = '';

  DAYS.forEach(day => {
    const isToday = day.id === todayId;
    container.appendChild(buildDayEl(day, isToday));
  });

  const activeDay = DAYS.find(d => getDayState(d.id).status === 'active');
  if (activeDay) startTimer(activeDay.id);

  if (isWeekComplete()) renderWeekSummary();
}

render();