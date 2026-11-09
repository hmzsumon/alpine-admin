/* ────────── exact numeric code search alongside bilingual item names ────────── */
export const normalizeItemCode = (value: string) => value.trim().replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit))).toUpperCase();
export function matchesMenuSearch(item: { code?: string; name: string; nameBn?: string; aliases?: string[]; category?: string }, input: string) {
  const query = normalizeItemCode(input.replace(/^(?:কোড|code)\s*/i, ""));
  if (item.code && normalizeItemCode(item.code) === query) return true;
  if (/^\d+$/.test(query)) return false;
  const text = `${item.name} ${item.nameBn || ""} ${(item.aliases || []).join(" ")} ${item.category || ""}`.normalize("NFC").toUpperCase();
  return text.includes(query.normalize("NFC")) || text.replace(/\s/g, "").includes(query.replace(/\s/g, ""));
}
