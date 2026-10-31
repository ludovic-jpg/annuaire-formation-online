/**
 * Textes SEO et éditoriaux des pages fixes (accueil, /formations, /publier, /a-propos).
 * Les métadonnées de chaque type de page sont centralisées ici pour rester uniques.
 */
import type { QuestionReponse } from "@/lib/contenu/themes";

export const META = {
  accueil: {
    // Titre absolu (sans gabarit) : la marque est déjà dedans.
    title: "Annuaire Formation Online : annuaire des formations professionnelles",
    description:
      "Comparez les parcours de formation professionnelle par thème, durée, prix, modalité et CPF. Organismes de formation : référencez vos parcours gratuitement.",
  },
  formations: {
    title: "Rechercher une formation professionnelle par thème, CPF ou modalité",
    description:
      "Moteur de recherche de l'annuaire : filtrez les parcours de formation par mot-clé, thème, ville, modalité, éligibilité CPF ou certification.",
  },
  publier: {
    title: "Publier sa formation gratuitement : référencez vos parcours",
    description:
      "Organisme de formation ? Publiez vos parcours gratuitement dans l'annuaire : fiche guidée, relecture humaine, lien vers votre site et demandes d'apprenants.",
  },
  aPropos: {
    title: "À propos et méthodologie de l'annuaire",
    description:
      "Qui édite Annuaire Formation Online, comment les fiches sont rédigées, relues, classées et indexées, et quelles données chaque fiche contient.",
  },
} as const;

/** Bloc éditorial de l'accueil (affiché sous les derniers parcours). */
export const ACCUEIL_GUIDE = {
  titre: "Un annuaire de la formation professionnelle, pour apprendre et pour se faire connaître",
  apprenants: {
    titre: "Vous cherchez une formation",
    paragraphes: [
      "Chaque fiche décrit un parcours réel avec les mêmes informations, placées au même endroit : durée, prix, modalité, éligibilité au CPF, objectifs, public visé et prérequis. Vous comparez des parcours d'organismes différents sans ouvrir dix onglets.",
      "Quand un parcours vous intéresse, vous écrivez à l'organisme depuis la fiche ou vous ouvrez le programme complet sur son site. L'annuaire ne vend pas de formation et ne prend pas de commission.",
    ],
  },
  organismes: {
    titre: "Vous êtes un organisme de formation",
    paragraphes: [
      "Référencer ses formations ici est gratuit. Vous créez une fiche par parcours, nous la relisons, puis elle renvoie vers la page du parcours sur votre site. Les demandes des apprenants vous arrivent directement.",
      "Le classement ne s'achète pas : il dépend de la pertinence de la recherche, de la complétude de la fiche et de sa date de publication.",
    ],
  },
};

export const ACCUEIL_FAQ: QuestionReponse[] = [
  {
    q: "L'annuaire est-il gratuit ?",
    r: "Oui, pour les apprenants comme pour les organismes de formation. Si une offre payante apparaît un jour, elle sera annoncée à l'avance et ne donnera pas de meilleur classement.",
  },
  {
    q: "Qui rédige les fiches ?",
    r: "Les organismes de formation eux-mêmes, avec un résumé original. Chaque fiche est relue avant sa publication.",
  },
  {
    q: "Qui édite l'annuaire ?",
    r: "Back to Business SASU, organisme de formation à Rixheim (nom commercial Formatrix). Les parcours de ses marques sont signalés sur chaque fiche.",
  },
];

/** Texte de la page /formations (indexable sans filtre). */
export const FORMATIONS_INTRO =
  "Tous les parcours publiés dans l'annuaire, du plus complet au moins complet. Affinez par thème, ville, modalité, éligibilité CPF ou certification, ou parcourez directement un thème.";

/** Page /publier : texte orienté « publier sa formation », « annuaire organisme de formation ». */
export const PUBLIER = {
  h1: "Publiez vos formations gratuitement, là où les apprenants cherchent",
  chapo:
    "Une fiche par parcours, avec l'essentiel en haut (durée, prix, modalité, CPF) et un lien vers la page du parcours sur votre site. Le référencement est gratuit.",
  pourquoi: {
    titre: "Pourquoi référencer vos parcours dans un annuaire de formation",
    paragraphes: [
      "Une personne qui cherche une formation compare souvent plusieurs organismes avant d'en contacter un. L'annuaire lui présente vos parcours à côté des autres, avec des informations homogènes, ce qui lui évite de reconstituer elle-même un tableau comparatif.",
      "Votre fiche n'est pas une copie de votre site. Elle résume le parcours en 80 à 150 mots originaux, liste les objectifs et renvoie vers votre page détaillée pour le programme complet et l'inscription. Les apprenants vous écrivent depuis la fiche, sans intermédiaire.",
      "Les données sont structurées (durée, prix, modalité, ville, CPF, certification), ce qui permet aux moteurs de recherche et aux assistants conversationnels de les comprendre. Nous ne promettons pas pour autant de position dans Google : nous appliquons les règles publiques des moteurs et nous les expliquons.",
    ],
  },
  faq: [
    {
      q: "Combien coûte la publication d'une formation ?",
      r: "Rien au lancement. Si une offre payante apparaît plus tard, elle sera annoncée au moins 15 jours à l'avance et ne donnera jamais de meilleur classement.",
    },
    {
      q: "Qui peut publier ?",
      r: "Les organismes de formation disposant d'un SIRET. Le numéro de déclaration d'activité et la certification Qualiopi sont affichés quand vous les renseignez.",
    },
    {
      q: "Combien de formations puis-je référencer ?",
      r: "Une fiche par parcours, sans limite fixée au lancement. Si un même parcours existe dans plusieurs variantes très proches, regroupez-les sur une seule fiche.",
    },
    {
      q: "Puis-je copier le texte de mon site ?",
      r: "Non pour le résumé : il doit être original (80 à 150 mots). Un copier-coller ferait doublon avec votre propre page et nuirait à son référencement. Le lien « Voir le programme complet » mène à votre page détaillée.",
    },
    {
      q: "Comment les fiches sont-elles classées ?",
      r: "Par pertinence de la recherche, puis par complétude de la fiche, puis par date de publication. Tous les critères sont expliqués sur la page dédiée.",
    },
    {
      q: "Le lien vers mon site est-il suivi ?",
      r: "Il porte l'attribut rel=\"ugc\", que Google recommande pour les contenus publiés par les utilisateurs (rel=\"sponsored\" pour les marques de l'éditeur). Il vous apporte des visiteurs qualifiés, pas un lien artificiel.",
    },
    {
      q: "Puis-je retirer une fiche ?",
      r: "Oui, à tout moment depuis votre espace, ou par simple e-mail.",
    },
  ] as QuestionReponse[],
};
