/* Minimal dependency-free PDF writer (Helvetica) + CSV/download helpers. */

export interface PdfLine {
  text: string;
  bold?: boolean;
  size?: number;
  color?: string; // "r g b"
}

export interface PdfSection {
  heading: string;
  lines: PdfLine[];
}

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 52;
const CONTENT_W = PAGE_W - MARGIN * 2;
const HEADER_SIZE = 16;
const HEADING_SIZE = 12;
const BODY_SIZE = 9.5;
const LINE_H = 14;

function esc(s: string) {
  return s
    .replace(/₹/g, "Rs.")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function charWidth(size: number) {
  return size * 0.5;
}

function wrap(text: string, size: number, maxWidth: number): string[] {
  const maxChars = Math.max(8, Math.floor(maxWidth / charWidth(size)));
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars) {
      if (cur) lines.push(cur);
      cur = w.length > maxChars ? w.slice(0, maxChars) : w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export function buildPdf(title: string, subtitle: string, sections: PdfSection[]): string {
  let bytes: number[] = [];
  const offsets: number[] = [];

  const push = (obj: string) => {
    offsets.push(bytes.length);
    const str = obj + "\n";
    bytes.push(...new TextEncoder().encode(str));
  };

  // content stream building
  const streamLines: string[] = [];
  let y = PAGE_H - MARGIN - 8;

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN) {
      y = PAGE_H - MARGIN;
    }
  };

  const addLine = (text: string, opts: Omit<PdfLine, "text"> = {}) => {
    const size = opts.size ?? BODY_SIZE;
    const color = opts.color ?? "0.13 0.18 0.27";
    const font = opts.bold ? "F2" : "F1";
    for (const ln of wrap(text, size, CONTENT_W)) {
      ensureSpace(LINE_H);
      streamLines.push(`BT /${font} ${size} Tf ${color} rg ${MARGIN} ${y.toFixed(1)} Td (${esc(ln)}) Tj ET`);
      y -= size + 5.5;
    }
  };

  // title
  addLine(title, { bold: true, size: HEADER_SIZE, color: "0.05 0.12 0.31" });
  y -= 4;
  addLine(subtitle, { size: 9, color: "0.45 0.5 0.6" });
  y -= 8;
  streamLines.push(
    `${MARGIN} ${(y + 8).toFixed(1)} ${CONTENT_W} 0.5 re S`,
  );
  y -= 12;

  for (const sec of sections) {
    ensureSpace(40);
    addLine(sec.heading, { bold: true, size: HEADING_SIZE, color: "0.02 0.16 0.45" });
    y -= 2;
    for (const ln of sec.lines) addLine(ln.text, ln);
    y -= 6;
  }

  const content = streamLines.join("\n");

  // PDF objects
  const catalog = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj";
  const pages = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj";
  const page = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj`;
  const font1 = "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj";
  const font2 = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj";
  const stream = `6 0 obj\n<< /Length ${new TextEncoder().encode(content).length} >>\nstream\n${content}\nendstream\nendobj`;

  // header must live inside the byte stream so xref offsets stay absolute
  bytes.push(...new TextEncoder().encode(`%PDF-1.4\n%âãÏÓ\n`));
  push(catalog);
  push(pages);
  push(page);
  push(font1);
  push(font2);
  push(stream);

  const xrefStart = bytes.length;
  let xref = `xref\n0 7\n0000000000 65535 f \n`;
  for (const off of offsets) {
    xref += `${off.toString().padStart(10, "0")} 00000 n \n`;
  }
  bytes.push(...new TextEncoder().encode(xref));

  const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  bytes.push(...new TextEncoder().encode(trailer));

  return new TextDecoder().decode(new Uint8Array(bytes));
}

export function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadPdf(filename: string, content: string) {
  downloadBlob(filename, content, "application/pdf");
}

export function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  downloadBlob(filename, csv, "text/csv;charset=utf-8");
}
