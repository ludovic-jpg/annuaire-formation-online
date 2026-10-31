# Matrice des parcours (extraction 1/1)

Un fichier JSON par page de parcours de chaque site du réseau (`<domaine>/<slug>.json`), texte repris tel quel, rubrique par rubrique.
Bilan d'extraction : `_bilan.md`. Import en base : `scripts/matrice/build_payload.py` (une fiche par page, rattachée à sa marque),
puis appel de la fonction d'import (temporaire, protégée par un secret non versionné).
Extraction du 31/10/2026 : 180 pages, 9 sites.
