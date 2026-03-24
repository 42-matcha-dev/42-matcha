export function normalizePhotoUrls(urls?: string[]) {
  return Array.from({ length: 4 }, (_, i) => urls?.[i] ?? "");
}

export function compactPhotoUrls(urls: string[]) {
  return urls.filter((url) => url && url.trim() !== "");
}