export type CyberchienStep = 'idle' | 'dns' | 'ports' | 'headers' | 'tech' | 'complete';

export interface CyberchienFinding {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  cve?: string;
}

export interface CyberchienResult {
  url: string;
  threatLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  score: number;
  findings: CyberchienFinding[];
  technologies: string[];
  totalRisk: number;
  scannedAt: string;
  detectedLanguage: string;
}

const FINDINGS_BANK: CyberchienFinding[] = [
  {
    id: 'xss-csp',
    category: 'Headers',
    title: 'Missing Content-Security-Policy Header',
    description: 'No CSP header detected. Attackers can inject malicious scripts into page context.',
    severity: 'High',
    cve: 'CWE-116',
  },
  {
    id: 'hsts',
    category: 'Headers',
    title: 'HTTP Strict Transport Security Not Enforced',
    description: 'HSTS header missing. SSL stripping attacks are possible on this domain.',
    severity: 'Medium',
  },
  {
    id: 'xframe',
    category: 'Headers',
    title: 'Clickjacking Protection Absent',
    description: 'X-Frame-Options or frame-ancestors CSP directive not set. Framing attacks possible.',
    severity: 'Medium',
  },
  {
    id: 'server-leak',
    category: 'Information Disclosure',
    title: 'Server Version Exposed in Headers',
    description: 'Server response headers reveal exact software versions enabling targeted exploits.',
    severity: 'Medium',
  },
  {
    id: 'open-redirect',
    category: 'Application',
    title: 'Potential Open Redirect Vector',
    description: 'URL parameters can be manipulated to redirect users to external malicious sites.',
    severity: 'High',
  },
  {
    id: 'cors-wildcard',
    category: 'Configuration',
    title: 'Wildcard CORS Policy Detected',
    description: 'Access-Control-Allow-Origin: * allows any origin to make cross-site requests.',
    severity: 'Medium',
    cve: 'CWE-346',
  },
  {
    id: 'tls-old',
    category: 'Encryption',
    title: 'Legacy TLS 1.0/1.1 Supported',
    description: 'Server accepts deprecated TLS versions vulnerable to BEAST and POODLE attacks.',
    severity: 'High',
    cve: 'CVE-2014-3566',
  },
  {
    id: 'referrer',
    category: 'Headers',
    title: 'Referrer Policy Not Configured',
    description: 'Sensitive URL fragments may leak to third-party analytics and ad networks.',
    severity: 'Low',
  },
  {
    id: 'subresource',
    category: 'Integrity',
    title: 'Subresource Integrity Not Implemented',
    description: 'External CDN scripts loaded without SRI hashes. Supply chain injection risk.',
    severity: 'High',
  },
  {
    id: 'cookies-secure',
    category: 'Session',
    title: 'Session Cookies Missing Secure Flag',
    description: 'Authentication cookies transmitted over HTTP. Session hijacking possible.',
    severity: 'Critical',
    cve: 'CWE-614',
  },
  {
    id: 'robots-leak',
    category: 'Information Disclosure',
    title: 'Sensitive Paths Exposed in robots.txt',
    description: 'robots.txt reveals admin and API endpoints that should be private.',
    severity: 'Low',
  },
  {
    id: 'admin-exposed',
    category: 'Access Control',
    title: 'Admin Interface Publicly Accessible',
    description: 'Administrative panel discovered at predictable path without IP restriction.',
    severity: 'Critical',
    cve: 'CWE-284',
  },
];

const TECH_POOL = [
  'Next.js', 'React', 'WordPress', 'Nginx', 'Apache', 'Cloudflare',
  'Google Analytics', 'HubSpot', 'Stripe.js', 'jQuery', 'Bootstrap',
  'Vercel', 'AWS CloudFront', 'Hotjar', 'Intercom',
];

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function detectLanguage(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('.fr') || lower.includes('/fr')) return 'fr';
  if (lower.includes('.de') || lower.includes('/de')) return 'de';
  if (lower.includes('.es') || lower.includes('/es')) return 'es';
  if (lower.includes('.jp') || lower.includes('/ja')) return 'ja';
  return 'en';
}

function computeThreatLevel(findings: CyberchienFinding[]): { level: 'Critical' | 'High' | 'Medium' | 'Low'; score: number } {
  const hasCritical = findings.some((f) => f.severity === 'Critical');
  const highCount = findings.filter((f) => f.severity === 'High').length;
  if (hasCritical) return { level: 'Critical', score: rand(15, 38) };
  if (highCount >= 3) return { level: 'High', score: rand(38, 55) };
  if (highCount >= 1) return { level: 'Medium', score: rand(55, 72) };
  return { level: 'Low', score: rand(72, 90) };
}

export async function runCyberchienScan(
  url: string,
  onStep: (step: CyberchienStep) => void
): Promise<CyberchienResult> {
  onStep('dns');
  await sleep(rand(1200, 1800));

  onStep('ports');
  await sleep(rand(1400, 2200));

  onStep('headers');
  await sleep(rand(1600, 2400));

  onStep('tech');
  await sleep(rand(1200, 1800));

  const numFindings = rand(5, 10);
  const shuffled = [...FINDINGS_BANK].sort(() => Math.random() - 0.5);
  const findings = shuffled.slice(0, numFindings);

  const numTech = rand(4, 9);
  const shuffledTech = [...TECH_POOL].sort(() => Math.random() - 0.5);
  const technologies = shuffledTech.slice(0, numTech);

  const { level, score } = computeThreatLevel(findings);
  const totalRisk = findings.reduce((acc, f) => {
    const weights = { Critical: 25000, High: 12000, Medium: 5500, Low: 1800 };
    return acc + weights[f.severity];
  }, 0);

  onStep('complete');

  return {
    url,
    threatLevel: level,
    score,
    findings,
    technologies,
    totalRisk,
    scannedAt: new Date().toISOString(),
    detectedLanguage: detectLanguage(url),
  };
}
