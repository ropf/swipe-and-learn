
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      words: {
        Row: {
          id: string
          german: string
          italian: string
          level: number
          last_seen: number
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          german: string
          italian: string
          level?: number
          last_seen?: number
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          german?: string
          italian?: string
          level?: number
          last_seen?: number
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}
