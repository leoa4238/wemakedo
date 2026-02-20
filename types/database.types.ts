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
            users: {
                Row: {
                    id: string
                    email: string | null
                    name: string | null
                    avatar_url: string | null
                    company: string | null
                    job_title: string | null
                    manner_score: number
                    created_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    name?: string | null
                    avatar_url?: string | null
                    company?: string | null
                    job_title?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    name?: string | null
                    avatar_url?: string | null
                    company?: string | null
                    job_title?: string | null
                    created_at?: string
                }
            }
            gatherings: {
                Row: {
                    id: number
                    host_id: string
                    title: string
                    content: string | null
                    location: string
                    meet_at: string
                    capacity: number
                    image_url: string | null
                    category: string | null
                    status: 'recruiting' | 'closed' | 'canceled'
                    created_at: string
                    latitude: number | null
                    longitude: number | null
                }
                Insert: {
                    id?: number
                    host_id: string
                    title: string
                    content?: string | null
                    location: string
                    meet_at: string
                    capacity?: number
                    image_url?: string | null
                    category?: string | null
                    status?: 'recruiting' | 'closed' | 'canceled'
                    created_at?: string
                    latitude?: number | null
                    longitude?: number | null
                }
                Update: {
                    id?: number
                    host_id?: string
                    title?: string
                    content?: string | null
                    location?: string
                    meet_at?: string
                    capacity?: number
                    image_url?: string | null
                    category?: string | null
                    status?: 'recruiting' | 'closed' | 'canceled'
                    created_at?: string
                    latitude?: number | null
                    longitude?: number | null
                }
            }
            participations: {
                Row: {
                    id: number
                    user_id: string
                    gathering_id: number
                    status: 'pending' | 'joined' | 'rejected'
                    created_at: string
                }
                Insert: {
                    id?: number
                    user_id: string
                    gathering_id: number
                    status?: 'pending' | 'joined' | 'rejected'
                    created_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    gathering_id?: number
                    status?: 'pending' | 'joined' | 'rejected'
                    created_at?: string
                }
            }
            chat_messages: {
                Row: {
                    id: number
                    gathering_id: number
                    user_id: string
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    gathering_id: number
                    user_id: string
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    gathering_id?: number
                    user_id?: string
                    content?: string
                    created_at?: string
                }
            }
            user_reviews: {
                Row: {
                    id: number
                    reviewer_id: string
                    reviewee_id: string
                    gathering_id: number
                    score: number
                    created_at: string
                }
                Insert: {
                    id?: number
                    reviewer_id: string
                    reviewee_id: string
                    gathering_id: number
                    score: number
                    created_at?: string
                }
                Update: {
                    id?: number
                    reviewer_id?: string
                    reviewee_id?: string
                    gathering_id?: number
                    score?: number
                    created_at?: string
                }
            }
            notifications: {
                Row: {
                    id: number
                    user_id: string
                    type: string
                    content: string
                    link_url: string | null
                    is_read: boolean
                    created_at: string
                }
                Insert: {
                    id?: number
                    user_id: string
                    type: string
                    content: string
                    link_url?: string | null
                    is_read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    type?: string
                    content?: string
                    link_url?: string | null
                    is_read?: boolean
                    created_at?: string
                }
            }
        }
    }
}
