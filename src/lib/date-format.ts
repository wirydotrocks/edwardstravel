/** Long US date, e.g. April 2, 2026 */
export function formatLongUsDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
