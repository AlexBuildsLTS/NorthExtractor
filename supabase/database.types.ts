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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          data_id: string
          id: string
          insight_text: string
          task_type: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          data_id: string
          id?: string
          insight_text: string
          task_type: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          data_id?: string
          id?: string
          insight_text?: string
          task_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_data_id_fkey"
            columns: ["data_id"]
            isOneToOne: false
            referencedRelation: "extracted_data"
            referencedColumns: ["id"]
          },
        ]
      }
      extracted_data: {
        Row: {
          content_structured: Json
          created_at: string | null
          id: string
          job_id: string
          metadata: Json | null
        }
        Insert: {
          content_structured?: Json
          created_at?: string | null
          id?: string
          job_id: string
          metadata?: Json | null
        }
        Update: {
          content_structured?: Json
          created_at?: string | null
          id?: string
          job_id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_data_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scraping_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      harvested_data: {
        Row: {
          created_at: string
          execution_time_ms: number | null
          id: string
          raw_content: string | null
          scraper_id: string
          structured_data: Json
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          execution_time_ms?: number | null
          id?: string
          raw_content?: string | null
          scraper_id: string
          structured_data?: Json
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          execution_time_ms?: number | null
          id?: string
          raw_content?: string | null
          scraper_id?: string
          structured_data?: Json
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "harvested_data_scraper_id_fkey"
            columns: ["scraper_id"]
            isOneToOne: false
            referencedRelation: "scrapers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          proxy_config: Json | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          proxy_config?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          proxy_config?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      proxy_nodes: {
        Row: {
          created_at: string | null
          host: string
          id: string
          port: number
          protocol: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          host: string
          id?: string
          port: number
          protocol?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          host?: string
          id?: string
          port?: number
          protocol?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scrapers: {
        Row: {
          created_at: string
          engine_type: string | null
          extraction_schema: Json
          id: string
          last_run_at: string | null
          name: string
          status: string | null
          target_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          engine_type?: string | null
          extraction_schema?: Json
          id?: string
          last_run_at?: string | null
          name: string
          status?: string | null
          target_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          engine_type?: string | null
          extraction_schema?: Json
          id?: string
          last_run_at?: string | null
          name?: string
          status?: string | null
          target_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scraping_jobs: {
        Row: {
          created_at: string | null
          id: string
          last_run_at: string | null
          status: Database["public"]["Enums"]["job_status"] | null
          target_schema: Json | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_run_at?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          target_schema?: Json | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_run_at?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          target_schema?: Json | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      scraping_logs: {
        Row: {
          created_at: string | null
          id: string
          job_id: string | null
          level: string | null
          message: string
          metadata: Json | null
          scraper_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          level?: string | null
          message: string
          metadata?: Json | null
          scraper_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          level?: string | null
          message?: string
          metadata?: Json | null
          scraper_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scraping_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scraping_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scraping_logs_scraper_id_fkey"
            columns: ["scraper_id"]
            isOneToOne: false
            referencedRelation: "scrapers"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          secret_key: string | null
          target_url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          secret_key?: string | null
          target_url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          secret_key?: string | null
          target_url?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      dispatch_bulk_jobs: {
        Args: { p_schema: Json; p_urls: string[]; p_user_id: string }
        Returns: number
      }
      log_event: {
        Args: {
          p_job_id?: string
          p_level: string
          p_message: string
          p_metadata?: Json
          p_scraper_id?: string
          p_user_id: string
        }
        Returns: string
      }
      refresh_analytics: { Args: never; Returns: undefined }
    }
    Enums: {
      job_status: "pending" | "running" | "completed" | "failed"
      user_role: "Member" | "Premium" | "Moderator" | "Admin"
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
      job_status: ["pending", "running", "completed", "failed"],
      user_role: ["Member", "Premium", "Moderator", "Admin"],
    },
  },
} as const
