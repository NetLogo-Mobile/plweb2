import { escapeToHtml } from "./prerender";

async function parse(source: string) {
  if (!source) return "";
  return escapeToHtml(source);
}

export default parse;
