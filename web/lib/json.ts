export function prettyJsonString(raw: string | undefined | null, fallback = "{}"): string {
  const source = raw?.trim() || fallback;
  try {
    return JSON.stringify(JSON.parse(source), null, 2);
  } catch {
    return source;
  }
}

export function normalizeJsonString(raw: string): { ok: true; value: string } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(raw);
    return { ok: true, value: JSON.stringify(parsed, null, 2) };
  } catch {
    return { ok: false, error: "Invalid JSON. Check commas, quotes, and brackets." };
  }
}
