import { escapeToHtml } from "./prerender";

interface ParseContext {
  host?: string;
  project?: string;
  visitorId?: string;
  authorId?: string;
  coauthorIds?: string[];
}

async function parse(source: string, _context: ParseContext = {}) {
  if (!source) return "";
  return escapeToHtml(source);
}

export default parse;
