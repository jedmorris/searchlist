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
          rating_average: number | null
          rating_count: number
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
          rating_average?: number | null
          rating_count?: number
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
          rating_average?: number | null
          rating_count?: number
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
      industries: {
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
      provider_industries: {
        Row: {
          provider_id: string
          industry_id: string
        }
        Insert: {
          provider_id: string
          industry_id: string
        }
        Update: {
          provider_id?: string
          industry_id?: string
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
          status: 'new' | 'contacted' | 'closed' | 'converted'
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
          status?: 'new' | 'contacted' | 'closed' | 'converted'
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
          status?: 'new' | 'contacted' | 'closed' | 'converted'
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          role: UserRole
          provider_id: string | null
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          provider_id?: string | null
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          provider_id?: string | null
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      provider_invitations: {
        Row: {
          id: string
          email: string
          provider_id: string | null
          token: string
          invited_by: string | null
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          provider_id?: string | null
          token?: string
          invited_by?: string | null
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          provider_id?: string | null
          token?: string
          invited_by?: string | null
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          provider_id: string
          user_id: string | null
          author_name: string
          author_email: string
          rating: number
          title: string | null
          content: string
          is_approved: boolean
          is_featured: boolean
          helpful_count: number
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          user_id?: string | null
          author_name: string
          author_email: string
          rating: number
          title?: string | null
          content: string
          is_approved?: boolean
          is_featured?: boolean
          helpful_count?: number
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          user_id?: string | null
          author_name?: string
          author_email?: string
          rating?: number
          title?: string | null
          content?: string
          is_approved?: boolean
          is_featured?: boolean
          helpful_count?: number
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      review_votes: {
        Row: {
          review_id: string
          voter_ip: string
          created_at: string
        }
        Insert: {
          review_id: string
          voter_ip: string
          created_at?: string
        }
        Update: {
          review_id?: string
          voter_ip?: string
          created_at?: string
        }
      }
      provider_subscriptions: {
        Row: {
          id: string
          provider_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: SubscriptionTier
          status: SubscriptionStatus
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: SubscriptionTier
          status?: SubscriptionStatus
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: SubscriptionTier
          status?: SubscriptionStatus
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      feature_purchases: {
        Row: {
          id: string
          provider_id: string
          feature_type: FeatureType
          stripe_payment_intent_id: string | null
          starts_at: string
          expires_at: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          feature_type: FeatureType
          stripe_payment_intent_id?: string | null
          starts_at?: string
          expires_at: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          feature_type?: FeatureType
          stripe_payment_intent_id?: string | null
          starts_at?: string
          expires_at?: string
          is_active?: boolean
          created_at?: string
        }
      }
      payment_history: {
        Row: {
          id: string
          provider_id: string
          stripe_payment_intent_id: string | null
          stripe_invoice_id: string | null
          amount_cents: number
          currency: string
          description: string | null
          status: PaymentStatus
          created_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          stripe_payment_intent_id?: string | null
          stripe_invoice_id?: string | null
          amount_cents: number
          currency?: string
          description?: string | null
          status: PaymentStatus
          created_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          stripe_payment_intent_id?: string | null
          stripe_invoice_id?: string | null
          amount_cents?: number
          currency?: string
          description?: string | null
          status?: PaymentStatus
          created_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          youtube_video_id: string
          video_duration: string | null
          content: string
          author_name: string
          author_image_url: string | null
          published_at: string | null
          reading_time_minutes: number | null
          category: string | null
          tags: string[] | null
          meta_title: string | null
          meta_description: string | null
          featured_image_url: string | null
          is_published: boolean
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          youtube_video_id: string
          video_duration?: string | null
          content: string
          author_name?: string
          author_image_url?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          category?: string | null
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
          featured_image_url?: string | null
          is_published?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          youtube_video_id?: string
          video_duration?: string | null
          content?: string
          author_name?: string
          author_image_url?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          category?: string | null
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
          featured_image_url?: string | null
          is_published?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_providers: {
        Args: {
          search_query?: string | null
          category_filter?: string | null
          state_filter?: string | null
          min_deal_size?: number | null
          max_deal_size?: number | null
          remote_only?: boolean
          verified_only?: boolean
          featured_only?: boolean
          min_rating?: number | null
          result_limit?: number
          result_offset?: number
        }
        Returns: {
          id: string
          name: string
          slug: string
          company_name: string | null
          tagline: string | null
          city: string | null
          state: string | null
          is_remote: boolean
          is_verified: boolean
          is_featured: boolean
          headshot_url: string | null
          rating_average: number | null
          rating_count: number
          rank: number
        }[]
      }
    }
    Enums: {
      user_role: UserRole
      subscription_tier: SubscriptionTier
      subscription_status: SubscriptionStatus
    }
  }
}

// Enum types
export type UserRole = 'admin' | 'provider' | 'user'
export type SubscriptionTier = 'free' | 'basic' | 'featured' | 'premium'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing'
export type FeatureType = 'spotlight' | 'homepage_feature' | 'category_boost'
export type PaymentStatus = 'succeeded' | 'failed' | 'pending' | 'refunded'

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

export type Industry = Database['public']['Tables']['industries']['Row']
export type IndustryInsert = Database['public']['Tables']['industries']['Insert']
export type IndustryUpdate = Database['public']['Tables']['industries']['Update']

export type Inquiry = Database['public']['Tables']['inquiries']['Row']
export type InquiryInsert = Database['public']['Tables']['inquiries']['Insert']
export type InquiryUpdate = Database['public']['Tables']['inquiries']['Update']

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export type ProviderInvitation = Database['public']['Tables']['provider_invitations']['Row']
export type ProviderInvitationInsert = Database['public']['Tables']['provider_invitations']['Insert']
export type ProviderInvitationUpdate = Database['public']['Tables']['provider_invitations']['Update']

export type Review = Database['public']['Tables']['reviews']['Row']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update']

export type ReviewVote = Database['public']['Tables']['review_votes']['Row']
export type ReviewVoteInsert = Database['public']['Tables']['review_votes']['Insert']

export type ProviderSubscription = Database['public']['Tables']['provider_subscriptions']['Row']
export type ProviderSubscriptionInsert = Database['public']['Tables']['provider_subscriptions']['Insert']
export type ProviderSubscriptionUpdate = Database['public']['Tables']['provider_subscriptions']['Update']

export type FeaturePurchase = Database['public']['Tables']['feature_purchases']['Row']
export type FeaturePurchaseInsert = Database['public']['Tables']['feature_purchases']['Insert']
export type FeaturePurchaseUpdate = Database['public']['Tables']['feature_purchases']['Update']

export type PaymentHistory = Database['public']['Tables']['payment_history']['Row']
export type PaymentHistoryInsert = Database['public']['Tables']['payment_history']['Insert']

export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert']
export type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update']

// Extended types with relations
export type ProviderWithCategories = Provider & {
  categories: Category[]
}

export type ProviderWithServices = Provider & {
  services: Service[]
}

export type ProviderWithIndustries = Provider & {
  industries: Industry[]
}

export type ProviderWithAll = Provider & {
  categories: Category[]
  services: Service[]
  industries: Industry[]
}

export type ServiceWithCategory = Service & {
  category: Category
}

export type InquiryWithProvider = Inquiry & {
  provider: Provider
}

export type ReviewWithProvider = Review & {
  provider: Pick<Provider, 'id' | 'name' | 'slug'>
}

export type UserProfileWithProvider = UserProfile & {
  provider: Provider | null
}

export type ProviderSubscriptionWithProvider = ProviderSubscription & {
  provider: Pick<Provider, 'id' | 'name' | 'slug'>
}

// Search result type from the search_providers function
export type ProviderSearchResult = {
  id: string
  name: string
  slug: string
  company_name: string | null
  tagline: string | null
  city: string | null
  state: string | null
  is_remote: boolean
  is_verified: boolean
  is_featured: boolean
  headshot_url: string | null
  rating_average: number | null
  rating_count: number
  rank: number
}

// Quiz/Matching types
export type DealSizeRange = 'under-500k' | '500k-1m' | '1m-5m' | '5m-10m' | '10m-plus'
export type QuizTimeline = 'immediate' | '1-3-months' | '3-6-months' | '6-plus-months'

export interface QuizLead {
  id: string
  name: string
  email: string
  phone: string | null
  company_name: string | null
  service_needs: string[]
  deal_size_range: DealSizeRange | null
  location_preference: string | null
  timeline: QuizTimeline | null
  additional_notes: string | null
  matched_provider_ids: string[]
  match_scores: Record<string, number>
  source: string
  ip_address: string | null
  user_agent: string | null
  converted_to_inquiry: boolean
  created_at: string
  updated_at: string
}

export interface QuizLeadInsert {
  name: string
  email: string
  phone?: string | null
  company_name?: string | null
  service_needs: string[]
  deal_size_range?: DealSizeRange | null
  location_preference?: string | null
  timeline?: QuizTimeline | null
  additional_notes?: string | null
  matched_provider_ids?: string[]
  match_scores?: Record<string, number>
  source?: string
  ip_address?: string | null
  user_agent?: string | null
}

export interface QuizMatchedProvider {
  id: string
  name: string
  slug: string
  company_name: string | null
  tagline: string | null
  city: string | null
  state: string | null
  is_remote: boolean
  is_verified: boolean
  is_featured: boolean
  headshot_url: string | null
  rating_average: number | null
  rating_count: number
  deal_size_min: number | null
  deal_size_max: number | null
  match_score: number
}
