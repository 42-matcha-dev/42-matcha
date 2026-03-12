import { getCookie } from "./cookie.util";

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = getCookie("token");

  const res = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API request failed");
  }

  return res.json();
}