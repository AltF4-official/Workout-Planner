const FOOD_KEY = 'workout-food-tracker';
const FOOD_STEP = 50;
const RECOMMENDATIONS_KEY = 'workout-food-recommendations';

const FOOD_DATABASE = [
  {
    name: 'Turkish bread with 2 slices of meat',
    calories: '450-600',
    protein: '18-25',
    fat: '20-30',
    saturatedFat: '10-15',
    carbs: '40-55',
    sugar: '2-5',
    fibre: '2-4',
    sodium: '900-1400',
    image: 'Images/TurkishBread.jpg'
  },
  {
    name: 'Yoghurt bowl',
    calories: '500-700',
    protein: '40-50',
    fat: '10-18',
    saturatedFat: '10-15',
    carbs: '4-8',
    sugar: '20-40',
    fibre: '6-10',
    sodium: '150-350',
    image: 'Images/YogurtBowl.jpg'
  }
];

const API_KEY_STORAGE_KEY = 'workout-openai-api-key';

function getStoredApiKey() {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveApiKey(key) {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  } catch {}
}

function showApiKeyModal() {
  const modal = document.getElementById('api-key-modal');
  const input = document.getElementById('api-key-input');
  const saveBtn = document.getElementById('api-key-save');
  const skipBtn = document.getElementById('api-key-skip');
  
  if (!modal) return;
  
  modal.classList.remove('hidden');
  
  // Pre-fill if key exists
  const existingKey = getStoredApiKey();
  if (existingKey && input) {
    input.value = existingKey;
  }
  
  if (saveBtn) {
    saveBtn.onclick = () => {
      if (typeof playClick === 'function') playClick();
      const key = input ? input.value.trim() : '';
      if (key && key.startsWith('sk-')) {
        saveApiKey(key);
        modal.classList.add('hidden');
      } else if (input) {
        input.style.borderColor = '#ff4444';
        setTimeout(() => {
          input.style.borderColor = '';
        }, 2000);
      }
    };
  }
  
  if (skipBtn) {
    skipBtn.onclick = () => {
      if (typeof playClick === 'function') playClick();
      modal.classList.add('hidden');
    };
  }
  
  // Close on backdrop click
  const backdrop = modal.querySelector('.modal-backdrop');
  if (backdrop) {
    backdrop.onclick = () => {
      if (typeof playClick === 'function') playClick();
      modal.classList.add('hidden');
    };
  }
  
  // Enter key to save
  if (input) {
    input.onkeypress = (e) => {
      if (e.key === 'Enter') {
        saveBtn && saveBtn.click();
      }
    };
    input.focus();
  }
}

function initApiKeyModal() {
  // Check if we should show the modal on first load
  const hasKey = getStoredApiKey();
  
  if (!hasKey) {
    // Delay slightly to let the app render first
    setTimeout(() => {
      showApiKeyModal();
    }, 500);
  }
}

function getFoodAmount() {
  try {
    return parseInt(localStorage.getItem(FOOD_KEY)) || 0;
  } catch {
    return 0;
  }
}

function setFoodAmount(amount) {
  const newAmount = Math.max(0, Math.min(amount, 10000));
  try {
    localStorage.setItem(FOOD_KEY, newAmount.toString());
  } catch {}
  return newAmount;
}

function updateFoodDisplay() {
  const amount = getFoodAmount();
  const amountEl = document.getElementById('food-amount');
  const statusEl = document.getElementById('food-status');
  
  if (amountEl) amountEl.textContent = amount + ' cal';
  
  if (statusEl) {
    if (amount === 0) {
      statusEl.textContent = 'Log your meals!';
    } else if (amount < 500) {
      statusEl.textContent = 'Light meal logged';
    } else if (amount < 1500) {
      statusEl.textContent = 'Good amount today';
    } else {
      statusEl.textContent = 'Well fed!';
    }
  }
}

function initFoodLogger() {
  const foodBtn = document.getElementById('food-btn');
  const foodModal = document.getElementById('food-modal');
  const foodClose = document.getElementById('food-close');
  const foodMinus = document.getElementById('food-minus');
  const foodPlus = document.getElementById('food-plus');
  const foodChips = document.querySelectorAll('.food-chip');

  if (!foodBtn) return;

  foodBtn.addEventListener('click', () => {
    if (typeof playClick === 'function') playClick();
    updateFoodDisplay();
    foodModal.classList.remove('hidden');
  });

  foodClose.addEventListener('click', () => { if (typeof playClick === 'function') playClick(); foodModal.classList.add('hidden'); });
  foodModal.querySelector('.modal-backdrop').addEventListener('click', () => { if (typeof playClick === 'function') playClick(); foodModal.classList.add('hidden'); });

  foodMinus.addEventListener('click', () => {
    if (typeof playClick === 'function') playClick();
    const newAmount = setFoodAmount(getFoodAmount() - FOOD_STEP);
    updateFoodDisplay();
  });

  foodPlus.addEventListener('click', () => {
    if (typeof playClick === 'function') playClick();
    const newAmount = setFoodAmount(getFoodAmount() + FOOD_STEP);
    updateFoodDisplay();
  });

  foodChips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (typeof playClick === 'function') playClick();
      const calories = parseInt(chip.dataset.calories);
      const newAmount = setFoodAmount(getFoodAmount() + calories);
      updateFoodDisplay();
    });
  });
}

function getUserStats() {
  const weight = localStorage.getItem('workout-user-weight');
  const height = localStorage.getItem('workout-user-height');
  const bmiData = localStorage.getItem('workout-bmi-latest');
  const waterAmount = localStorage.getItem('workout-water-tracker') || '0';
  const foodAmount = localStorage.getItem('workout-food-tracker') || '0';
  
  let bmi = null;
  let bmiCategory = null;
  if (bmiData) {
    try {
      const parsed = JSON.parse(bmiData);
      bmi = parsed.bmi;
      bmiCategory = parsed.category;
    } catch {}
  }
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = dayNames[new Date().getDay()];
  
  const workoutState = localStorage.getItem('workout-state');
  let weeklyProgress = { completedDays: 0, totalDays: 7, percentage: 0 };
  let activeDay = null;
  
  if (workoutState) {
    try {
      const state = JSON.parse(workoutState);
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      let completed = 0;
      
      days.forEach(day => {
        const dayState = state[day];
        if (dayState) {
          if (dayState.status === 'active') activeDay = day;
          if (dayState.status === 'finished') completed++;
        }
      });
      
      weeklyProgress = {
        completedDays: completed,
        totalDays: 7,
        percentage: Math.round((completed / 7) * 100)
      };
    } catch {}
  }
  
  const currentWeek = localStorage.getItem('workout-current-week') || '1';
  
  return {
    weight: weight ? parseFloat(weight) : null,
    height: height ? parseFloat(height) : null,
    bmi: bmi,
    bmiCategory: bmiCategory,
    waterIntake: parseInt(waterAmount),
    caloriesLogged: parseInt(foodAmount),
    currentDay: currentDay,
    currentWeek: parseInt(currentWeek),
    weeklyProgress: weeklyProgress,
    activeDay: activeDay
  };
}

async function generateFoodRecommendations() {
  const btn = document.getElementById('generate-recommendations-btn');
  const area = document.getElementById('recommendations-area');
  
  if (!btn || !area) return;
  
  // Check for API key
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    showApiKeyModal();
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Generating...';
  area.innerHTML = '<div class="recommendations-loading">Loading...</div>';
  
  const userStats = getUserStats();
  
  const progress = userStats.weeklyProgress;
  const progressText = `${progress.completedDays}/7 days completed (${progress.percentage}%)`;
  
  const prompt = `You are a nutrition assistant. Based on the user's stats, workout progress, and available foods, recommend the best food option from the database.

User Stats:
- Weight: ${userStats.weight ? userStats.weight + 'kg' : 'Not provided'}
- Height: ${userStats.height ? userStats.height + 'cm' : 'Not provided'}
- BMI: ${userStats.bmi ? userStats.bmi + ' (' + userStats.bmiCategory + ')' : 'Not calculated'}
- Water intake today: ${userStats.waterIntake}ml

Workout Progress (Week ${userStats.currentWeek}):
- Today: ${userStats.currentDay}
- Weekly completion: ${progressText}
${userStats.activeDay ? `- Active workout day: ${userStats.activeDay}` : ''}

Available Food Database:
${FOOD_DATABASE.map(food => `- ${food.name}: ${food.calories} kcal, ${food.protein}g protein, ${food.fat}g fat, ${food.carbs}g carbs, ${food.fibre}g fibre, ${food.sodium}mg sodium`).join('\n')}

Analyze the user's stats and workout progress to recommend the SINGLE best food option. Consider:
1. Their BMI and weight status
2. How much they've worked out this week (higher protein needs after intense workouts)
3. Current day and remaining workouts in the week (more energy needed before big workout days)
4. Protein needs for muscle recovery and maintenance
5. Energy needs based on workout intensity
6. Sodium intake considerations
7. Fibre for digestive health

Respond with ONLY a JSON object in this exact format (no markdown, no backticks, just the raw JSON):
{"recommendation":"Food Name","reasoning":"2-3 sentences explaining why this food is best for this user based on their stats and workout progress"}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getStoredApiKey() || ''}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful nutrition assistant. You respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    const aiResponse = data.choices[0].message.content.trim();
    let parsedResponse;
    
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid response format');
      }
    }
    
    const recommendedFood = FOOD_DATABASE.find(f => 
      f.name.toLowerCase().includes(parsedResponse.recommendation.toLowerCase()) ||
      parsedResponse.recommendation.toLowerCase().includes(f.name.toLowerCase().split(' ')[0])
    ) || FOOD_DATABASE[0];
    
    const recommendationData = {
      food: recommendedFood,
      reasoning: parsedResponse.reasoning,
      timestamp: Date.now()
    };
    
    localStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify(recommendationData));
    displayRecommendation(recommendationData);
    
  } catch (error) {
    area.innerHTML = `<div class="recommendations-error">Error: ${error.message}. Please try again.</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Generate Recommendations';
  }
}

function displayRecommendation(data) {
  const area = document.getElementById('recommendations-area');
  if (!area) return;
  
  area.innerHTML = `
    <div class="recommendation-card">
      <div class="recommendation-image">
        <img src="${data.food.image}" alt="${data.food.name}" onerror="this.style.display='none'">
      </div>
      <div class="recommendation-header">
        <h3 class="recommendation-title">${data.food.name}</h3>
        <span class="recommendation-badge">AI Recommended</span>
      </div>
      <div class="recommendation-nutrition">
        <div class="nutrition-item">
          <span class="nutrition-value">${data.food.calories}</span>
          <span class="nutrition-label">kcal</span>
        </div>
        <div class="nutrition-item">
          <span class="nutrition-value">${data.food.protein}g</span>
          <span class="nutrition-label">protein</span>
        </div>
        <div class="nutrition-item">
          <span class="nutrition-value">${data.food.carbs}g</span>
          <span class="nutrition-label">carbs</span>
        </div>
        <div class="nutrition-item">
          <span class="nutrition-value">${data.food.fat}g</span>
          <span class="nutrition-label">fat</span>
        </div>
      </div>
      <div class="recommendation-reasoning">
        <p>${data.reasoning}</p>
      </div>
    </div>
  `;
}

function loadSavedRecommendation() {
  try {
    const saved = localStorage.getItem(RECOMMENDATIONS_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      displayRecommendation(data);
    }
  } catch {}
}

function initRecommendations() {
  const btn = document.getElementById('generate-recommendations-btn');
  if (btn) {
    btn.addEventListener('click', () => { if (typeof playClick === 'function') playClick(); generateFoodRecommendations(); });
  }
  loadSavedRecommendation();
}

function initFoodSection() {
  initFoodLogger();
  initRecommendations();
  initApiKeyModal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFoodSection);
} else {
  initFoodSection();
}
