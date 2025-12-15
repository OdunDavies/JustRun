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
      daily_stats: {
        Row: {
          created_at: string
          date: string
          distance_km: number
          id: string
          jogs_count: number
          steps: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          distance_km?: number
          id?: string
          jogs_count?: number
          steps?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          distance_km?: number
          id?: string
          jogs_count?: number
          steps?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      jogs: {
        Row: {
          created_at: string
          distance_km: number
          duration_seconds: number
          id: string
          route: Json
          steps: number
          user_id: string
        }
        Insert: {
          created_at?: string
          distance_km?: number
          duration_seconds?: number
          id?: string
          route?: Json
          steps?: number
          user_id: string
        }
        Update: {
          created_at?: string
          distance_km?: number
          duration_seconds?: number
          id?: string
          route?: Json
          steps?: number
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_members: {
        Row: {
          id: string
          joined_at: string
          leaderboard_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          leaderboard_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          leaderboard_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_members_leaderboard_id_fkey"
            columns: ["leaderboard_id"]
            isOneToOne: false
            referencedRelation: "leaderboards"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboards: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          is_public: boolean
          latitude: number | null
          location_name: string | null
          longitude: number | null
          name: string
          type: Database["public"]["Enums"]["leaderboard_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          invite_code?: string
          is_public?: boolean
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          name: string
          type?: Database["public"]["Enums"]["leaderboard_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          is_public?: boolean
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          name?: string
          type?: Database["public"]["Enums"]["leaderboard_type"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          display_name: string | null
          id: string
          latitude: number | null
          longitude: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_leaderboard_invite_code: {
        Args: { _leaderboard_id: string }
        Returns: string
      }
      is_leaderboard_member: {
        Args: { _leaderboard_id: string; _user_id: string }
        Returns: boolean
      }
      is_public_leaderboard: {
        Args: { _leaderboard_id: string }
        Returns: boolean
      }
    }
    Enums: {
      leaderboard_type: "location" | "custom"
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
      leaderboard_type: ["location", "custom"],
    },
  },
} as const
