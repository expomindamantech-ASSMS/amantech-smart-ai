// src/utils/downloadUtils.js
import jsPDF from 'jspdf';

export const downloadAsPDF = (content, title = 'AmanTech-SmartAI') => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;

  // Header
  doc.setFillColor(15, 76, 129);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('AmanTech Smart AI', margin, 10);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Ghana Education AI Platform', margin, 16);
  doc.text(new Date().toLocaleDateString('en-GH'), pageWidth - margin, 10, { align: 'right' });

  // Title
  doc.setTextColor(15, 76, 129);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, 35);

  // Content
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Strip markdown
  const plain = content
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\|/g, '  ')
    .replace(/---+/g, '─'.repeat(40));

  const lines = doc.splitTextToSize(plain, maxWidth);
  let y = 45;
  lines.forEach(line => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    if (line.startsWith('─')) {
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;
    } else {
      doc.text(line, margin, y);
      y += 5;
    }
  });

  // Footer
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`AmanTech Smart AI | Ghana Education Platform | Page ${i} of ${pages}`, pageWidth / 2, 292, { align: 'center' });
  }

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

export const downloadAsText = (content, title = 'AmanTech') => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

export const installPWA = () => {
  window.__deferredPrompt?.prompt();
};
