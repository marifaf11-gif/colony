import type { VulnerabilityLog } from '@/lib/agents/types';

export interface GoldenTicketData {
  vuln: VulnerabilityLog;
  companyName?: string;
  contactName?: string;
  stripeLink?: string;
}

const SEVERITY_PALETTE: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  Critical: { bg: '#1a0000', border: '#ff0000', text: '#ff4444', badge: '#ff0000' },
  High: { bg: '#1a0800', border: '#ff4500', text: '#ff6b35', badge: '#ff4500' },
  Medium: { bg: '#1a1200', border: '#ffa500', text: '#ffc041', badge: '#ffa500' },
  Low: { bg: '#001a05', border: '#39ff14', text: '#39ff14', badge: '#39ff14' },
};

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function generateGoldenTicketHtml(data: GoldenTicketData): string {
  const { vuln, companyName, contactName, stripeLink } = data;
  const palette = SEVERITY_PALETTE[vuln.severity ?? 'Medium'] ?? SEVERITY_PALETTE.Medium;

  const rawTitle = (vuln.raw_data?.['title'] as string | undefined) ?? vuln.vulnerability_type ?? 'Unknown Issue';
  const rawDesc = (vuln.raw_data?.['description'] as string | undefined) ?? '';
  const impactEst = vuln.raw_data?.['impact_estimate'];
  const impactStr = impactEst != null ? `$${Number(impactEst).toLocaleString('en-CA')}` : 'TBD';

  const dateStr = new Date(vuln.created_at).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const ticketId = `GT-${vuln.id.slice(0, 8).toUpperCase()}`;
  const targetDomain = (() => {
    try {
      return new URL(vuln.target_url).hostname;
    } catch {
      return vuln.target_url;
    }
  })();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Golden Ticket — ${escHtml(ticketId)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
      background: #0a0d12;
      color: #e0e8f0;
      min-height: 100vh;
      padding: 0;
    }
    .wrapper { max-width: 680px; margin: 0 auto; }

    .header {
      background: linear-gradient(135deg, #0f1a2d 0%, #0a1020 100%);
      border-bottom: 2px solid #FFD700;
      padding: 36px 40px 28px;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, #FFD700, #FFA500, #FFD700);
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .logo-text {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.3em;
      color: #FFD700;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .logo-sub {
      font-size: 10px;
      color: rgba(255,255,255,0.3);
      letter-spacing: 0.1em;
    }
    .ticket-id {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      color: rgba(255,215,0,0.5);
      text-align: right;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 800;
      color: #fff;
      line-height: 1.1;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }
    .header .subtitle {
      font-size: 13px;
      color: rgba(255,255,255,0.4);
    }
    .severity-banner {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 6px 14px;
      border-radius: 4px;
      border: 1px solid ${escHtml(palette.border)};
      background: ${escHtml(palette.bg)};
    }
    .severity-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: ${escHtml(palette.badge)};
      box-shadow: 0 0 8px ${escHtml(palette.badge)};
    }
    .severity-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: ${escHtml(palette.text)};
      text-transform: uppercase;
    }

    .body { padding: 32px 40px; }

    .target-block {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    .target-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2em;
      color: rgba(255,255,255,0.25);
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .target-url {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #4A9EFF;
      word-break: break-all;
    }

    .impact-block {
      border: 1.5px solid ${escHtml(palette.border)};
      border-radius: 8px;
      background: ${escHtml(palette.bg)};
      padding: 20px 24px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .impact-label {
      font-size: 11px;
      font-weight: 600;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 6px;
    }
    .impact-value {
      font-size: 36px;
      font-weight: 800;
      color: ${escHtml(palette.text)};
      font-family: 'Courier New', monospace;
      letter-spacing: -0.02em;
    }
    .impact-type {
      font-size: 12px;
      font-weight: 700;
      color: rgba(255,255,255,0.3);
      text-align: right;
    }
    .impact-sub {
      font-size: 11px;
      color: rgba(255,255,255,0.2);
      margin-top: 4px;
    }

    .section-title {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.25em;
      color: rgba(255,255,255,0.2);
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .kink-block {
      border-left: 3px solid ${escHtml(palette.border)};
      background: rgba(255,255,255,0.02);
      border-radius: 0 6px 6px 0;
      padding: 14px 18px;
      margin-bottom: 24px;
    }
    .kink-title {
      font-size: 16px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 8px;
    }
    .kink-desc {
      font-size: 13px;
      color: rgba(255,255,255,0.55);
      line-height: 1.6;
    }
    .kink-meta {
      display: flex;
      gap: 12px;
      margin-top: 12px;
    }
    .kink-tag {
      font-size: 10px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 3px;
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .remediation-block {
      background: linear-gradient(135deg, #0f2a1a 0%, #0a1a0f 100%);
      border: 1.5px solid #39FF14;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
      text-align: center;
    }
    .remediation-label {
      font-size: 11px;
      font-weight: 700;
      color: rgba(57,255,20,0.5);
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .remediation-price {
      font-size: 32px;
      font-weight: 800;
      color: #39FF14;
      font-family: 'Courier New', monospace;
      text-shadow: 0 0 20px rgba(57,255,20,0.4);
      margin-bottom: 4px;
    }
    .remediation-sub {
      font-size: 12px;
      color: rgba(255,255,255,0.3);
      margin-bottom: 16px;
    }
    .remediation-btn {
      display: inline-block;
      background: #39FF14;
      color: #000;
      font-weight: 800;
      font-size: 14px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 12px 32px;
      border-radius: 4px;
      text-decoration: none;
      cursor: pointer;
    }

    .footer {
      padding: 20px 40px 32px;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: rgba(255,255,255,0.2);
    }

    @media print {
      body { background: #fff; color: #000; }
      .header { background: #0f1a2d !important; }
    }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="header-top">
      <div class="logo-block">
        <div class="logo-text">Colony OS // Strike Engine</div>
        <div class="logo-sub">Autonomous Revenue Recovery System</div>
      </div>
      <div class="ticket-id">
        <div>${escHtml(ticketId)}</div>
        <div style="margin-top:4px;">${escHtml(dateStr)}</div>
      </div>
    </div>
    <h1>Golden Ticket</h1>
    <div class="subtitle">
      ${contactName ? `Attention: ${escHtml(contactName)} — ` : ''}
      ${companyName ? escHtml(companyName) : escHtml(targetDomain)}
    </div>
    <div class="severity-banner">
      <div class="severity-dot"></div>
      <span class="severity-label">${escHtml(vuln.severity ?? 'Unknown')} Priority Vulnerability Detected</span>
    </div>
  </div>

  <div class="body">
    <div class="target-block">
      <div class="target-label">Target Domain</div>
      <div class="target-url">${escHtml(vuln.target_url)}</div>
    </div>

    <div class="impact-block">
      <div>
        <div class="impact-label">Estimated Revenue at Risk</div>
        <div class="impact-value">${escHtml(impactStr)}</div>
      </div>
      <div>
        <div class="impact-type">per year</div>
        <div class="impact-sub">if unresolved</div>
      </div>
    </div>

    <div class="section-title">Vulnerability Discovered</div>
    <div class="kink-block">
      <div class="kink-title">${escHtml(rawTitle)}</div>
      <div class="kink-desc">${escHtml(rawDesc)}</div>
      <div class="kink-meta">
        <span class="kink-tag">${escHtml(vuln.vulnerability_type ?? 'UNKNOWN')}</span>
        <span class="kink-tag">${escHtml(vuln.severity ?? 'Unknown')}</span>
        <span class="kink-tag">Revenue Impact</span>
      </div>
    </div>

    ${stripeLink ? `
    <div class="remediation-block">
      <div class="remediation-label">Certified Remediation Package</div>
      <div class="remediation-price">$299</div>
      <div class="remediation-sub">One-time fix — guaranteed resolution within 5 business days</div>
      <a class="remediation-btn" href="${escHtml(stripeLink)}" target="_blank">
        Activate Remediation →
      </a>
    </div>
    ` : `
    <div class="remediation-block" style="opacity:0.7;">
      <div class="remediation-label">Remediation Available</div>
      <div class="remediation-price">$299</div>
      <div class="remediation-sub">Contact Colony OS to activate this remediation package</div>
    </div>
    `}
  </div>

  <div class="footer">
    <span>Generated by Colony OS Strike Engine — HAWK UNIT</span>
    <span>Confidential — ${escHtml(ticketId)}</span>
  </div>
</div>
</body>
</html>`;
}
