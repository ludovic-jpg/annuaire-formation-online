"""Construit le lot d'import des fiches à partir des extractions de la matrice (1 fichier JSON par page source).

Usage : python3 -I scripts/matrice/build_payload.py <dossier_matrice> <parcours_enrichis.json> <visuels.json> <seed_programs.json> <existants.json> <sortie.json>
- existants.json : [{slug, source_url}] des fiches déjà en base (pour garder leurs slugs et éviter les doublons).
Une fiche par page source ; rattachée à la marque du site ; texte repris tel quel.
"""
import glob, json, os, re, sys, unicodedata

src_dir, enr_p, vis_p, seed_p, exist_p, out_p = sys.argv[1:7]

ORG = {"formatrix.fr": "back-to-business-formatrix", "skills4mation.com": "skills4mation", "formarh.com": "formarh",
       "formalangue.com": "formalangue", "formadigital.fr": "formadigital", "formavente.fr": "formavente",
       "formabientre.fr": "formabienetre", "formacompta.fr": "formacompta", "bilandecompetence.pro": "bilandecompetence-pro"}
NOM = {"formatrix.fr": "Formatrix", "skills4mation.com": "Skills4mation", "formarh.com": "FormaRH", "formalangue.com": "FormaLangue",
       "formadigital.fr": "FormaDigital", "formavente.fr": "FormaVente", "formabientre.fr": "FormaBienêtre",
       "formacompta.fr": "FormaCompta", "bilandecompetence.pro": "Bilan de compétences Pro"}
SPHERE = {"Management & RH": "management-rh", "Digital & bureautique": "digital-bureautique", "Langues": "langues",
          "Bien-être & massage": "bien-etre-massage", "Vente & commerce": "vente-commerce", "Comptabilité & finance": "comptabilite-finance",
          "Métiers spécifiques": "metiers-specifiques", "RSE & culture": "rse-culture", "Bilan de compétences": "bilan-de-competences"}

def slugify(s, m=80):
    s = unicodedata.normalize("NFD", s.lower().replace("œ", "oe").replace("æ", "ae"))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:m].rstrip("-")

def host(u):
    h = u.split("://")[-1].split("/")[0].lower()
    return h[4:] if h.startswith("www.") else h

def nu(u):
    return u.rstrip("/").split("://")[-1].replace("www.", "")

def txt(v):
    if v is None:
        return ""
    if isinstance(v, list):
        return "\n".join(str(x).strip() for x in v if str(x).strip())
    return re.sub(r"[ \t]+", " ", str(v)).strip()

def modalite(t):
    t = (t or "").lower()
    pres, dist = "présentiel" in t or "presentiel" in t, "distanciel" in t or "distance" in t or "en ligne" in t
    if pres and dist:
        return "mixte"
    return "presentiel" if pres else "distanciel" if dist else ""

enr = {nu(r["lien"]): r for r in json.load(open(enr_p, encoding="utf-8"))}
groupes = {}
for r in enr.values():
    groupes.setdefault(r.get("groupe"), []).append(r)
vis = {nu(v["source_url"]): v["fichier"] for v in json.load(open(vis_p, encoding="utf-8")) if v.get("source_url")}
seed_img = {nu(s["source_url"]): s.get("image") for s in json.load(open(seed_p, encoding="utf-8"))}
exist = {nu(e["source_url"]): e["slug"] for e in json.load(open(exist_p, encoding="utf-8")) if e.get("source_url")}
pris = set(exist.values())

rows, manques = [], []
for f in sorted(glob.glob(os.path.join(src_dir, "*", "*.json"))):
    if os.path.basename(f).startswith("_"):
        continue
    m = json.load(open(f, encoding="utf-8"))
    url = m.get("lien")
    if not url:
        continue
    h = host(url)
    e = enr.get(nu(url), {})
    titre = txt(m.get("titre") or e.get("titre"))
    slug = exist.get(nu(url))
    if not slug:
        base = slugify(titre) or slugify(url.rstrip("/").split("/")[-1])
        slug = base if base not in pris else f"{base}-{slugify(NOM.get(h, h))}"
        i = 2
        while slug in pris:
            slug = f"{base}-{i}"; i += 1
    pris.add(slug)
    objectifs = [txt(x) for x in (m.get("objectifs") or []) if txt(x)]
    if not objectifs and e.get("objectifs"):
        objectifs = [x.strip() for x in re.split(r"\s*[;\n]\s*", e["objectifs"]) if x.strip()]
    img = seed_img.get(nu(url))
    if img:
        img = f"/visuels/{img}"
    elif m.get("image") and nu(m["image"]) in vis:
        img = f"/visuels/{vis[nu(m['image'])]}"
    else:
        img = m.get("image") or ""
    twins = [t for t in groupes.get(e.get("groupe"), []) if nu(t["lien"]) != nu(url)] if e.get("groupe") else []
    cert = m.get("certification") if m.get("certification") in ("LILATE", "ICDL") else None
    champs = {
        "level_text": txt(m.get("niveau")), "short_objective": txt(m.get("objectif_court")), "highlights": txt(m.get("points_forts")),
        "modalities_text": txt(m.get("modalites")), "program_md": (m.get("programme_md") or "").strip(),
        "results_expected": txt(m.get("resultats_attendus")), "evaluation": txt(m.get("evaluation")),
        "accessibility": txt(m.get("accessibilite")), "access_delay": txt(m.get("delais_acces")),
    }
    base_cles = [titre, txt(m.get("duree")), txt(m.get("tarif")), txt(m.get("public")), txt(m.get("prerequis")), champs["program_md"], champs["modalities_text"]]
    completude = round(100 * (sum(1 for x in base_cles if x) + (1 if objectifs else 0)) / (len(base_cles) + 1))
    row = {
        "org_slug": ORG.get(h), "slug": slug, "title": titre, "objectives": objectifs,
        "audience": txt(m.get("public")), "prerequisites": txt(m.get("prerequis")), "duration_text": txt(m.get("duree")),
        "price_text": re.sub(r"^A partir", "À partir", txt(m.get("tarif"))), "modality": modalite(champs["modalities_text"]),
        "sphere": SPHERE.get(e.get("sphere"), "metiers-specifiques"), "certification": cert,
        "cpf_eligible": bool(m.get("cpf")), "source_url": url, "image_url": img, "source_site": h, "completeness": completude,
        "also_offered_by": [{"name": NOM.get(host(t["lien"]), host(t["lien"])), "url": t["lien"]} for t in twins],
        "extra_sections": [{"rubrique": txt(x.get("rubrique")), "contenu": txt(x.get("contenu"))} for x in (m.get("autres") or []) if txt(x.get("contenu"))],
        **champs,
    }
    if not row["org_slug"]:
        manques.append(f"marque inconnue : {url}")
        continue
    rows.append(row)

json.dump(rows, open(out_p, "w", encoding="utf-8"), ensure_ascii=False)
print(json.dumps({"fiches": len(rows), "nouvelles": sum(1 for r in rows if nu(r["source_url"]) not in exist), "problemes": manques}, ensure_ascii=False))
