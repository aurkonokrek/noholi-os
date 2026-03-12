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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      book_covers: {
        Row: {
          book_id: string
          cover_url: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          book_id: string
          cover_url: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          book_id?: string
          cover_url?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          author: string
          author_bangla: string
          available_copies: number
          category: string
          condition: string
          created_at: string
          edition: string
          genre: string
          id: string
          isbn: string
          issued_copies: number
          language: string
          location: string
          pages: number
          price: number
          publisher: string
          reserved_copies: number
          thumbnail: string | null
          title: string
          title_bangla: string
          total_copies: number
          updated_at: string
          year_of_publication: string
        }
        Insert: {
          author: string
          author_bangla?: string
          available_copies?: number
          category?: string
          condition?: string
          created_at?: string
          edition?: string
          genre?: string
          id: string
          isbn?: string
          issued_copies?: number
          language?: string
          location?: string
          pages?: number
          price?: number
          publisher?: string
          reserved_copies?: number
          thumbnail?: string | null
          title: string
          title_bangla?: string
          total_copies?: number
          updated_at?: string
          year_of_publication?: string
        }
        Update: {
          author?: string
          author_bangla?: string
          available_copies?: number
          category?: string
          condition?: string
          created_at?: string
          edition?: string
          genre?: string
          id?: string
          isbn?: string
          issued_copies?: number
          language?: string
          location?: string
          pages?: number
          price?: number
          publisher?: string
          reserved_copies?: number
          thumbnail?: string | null
          title?: string
          title_bangla?: string
          total_copies?: number
          updated_at?: string
          year_of_publication?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          assigned_accession_id: string | null
          book_title: string
          condition: string
          created_at: string
          date_received: string
          donor_name: string
          id: string
          review_status: string
        }
        Insert: {
          assigned_accession_id?: string | null
          book_title: string
          condition?: string
          created_at?: string
          date_received?: string
          donor_name: string
          id: string
          review_status?: string
        }
        Update: {
          assigned_accession_id?: string | null
          book_title?: string
          condition?: string
          created_at?: string
          date_received?: string
          donor_name?: string
          id?: string
          review_status?: string
        }
        Relationships: []
      }
      loans: {
        Row: {
          accession_id: string
          book_title: string
          created_at: string
          due_date: string
          fine_amount: number
          guarantor_city: string
          guarantor_district: string
          guarantor_email: string
          guarantor_name: string
          guarantor_phone: string
          guarantor_postal_code: string
          guarantor_relationship: string
          guarantor_street: string
          id: string
          issued_date: string
          member_id: string
          member_name: string
          notes: string
          return_date: string | null
          status: string
        }
        Insert: {
          accession_id: string
          book_title: string
          created_at?: string
          due_date: string
          fine_amount?: number
          guarantor_city?: string
          guarantor_district?: string
          guarantor_email?: string
          guarantor_name?: string
          guarantor_phone?: string
          guarantor_postal_code?: string
          guarantor_relationship?: string
          guarantor_street?: string
          id: string
          issued_date?: string
          member_id: string
          member_name: string
          notes?: string
          return_date?: string | null
          status?: string
        }
        Update: {
          accession_id?: string
          book_title?: string
          created_at?: string
          due_date?: string
          fine_amount?: number
          guarantor_city?: string
          guarantor_district?: string
          guarantor_email?: string
          guarantor_name?: string
          guarantor_phone?: string
          guarantor_postal_code?: string
          guarantor_relationship?: string
          guarantor_street?: string
          id?: string
          issued_date?: string
          member_id?: string
          member_name?: string
          notes?: string
          return_date?: string | null
          status?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          active_loans: number
          address_line: string
          avatar: string | null
          city: string
          created_at: string
          district: string
          email: string
          fines: number
          id: string
          name: string
          phone: string
          postal_code: string
          status: string
          updated_at: string
        }
        Insert: {
          active_loans?: number
          address_line?: string
          avatar?: string | null
          city?: string
          created_at?: string
          district?: string
          email: string
          fines?: number
          id: string
          name: string
          phone?: string
          postal_code?: string
          status?: string
          updated_at?: string
        }
        Update: {
          active_loans?: number
          address_line?: string
          avatar?: string | null
          city?: string
          created_at?: string
          district?: string
          email?: string
          fines?: number
          id?: string
          name?: string
          phone?: string
          postal_code?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
