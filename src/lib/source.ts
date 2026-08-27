import type { Source } from "./schema";

/** The bare domain, without "www.", for the preview footer. */
export function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** The path part of the URL, shortened, so the reader sees where the link goes. */
export function pathLabel(url: string): string {
  try {
    const { pathname } = new URL(url);
    const path = decodeURIComponent(pathname).replace(/\/$/, "");
    if (path === "" || path === "/") return "";
    return path.length > 42 ? `${path.slice(0, 41)}…` : path;
  } catch {
    return "";
  }
}

/** The name to show for the site: the stated one, or the domain. */
export function siteLabel(source: Source): string {
  return source.siteName ?? hostLabel(source.url);
}

/** One or two letters for the monogram tile, in place of a remote favicon. */
export function monogram(source: Source): string {
  const words = siteLabel(source)
    .replace(/[^\p{L}\p{N} ]+/gu, " ")
    .split(" ")
    .filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
