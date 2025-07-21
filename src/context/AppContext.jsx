import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { format } from 'date-fns'

const AppContext = createContext()

// Mock user data
const mockUser = {
  id: 'user-1',
  email: 'user@example.com',
  full_name: 'John Doe',
  profile_picture: null,
  created_date: '2024-01-01',
  level: 5,
  xp: 1250,
  finance_onboarding_completed: true
}

// Initial state with mock data
const initialState = {
  user: mockUser,
  habits: [
    {
      id: 'habit-1',
      title: 'Morning Meditation',
      description: 'Start your day with mindfulness and clarity',
      category: 'mindfulness',
      type: 'build',
      techniques: [
        {
          name: 'Breathing Focus',
          description: 'Focus on your breath to center your mind',
          scientific_backing: 'Studies show breathing exercises reduce stress and improve focus'
        }
      ],
      benefits: ['Reduced stress', 'Better focus', 'Improved emotional regulation'],
      questions: [
        {
          question: 'How many minutes would you like to meditate?',
          type: 'number',
          required: true
        }
      ],
      icon: '🧘',
      color: 'purple'
    },
    {
      id: 'habit-2',
      title: 'Daily Exercise',
      description: 'Move your body for better health',
      category: 'fitness',
      type: 'build',
      techniques: [
        {
          name: 'Progressive Overload',
          description: 'Gradually increase intensity over time',
          scientific_backing: 'Research shows progressive overload builds strength effectively'
        }
      ],
      benefits: ['Better cardiovascular health', 'Increased strength', 'Improved mood'],
      questions: [
        {
          question: 'What type of exercise do you prefer?',
          type: 'select',
          options: ['Cardio', 'Strength Training', 'Yoga', 'Walking'],
          required: true
        }
      ],
      icon: '💪',
      color: 'red'
    },
    {
      id: 'habit-3',
      title: 'Read Daily',
      description: 'Expand your knowledge through reading',
      category: 'learning',
      type: 'build',
      techniques: [
        {
          name: 'Active Reading',
          description: 'Take notes and summarize what you read',
          scientific_backing: 'Active reading improves comprehension and retention'
        }
      ],
      benefits: ['Increased knowledge', 'Better vocabulary', 'Improved focus'],
      questions: [
        {
          question: 'How many pages would you like to read daily?',
          type: 'number',
          required: true
        }
      ],
      icon: '📚',
      color: 'blue'
    }
  ],
  userHabits: [
    {
      id: 'user-habit-1',
      habit_id: 'habit-1',
      user_id: 'user-1',
      status: 'active',
      start_date: '2024-01-01',
      target_frequency: 'daily',
      user_answers: { 'How many minutes would you like to meditate?': '10' },
      streak_current: 7,
      streak_longest: 15,
      total_completions: 45,
      reminder_enabled: true,
      reminder_time: '07:00'
    },
    {
      id: 'user-habit-2',
      habit_id: 'habit-2',
      user_id: 'user-1',
      status: 'active',
      start_date: '2024-01-01',
      target_frequency: 'daily',
      user_answers: { 'What type of exercise do you prefer?': 'Cardio' },
      streak_current: 3,
      streak_longest: 12,
      total_completions: 32,
      reminder_enabled: true,
      reminder_time: '18:00'
    }
  ],
  habitLogs: [
    {
      id: 'log-1',
      user_habit_id: 'user-habit-1',
      date: format(new Date(), 'yyyy-MM-dd'),
      completed: true,
      notes: 'Great session today'
    },
    {
      id: 'log-2',
      user_habit_id: 'user-habit-2',
      date: format(new Date(), 'yyyy-MM-dd'),
      completed: false
    }
  ],
  todos: [
    {
      id: 'todo-1',
      title: 'Complete project proposal',
      description: 'Finish the quarterly project proposal for review',
      completed: false,
      due_date: '2024-12-31',
      priority: 'high',
      category: 'Work',
      created_date: '2024-12-01',
      updated_date: '2024-12-01'
    },
    {
      id: 'todo-2',
      title: 'Buy groceries',
      description: 'Get ingredients for this week\'s meals',
      completed: true,
      due_date: null,
      priority: 'medium',
      category: 'Personal',
      created_date: '2024-12-01',
      updated_date: '2024-12-01'
    }
  ],
  journalEntries: [
    {
      id: 'journal-1',
      title: 'A Great Day',
      content: 'Today was amazing! I accomplished so much and felt really productive. The weather was perfect and I had a great workout.',
      date: format(new Date(), 'yyyy-MM-dd'),
      mood: 'very_happy',
      tags: ['productivity', 'exercise', 'weather']
    }
  ],
  goals: [
    {
      id: 'goal-1',
      title: 'Learn React',
      description: 'Master React development for better career prospects',
      category: 'career',
      target_date: '2024-12-31',
      progress: 65,
      status: 'active',
      milestones: [
        { title: 'Complete React basics course', completed: true, date: '2024-11-01' },
        { title: 'Build first React app', completed: true, date: '2024-11-15' },
        { title: 'Learn React hooks', completed: false, date: null }
      ]
    }
  ],
  calendarEvents: [
    {
      id: 'event-1',
      title: 'Team Meeting',
      description: 'Weekly team sync',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      start_time: '10:00',
      end_date: format(new Date(), 'yyyy-MM-dd'),
      end_time: '11:00',
      category: 'Meeting',
      location: 'Conference Room A',
      color: 'blue',
      user_id: 'user-1'
    }
  ],
  mealEntries: [],
  waterEntries: [],
  nutritionGoals: {
    id: 'nutrition-1',
    daily_calories: 2000,
    daily_protein: 150,
    daily_carbs: 250,
    daily_fat: 65,
    daily_water: 64,
    water_unit: 'oz',
    user_id: 'user-1'
  },
  financeProfile: {
    id: 'finance-1',
    user_id: 'user-1',
    monthly_income: 5000,
    tax_rate: 22,
    k401_contribution: 500,
    k401_employer_match: 4,
    roth_ira_contribution: 500,
    savings_goal_type: 'percentage',
    savings_goal_value: 20
  },
  liabilities: [
    {
      id: 'liability-1',
      user_id: 'user-1',
      name: 'Student Loan',
      type: 'student',
      total_amount: 25000,
      monthly_payment: 300,
      interest_rate: 4.5
    }
  ],
  financeTransactions: [],
  financialGoals: [],
  schoolAssignments: [],
  bucketListItems: [],
  futureLetters: [],
  dailyReflections: [],
  vaultEntries: [],
  workoutSessions: [],
  workoutTemplates: [],
  gratitudePosts: []
}

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case 'ADD_USER_HABIT':
      return {
        ...state,
        userHabits: [...state.userHabits, { ...action.payload, id: `user-habit-${Date.now()}` }]
      }
    
    case 'UPDATE_USER_HABIT':
      return {
        ...state,
        userHabits: state.userHabits.map(habit =>
          habit.id === action.payload.id ? { ...habit, ...action.payload.updates } : habit
        )
      }
    
    case 'DELETE_USER_HABIT':
      return {
        ...state,
        userHabits: state.userHabits.filter(habit => habit.id !== action.payload.id)
      }
    
    case 'ADD_HABIT_LOG':
      return {
        ...state,
        habitLogs: [...state.habitLogs, { ...action.payload, id: `log-${Date.now()}` }]
      }
    
    case 'UPDATE_HABIT_LOG':
      return {
        ...state,
        habitLogs: state.habitLogs.map(log =>
          log.id === action.payload.id ? { ...log, ...action.payload.updates } : log
        )
      }
    
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, { 
          ...action.payload, 
          id: `todo-${Date.now()}`,
          created_date: format(new Date(), 'yyyy-MM-dd'),
          updated_date: format(new Date(), 'yyyy-MM-dd')
        }]
      }
    
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id ? { 
            ...todo, 
            ...action.payload.updates,
            updated_date: format(new Date(), 'yyyy-MM-dd')
          } : todo
        )
      }
    
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload.id)
      }
    
    case 'ADD_JOURNAL_ENTRY':
      return {
        ...state,
        journalEntries: [...state.journalEntries, { ...action.payload, id: `journal-${Date.now()}` }]
      }
    
    case 'UPDATE_JOURNAL_ENTRY':
      return {
        ...state,
        journalEntries: state.journalEntries.map(entry =>
          entry.id === action.payload.id ? { ...entry, ...action.payload.updates } : entry
        )
      }
    
    case 'DELETE_JOURNAL_ENTRY':
      return {
        ...state,
        journalEntries: state.journalEntries.filter(entry => entry.id !== action.payload.id)
      }
    
    case 'ADD_GOAL':
      return {
        ...state,
        goals: [...state.goals, { ...action.payload, id: `goal-${Date.now()}` }]
      }
    
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(goal =>
          goal.id === action.payload.id ? { ...goal, ...action.payload.updates } : goal
        )
      }
    
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(goal => goal.id !== action.payload.id)
      }
    
    case 'ADD_CALENDAR_EVENT':
      return {
        ...state,
        calendarEvents: [...state.calendarEvents, { ...action.payload, id: `event-${Date.now()}` }]
      }
    
    case 'UPDATE_CALENDAR_EVENT':
      return {
        ...state,
        calendarEvents: state.calendarEvents.map(event =>
          event.id === action.payload.id ? { ...event, ...action.payload.updates } : event
        )
      }
    
    case 'DELETE_CALENDAR_EVENT':
      return {
        ...state,
        calendarEvents: state.calendarEvents.filter(event => event.id !== action.payload.id)
      }
    
    case 'ADD_MEAL_ENTRY':
      return {
        ...state,
        mealEntries: [...state.mealEntries, { ...action.payload, id: `meal-${Date.now()}` }]
      }
    
    case 'UPDATE_MEAL_ENTRY':
      return {
        ...state,
        mealEntries: state.mealEntries.map(entry =>
          entry.id === action.payload.id ? { ...entry, ...action.payload.updates } : entry
        )
      }
    
    case 'DELETE_MEAL_ENTRY':
      return {
        ...state,
        mealEntries: state.mealEntries.filter(entry => entry.id !== action.payload.id)
      }
    
    case 'ADD_WATER_ENTRY':
      return {
        ...state,
        waterEntries: [...state.waterEntries, { ...action.payload, id: `water-${Date.now()}` }]
      }
    
    case 'DELETE_WATER_ENTRY':
      return {
        ...state,
        waterEntries: state.waterEntries.filter(entry => entry.id !== action.payload.id)
      }
    
    case 'UPDATE_NUTRITION_GOALS':
      return {
        ...state,
        nutritionGoals: { ...state.nutritionGoals, ...action.payload }
      }
    
    case 'ADD_FINANCE_TRANSACTION':
      return {
        ...state,
        financeTransactions: [...state.financeTransactions, { ...action.payload, id: `transaction-${Date.now()}` }]
      }
    
    case 'ADD_FINANCIAL_GOAL':
      return {
        ...state,
        financialGoals: [...state.financialGoals, { ...action.payload, id: `fin-goal-${Date.now()}` }]
      }
    
    case 'ADD_SCHOOL_ASSIGNMENT':
      return {
        ...state,
        schoolAssignments: [...state.schoolAssignments, { ...action.payload, id: `assignment-${Date.now()}` }]
      }
    
    case 'UPDATE_SCHOOL_ASSIGNMENT':
      return {
        ...state,
        schoolAssignments: state.schoolAssignments.map(assignment =>
          assignment.id === action.payload.id ? { ...assignment, ...action.payload.updates } : assignment
        )
      }
    
    case 'DELETE_SCHOOL_ASSIGNMENT':
      return {
        ...state,
        schoolAssignments: state.schoolAssignments.filter(assignment => assignment.id !== action.payload.id)
      }
    
    case 'ADD_BUCKET_LIST_ITEM':
      return {
        ...state,
        bucketListItems: [...state.bucketListItems, { ...action.payload, id: `bucket-${Date.now()}` }]
      }
    
    case 'UPDATE_BUCKET_LIST_ITEM':
      return {
        ...state,
        bucketListItems: state.bucketListItems.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload.updates } : item
        )
      }
    
    case 'DELETE_BUCKET_LIST_ITEM':
      return {
        ...state,
        bucketListItems: state.bucketListItems.filter(item => item.id !== action.payload.id)
      }
    
    case 'ADD_FUTURE_LETTER':
      return {
        ...state,
        futureLetters: [...state.futureLetters, { ...action.payload, id: `letter-${Date.now()}` }]
      }
    
    case 'ADD_DAILY_REFLECTION':
      return {
        ...state,
        dailyReflections: [...state.dailyReflections, { ...action.payload, id: `reflection-${Date.now()}` }]
      }
    
    case 'ADD_VAULT_ENTRY':
      return {
        ...state,
        vaultEntries: [...state.vaultEntries, { ...action.payload, id: `vault-${Date.now()}` }]
      }
    
    case 'UPDATE_VAULT_ENTRY':
      return {
        ...state,
        vaultEntries: state.vaultEntries.map(entry =>
          entry.id === action.payload.id ? { ...entry, ...action.payload.updates } : entry
        )
      }
    
    case 'DELETE_VAULT_ENTRY':
      return {
        ...state,
        vaultEntries: state.vaultEntries.filter(entry => entry.id !== action.payload.id)
      }
    
    case 'ADD_WORKOUT_TEMPLATE':
      return {
        ...state,
        workoutTemplates: [...state.workoutTemplates, { ...action.payload, id: `template-${Date.now()}` }]
      }
    
    case 'UPDATE_WORKOUT_TEMPLATE':
      return {
        ...state,
        workoutTemplates: state.workoutTemplates.map(template =>
          template.id === action.payload.id ? { ...template, ...action.payload.updates } : template
        )
      }
    
    case 'DELETE_WORKOUT_TEMPLATE':
      return {
        ...state,
        workoutTemplates: state.workoutTemplates.filter(template => template.id !== action.payload.id)
      }
    
    case 'ADD_WORKOUT_SESSION':
      return {
        ...state,
        workoutSessions: [...state.workoutSessions, { ...action.payload, id: `session-${Date.now()}` }]
      }
    
    case 'ADD_GRATITUDE_POST':
      return {
        ...state,
        gratitudePosts: [...state.gratitudePosts, { 
          ...action.payload, 
          id: `gratitude-${Date.now()}`,
          created_at: new Date().toISOString()
        }]
      }
    
    case 'DELETE_GRATITUDE_POST':
      return {
        ...state,
        gratitudePosts: state.gratitudePosts.filter(post => post.id !== action.payload.id)
      }
    
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('productivityAppData', JSON.stringify(state))
  }, [state])

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('productivityAppData')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        // Merge with initial state to ensure new fields are present
        Object.keys(parsedData).forEach(key => {
          if (parsedData[key] !== undefined) {
            dispatch({ type: 'LOAD_DATA', payload: { key, data: parsedData[key] } })
          }
        })
      } catch (error) {
        console.error('Error loading saved data:', error)
      }
    }
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}