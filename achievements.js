const SHOWN_ACHIEVEMENTS_KEY = 'workout-shown-achievements';
const UNLOCK_ALL_KEY = 'workout-unlock-all';
const FORCE_UNLOCKED_KEY = 'workout-force-unlocked';

function getShownAchievements() {
  try {
    return JSON.parse(localStorage.getItem(SHOWN_ACHIEVEMENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function areAllAchievementsUnlocked() {
  try {
    return localStorage.getItem(UNLOCK_ALL_KEY) === 'true';
  } catch {
    return false;
  }
}

function getForceUnlocked() {
  try {
    return JSON.parse(localStorage.getItem(FORCE_UNLOCKED_KEY) || '[]');
  } catch {
    return [];
  }
}

function markAchievementShown(id) {
  try {
    const shown = getShownAchievements();
    if (!shown.includes(id)) {
      shown.push(id);
      localStorage.setItem(SHOWN_ACHIEVEMENTS_KEY, JSON.stringify(shown));
    }
  } catch {}
}

function showAchievementNotification(name, icon, tier) {
  if (tier === 'ultra-gold') {
    showUltraGoldOverlay(name, icon);
  } else {
    showAchievementToast(name, icon, tier);
  }
}

function showAchievementToast(name, icon, tier) {
  const toast = document.getElementById('achievement-toast');
  if (!toast) return;
  
  const iconEl = toast.querySelector('.achievement-toast-icon');
  const textEl = toast.querySelector('.achievement-toast-text');
  
  iconEl.innerHTML = `<img src="${icon}" alt="" aria-hidden="true">`;
  textEl.textContent = `Achievement unlocked: ${name}`;
  
  toast.className = 'achievement-toast tier-' + (tier || 'default');
  
  const achievement = new Audio('sfx/achievement.mp3');
  achievement.play().catch(() => {});
  
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function showUltraGoldOverlay(name, icon) {
  const overlay = document.getElementById('achievement-overlay');
  const img = document.getElementById('achievement-icon-img');
  const nameText = document.getElementById('achievement-name-text');
  
  if (!overlay || !img || !nameText) return;
  
  img.src = icon;
  nameText.textContent = name;
  overlay.className = 'achievement-overlay tier-ultra-gold';
  
  const ultraSfx = new Audio('sfx/ultra-achievement.mp3');
  ultraSfx.play().catch(() => {});
  createUltraGoldCelebration();
  
  requestAnimationFrame(() => {
    overlay.classList.add('show');
  });
  
  setTimeout(() => {
    overlay.classList.add('exit');
    setTimeout(() => {
      overlay.classList.remove('show', 'exit');
      img.src = '';
    }, 500);
  }, 6000);
}

function createUltraGoldCelebration() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  const colors = ['#ffaa00', '#ffd700', '#ff5a1f', '#ffffff', '#ff8a00'];
  
  for (let i = 0; i < 150; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20 - 5,
      life: 1,
      decay: 0.01 + Math.random() * 0.01,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 3 + Math.random() * 6
    });
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life -= p.decay;
      p.vx *= 0.98;
      
      if (p.life > 0) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    if (particles.some(p => p.life > 0)) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }
  
  animate();
  
  setTimeout(() => {
    document.body.style.animation = 'none';
  }, 500);
}

function calculateTotalWorkouts() {
  const state = getState();
  let total = 0;
  DAYS.forEach(day => {
    const ds = state[day.id] || {};
    if (ds.status === 'finished') {
      total++;
    }
  });
  
  return total;
}

const ACHIEVEMENT_CATEGORIES = {
  'Total Workouts': [
    {
      id: 'first-workout',
      name: 'First Workout',
      icon: 'icons/achievements/TotalWorkouts/First-Workout.svg',
      tier: 'bronze',
      checkUnlocked: (totalWorkouts) => totalWorkouts >= 1
    },
    {
      id: '3-workouts',
      name: '3 Workouts',
      icon: 'icons/achievements/TotalWorkouts/3 Workouts.svg',
      tier: 'silver',
      checkUnlocked: (totalWorkouts) => totalWorkouts >= 3
    },
    {
      id: '5-workouts',
      name: '5 Workouts',
      icon: 'icons/achievements/TotalWorkouts/5 Workouts.svg',
      tier: 'gold',
      checkUnlocked: (totalWorkouts) => totalWorkouts >= 5
    },
    {
      id: '10-workouts',
      name: '10 Workouts',
      icon: 'icons/achievements/TotalWorkouts/10 Workouts.svg',
      tier: 'bronze',
      checkUnlocked: (totalWorkouts) => totalWorkouts >= 10
    },
    {
      id: '25-workouts',
      name: '25 Workouts',
      icon: 'icons/achievements/TotalWorkouts/25 Workouts.svg',
      tier: 'silver',
      checkUnlocked: (totalWorkouts) => totalWorkouts >= 25
    },
    {
      id: '50-workouts',
      name: '50 Workouts',
      icon: 'icons/achievements/TotalWorkouts/50 Workouts.svg',
      tier: 'gold',
      checkUnlocked: (totalWorkouts) => totalWorkouts >= 50
    },
    {
      id: '100-workouts',
      name: '100 Workouts',
      icon: 'icons/achievements/TotalWorkouts/100 Workouts.svg',
      tier: 'bronze',
      checkUnlocked: (totalWorkouts) => totalWorkouts >= 100
    },
    {
      id: '250-workouts',
      name: '250 Workouts',
      icon: 'icons/achievements/TotalWorkouts/250 Workouts.svg',
      tier: 'silver',
      checkUnlocked: (totalWorkouts) => totalWorkouts >= 250
    },
    {
      id: '500-workouts',
      name: '500 Workouts',
      icon: 'icons/achievements/TotalWorkouts/500 Workouts.svg',
      tier: 'gold',
      checkUnlocked: (totalWorkouts) => totalWorkouts >= 500
    },
    {
      id: '1000-workouts',
      name: '1000 Workouts',
      icon: 'icons/achievements/TotalWorkouts/1000 Workouts.svg',
      tier: 'ultra-gold',
      checkUnlocked: (totalWorkouts) => totalWorkouts >= 1000
    }
  ],
};

function checkAndShowAchievements() {
  const totalWorkouts = calculateTotalWorkouts();
  const shownAchievements = getShownAchievements();
  
  Object.values(ACHIEVEMENT_CATEGORIES).forEach(achievements => {
    achievements.forEach(ach => {
      const isUnlocked = ach.checkUnlocked(totalWorkouts);
      if (isUnlocked && !shownAchievements.includes(ach.id)) {
        showAchievementNotification(ach.name, ach.icon, ach.tier);
        markAchievementShown(ach.id);
      }
    });
  });
}

function calculateAchievementsByCategory() {
  const totalWorkouts = calculateTotalWorkouts();
  const allUnlocked = areAllAchievementsUnlocked();
  const forceUnlocked = getForceUnlocked();
  
  const result = {};
  
  Object.entries(ACHIEVEMENT_CATEGORIES).forEach(([category, achievements]) => {
    result[category] = achievements.map(ach => ({
      id: ach.id,
      name: ach.name,
      icon: ach.icon,
      tier: ach.tier,
      unlocked: allUnlocked || forceUnlocked.includes(ach.id) || ach.checkUnlocked(totalWorkouts)
    }));
  });
  
  return result;
}

function renderAchievements() {
  const container = document.getElementById('achievements-container');
  if (!container) return;
  
  const categories = calculateAchievementsByCategory();
  
  let html = '<div class="achievements-wrapper">';
  
  Object.entries(categories).forEach(([categoryName, achievements]) => {
    html += `
      <div class="achievement-section">
        <h3 class="achievement-category">${categoryName}</h3>
        <div class="achievements-grid-big">
          ${achievements.map(ach => `
            <div class="achievement-card ${ach.unlocked ? 'unlocked' : 'locked'} tier-${ach.tier || 'default'}">
              <div class="achievement-big-icon"><img src="${ach.icon}" alt="" aria-hidden="true"></div>
              <span class="achievement-title">${ach.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

window.unlockAllAchievements = function() {
  try {
    const allIds = [];
    Object.values(ACHIEVEMENT_CATEGORIES).forEach(achievements => {
      achievements.forEach(ach => {
        allIds.push(ach.id);
      });
    });
    
    localStorage.setItem(SHOWN_ACHIEVEMENTS_KEY, JSON.stringify(allIds));
    localStorage.setItem(UNLOCK_ALL_KEY, 'true');
    
    if (typeof renderAchievements === 'function') {
      renderAchievements();
    }
    
    return allIds;
  } catch (e) {
    return [];
  }
};

window.unlock = function(num) {
  try {
    const allAchievements = [];
    Object.values(ACHIEVEMENT_CATEGORIES).forEach(achievements => {
      achievements.forEach(ach => {
        allAchievements.push(ach);
      });
    });
    
    const index = num - 1;
    if (index < 0 || index >= allAchievements.length) {
      return null;
    }
    
    const achievement = allAchievements[index];
    const shown = getShownAchievements();
    const forceUnlocked = getForceUnlocked();
    
    if (!shown.includes(achievement.id)) {
      shown.push(achievement.id);
      localStorage.setItem(SHOWN_ACHIEVEMENTS_KEY, JSON.stringify(shown));
    }
    
    if (!forceUnlocked.includes(achievement.id)) {
      forceUnlocked.push(achievement.id);
      localStorage.setItem(FORCE_UNLOCKED_KEY, JSON.stringify(forceUnlocked));
    }
    
    showAchievementNotification(achievement.name, achievement.icon, achievement.tier);
    
    if (typeof renderAchievements === 'function') {
      renderAchievements();
    }
    
    return achievement;
  } catch (e) {
    return null;
  }
};
