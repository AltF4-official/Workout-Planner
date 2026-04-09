# Workout Planner

A comprehensive fitness tracking web application with workout planning, AI-powered food recommendations, and health tools.

## Features

### Workout System
- **7-Day Weekly Plan**
  - Monday: Shoulders
  - Tuesday: Legs
  - Wednesday: Back
  - Thursday: Chest
  - Friday: Arms
  - Saturday: Cardio
  - Sunday: Rest

- **Day Tracking**
  - Start/finish individual workout days
  - Exercise checklist with sets × reps tracking
  - Progress ring showing completion percentage
  - Warmup exercises marked separately
  - Skip exercises option
  - Reset day progress

- **Weekly Management**
  - "New Week" button to advance weeks
  - Week counter display
  - Persistent workout history
  - Week summary modal when all days complete

### AI Food Recommendations
- **OpenAI Integration** (GPT-4o-mini)
- **Food Database** with nutritional info:
  - Calories, protein, fat, carbs, fibre, sodium
  - Food images (adaptive sizing)
- **Personalized Analysis** based on:
  - Weight and height
  - BMI and body category
  - Water intake
  - Current workout day
  - Weekly workout completion percentage
- **Recommendation Display**:
  - Food image
  - Nutrition breakdown
  - AI reasoning for recommendation

### Statistics Dashboard
- **Weekly Completion Chart**
  - Daily completion rates
  - Weekly average percentage
  - Historical week tracking (last 52 weeks)

- **BMI Gauge**
  - Visual BMI indicator
  - Category classification (Underweight, Normal, Overweight, Obese)
  - History tracking

- **Consistency Metrics**
  - Workout completion trends
  - Weekly performance comparison

### Health Tools
- **BMI Calculator**
  - Height and weight input
  - BMI value and category display
  - Gauge visualization
  - Result history

- **Water Tracker**
  - Increment/decrement by 500ml
  - Daily goal indicator (2000ml)
  - Status messages based on intake

- **Protein Calculator**
  - Weight-based calculation (2g per kg)
  - Daily protein target recommendation

- **Calorie Estimator**
  - Weight-based BMR calculation
  - Activity multiplier (1.725)
  - Daily calorie target

- **Food Logger**
  - Manual calorie entry
  - Quick-add calorie chips (100-600 cal)
  - Running daily total

### Achievement System
- **Progressive Workout Milestones**:
  - 1 Workout (Bronze)
  - 3 Workouts (Silver)
  - 5 Workouts (Gold)
  - 10 Workouts (Bronze)
  - 25 Workouts (Silver)
  - 50 Workouts (Gold)
  - 100 Workouts (Bronze)
  - 250 Workouts (Silver)
  - 500 Workouts (Gold)
  - 1000 Workouts (Ultra Gold)

- **Achievement Display**:
  - Toast notifications on unlock
  - Visual achievement gallery
  - Locked/unlocked states with tier colors
  - Celebration animation on new unlocks

### UI/UX
- **Responsive Design**
  - Mobile-friendly layout
  - Adaptive image sizing
  - Touch-friendly controls

- **Sound Effects**
  - Click sounds on all buttons (via `sfx/click.mp3`)

- **Tab Navigation**
  - Workout (main tracking)
  - Statistics (charts and metrics)
  - Food (recommendations and tools)

- **Visual Design**
  - Dark theme with accent colors
  - Progress rings for visual feedback
  - Smooth animations and transitions
  - Card-based layout

## File Structure

```
├── index.html              # Main HTML structure
├── workout.css            # All styles and animations
├── workout.js             # Workout tracking logic
├── statistics.js          # Charts and metrics
├── food.js                # AI recommendations and food logger
├── tools.js               # BMI, water, protein, calorie calculators
├── achievements.js        # Achievement system
├── sfx/
│   └── click.mp3          # Button click sound
├── Images/
│   ├── TurkishBread.jpg   # Food images
│   └── YogurtBowl.jpg
└── icons/                 # Achievement and UI icons
```

## Data Storage

All data is stored in browser localStorage:
- `workout-state`: Day and exercise completion status
- `workout-current-week`: Current week number
- `workout-weekly-stats`: Weekly completion history
- `workout-user-weight`: User weight
- `workout-user-height`: User height
- `workout-bmi-latest`: BMI calculation results
- `workout-water-tracker`: Daily water intake
- `workout-food-tracker`: Daily calorie intake
- `workout-food-recommendations`: Saved AI recommendations
- `workout-achievements-shown`: Achievement notification history
- `workout-force-unlocked`: Force-unlocked achievements (debug)

## API Integration

**OpenAI API** for food recommendations:
- Model: `gpt-4o-mini`
- Requires: `OPENAI_API_KEY` in code
- Analyzes user stats and recommends best food from database

## Usage

1. Open `index.html` in a browser
2. Click days to expand and see exercises
3. Click "Start" to begin a workout day
4. Click exercises to mark them complete
5. Click "Finish" when done
6. Check Statistics tab for progress charts
7. Use Food tab for AI recommendations and health tools

## Requirements

- Modern web browser with JavaScript enabled
- `sfx/click.mp3` for button sounds
- Food images in `Images/` folder
- OpenAI API key for food recommendations (optional)

## License

Personal use only.
