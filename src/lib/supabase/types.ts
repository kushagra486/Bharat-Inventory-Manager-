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
      categories: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          is_default: boolean
          name: string
          user_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_default?: boolean
          name: string
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_default?: boolean
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          auth_user_id: string | null
          created_at: string
          email: string | null
          id: string
          loyalty_points: number
          name: string
          phone: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          loyalty_points?: number
          name: string
          phone?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          loyalty_points?: number
          name?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sales_orders: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          order_number: string
          payment_method: string
          status: string
          subtotal: number
          tax: number
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          order_number: string
          payment_method?: string
          status?: string
          subtotal: number
          tax?: number
          total: number
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          order_number?: string
          payment_method?: string
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_order_items: {
        Row: {
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: string
          line_total: number
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Update: {
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          created_at: string
          days_before: number
          id: string
          product_id: string
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_before: number
          id?: string
          product_id: string
          sent_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_before?: number
          id?: string
          product_id?: string
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          channel: string
          days_before: number
          id: string
          is_enabled: boolean
          user_id: string
        }
        Insert: {
          channel?: string
          days_before: number
          id?: string
          is_enabled?: boolean
          user_id: string
        }
        Update: {
          channel?: string
          days_before?: number
          id?: string
          is_enabled?: boolean
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          batch_number: string | null
          category_id: string | null
          created_at: string
          expiry_date: string
          id: string
          image_url: string | null
          is_archived: boolean
          location: string | null
          manufacture_date: string | null
          name: string
          notes: string | null
          price: number | null
          quantity: number
          supplier_id: string | null
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          barcode?: string | null
          batch_number?: string | null
          category_id?: string | null
          created_at?: string
          expiry_date: string
          id?: string
          image_url?: string | null
          is_archived?: boolean
          location?: string | null
          manufacture_date?: string | null
          name: string
          notes?: string | null
          price?: number | null
          quantity?: number
          supplier_id?: string | null
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          barcode?: string | null
          batch_number?: string | null
          category_id?: string | null
          created_at?: string
          expiry_date?: string
          id?: string
          image_url?: string | null
          is_archived?: boolean
          location?: string | null
          manufacture_date?: string | null
          name?: string
          notes?: string | null
          price?: number | null
          quantity?: number
          supplier_id?: string | null
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          business_name: string | null
          created_at: string
          delivery_estimate: string | null
          full_name: string | null
          id: string
          phone: string | null
          service_area: string | null
          upi_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string
          delivery_estimate?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          service_area?: string | null
          upi_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string
          delivery_estimate?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          service_area?: string | null
          upi_id?: string | null
        }
        Relationships: []
      }
      shop_staff: {
        Row: {
          auth_user_id: string | null
          created_at: string
          full_name: string
          id: string
          invite_code: string
          owner_id: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          full_name: string
          id?: string
          invite_code?: string
          owner_id: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          full_name?: string
          id?: string
          invite_code?: string
          owner_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_staff_invite: {
        Args: {
          p_invite_code: string
        }
        Returns: {
          owner_id: string
          business_name: string
        }[]
      }
      place_customer_order: {
        Args: {
          p_customer_name: string
          p_customer_phone: string
          p_items: Json
          p_owner_id: string
          p_payment_method?: string
        }
        Returns: Json
      }
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
