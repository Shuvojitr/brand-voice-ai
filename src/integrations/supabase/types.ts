export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_organization_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_organization_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_organization_id?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      ai_provider_settings: {
        Row: {
          api_endpoint: string | null
          api_key_encrypted: string | null
          created_at: string | null
          default_model: string | null
          id: string
          is_active: boolean
          provider_name: string
          provider_slug: string
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          created_at?: string | null
          default_model?: string | null
          id?: string
          is_active?: boolean
          provider_name: string
          provider_slug: string
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          created_at?: string | null
          default_model?: string | null
          id?: string
          is_active?: boolean
          provider_name?: string
          provider_slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_daily_stats: {
        Row: {
          avg_pages_per_session: number | null
          avg_session_duration: number | null
          bounce_rate: number | null
          content_generations: number | null
          created_at: string
          date: string
          desktop_visits: number | null
          direct_visits: number | null
          email_visits: number | null
          id: string
          mobile_visits: number | null
          new_visitors: number | null
          organic_visits: number | null
          paid_visits: number | null
          referral_visits: number | null
          returning_visitors: number | null
          signups: number | null
          social_visits: number | null
          subscriptions: number | null
          tablet_visits: number | null
          total_page_views: number | null
          total_revenue: number | null
          total_sessions: number | null
          total_visitors: number | null
          unique_visitors: number | null
          updated_at: string
        }
        Insert: {
          avg_pages_per_session?: number | null
          avg_session_duration?: number | null
          bounce_rate?: number | null
          content_generations?: number | null
          created_at?: string
          date: string
          desktop_visits?: number | null
          direct_visits?: number | null
          email_visits?: number | null
          id?: string
          mobile_visits?: number | null
          new_visitors?: number | null
          organic_visits?: number | null
          paid_visits?: number | null
          referral_visits?: number | null
          returning_visitors?: number | null
          signups?: number | null
          social_visits?: number | null
          subscriptions?: number | null
          tablet_visits?: number | null
          total_page_views?: number | null
          total_revenue?: number | null
          total_sessions?: number | null
          total_visitors?: number | null
          unique_visitors?: number | null
          updated_at?: string
        }
        Update: {
          avg_pages_per_session?: number | null
          avg_session_duration?: number | null
          bounce_rate?: number | null
          content_generations?: number | null
          created_at?: string
          date?: string
          desktop_visits?: number | null
          direct_visits?: number | null
          email_visits?: number | null
          id?: string
          mobile_visits?: number | null
          new_visitors?: number | null
          organic_visits?: number | null
          paid_visits?: number | null
          referral_visits?: number | null
          returning_visitors?: number | null
          signups?: number | null
          social_visits?: number | null
          subscriptions?: number | null
          tablet_visits?: number | null
          total_page_views?: number | null
          total_revenue?: number | null
          total_sessions?: number | null
          total_visitors?: number | null
          unique_visitors?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          anonymous_id: string | null
          browser: string | null
          browser_version: string | null
          city: string | null
          conversion_type: string | null
          conversion_value: number | null
          country: string | null
          created_at: string
          device_type: string | null
          event_name: string | null
          event_type: string
          id: string
          is_new_visitor: boolean | null
          operating_system: string | null
          page_path: string | null
          page_title: string | null
          previous_page_path: string | null
          properties: Json | null
          referrer: string | null
          referrer_domain: string | null
          region: string | null
          screen_height: number | null
          screen_width: number | null
          scroll_depth: number | null
          session_id: string
          time_on_page: number | null
          traffic_source: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          anonymous_id?: string | null
          browser?: string | null
          browser_version?: string | null
          city?: string | null
          conversion_type?: string | null
          conversion_value?: number | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_name?: string | null
          event_type: string
          id?: string
          is_new_visitor?: boolean | null
          operating_system?: string | null
          page_path?: string | null
          page_title?: string | null
          previous_page_path?: string | null
          properties?: Json | null
          referrer?: string | null
          referrer_domain?: string | null
          region?: string | null
          screen_height?: number | null
          screen_width?: number | null
          scroll_depth?: number | null
          session_id: string
          time_on_page?: number | null
          traffic_source?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          anonymous_id?: string | null
          browser?: string | null
          browser_version?: string | null
          city?: string | null
          conversion_type?: string | null
          conversion_value?: number | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_name?: string | null
          event_type?: string
          id?: string
          is_new_visitor?: boolean | null
          operating_system?: string | null
          page_path?: string | null
          page_title?: string | null
          previous_page_path?: string | null
          properties?: Json | null
          referrer?: string | null
          referrer_domain?: string | null
          region?: string | null
          screen_height?: number | null
          screen_width?: number | null
          scroll_depth?: number | null
          session_id?: string
          time_on_page?: number | null
          traffic_source?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          organization_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name?: string
          organization_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_voices: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean | null
          language: string | null
          name: string
          organization_id: string
          sample_text: string | null
          style_instructions: string | null
          tone_keywords: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          language?: string | null
          name: string
          organization_id: string
          sample_text?: string | null
          style_instructions?: string | null
          tone_keywords?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          language?: string | null
          name?: string
          organization_id?: string
          sample_text?: string | null
          style_instructions?: string | null
          tone_keywords?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_voices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_voices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_usage: {
        Row: {
          created_at: string | null
          credits_consumed: number | null
          document_id: string | null
          id: string
          model_used: string | null
          organization_id: string
          template_type: string | null
          tokens_input: number | null
          tokens_output: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_consumed?: number | null
          document_id?: string | null
          id?: string
          model_used?: string | null
          organization_id: string
          template_type?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_consumed?: number | null
          document_id?: string | null
          id?: string
          model_used?: string | null
          organization_id?: string
          template_type?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_usage_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          brand_voice_id: string | null
          content: string | null
          content_html: string | null
          created_at: string | null
          folder: string | null
          id: string
          initial_word_count: number | null
          is_favorite: boolean | null
          language: string | null
          organization_id: string
          seo_score: number | null
          template_inputs: Json | null
          template_type: string | null
          title: string
          updated_at: string | null
          user_id: string
          word_count: number | null
        }
        Insert: {
          brand_voice_id?: string | null
          content?: string | null
          content_html?: string | null
          created_at?: string | null
          folder?: string | null
          id?: string
          initial_word_count?: number | null
          is_favorite?: boolean | null
          language?: string | null
          organization_id: string
          seo_score?: number | null
          template_inputs?: Json | null
          template_type?: string | null
          title?: string
          updated_at?: string | null
          user_id: string
          word_count?: number | null
        }
        Update: {
          brand_voice_id?: string | null
          content?: string | null
          content_html?: string | null
          created_at?: string | null
          folder?: string | null
          id?: string
          initial_word_count?: number | null
          is_favorite?: boolean | null
          language?: string | null
          organization_id?: string
          seo_score?: number | null
          template_inputs?: Json | null
          template_type?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_brand_voice_id_fkey"
            columns: ["brand_voice_id"]
            isOneToOne: false
            referencedRelation: "brand_voices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          question: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      homepage_content: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          section_key: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          content?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          section_key: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          section_key?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      live_chat_messages: {
        Row: {
          chat_id: string
          created_at: string
          id: string
          is_admin_message: boolean
          message: string
          user_id: string | null
        }
        Insert: {
          chat_id: string
          created_at?: string
          id?: string
          is_admin_message?: boolean
          message: string
          user_id?: string | null
        }
        Update: {
          chat_id?: string
          created_at?: string
          id?: string
          is_admin_message?: boolean
          message?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "live_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      live_chat_settings: {
        Row: {
          auto_reply_delay_seconds: number
          auto_reply_enabled: boolean
          auto_reply_message: string
          business_days: number[]
          business_hours_end: string
          business_hours_start: string
          created_at: string
          id: string
          is_enabled: boolean
          offline_message: string
          timezone: string
          updated_at: string
        }
        Insert: {
          auto_reply_delay_seconds?: number
          auto_reply_enabled?: boolean
          auto_reply_message?: string
          business_days?: number[]
          business_hours_end?: string
          business_hours_start?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          offline_message?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          auto_reply_delay_seconds?: number
          auto_reply_enabled?: boolean
          auto_reply_message?: string
          business_days?: number[]
          business_hours_end?: string
          business_hours_start?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          offline_message?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      live_chats: {
        Row: {
          assigned_to: string | null
          created_at: string
          ended_at: string | null
          id: string
          status: string
          updated_at: string
          user_email: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_email: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id: string
          joined_at: string | null
          organization_id: string
          role: Database["public"]["Enums"]["org_role"] | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"] | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          credits_used: number | null
          has_used_free_plan: boolean
          id: string
          is_yearly_subscription: boolean | null
          logo_url: string | null
          monthly_credits: number | null
          name: string
          remaining_credits: number
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_ends_at: string | null
          subscription_status: string
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credits_used?: number | null
          has_used_free_plan?: boolean
          id?: string
          is_yearly_subscription?: boolean | null
          logo_url?: string | null
          monthly_credits?: number | null
          name: string
          remaining_credits?: number
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          subscription_status?: string
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credits_used?: number | null
          has_used_free_plan?: boolean
          id?: string
          is_yearly_subscription?: boolean | null
          logo_url?: string | null
          monthly_credits?: number | null
          name?: string
          remaining_credits?: number
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          subscription_status?: string
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string | null
          credits: number
          credits_yearly: number | null
          cta_text: string | null
          currency: string
          description: string | null
          features_monthly: string[]
          features_yearly: string[]
          id: string
          interval: string
          is_active: boolean
          is_popular: boolean
          monthly_discount: number
          name: string
          price: number
          price_yearly: number | null
          slug: string
          sort_order: number
          stripe_price_id: string | null
          stripe_price_id_yearly: string | null
          updated_at: string | null
          yearly_discount: number
        }
        Insert: {
          created_at?: string | null
          credits?: number
          credits_yearly?: number | null
          cta_text?: string | null
          currency?: string
          description?: string | null
          features_monthly?: string[]
          features_yearly?: string[]
          id?: string
          interval?: string
          is_active?: boolean
          is_popular?: boolean
          monthly_discount?: number
          name: string
          price?: number
          price_yearly?: number | null
          slug: string
          sort_order?: number
          stripe_price_id?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string | null
          yearly_discount?: number
        }
        Update: {
          created_at?: string | null
          credits?: number
          credits_yearly?: number | null
          cta_text?: string | null
          currency?: string
          description?: string | null
          features_monthly?: string[]
          features_yearly?: string[]
          id?: string
          interval?: string
          is_active?: boolean
          is_popular?: boolean
          monthly_discount?: number
          name?: string
          price?: number
          price_yearly?: number | null
          slug?: string
          sort_order?: number
          stripe_price_id?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string | null
          yearly_discount?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_banned: boolean | null
          onboarding_completed: boolean | null
          preferred_language: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_banned?: boolean | null
          onboarding_completed?: boolean | null
          preferred_language?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_banned?: boolean | null
          onboarding_completed?: boolean | null
          preferred_language?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          bottom_tagline: string | null
          copyright_text: string | null
          created_at: string | null
          favicon_sizes: Json | null
          favicon_url: string | null
          footer_logo_url: string | null
          footer_nav: Json
          header_logo_url: string | null
          header_nav: Json
          id: string
          is_api_feature_enabled: boolean
          logo_url: string | null
          og_image_url: string | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          site_description: string | null
          site_name: string
          social_links: Json
          twitter_handle: string | null
          updated_at: string | null
        }
        Insert: {
          bottom_tagline?: string | null
          copyright_text?: string | null
          created_at?: string | null
          favicon_sizes?: Json | null
          favicon_url?: string | null
          footer_logo_url?: string | null
          footer_nav?: Json
          header_logo_url?: string | null
          header_nav?: Json
          id?: string
          is_api_feature_enabled?: boolean
          logo_url?: string | null
          og_image_url?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          site_description?: string | null
          site_name?: string
          social_links?: Json
          twitter_handle?: string | null
          updated_at?: string | null
        }
        Update: {
          bottom_tagline?: string | null
          copyright_text?: string | null
          created_at?: string | null
          favicon_sizes?: Json | null
          favicon_url?: string | null
          footer_logo_url?: string | null
          footer_nav?: Json
          header_logo_url?: string | null
          header_nav?: Json
          id?: string
          is_api_feature_enabled?: boolean
          logo_url?: string | null
          og_image_url?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          site_description?: string | null
          site_name?: string
          social_links?: Json
          twitter_handle?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_notes: string | null
          assigned_to: string | null
          category: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          assigned_to?: string | null
          category?: string
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          assigned_to?: string | null
          category?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      template_categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
          sort_order: number | null
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          sort_order?: number | null
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          sort_order?: number | null
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      template_icons: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          description_bn: string | null
          estimated_credits: number | null
          form_schema_json: Json
          icon: string | null
          id: string
          is_active: boolean | null
          model: string | null
          name: string
          name_bn: string | null
          output_format: string | null
          slug: string
          sort_order: number | null
          supported_languages: string[] | null
          system_prompt: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          description_bn?: string | null
          estimated_credits?: number | null
          form_schema_json?: Json
          icon?: string | null
          id?: string
          is_active?: boolean | null
          model?: string | null
          name: string
          name_bn?: string | null
          output_format?: string | null
          slug: string
          sort_order?: number | null
          supported_languages?: string[] | null
          system_prompt: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          description_bn?: string | null
          estimated_credits?: number | null
          form_schema_json?: Json
          icon?: string | null
          id?: string
          is_active?: boolean | null
          model?: string | null
          name?: string
          name_bn?: string | null
          output_format?: string | null
          slug?: string
          sort_order?: number | null
          supported_languages?: string[] | null
          system_prompt?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          rating: number | null
          review_text: string
          sort_order: number | null
          updated_at: string | null
          user_avatar: string | null
          user_name: string
          user_role: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          rating?: number | null
          review_text: string
          sort_order?: number | null
          updated_at?: string | null
          user_avatar?: string | null
          user_name: string
          user_role?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          rating?: number | null
          review_text?: string
          sort_order?: number | null
          updated_at?: string | null
          user_avatar?: string | null
          user_name?: string
          user_role?: string | null
        }
        Relationships: []
      }
      themes: {
        Row: {
          colors: Json
          created_at: string | null
          description: string | null
          fonts: Json
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          colors?: Json
          created_at?: string | null
          description?: string | null
          fonts?: Json
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          colors?: Json
          created_at?: string | null
          description?: string | null
          fonts?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_replies: {
        Row: {
          created_at: string
          id: string
          is_admin_reply: boolean
          message: string
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin_reply?: boolean
          message: string
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_admin_reply?: boolean
          message?: string
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_subscription_status: { Args: { org_id: string }; Returns: Json }
      deduct_credits: {
        Args: { credits_amount: number; org_id: string }
        Returns: Json
      }
      expire_subscriptions: { Args: never; Returns: undefined }
      get_user_org_ids: { Args: { _user_id: string }; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      process_subscription: {
        Args: {
          is_yearly?: boolean
          org_id: string
          plan_credits: number
          plan_slug: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user" | "manager"
      org_role: "owner" | "admin" | "member"
      subscription_tier: "free" | "starter" | "pro" | "enterprise"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "manager"],
      org_role: ["owner", "admin", "member"],
      subscription_tier: ["free", "starter", "pro", "enterprise"],
    },
  },
} as const
