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
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          display_order?: number
          created_at?: string
        }
      }
      providers: {
        Row: {
          id: string
          name: string
          slug: string
          company_name: string | null
          email: string
          phone: string | null
          website: string | null
          linkedin: string | null
          headshot_url: string | null
          logo_url: string | null
          tagline: string | null
          bio: string | null
          city: string | null
          state: string | null
          is_remote: boolean
          deal_size_min: number | null
          deal_size_max: number | null
          years_experience: number | null
          deals_closed: number | null
          is_verified: boolean
          is_featured: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          company_name?: string | null
          email: string
          phone?: string | null
          website?: string | null
          linkedin?: string | null
          headshot_url?: string | null
          logo_url?: string | null
          tagline?: string | null
          bio?: string | null
          city?: string | null
          state?: string | null
          is_remote?: boolean
          deal_size_min?: number | null
          deal_size_max?: number | null
          years_experience?: number | null
          deals_closed?: number | null
          is_verified?: boolean
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          company_name?: string | null
          email?: string
          phone?: string | null
          website?: string | null
          linkedin?: string | null
          headshot_url?: string | null
          logo_url?: string | null
          tagline?: string | null
          bio?: string | null
          city?: string | null
          state?: string | null
          is_remote?: boolean
          deal_size_min?: number | null
          deal_size_max?: number | null
          years_experience?: number | null
          deals_closed?: number | null
          is_verified?: boolean
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      provider_categories: {
        Row: {
          provider_id: string
          category_id: string
        }
        Insert: {
          provider_id: string
          category_id: string
        }
        Update: {
          provider_id?: string
          category_id?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          slug: string
          category_id: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          category_id: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          category_id?: string
        }
      }
      provider_services: {
        Row: {
          provider_id: string
          service_id: string
        }
        Insert: {
          provider_id: string
          service_id: string
        }
        Update: {
          provider_id?: string
          service_id?: string
        }
      }
      inquiries: {
        Row: {
          id: string
          provider_id: string
          sender_name: string
          sender_email: string
          sender_phone: string | null
          company_name: string | null
          message: string
          deal_context: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          sender_name: string
          sender_email: string
          sender_phone?: string | null
          company_name?: string | null
          message: string
          deal_context?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          sender_name?: string
          sender_email?: string
          sender_phone?: string | null
          company_name?: string | null
          message?: string
          deal_context?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export type Provider = Database['public']['Tables']['providers']['Row']
export type ProviderInsert = Database['public']['Tables']['providers']['Insert']
export type ProviderUpdate = Database['public']['Tables']['providers']['Update']

export type Service = Database['public']['Tables']['services']['Row']
export type ServiceInsert = Database['public']['Tables']['services']['Insert']
export type ServiceUpdate = Database['public']['Tables']['services']['Update']

export type Inquiry = Database['public']['Tables']['inquiries']['Row']
export type InquiryInsert = Database['public']['Tables']['inquiries']['Insert']
export type InquiryUpdate = Database['public']['Tables']['inquiries']['Update']

// Extended types with relations
export type ProviderWithCategories = Provider & {
  categories: Category[]
}

export type ProviderWithServices = Provider & {
  services: Service[]
}

export type ProviderWithAll = Provider & {
  categories: Category[]
  services: Service[]
}

export type ServiceWithCategory = Service & {
  category: Category
}

export type InquiryWithProvider = Inquiry & {
  provider: Provider
}
