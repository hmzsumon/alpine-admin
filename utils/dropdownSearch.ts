/* ────────── Bengali/English partial matching and Bengali numeric codes ────────── */
export function normalizeDropdownSearch(value: string): string {
  return value
    .normalize("NFC")
    .toLocaleLowerCase()
    .replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit)))
    .replace(/[\u09bc\u200c\u200d]/g, "")
    .replace(/পোরটা|পরটা|পরাটা|পড়োটা/g, "পরোটা")
    .replace(/\s+/g, " ")
    .trim();
}
export function matchesDropdownOption(
  label: string,
  value: string,
  query: string,
  keywords = "",
): boolean {
  // Internal UUIDs are not item codes and must not create unrelated numeric matches.
  const text = normalizeDropdownSearch(label + " " + keywords);
  const q = normalizeDropdownSearch(query);
  if (!q) return true;
  return (
    q.split(" ").every((word) => text.includes(word)) ||
    text.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
  );
}
