const WATER_KEY = 'workout-water-tracker';
const WEIGHT_KEY = 'workout-user-weight';
const HEIGHT_KEY = 'workout-user-height';
const WATER_GOAL = 2000;
const WATER_STEP = 500;

let pendingTool = null;
let pendingWeightInput = null;

function getWaterAmount() {
  try {
    return parseInt(localStorage.getItem(WATER_KEY)) || 0;
  } catch {
    return 0;
  }
}

function setWaterAmount(amount) {
  const newAmount = Math.max(0, Math.min(amount, 5000));
  try {
    localStorage.setItem(WATER_KEY, newAmount.toString());
  } catch {}
  return newAmount;
}

function getWaterStatus(amount) {
  if (amount < 1000) {
    return { text: 'Keep drinking!', class: 'low' };
  } else if (amount < 1500) {
    return { text: 'Getting there', class: 'medium' };
  } else if (amount < 2000) {
    return { text: 'Almost there', class: 'good' };
  } else {
    return { text: 'Well hydrated!', class: 'excellent' };
  }
}

function updateWaterDisplay() {
  const amount = getWaterAmount();
  const amountEl = document.getElementById('water-amount');
  const statusEl = document.getElementById('water-status');
  const fillEl = document.getElementById('water-fill');
  
  if (amountEl) amountEl.textContent = amount + ' ml';
  if (fillEl) fillEl.style.width = Math.min((amount / WATER_GOAL * 100), 100) + '%';
  
  if (statusEl) {
    const status = getWaterStatus(amount);
    statusEl.textContent = status.text;
    statusEl.className = 'water-status ' + status.class;
  }
}

function getSavedWeight() {
  try {
    return parseFloat(localStorage.getItem(WEIGHT_KEY)) || null;
  } catch {
    return null;
  }
}

function saveWeight(weight) {
  try {
    localStorage.setItem(WEIGHT_KEY, weight.toString());
  } catch {}
}

function getSavedHeight() {
  try {
    return parseFloat(localStorage.getItem(HEIGHT_KEY)) || null;
  } catch {
    return null;
  }
}

function saveHeight(height) {
  try {
    localStorage.setItem(HEIGHT_KEY, height.toString());
  } catch {}
}

function showBMIConfirmModal(weight, height, onYes, onNo) {
  const existingModal = document.getElementById('bmi-confirm-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'bmi-confirm-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content weight-confirm-content">
      <h3 class="weight-confirm-title">Confirm Details</h3>
      <p class="weight-confirm-text">
        Are you still <strong>${weight}kg</strong> and <strong>${height}cm</strong>?
      </p>
      <div class="weight-confirm-actions">
        <button id="bmi-confirm-yes" class="btn-weight-yes">Yes</button>
        <button id="bmi-confirm-no" class="btn-weight-no">No</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#bmi-confirm-yes').addEventListener('click', () => {
    if (typeof playClick === 'function') playClick();
    modal.classList.add('hidden');
    onYes();
  });

  modal.querySelector('#bmi-confirm-no').addEventListener('click', () => {
    if (typeof playClick === 'function') playClick();
    modal.classList.add('hidden');
    onNo();
  });

  modal.querySelector('.modal-backdrop').addEventListener('click', () => {
    if (typeof playClick === 'function') playClick();
    modal.classList.add('hidden');
  });

  modal.classList.remove('hidden');
}

function openBMIWithCheck(bmiModal, bmiHeight, bmiWeight, bmiResult) {
  const savedWeight = getSavedWeight();
  const savedHeight = getSavedHeight();
  
  if (savedWeight && savedHeight) {
    showBMIConfirmModal(savedWeight, savedHeight, () => {
      bmiWeight.value = savedWeight;
      bmiHeight.value = savedHeight;
      bmiModal.classList.remove('hidden');
      if (bmiResult) bmiResult.classList.add('hidden');
    }, () => {
      bmiWeight.value = '';
      bmiHeight.value = '';
      bmiModal.classList.remove('hidden');
      if (bmiResult) bmiResult.classList.add('hidden');
    });
  } else {
    bmiWeight.value = '';
    bmiHeight.value = '';
    bmiModal.classList.remove('hidden');
    if (bmiResult) bmiResult.classList.add('hidden');
  }
}

function showWeightConfirmModal(weight, onYes, onNo) {
  const existingModal = document.getElementById('weight-confirm-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'weight-confirm-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content weight-confirm-content">
      <h3 class="weight-confirm-title">Confirm Weight</h3>
      <p class="weight-confirm-text">Are you still <strong>${weight}kg</strong>?</p>
      <div class="weight-confirm-actions">
        <button id="weight-confirm-yes" class="btn-weight-yes">Yes</button>
        <button id="weight-confirm-no" class="btn-weight-no">No</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#weight-confirm-yes').addEventListener('click', () => {
    if (typeof playClick === 'function') playClick();
    modal.classList.add('hidden');
    onYes();
  });

  modal.querySelector('#weight-confirm-no').addEventListener('click', () => {
    if (typeof playClick === 'function') playClick();
    modal.classList.add('hidden');
    onNo();
  });

  modal.querySelector('.modal-backdrop').addEventListener('click', () => {
    if (typeof playClick === 'function') playClick();
    modal.classList.add('hidden');
  });

  modal.classList.remove('hidden');
}

function openToolWithWeightCheck(toolModal, weightInput, resultElement) {
  const savedWeight = getSavedWeight();
  
  if (savedWeight) {
    showWeightConfirmModal(savedWeight, () => {
      weightInput.value = savedWeight;
      toolModal.classList.remove('hidden');
      if (resultElement) resultElement.classList.add('hidden');
    }, () => {
      weightInput.value = '';
      toolModal.classList.remove('hidden');
      if (resultElement) resultElement.classList.add('hidden');
    });
  } else {
    weightInput.value = '';
    toolModal.classList.remove('hidden');
    if (resultElement) resultElement.classList.add('hidden');
  }
}

function initWaterTracker() {
  const waterBtn = document.getElementById('water-btn');
  const waterModal = document.getElementById('water-modal');
  const waterClose = document.getElementById('water-close');
  const waterMinus = document.getElementById('water-minus');
  const waterPlus = document.getElementById('water-plus');

  if (!waterBtn) return;

  waterBtn.addEventListener('click', () => {
    if (typeof playClick === 'function') playClick();
    updateWaterDisplay();
    waterModal.classList.remove('hidden');
  });

  waterClose.addEventListener('click', () => { if (typeof playClick === 'function') playClick(); waterModal.classList.add('hidden'); });
  waterModal.querySelector('.modal-backdrop').addEventListener('click', () => { if (typeof playClick === 'function') playClick(); waterModal.classList.add('hidden'); });

  waterMinus.addEventListener('click', () => {
    if (typeof playClick === 'function') playClick();
    const newAmount = setWaterAmount(getWaterAmount() - WATER_STEP);
    updateWaterDisplay();
  });

  waterPlus.addEventListener('click', () => {
    if (typeof playClick === 'function') playClick();
    const newAmount = setWaterAmount(getWaterAmount() + WATER_STEP);
    updateWaterDisplay();
  });
}

const BMI_KEY = 'workout-bmi-latest';

function saveBMI(bmi, category, categoryClass) {
  try {
    const data = JSON.stringify({
      bmi: parseFloat(bmi),
      category,
      categoryClass,
      date: Date.now()
    });
    localStorage.setItem(BMI_KEY, data);
  } catch {}
}

function getBMI() {
  try {
    const data = localStorage.getItem(BMI_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

let bmiChart = null;

function updateBMIGauge(bmi, categoryClass) {
  const ctx = document.getElementById('bmi-gauge-chart');
  if (!ctx) return;
  
  const minBMI = 15;
  const maxBMI = 35;
  const clampedBMI = Math.max(minBMI, Math.min(bmi, maxBMI));
  const percentage = (clampedBMI - minBMI) / (maxBMI - minBMI);
  const fillAmount = Math.round(percentage * 100);
  
  const colors = {
    underweight: '#3b82f6',
    normal: '#10b981',
    overweight: '#f59e0b',
    obese: '#ef4444'
  };
  const color = colors[categoryClass] || '#10b981';
  
  if (bmiChart) {
    bmiChart.data.datasets[0].data = [fillAmount, 100 - fillAmount];
    bmiChart.data.datasets[0].backgroundColor = [color, 'rgba(255,255,255,0.08)'];
    bmiChart.update();
  } else {
    bmiChart = new Chart(ctx, {
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
          animateScale: true,
          duration: 400,
          easing: 'easeOutCubic'
        }
      }
    });
  }
}

function renderBMIHistory() {
  const container = document.getElementById('bmi-history-container');
  if (!container) return;
  
  const bmi = getBMI();
  
  if (!bmi) {
    container.innerHTML = `
      <div class="bmi-history-empty">
        No BMI calculation yet. Use the BMI Calculator in the Food tab.
      </div>
    `;
    return;
  }
  
  const entryDate = new Date(bmi.date);
  const entryDateStr = entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  container.innerHTML = `
    <div class="bmi-history-card">
      <div class="bmi-history-list">
        <div class="bmi-history-item bmi-history-item-recent">
          <div>
            <div class="bmi-history-item-value">${bmi.bmi.toFixed(1)}</div>
            <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">${entryDateStr}</div>
          </div>
          <div class="bmi-history-item-category ${bmi.categoryClass}">${bmi.category}</div>
        </div>
      </div>
    </div>
  `;
}

function initBMICalculator() {
  const bmiBtn = document.getElementById('bmi-btn');
  const bmiModal = document.getElementById('bmi-modal');
  const bmiClose = document.getElementById('bmi-close');
  const bmiCalculate = document.getElementById('bmi-calculate');
  const bmiHeight = document.getElementById('bmi-height');
  const bmiWeight = document.getElementById('bmi-weight');
  const bmiResult = document.getElementById('bmi-result');
  const bmiValue = document.getElementById('bmi-chart-number');
  const bmiCategory = document.getElementById('bmi-category');

  if (!bmiBtn) return;

  bmiBtn.addEventListener('click', () => {
    if (typeof playClick === 'function') playClick();
    openBMIWithCheck(bmiModal, bmiHeight, bmiWeight, bmiResult);
  });

  bmiClose.addEventListener('click', () => { if (typeof playClick === 'function') playClick(); bmiModal.classList.add('hidden'); });
  bmiModal.querySelector('.modal-backdrop').addEventListener('click', () => { if (typeof playClick === 'function') playClick(); bmiModal.classList.add('hidden'); });

  function calculateBMI() {
    const height = parseFloat(bmiHeight.value);
    const weight = parseFloat(bmiWeight.value);
    if (!height || !weight || height <= 0 || weight <= 0) return;

    saveWeight(weight);
    saveHeight(height);

    const heightInMeters = height / 100;
    const bmi = (1.3 * weight) / Math.pow(heightInMeters, 2.5);
    const bmiRounded = bmi.toFixed(1);

    let category = '';
    let categoryClass = '';
    if (bmi < 18.5) { category = 'Underweight'; categoryClass = 'underweight'; }
    else if (bmi < 25) { category = 'Normal weight'; categoryClass = 'normal'; }
    else if (bmi < 30) { category = 'Overweight'; categoryClass = 'overweight'; }
    else { category = 'Obese'; categoryClass = 'obese'; }

    bmiValue.textContent = bmiRounded;
    bmiCategory.textContent = category;
    bmiCategory.className = 'bmi-category ' + categoryClass;
    bmiResult.classList.remove('hidden');
    
    updateBMIGauge(parseFloat(bmiRounded), categoryClass);
    saveBMI(bmiRounded, category, categoryClass);
    if (typeof renderBMIHistory === 'function') renderBMIHistory();
  }

  bmiCalculate.addEventListener('click', () => { if (typeof playClick === 'function') playClick(); calculateBMI(); });
  bmiHeight.addEventListener('keypress', (e) => { if (e.key === 'Enter') bmiWeight.focus(); });
  bmiWeight.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculateBMI(); });
}

window.renderBMIHistory = renderBMIHistory;
window.getBMI = getBMI;

function initProteinCalculator() {
  const proteinBtn = document.getElementById('protein-btn');
  const proteinModal = document.getElementById('protein-modal');
  const proteinClose = document.getElementById('protein-close');
  const proteinCalculate = document.getElementById('protein-calculate');
  const proteinWeight = document.getElementById('protein-weight');
  const proteinResult = document.getElementById('protein-result');
  const proteinValue = document.getElementById('protein-value');

  if (!proteinBtn) return;

  proteinBtn.addEventListener('click', () => {
    if (typeof playClick === 'function') playClick();
    openToolWithWeightCheck(proteinModal, proteinWeight, proteinResult);
  });

  proteinClose.addEventListener('click', () => { if (typeof playClick === 'function') playClick(); proteinModal.classList.add('hidden'); });
  proteinModal.querySelector('.modal-backdrop').addEventListener('click', () => { if (typeof playClick === 'function') playClick(); proteinModal.classList.add('hidden'); });

  function calculateProtein() {
    const weight = parseFloat(proteinWeight.value);
    if (!weight || weight <= 0) return;

    saveWeight(weight);

    const multiplier = 2.0;
    const protein = Math.round(weight * multiplier);

    proteinValue.textContent = protein;
    proteinResult.classList.remove('hidden');
  }

  proteinCalculate.addEventListener('click', () => { if (typeof playClick === 'function') playClick(); calculateProtein(); });
  proteinWeight.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculateProtein(); });
}

function initCalorieEstimator() {
  const calorieBtn = document.getElementById('calorie-btn');
  const calorieModal = document.getElementById('calorie-modal');
  const calorieClose = document.getElementById('calorie-close');
  const calorieCalculate = document.getElementById('calorie-calculate');
  const calorieWeight = document.getElementById('calorie-weight');
  const calorieResult = document.getElementById('calorie-result');
  const calorieValue = document.getElementById('calorie-value');

  if (!calorieBtn) return;

  calorieBtn.addEventListener('click', () => {
    if (typeof playClick === 'function') playClick();
    openToolWithWeightCheck(calorieModal, calorieWeight, calorieResult);
  });

  calorieClose.addEventListener('click', () => { if (typeof playClick === 'function') playClick(); calorieModal.classList.add('hidden'); });
  calorieModal.querySelector('.modal-backdrop').addEventListener('click', () => { if (typeof playClick === 'function') playClick(); calorieModal.classList.add('hidden'); });

  function calculateCalories() {
    const weight = parseFloat(calorieWeight.value);
    if (!weight || weight <= 0) return;

    saveWeight(weight);

    const multiplier = 1.725;
    const calories = Math.round(weight * 24 * multiplier);

    calorieValue.textContent = calories;
    calorieResult.classList.remove('hidden');
  }

  calorieCalculate.addEventListener('click', () => { if (typeof playClick === 'function') playClick(); calculateCalories(); });
  calorieWeight.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculateCalories(); });
}

function initFoodTools() {
  initWaterTracker();
  initBMICalculator();
  initProteinCalculator();
  initCalorieEstimator();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFoodTools);
} else {
  initFoodTools();
}
