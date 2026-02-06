export interface User {
  id: string
  email: string
  display_name?: string
}

export interface Profile {
  id: string
  display_name?: string
  created_at: string
}

export interface Partnership {
  id: string
  user_a: string
  user_b: string
  status: 'pending' | 'active'
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  entry_date: string
  priorities: string[]
  wins: string
  blockers: string
  minutes_deep_work: number
  mood: number
  tomorrow_plan: string
  freeform_notes: string
  is_submitted: boolean
  submitted_at?: string
  daily_score: number
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  entry_id: string
  author_id: string
  body: string
  created_at: string
  author?: Profile
}

export interface EntryPhoto {
  id: string
  entry_id: string
  user_id: string
  storage_path: string
  caption: string
  created_at: string
}

export interface ScoreBreakdown {
  priorities: number
  wins: number
  blockers: number
  deepWork: number
  mood: number
  tomorrowPlan: number
  photos: number
  total: number
}

export interface CompareData {
  date: string
  currentUser: {
    entry: JournalEntry | null
    photos: EntryPhoto[]
    comments: Comment[]
    score: ScoreBreakdown
    profile: Profile
  }
  partner: {
    entry: JournalEntry | null
    photos: EntryPhoto[]
    comments: Comment[]
    score: ScoreBreakdown
    profile: Profile
  }
}

export interface DashboardStats {
  range: '7' | '30' | '90'
  currentUser: {
    dailyScores: Array<{ date: string; score: number }>
    weeklyScores: Array<{ week: string; score: number }>
    currentStreak: number
    bestStreak: number
    completionRate: number
    totalDeepWork: number
    averageMood: number
    profile: Profile
  }
  partner: {
    dailyScores: Array<{ date: string; score: number }>
    weeklyScores: Array<{ week: string; score: number }>
    currentStreak: number
    bestStreak: number
    completionRate: number
    totalDeepWork: number
    averageMood: number
    profile: Profile
  }
  winner?: {
    userId: string
    name: string
    totalScore: number
  }
}
