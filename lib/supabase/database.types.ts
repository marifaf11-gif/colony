/**
 * Database Types (Generated from Supabase)
 * Will be updated as schema evolves
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      global_leads: {
        Row: {
          id: string;
          url: string;
          detected_language: string;
          total_leak_estimate: number;
          severity: 'Low' | 'Medium' | 'High';
          scores: Json;
          findings: Json;
          locale: string;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          detected_language?: string;
          total_leak_estimate?: number;
          severity?: 'Low' | 'Medium' | 'High';
          scores?: Json;
          findings?: Json;
          locale?: string;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          url?: string;
          detected_language?: string;
          total_leak_estimate?: number;
          severity?: 'Low' | 'Medium' | 'High';
          scores?: Json;
          findings?: Json;
          locale?: string;
          user_id?: string | null;
          created_at?: string;
        };
      };
      arsenal_tools: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string | null;
          endpoint_config: Json | null;
          embedding: unknown | null;
          success_rate: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category?: string | null;
          endpoint_config?: Json | null;
          embedding?: unknown | null;
          success_rate?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          endpoint_config?: Json | null;
          embedding?: unknown | null;
          success_rate?: number;
          created_at?: string;
        };
      };
      vulnerability_log: {
        Row: {
          id: string;
          target_url: string;
          target_name: string | null;
          vulnerability_type: string | null;
          severity: string | null;
          raw_data: Json | null;
          status: string;
          hound_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          target_url: string;
          target_name?: string | null;
          vulnerability_type?: string | null;
          severity?: string | null;
          raw_data?: Json | null;
          status?: string;
          hound_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          target_url?: string;
          target_name?: string | null;
          vulnerability_type?: string | null;
          severity?: string | null;
          raw_data?: Json | null;
          status?: string;
          hound_id?: string | null;
          created_at?: string;
        };
      };
      agent_budget: {
        Row: {
          id: string;
          agent_name: string;
          date: string;
          spend_usd: number;
          tokens_used: number;
          requests_made: number;
          bounties_identified: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_name: string;
          date?: string;
          spend_usd?: number;
          tokens_used?: number;
          requests_made?: number;
          bounties_identified?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agent_name?: string;
          date?: string;
          spend_usd?: number;
          tokens_used?: number;
          requests_made?: number;
          bounties_identified?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      agent_terminal_logs: {
        Row: {
          id: string;
          agent: string;
          event_type: string;
          message: string;
          target_url: string | null;
          vulnerability_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent: string;
          event_type: string;
          message: string;
          target_url?: string | null;
          vulnerability_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          agent?: string;
          event_type?: string;
          message?: string;
          target_url?: string | null;
          vulnerability_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      strikes: {
        Row: {
          id: string;
          company_name: string;
          website: string;
          contact_email: string | null;
          sector: string;
          city: string;
          tech_stack: string[];
          loi25_gaps: string[];
          severity: string;
          revenue_value: number;
          status: string;
          audit_data: Json;
          email_draft: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_name?: string;
          website?: string;
          contact_email?: string | null;
          sector?: string;
          city?: string;
          tech_stack?: string[];
          loi25_gaps?: string[];
          severity?: string;
          revenue_value?: number;
          status?: string;
          audit_data?: Json;
          email_draft?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          website?: string;
          contact_email?: string | null;
          sector?: string;
          city?: string;
          tech_stack?: string[];
          loi25_gaps?: string[];
          severity?: string;
          revenue_value?: number;
          status?: string;
          audit_data?: Json;
          email_draft?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      golden_ticket_reports: {
        Row: {
          id: string;
          vulnerability_id: string | null;
          target_url: string;
          html_content: string;
          stripe_link: string | null;
          price_cents: number;
          sent_to_discord: boolean;
          opened: boolean;
          paid: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          vulnerability_id?: string | null;
          target_url: string;
          html_content?: string;
          stripe_link?: string | null;
          price_cents?: number;
          sent_to_discord?: boolean;
          opened?: boolean;
          paid?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          vulnerability_id?: string | null;
          target_url?: string;
          html_content?: string;
          stripe_link?: string | null;
          price_cents?: number;
          sent_to_discord?: boolean;
          opened?: boolean;
          paid?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
