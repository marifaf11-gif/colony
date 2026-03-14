import type { VulnerabilityLog } from './types';

export interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
}

const SEVERITY_COLORS: Record<string, number> = {
  Critical: 0xff0000,
  High: 0xff4500,
  Medium: 0xffa500,
  Low: 0x39ff14,
};

export async function sendScoutLog(
  webhookUrl: string,
  message: string,
  agent: string,
  metadata?: Record<string, unknown>
): Promise<boolean> {
  if (!webhookUrl) return false;

  const agentColors: Record<string, number> = {
    HOUND: 0x39ff14,
    HAWK: 0x4a9eff,
    GENERAL: 0xffb830,
    SYSTEM: 0x888888,
    ARSENAL: 0xff69b4,
  };

  const embed: DiscordEmbed = {
    title: `[${agent}] Scout Log`,
    description: `\`\`\`\n${message}\n\`\`\``,
    color: agentColors[agent] ?? 0x4a9eff,
    footer: { text: 'Colony OS // Strike Engine' },
    timestamp: new Date().toISOString(),
  };

  if (metadata && Object.keys(metadata).length > 0) {
    embed.fields = Object.entries(metadata)
      .slice(0, 5)
      .map(([k, v]) => ({
        name: k,
        value: String(v).slice(0, 100),
        inline: true,
      }));
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendBountyStrike(
  webhookUrl: string,
  vuln: VulnerabilityLog,
  goldenTicketUrl?: string
): Promise<string | null> {
  if (!webhookUrl) return null;

  const color = SEVERITY_COLORS[vuln.severity ?? 'Low'] ?? 0x4a9eff;
  const rawTitle = (vuln.raw_data?.['title'] as string | undefined) ?? vuln.vulnerability_type ?? 'Unknown';
  const rawDesc = (vuln.raw_data?.['description'] as string | undefined) ?? '';
  const impactEst = vuln.raw_data?.['impact_estimate'];
  const impactStr = impactEst != null ? `$${Number(impactEst).toLocaleString('en-CA')}` : 'TBD';

  const embed: DiscordEmbed = {
    title: `BOUNTY STRIKE // ${(vuln.severity ?? 'UNKNOWN').toUpperCase()} DETECTED`,
    description: `**${rawTitle}**\n\n${rawDesc}`,
    color,
    fields: [
      { name: 'Target', value: `\`${vuln.target_url}\``, inline: false },
      { name: 'Type', value: vuln.vulnerability_type ?? 'UNKNOWN', inline: true },
      { name: 'Severity', value: vuln.severity ?? 'Unknown', inline: true },
      { name: 'Est. Impact', value: impactStr, inline: true },
      ...(goldenTicketUrl
        ? [{ name: 'Golden Ticket', value: `[View Report](${goldenTicketUrl})`, inline: false }]
        : []),
    ],
    footer: { text: `Colony OS // HAWK UNIT // vuln:${vuln.id.slice(0, 8)}` },
    timestamp: new Date().toISOString(),
  };

  const payload = {
    content: `@here **HAWK: TARGET_ACQUIRED** — ${vuln.severity ?? 'Unknown'} on \`${vuln.target_url}\` — Est. ${impactStr}`,
    embeds: [embed],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 3,
            label: 'Approve Strike',
            custom_id: `approve_${vuln.id}`,
            emoji: { name: '✅' },
          },
          {
            type: 2,
            style: 4,
            label: 'Deny',
            custom_id: `deny_${vuln.id}`,
            emoji: { name: '❌' },
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return data?.id ?? 'sent';
    }
    return null;
  } catch {
    return null;
  }
}
