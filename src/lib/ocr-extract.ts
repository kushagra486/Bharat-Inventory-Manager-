export type ExtractedLabel = {
  name: string | null;
  price: string | null;
  expiryDate: string | null;
  batchNumber: string | null;
  rawText: string;
};

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

function toIsoDate(day: string | undefined, month: string, year: string): string | null {
  const y = year.length === 2 ? `20${year}` : year;
  const m = /^\d+$/.test(month) ? month.padStart(2, "0") : MONTHS[month.slice(0, 3).toLowerCase()];
  if (!m) return null;
  const d = (day ?? "01").padStart(2, "0");
  const iso = `${y}-${m}-${d}`;
  return Number.isNaN(new Date(iso).getTime()) ? null : iso;
}

function extractExpiryDate(text: string): string | null {
  const near = text.match(/(?:exp|expiry|use by|best before)\w*[.:\s-]*([^\n]{0,20})/i)?.[1] ?? text;

  const numeric = near.match(/(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})/);
  if (numeric) {
    const [, a, b, year] = numeric;
    // Ambiguous locale order — Indian labels are near-universally DD/MM/YY(YY).
    return toIsoDate(a, b, year);
  }

  const monthYear = near.match(/(\d{1,2})[/.\-](\d{4}|\d{2})\b/);
  if (monthYear) {
    const [, month, year] = monthYear;
    return toIsoDate(undefined, month, year);
  }

  const worded = near.match(/(\d{1,2})?\s*([A-Za-z]{3,})\s*(\d{4}|\d{2})/);
  if (worded && MONTHS[worded[2].slice(0, 3).toLowerCase()]) {
    const [, day, month, year] = worded;
    return toIsoDate(day, month, year);
  }

  return null;
}

function extractPrice(text: string): string | null {
  const withLabel = text.match(/(?:mrp|price|rs\.?|₹)[^\d]{0,6}(\d+(?:[.,]\d{1,2})?)/i);
  if (withLabel) return withLabel[1].replace(",", ".");
  const bare = text.match(/₹\s?(\d+(?:[.,]\d{1,2})?)/);
  return bare ? bare[1].replace(",", ".") : null;
}

function extractBatchNumber(text: string): string | null {
  const match = text.match(/(?:batch\s*(?:no\.?)?|b\.?no)[^\w]{0,4}([A-Za-z0-9-]{3,})/i);
  return match ? match[1] : null;
}

function extractName(text: string, lines: string[]): string | null {
  const skip = /^(mrp|price|exp|expiry|batch|b\.?no|use by|best before|net wt|net weight|₹|rs\.?)\b/i;
  const candidate = lines.find(
    (line) => line.length >= 3 && /[a-zA-Z]{3,}/.test(line) && !skip.test(line.trim()) && !/^\d+$/.test(line.trim()),
  );
  return candidate?.trim() ?? null;
}

export function extractLabelFields(rawText: string): ExtractedLabel {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return {
    name: extractName(rawText, lines),
    price: extractPrice(rawText),
    expiryDate: extractExpiryDate(rawText),
    batchNumber: extractBatchNumber(rawText),
    rawText,
  };
}
