// This file is created by chatgpt, and isnot used in the project.
// Mabybe useful in the future.
// ios_saf >= 12, android >= 6, chrome >= 60, firefox >= 60, edge >= 80
// @see browserslistrc
// eslint-disable-next-line max-lines-per-function, complexity
function isUnsupportedBrowser() {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || navigator.vendor || "";
  if (
    /(ucbrowser|ucweb|puffin|baiduboxapp|mqiubrowser|qqbrowser|miuibrowser|opera mini)/i.test(
      ua,
    )
  ) {
    return true;
  }

  // Helper to parse major version from a regex match group
  const parseMajor = (v?: string | null) => {
    if (!v) return NaN;
    const major = parseInt(v.split(".")[0] || "NaN", 10);
    return Number.isNaN(major) ? NaN : major;
  };

  // iOS (iPhone/iPad/iPod) - check OS version (treat as ios_saf)
  if (/iphone|ipad|ipod/i.test(ua)) {
    const m = ua.match(/OS (\d+)[._]?(\d+)?/i);
    const major = m ? parseMajor(m[1]) : NaN;
    if (!Number.isNaN(major)) return !(major >= 12);
    // if can't parse, consider unsupported to be conservative
    return true;
  }

  // Android OS version check (Android >= 6)
  const androidMatch = ua.match(/Android\s+(\d+)(?:\.(\d+))?/i);
  if (androidMatch) {
    const major = parseMajor(androidMatch[1]);
    if (!Number.isNaN(major)) return !(major >= 6);
    return true;
  }

  // Edge (Chromium-based) - look for Edg/Edge token
  const edgeMatch = ua.match(/(?:edg|edge)\/(\d+)(?:\.(\d+))?/i);
  if (edgeMatch) {
    const major = parseMajor(edgeMatch[1]);
    if (!Number.isNaN(major)) return !(major >= 80);
    return true;
  }

  // Firefox
  const ffMatch = ua.match(/firefox\/(\d+)(?:\.(\d+))?/i);
  if (ffMatch) {
    const major = parseMajor(ffMatch[1]);
    if (!Number.isNaN(major)) return !(major >= 60);
    return true;
  }

  // Chrome (exclude Edge/Opera/UC tokens)
  if (
    /chrome\/(\d+)/i.test(ua) &&
    !/(edg|edge|opr|opera mini|ucbrowser|ucweb)/i.test(ua)
  ) {
    const chromeMatch =
      ua.match(/chrome\/(\d+)(?:\.(\d+))?/i) ||
      ua.match(/crios\/(\d+)(?:\.(\d+))?/i);
    if (chromeMatch) {
      const major = parseMajor(chromeMatch[1]);
      if (!Number.isNaN(major)) return !(major >= 60);
      return true;
    }
  }

  // Known explicitly unsupported signatures (fallback)

  // If none of the whitelist rules matched, treat as unsupported (conservative)
  return true;
}

export default isUnsupportedBrowser;
