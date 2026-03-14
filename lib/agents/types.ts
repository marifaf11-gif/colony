export type AgentName = 'HOUND' | 'HAWK' | 'GENERAL' | 'SYSTEM' | 'ARSENAL';

export type EventType =
  | 'BOOT'
  | 'SCAN_START'
  | 'VULN_FOUND'
  | 'TARGET_ACQUIRED'
  | 'TICKET_GENERATED'
  | 'REPORT_SENT'
  | 'BUDGET_CHECK'
  | 'RATE_LIMIT'
  | 'WEAPON_SELECTED'
  | 'DISCORD_SENT'
  | 'ERROR'
  | 'COMPLETE';

export interface TerminalLog {
  id: string;
  agent: AgentName;
  event_type: EventType;
  message: string;
  target_url?: string | null;
  vulnerability_id?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface VulnerabilityLog {
  id: string;
  target_url: string;
  kink_type: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  impact_estimate: number;
  status: 'pending' | 'hawk_processing' | 'report_sent' | 'invoiced';
  golden_ticket_html: string | null;
  stripe_remediation_link: string | null;
  discord_message_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AgentBudget {
  agent_name: 'hound' | 'hawk' | 'general' | 'system';
  date: string;
  spend_usd: number;
  tokens_used: number;
  requests_made: number;
  bounties_identified: number;
}

export interface GoldenTicketReport {
  id: string;
  vulnerability_id: string;
  target_url: string;
  html_content: string;
  stripe_link: string | null;
  price_cents: number;
  sent_to_discord: boolean;
  opened: boolean;
  paid: boolean;
  created_at: string;
}

export interface OrchestratorConfig {
  openrouterKey?: string;
  discordScoutWebhook?: string;
  discordBountyWebhook?: string;
  stripeRemediationBase?: string;
  maxDailySpendUsd?: number;
}
