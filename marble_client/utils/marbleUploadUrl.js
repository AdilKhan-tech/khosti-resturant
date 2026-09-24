/**
 * Safe value for `<img src={…} />` when the API returns a full image URL (or null when absent).
 * Trims whitespace; returns `null` for missing/blank so React does not set `src=""`.
 */
export default function marbleUploadUrl(stored) {
  if (stored == null || stored === "") return null;
  const s = String(stored).trim();
  if (!s) return null;
  return s;
}
