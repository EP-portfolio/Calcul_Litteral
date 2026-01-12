// Types générés depuis le schéma Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Difficulty = 'facile' | 'moyen' | 'difficile'
export type Competence = 'developpement' | 'reduction' | 'factorisation'
export type ChallengeStatus = 'in_progress' | 'completed' | 'abandoned'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string | null
          difficulty: Difficulty
          competence: Competence
          exercises: Json
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          difficulty: Difficulty
          competence: Competence
          exercises: Json
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          difficulty?: Difficulty
          competence?: Competence
          exercises?: Json
          created_at?: string
        }
      }
      user_challenge_progress: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          started_at: string
          completed_at: string | null
          score: number
          total_exercises: number
          time_spent: number | null
          status: ChallengeStatus
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          started_at?: string
          completed_at?: string | null
          score?: number
          total_exercises?: number
          time_spent?: number | null
          status?: ChallengeStatus
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          started_at?: string
          completed_at?: string | null
          score?: number
          total_exercises?: number
          time_spent?: number | null
          status?: ChallengeStatus
        }
      }
      exercise_attempts: {
        Row: {
          id: string
          user_id: string
          progress_id: string
          competence: Competence
          difficulty: Difficulty
          exercise_data: Json
          user_answer: string
          is_correct: boolean
          time_spent: number | null
          attempted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          progress_id: string
          competence: Competence
          difficulty: Difficulty
          exercise_data: Json
          user_answer: string
          is_correct: boolean
          time_spent?: number | null
          attempted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          progress_id?: string
          competence?: Competence
          difficulty?: Difficulty
          exercise_data?: Json
          user_answer?: string
          is_correct?: boolean
          time_spent?: number | null
          attempted_at?: string
        }
      }
    }
    Views: {
      user_stats: {
        Row: {
          user_id: string
          competence: Competence
          difficulty: Difficulty
          total_attempts: number
          correct_attempts: number
          success_rate: number
          avg_time_spent: number
        }
      }
      user_recent_activity: {
        Row: {
          user_id: string
          activity_date: string
          exercises_done: number
          correct_count: number
        }
      }
    }
  }
}
