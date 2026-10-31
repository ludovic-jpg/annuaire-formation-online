import { Marked } from "marked";

const echapper = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Pour les contenus des organismes (fiches importées, articles) : tout HTML brut est affiché comme du texte, jamais interprété.
const markedSur = new Marked({ gfm: true, breaks: true, renderer: { html: ({ text }) => echapper(text) } });

export function renderMarkdownSur(md: string): string {
  return markedSur.parse(md, { async: false }) as string;
}
