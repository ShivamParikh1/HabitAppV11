export function createPageUrl(pageName) {
  const pageMap = {
    'Home': '/',
    'Habits': '/habits',
    'HabitSelect': '/habit-select',
    'HabitDetail': '/habit-detail',
    'HabitForm': '/habit-form',
    'Progress': '/progress',
    'Features': '/features',
    'TodoList': '/todo-list',
    'Calendar': '/calendar',
    'Journal': '/journal',
    'FoodTracker': '/food-tracker',
    'Finance': '/finance',
    'School': '/school',
    'LifeStats': '/life-stats',
    'Goals': '/goals',
    'FutureSelf': '/future-self',
    'UnpackDay': '/unpack-day',
    'BucketList': '/bucket-list',
    'PasswordVault': '/password-vault',
    'WorkoutTracker': '/workout-tracker',
    'GratitudeWall': '/gratitude-wall'
  }
  
  return pageMap[pageName] || '/'
}

export function generateId() {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

export function formatTime(time) {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}