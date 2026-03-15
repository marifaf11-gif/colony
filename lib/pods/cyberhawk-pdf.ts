import jsPDF from 'jspdf';

export interface CyberchienScanResult {
  url: string;
  threatLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  score: number;
  findings: Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    cve?: string;
  }>;
  technologies: string[];
  openPorts?: number[];
  totalRisk: number;
  scannedAt: string;
}

const SEVERITY_HEX: Record<string, [number, number, number]> = {
  Critical: [231, 76, 60],
  High: [231, 76, 60],
  Medium: [243, 156, 18],
  Low: [57, 255, 20],
};

export async function generateGoldenTicket(result: CyberchienScanResult) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;

  doc.setFillColor(5, 8, 16);
  doc.rect(0, 0, W, H, 'F');

  doc.setFillColor(10, 18, 35);
  doc.rect(0, 0, W, 48, 'F');

  const threatColor = SEVERITY_HEX[result.threatLevel] ?? SEVERITY_HEX.High;
  doc.setDrawColor(...threatColor);
  doc.setLineWidth(0.6);
  doc.line(0, 48, W, 48);

  doc.setFillColor(74, 158, 255);
  doc.rect(0, 0, 4, 48, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('CYBERCHIEN', 12, 18);

  doc.setFontSize(9);
  doc.setTextColor(74, 158, 255);
  doc.text('TALON HUD — GOLDEN TICKET REPORT', 12, 25);

  doc.setFontSize(8);
  doc.setTextColor(120, 140, 180);
  doc.text(`TARGET: ${result.url}`, 12, 33);
  doc.text(`SCANNED: ${new Date(result.scannedAt).toLocaleString('en-CA')}`, 12, 39);

  const scoreColor = result.score >= 70 ? ([57, 255, 20] as [number, number, number])
    : result.score >= 50 ? ([243, 156, 18] as [number, number, number])
    : ([231, 76, 60] as [number, number, number]);

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...scoreColor);
  doc.text(`${result.score}`, W - 25, 28, { align: 'right' });

  doc.setFontSize(8);
  doc.setTextColor(120, 140, 180);
  doc.text('SECURITY', W - 25, 35, { align: 'right' });
  doc.text('SCORE', W - 25, 40, { align: 'right' });

  let y = 58;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 140, 180);
  doc.text('THREAT ASSESSMENT', 12, y);
  y += 7;

  const cells = [
    { label: 'Threat Level', value: result.threatLevel, color: threatColor },
    { label: 'Findings', value: `${result.findings.length}`, color: [255, 255, 255] as [number, number, number] },
    { label: 'Risk Score', value: `$${result.totalRisk.toLocaleString('en-CA')}`, color: scoreColor },
    { label: 'Technologies', value: `${result.technologies.length} detected`, color: [74, 158, 255] as [number, number, number] },
  ];

  const cellW = (W - 24) / 2;
  cells.forEach((cell, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 12 + col * (cellW + 4);
    const cy = y + row * 18;

    doc.setFillColor(15, 22, 40);
    doc.roundedRect(cx, cy, cellW, 14, 2, 2, 'F');
    doc.setDrawColor(30, 45, 70);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, cy, cellW, 14, 2, 2, 'S');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 100, 140);
    doc.text(cell.label.toUpperCase(), cx + 4, cy + 5);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...cell.color);
    doc.text(cell.value, cx + 4, cy + 11);
  });

  y += 40;

  if (result.technologies.length > 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(120, 140, 180);
    doc.text('DETECTED TECHNOLOGIES', 12, y);
    y += 6;

    const techsPerRow = 4;
    const techW = (W - 24) / techsPerRow;
    result.technologies.slice(0, 12).forEach((tech, i) => {
      const col = i % techsPerRow;
      const row = Math.floor(i / techsPerRow);
      const tx = 12 + col * techW;
      const ty = y + row * 9;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(74, 158, 255);
      doc.text(`• ${tech}`, tx, ty);
    });
    y += Math.ceil(result.technologies.length / techsPerRow) * 9 + 6;
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 140, 180);
  doc.text('SECURITY FINDINGS', 12, y);
  y += 7;

  const sortedFindings = [...result.findings].sort((a, b) => {
    const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return order[a.severity] - order[b.severity];
  });

  for (const finding of sortedFindings) {
    if (y > H - 30) {
      doc.addPage();
      doc.setFillColor(5, 8, 16);
      doc.rect(0, 0, W, H, 'F');
      y = 20;
    }

    const sColor = SEVERITY_HEX[finding.severity] ?? SEVERITY_HEX.Medium;
    doc.setFillColor(10, 16, 28);
    doc.roundedRect(12, y, W - 24, 22, 2, 2, 'F');
    doc.setDrawColor(...sColor, 60);
    doc.setLineWidth(0.3);
    doc.roundedRect(12, y, W - 24, 22, 2, 2, 'S');

    doc.setFillColor(...sColor);
    doc.roundedRect(12, y, 3, 22, 1, 1, 'F');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(230, 235, 245);
    doc.text(finding.title, 20, y + 7);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 120, 160);
    const descLines = doc.splitTextToSize(finding.description, W - 50);
    doc.text(descLines.slice(0, 2), 20, y + 13);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...sColor);
    doc.text(finding.severity.toUpperCase(), W - 14, y + 7, { align: 'right' });

    if (finding.cve) {
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(74, 158, 255);
      doc.text(finding.cve, W - 14, y + 14, { align: 'right' });
    }

    y += 25;
  }

  y += 10;
  if (y > H - 20) {
    doc.addPage();
    doc.setFillColor(5, 8, 16);
    doc.rect(0, 0, W, H, 'F');
    y = 20;
  }

  doc.setFillColor(10, 16, 28);
  doc.rect(0, H - 14, W, 14, 'F');
  doc.setDrawColor(74, 158, 255, 30);
  doc.setLineWidth(0.3);
  doc.line(0, H - 14, W, H - 14);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 70, 110);
  doc.text('COLONY OS — CYBERCHIEN POD — CONFIDENTIAL', 12, H - 6);
  doc.text(`Generated ${new Date().toLocaleString('en-CA')}`, W - 12, H - 6, { align: 'right' });

  const filename = `cyberchien-ticket-or-${Date.now()}.pdf`;
  doc.save(filename);
}
