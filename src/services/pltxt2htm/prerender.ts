function getUA(): string {
  if (typeof navigator === "undefined") return "";
  return navigator.userAgent || "";
}

export function isPrerenderRuntime(): boolean {
  const ua = getUA().toLowerCase();
  return (
    ua.includes("netlify") ||
    ua.includes("headless") ||
    ua.includes("prerender") ||
    ua.includes("puppeteer")
  );
}

export function escapeToHtml(source: string): string {
  return source
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");
}
