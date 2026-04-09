const TIME_RANGE_KEY = 'workout-time-range';

function renderStatistics() {
  const container = document.getElementById('stats-container');
  if (!container) return;
  
  const savedTimeRange = (() => {
    try { return localStorage.getItem(TIME_RANGE_KEY) || '5weeks'; }
    catch { return '5weeks'; }
  })();
  
  container.innerHTML = `
    <div class="chart-card">
      <div class="chart-header">
        <div class="title-section">
          <h2>Consistency</h2>
        </div>
        <div class="time-selector">
          <select id="time-range" class="time-dropdown">
            <option value="7days" ${savedTimeRange === '7days' ? 'selected' : ''}>Past 7 Days</option>
            <option value="5weeks" ${savedTimeRange === '5weeks' ? 'selected' : ''}>Past 5 Weeks</option>
            <option value="10weeks" ${savedTimeRange === '10weeks' ? 'selected' : ''}>Past 10 Weeks</option>
            <option value="year" ${savedTimeRange === 'year' ? 'selected' : ''}>Past Year</option>
          </select>
        </div>
      </div>

      <div class="chart-wrapper">
        <canvas id="workoutLineChart" style="width:100%; height:auto;"></canvas>
      </div>
    </div>
    
    <div class="stats-row">
      <div class="stats-row-item weekly-progress-card">
        <div class="chart-header">
          <div class="title-section">
            <h2>This Week's Progress</h2>
          </div>
        </div>
        <div class="chart-wrapper radial-wrapper">
          <canvas id="weeklyRadialChart" style="width:100%; height:auto;"></canvas>
          <div class="radial-center-text">
            <span class="radial-percentage" id="weekly-percentage">0%</span>
            <span class="radial-label">Complete</span>
          </div>
        </div>
      </div>
      
      <div class="stats-row-item bmi-stats-card">
        <div class="chart-header">
          <div class="title-section">
            <h2>Latest BMI</h2>
          </div>
        </div>
        <div class="bmi-chart-container" style="max-width: 280px; height: 160px; margin: 20px auto;">
          <canvas id="bmi-stats-gauge"></canvas>
          <div class="bmi-chart-value" style="bottom: 0;">
            <span id="bmi-stats-value">--</span>
            <span class="bmi-chart-label">BMI</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    initializeChartJS();
    initializeRadialChart();
    initializeBMIGauge();
    
    const dropdown = document.getElementById('time-range');
    if (dropdown) {
      dropdown.addEventListener('change', () => {
        try { localStorage.setItem(TIME_RANGE_KEY, dropdown.value); }
        catch(e) { }
        initializeChartJS();
      });
    }
  }, 100);
}

function refreshStatisticsIfVisible() {
  if (typeof activeTab !== 'undefined' && activeTab === 'statistics') {
    initializeChartJS();
    initializeRadialChart();
  }
}

function initializeChartJS() {
  const rootStyles = getComputedStyle(document.documentElement);
  const getVar = (name, fallback) => {
    const val = rootStyles.getPropertyValue(name).trim();
    return val ? val : fallback;
  };

  const a1Color = getVar('--a1', '#ff4d1a');
  const a2Color = getVar('--a2', '#ff9100');
  const textDim = getVar('--text-dim', '#777');
  const borderColor = getVar('--border', '#222');
  const textColor = getVar('--text', '#f0f0f0');
  const surfaceHi = getVar('--surface-hi', '#181818');
  const borderHi = getVar('--border-hi', '#2e2e2e');

  const timeRange = document.getElementById('time-range')?.value || '5weeks';

  const ctx = document.getElementById('workoutLineChart');
  if (!ctx) return;
  
  const canvasWidth = ctx.width || ctx.clientWidth;
  const canvasHeight = ctx.height || ctx.clientHeight;
  
  const existingChart = Chart.getChart('workoutLineChart');
  if (existingChart) {
    existingChart.destroy();
  }
  
  if (canvasWidth && canvasHeight) {
    ctx.width = canvasWidth;
    ctx.height = canvasHeight;
  }

  function getDailyStats() {
    return DAYS.map(day => {
      const ds = getDayState(day.id);
      return {
        label: day.name.slice(0, 3),
        completion: ds.status === 'finished' ? 100 : 0
      };
    });
  }

  window.clearWorkoutStats = function() {
    try {
      localStorage.removeItem('workout-weekly-stats');
      setTimeout(() => {
        const dropdown = document.getElementById('time-range');
        if (dropdown) {
          initializeChartJS();
        }
      }, 100);
    } catch (e) {
    }
  };

  window.checkWorkoutData = function() {
    try {
      const stored = localStorage.getItem('workout-weekly-stats');
      const data = stored ? JSON.parse(stored) : [];
      const currentWeek = getCurrentWeek();
      return { weeks: data, currentWeek };
    } catch (e) {
      return [];
    }
  };

  window.getCurrentWeekNum = function() {
    const week = getCurrentWeek();
    return week;
  };

  window.setCurrentWeekNum = function(week) {
    if (typeof week !== 'number' || week < 1) {
      return;
    }
    const previousWeek = getCurrentWeek();
    setCurrentWeek(week);
    refreshStatisticsIfVisible();
    return week;
  };

  window.randomizeCurrentWeek = function() {
    try {
      const weeklyStats = getWeeklyStats();
      const currentWeekNumber = getCurrentWeek();
      
      // Randomly finish some days (0-7 days)
      const completedDays = Math.floor(Math.random() * 8);
      const totalDays = DAYS.length;
      const completion = Math.round((completedDays / totalDays) * 100);
      
      const dayStates = {};
      
      DAYS.forEach((day, dayIndex) => {
        const isFinished = dayIndex < completedDays;
        const workoutIndices = day.exercises
          .map((exercise, i) => (exercise.warmup ? null : i))
          .filter(i => i !== null);
        
        const dayChecks = {};
        const daySkipped = [];
        
        if (isFinished) {
          workoutIndices.forEach(i => {
            dayChecks[i] = true;
          });
        }
        
        dayStates[day.id] = {
          status: isFinished ? 'finished' : 'idle',
          checks: dayChecks,
          skipped: daySkipped,
          startTime: null,
          duration: isFinished ? Math.floor(Math.random() * 3600) : 0
        };
      });
      
      const currentData = getState();
      Object.keys(dayStates).forEach(dayId => {
        currentData[dayId] = dayStates[dayId];
      });
      saveState(currentData);
      
      const existingWeek = weeklyStats.find(w => w.week === currentWeekNumber);
      if (!existingWeek) {
        weeklyStats.push({
          week: currentWeekNumber,
          completion: completion,
          completedDays: completedDays,
          totalDays: totalDays,
          timestamp: Date.now()
        });
      } else {
        existingWeek.completion = completion;
        existingWeek.completedDays = completedDays;
        existingWeek.totalDays = totalDays;
        existingWeek.timestamp = Date.now();
      }
      
      localStorage.setItem('workout-weekly-stats', JSON.stringify(weeklyStats));
      
      setTimeout(() => {
        DAYS.forEach(day => rebuildDayEl(day.id));
        refreshStatisticsIfVisible();
      }, 100);
      
      return { week: currentWeekNumber, completion: completion };
    } catch (e) {
      return null;
    }
  };

  window.saveCurrentWeekStats = saveCurrentWeekStats;

  function getDailyStats() {
    return DAYS.map(day => {
      const ds = getDayState(day.id);
      return {
        label: day.name.slice(0, 3),
        completion: ds.status === 'finished' ? 100 : 0
      };
    });
  }

  let chartData = { labels: [], data: [] };
  const currentWeekNum = getCurrentWeek();
  
  if (timeRange === '7days') {
    const dailyStats = getDailyStats();
    const last7Days = dailyStats.slice(-7);
    chartData = {
      labels: last7Days.map(d => d.label),
      data: last7Days.map(d => d.completion)
    };
  } else if (timeRange === '5weeks') {
    const weeklyStats = getWeeklyStats();
    const currentWeekNum = getCurrentWeek();
    const lastWeekToShow = currentWeekNum;
    const startWeek = Math.max(1, lastWeekToShow - 4);
    const weekData = [];
    const weekLabels = [];
    let currentWeekIndex = -1;
    
    for (let i = startWeek; i <= lastWeekToShow; i++) {
      weekLabels.push(`W${i}`);
      const weekStat = weeklyStats.find(w => w.week === i);
      weekData.push(weekStat ? weekStat.completion : 0);
      if (i === currentWeekNum) currentWeekIndex = weekData.length - 1;
    }
    
    chartData = {
      labels: weekLabels,
      data: weekData,
      currentWeekIndex: currentWeekIndex >= 0 ? currentWeekIndex : undefined
    };
  } else if (timeRange === '10weeks') {
    const weeklyStats = getWeeklyStats();
    const currentWeekNum = getCurrentWeek();
    const lastWeekToShow = currentWeekNum;
    const startWeek = Math.max(1, lastWeekToShow - 9);
    const weekData = [];
    const weekLabels = [];
    let currentWeekIndex = -1;
    
    for (let i = startWeek; i <= lastWeekToShow; i++) {
      weekLabels.push(`W${i}`);
      const weekStat = weeklyStats.find(w => w.week === i);
      weekData.push(weekStat ? weekStat.completion : 0);
      if (i === currentWeekNum) currentWeekIndex = weekData.length - 1;
    }
    
    chartData = {
      labels: weekLabels,
      data: weekData,
      currentWeekIndex: currentWeekIndex >= 0 ? currentWeekIndex : undefined
    };
  } else if (timeRange === 'year') {
    const weeklyStats = getWeeklyStats();
    const currentWeekNum = getCurrentWeek();
    const lastWeekToShow = currentWeekNum;
    const weekData = [];
    const weekLabels = [];
    let currentWeekIndex = -1;
    
    for (let i = 1; i <= lastWeekToShow; i++) {
      weekLabels.push(`W${i}`);
      const weekStat = weeklyStats.find(w => w.week === i);
      weekData.push(weekStat ? weekStat.completion : 0);
      if (i === currentWeekNum) currentWeekIndex = weekData.length - 1;
    }
    
    chartData = {
      labels: weekLabels,
      data: weekData,
      currentWeekIndex: currentWeekIndex >= 0 ? currentWeekIndex : undefined
    };
  }
  
  Chart.defaults.font.family = "'Inter', system-ui, 'Segoe UI', Roboto, sans-serif";
  Chart.defaults.font.size = 12;

  const chartConfig = {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Weekly completion %',
          data: chartData.data,
          borderColor: a1Color,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: window.innerWidth < 768 ? 3 : 4,
          pointHoverRadius: window.innerWidth < 768 ? 5 : 6,
          pointBackgroundColor: a1Color,
          pointBorderColor: 'transparent',
          pointBorderWidth: 0,
          pointHoverBackgroundColor: a1Color,
          pointHoverBorderColor: 'transparent',
          pointHoverBorderWidth: 0,
          tension: 0.2,
          fill: false,
          segment: { borderDash: [0, 0] }
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: window.innerWidth < 480 ? 1.0 : window.innerWidth < 768 ? 1.3 : 1.8,
      interaction: {
        mode: 'nearest',
        intersect: false,
        axis: 'x'
      },
      plugins: {
        annotation: {
          annotations: {
            line1: {
              type: 'line',
              yMin: 80,
              yMax: 80,
              borderColor: a2Color,
              borderWidth: 2.2,
              borderDash: [6, 8],
              label: {
                enabled: false
              }
            }
          }
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: surfaceHi,
          titleColor: textColor,
          bodyColor: textDim,
          borderColor: borderHi,
          borderWidth: 1,
          cornerRadius: 8,
          xPadding: window.innerWidth < 768 ? 8 : 10,
          yPadding: window.innerWidth < 768 ? 6 : 8,
          titleFont: { size: window.innerWidth < 480 ? 10 : window.innerWidth < 768 ? 11 : 12, weight: '600' },
          bodyFont: { size: window.innerWidth < 480 ? 9 : window.innerWidth < 768 ? 10 : 11, weight: '400' },
          caretSize: 5,
          displayColors: false,
          position: 'nearest',
          callbacks: {
            title: (tooltipItems) => {
              const idx = tooltipItems[0].dataIndex;
              return `Week ${idx+1}`;
            },
            label: (context) => {
              const raw = context.raw;
              return `${raw}%`;
            },
            afterBody: (tooltipItems) => {
              const val = tooltipItems[0].raw;
              const diff = val - 80;
              let statusMsg = '';
              if (diff >= 20) statusMsg = 'Perfect';
              else if (diff >= 10) statusMsg = 'Good';
              else if (diff >= 0) statusMsg = 'Meh';
              else statusMsg = 'Bad';
              return [statusMsg];
            }
          }
        },
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            color: borderColor,
            drawOnChartArea: true,
            lineWidth: 0.6,
          },
          ticks: {
            color: (context) => {
              if (chartData.currentWeekIndex !== undefined && context.index === chartData.currentWeekIndex) {
                return a1Color;
              }
              return textDim;
            },
            font: (context) => {
              if (chartData.currentWeekIndex !== undefined && context.index === chartData.currentWeekIndex) {
                return { size: window.innerWidth < 480 ? 9 : window.innerWidth < 768 ? 10 : 12, weight: '700' };
              }
              return { size: window.innerWidth < 480 ? 8 : window.innerWidth < 768 ? 9 : 11, weight: '500' };
            },
            padding: window.innerWidth < 768 ? 4 : 8,
            maxRotation: window.innerWidth < 768 ? 45 : 0,
            minRotation: window.innerWidth < 768 ? 45 : 0,
          },
          border: { color: borderColor, width: 1 }
        },
        y: {
          min: 0,
          max: 100,
          grid: {
            color: borderColor,
            lineWidth: 0.6,
          },
          ticks: {
            color: textDim,
            stepSize: 20,
            callback: (value) => value + '%',
            font: { size: window.innerWidth < 480 ? 9 : window.innerWidth < 768 ? 10 : 11 },
            padding: window.innerWidth < 480 ? 2 : window.innerWidth < 768 ? 4 : 8,
          },
          border: { color: borderColor, width: 1 }
        }
      },
      elements: {
        line: { borderJoin: 'round', borderCap: 'round' },
        point: { hoverBorderWidth: 2.2 }
      },
      layout: {
        padding: { 
          top: window.innerWidth < 480 ? 4 : window.innerWidth < 768 ? 6 : 12, 
          bottom: window.innerWidth < 480 ? 2 : window.innerWidth < 768 ? 4 : 8, 
          left: window.innerWidth < 480 ? 2 : window.innerWidth < 768 ? 4 : 8, 
          right: window.innerWidth < 480 ? 2 : window.innerWidth < 768 ? 4 : 12 
        }
      },
      hover: {
        mode: 'nearest',
        intersect: false,
        animationDuration: 200
      }
    }
  };

  let workoutChart = new Chart(ctx, chartConfig);

  const resizeHandler = () => {
    if (workoutChart && workoutChart.canvas && document.body.contains(workoutChart.canvas)) {
      workoutChart.resize();
    }
  };
  window.addEventListener('resize', resizeHandler);
}

function initializeRadialChart() {
  const ctx = document.getElementById('weeklyRadialChart');
  if (!ctx) return;
  
  const existingChart = Chart.getChart('weeklyRadialChart');
  if (existingChart) {
    existingChart.destroy();
  }
  
  const weeklyCompletion = calculateWeeklyCompletion();
  const percentageEl = document.getElementById('weekly-percentage');
  if (percentageEl) {
    percentageEl.textContent = `${weeklyCompletion}%`;
  }
  
  const rootStyles = getComputedStyle(document.documentElement);
  const getVar = (name, fallback) => {
    const val = rootStyles.getPropertyValue(name).trim();
    return val ? val : fallback;
  };
  
  const a1Color = getVar('--a1', '#ff4d1a');
  const a2Color = getVar('--a2', '#ff9100');
  const textDim = getVar('--text-dim', '#777');
  const surfaceHi = getVar('--surface-hi', '#181818');
  const borderHi = getVar('--border-hi', '#2e2e2e');
  const textColor = getVar('--text', '#f0f0f0');
  
  const gradient = document.createElement('canvas').getContext('2d').createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0, a1Color);
  gradient.addColorStop(1, a2Color);
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'Remaining'],
      datasets: [{
        data: [weeklyCompletion, 100 - weeklyCompletion],
        backgroundColor: [gradient, 'rgba(255,255,255,0.05)'],
        borderWidth: 0,
        hoverOffset: 0,
        circumference: 270,
        rotation: 225
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '85%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          backgroundColor: surfaceHi,
          titleColor: textColor,
          bodyColor: textDim,
          borderColor: borderHi,
          borderWidth: 1,
          cornerRadius: 12,
          xPadding: 12,
          yPadding: 8,
          titleFont: { size: 12, weight: '600' },
          bodyFont: { size: 11, weight: '400' },
          displayColors: false,
          callbacks: {
            title: () => 'Weekly Progress',
            label: (context) => {
              const val = context.raw;
              if (context.dataIndex === 0) {
                return `${val}% completed`;
              } else {
                return `${val}% remaining`;
              }
            }
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: false,
        duration: 1200,
        easing: 'easeOutQuart'
      }
    }
  });
}

function calculateWeeklyCompletion() {
  const totalDays = DAYS.length;
  const completedDays = DAYS.reduce((sum, day) => {
    const ds = getDayState(day.id);
    return sum + (ds.status === 'finished' ? 1 : 0);
  }, 0);
  
  if (totalDays === 0) return 0;
  return Math.round((completedDays / totalDays) * 100);
}

function initializeBMIGauge() {
  const ctx = document.getElementById('bmi-stats-gauge');
  const valueEl = document.getElementById('bmi-stats-value');
  if (!ctx || !valueEl) return;
  
  const bmi = typeof getBMI === 'function' ? getBMI() : null;
  
  if (!bmi) {
    valueEl.textContent = '--';
    return;
  }
  
  const bmiValue = parseFloat(bmi.bmi);
  const categoryClass = bmi.categoryClass;
  
  valueEl.textContent = bmiValue.toFixed(1);
  
  const minBMI = 15;
  const maxBMI = 35;
  const clampedBMI = Math.max(minBMI, Math.min(bmiValue, maxBMI));
  const percentage = (clampedBMI - minBMI) / (maxBMI - minBMI);
  const fillAmount = Math.round(percentage * 100);
  
  const colors = {
    underweight: '#3b82f6',
    normal: '#10b981',
    overweight: '#f59e0b',
    obese: '#ef4444'
  };
  const color = colors[categoryClass] || '#10b981';
  
  const existingChart = Chart.getChart('bmi-stats-gauge');
  if (existingChart) {
    existingChart.destroy();
  }
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [fillAmount, 100 - fillAmount],
        backgroundColor: [color, 'rgba(255,255,255,0.08)'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '85%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      animation: {
        animateRotate: true,
        animateScale: false,
        duration: 400,
        easing: 'easeOutCubic'
      }
    }
  });
}
