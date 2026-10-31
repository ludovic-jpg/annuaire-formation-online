/** N'accepte qu'un chemin interne (évite les redirections ouvertes). */
export function safeNext(next: string | null | undefined, fallback = "/espace") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
