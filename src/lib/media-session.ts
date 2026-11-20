/**
 * User-uploaded media stays in memory for this browser session only (never in localStorage).
 * In production these files would be uploaded to storage and reviewed by a human advisor.
 */
const files = new Map<string, string>();

export function rememberMedia(file: Blob): string {
  const key = `media-${Date.now().toString(36)}`;
  files.set(key, URL.createObjectURL(file));
  return key;
}

export function mediaUrl(key: string | undefined): string | undefined {
  return key ? files.get(key) : undefined;
}
