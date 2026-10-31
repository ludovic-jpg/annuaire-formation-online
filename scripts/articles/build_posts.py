"""Construit le lot d'import des articles de marque (posts) depuis des fichiers Markdown à en-tête YAML simple.
Usage : python3 -I scripts/articles/build_posts.py <dossier_md> <sortie.json>
"""
import glob, json, os, re, sys

def lire(v):
    v = v.strip()
    if v.startswith('"') and v.endswith('"'):
        return v[1:-1].replace('\\"', '"')
    if v.startswith("["):
        try:
            return json.loads(v)
        except Exception:
            return v
    return v

rows = []
for f in sorted(glob.glob(os.path.join(sys.argv[1], "*.md"))):
    brut = open(f, encoding="utf-8").read()
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", brut, re.S)
    if not m:
        continue
    h = {}
    for l in m.group(1).splitlines():
        if ":" in l:
            k, v = l.split(":", 1)
            h[k.strip()] = lire(v)
    rows.append({"org_slug": h["org_slug"], "slug": h["slug"], "title": h["title"], "seo_title": h.get("seoTitle"),
                 "description": h.get("description"), "keyword": h.get("keyword"), "body_md": m.group(2).strip()})
json.dump(rows, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False)
print(len(rows), [r["slug"] for r in rows])
