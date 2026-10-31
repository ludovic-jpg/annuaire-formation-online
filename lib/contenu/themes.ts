/**
 * Textes éditoriaux des pages thème (/theme/[sphere]).
 * Rédigés pour l'annuaire, sans copie des sites des organismes.
 * Règles : 150 à 250 mots d'introduction, 3 à 5 questions affichées à l'écran
 * (le JSON-LD FAQPage n'est émis que parce que ces questions sont visibles).
 * Aucun chiffre ni promesse invérifiable.
 */

export type QuestionReponse = { q: string; r: string };

export type ThemeContenu = {
  /** Balise <title> (le gabarit ajoute « | Annuaire Formation Online »). */
  metaTitle: string;
  /** 120 à 158 caractères. */
  metaDescription: string;
  h1: string;
  /** Phrase courte affichée sous le H1. */
  accroche: string;
  /** Titre H2 du bloc éditorial. */
  titreGuide: string;
  /** Paragraphes du guide (150 à 250 mots au total). */
  guide: string[];
  faq: QuestionReponse[];
  /** Thèmes proches, pour le maillage contextuel. */
  voisins: string[];
};

export const THEMES_CONTENU: Record<string, ThemeContenu> = {
  "digital-bureautique": {
    metaTitle: "Formations digital et bureautique : Excel, Word, IA, réseaux sociaux",
    metaDescription:
      "Parcours de formation en bureautique, outils collaboratifs, IA, SEO et réseaux sociaux : durée, prix, modalité et éligibilité CPF de chaque parcours.",
    h1: "Formations digital et bureautique",
    accroche: "Tableurs, traitement de texte, outils collaboratifs, IA, référencement, réseaux sociaux : comparez les parcours.",
    titreGuide: "Bien choisir une formation au numérique",
    guide: [
      "Ce thème couvre deux familles de besoins. La première concerne les outils de tous les jours : traitement de texte, tableur, logiciel de présentation, messagerie et espaces de travail partagés. La seconde touche aux métiers du web : création de site, référencement naturel ou payant, community management, production de vidéos et usage de l'IA dans une stratégie commerciale.",
      "Avant de choisir, situez votre niveau. Un parcours d'initiation n'a pas grand intérêt si vous utilisez déjà un tableur chaque jour, et un module avancé sera frustrant si les bases manquent. Beaucoup d'organismes proposent un test de positionnement en amont : demandez-le.",
      "Pour un financement par le CPF, la formation doit préparer une certification enregistrée auprès de France Compétences. En bureautique, c'est le cas des parcours qui mènent à l'ICDL, signalés par la mention « Certifiant ICDL » sur les fiches. Les autres parcours restent finançables par d'autres voies, comme le plan de développement des compétences de l'employeur.",
      "Regardez enfin la modalité. Les outils numériques se prêtent bien à la formation à distance, à condition d'avoir un formateur disponible pour corriger vos exercices.",
    ],
    faq: [
      {
        q: "Une formation bureautique est-elle éligible au CPF ?",
        r: "Seulement si elle prépare une certification enregistrée auprès de France Compétences, comme l'ICDL. Le filtre « Certification » de la recherche permet de retrouver ces parcours.",
      },
      {
        q: "Faut-il un niveau minimum pour suivre une formation en référencement ou en réseaux sociaux ?",
        r: "Les prérequis varient d'un parcours à l'autre. Ils sont indiqués sur chaque fiche, dans le bloc « Prérequis ». En cas de doute, contactez l'organisme avant de vous inscrire.",
      },
      {
        q: "Peut-on suivre ces formations à distance ?",
        r: "Oui pour une bonne partie d'entre elles. La modalité (présentiel, à distance ou mixte) apparaît en haut de chaque fiche et dans les filtres de recherche.",
      },
    ],
    voisins: ["vente-commerce", "management-rh"],
  },

  "management-rh": {
    metaTitle: "Formations management et RH : manager, recruter, conduire un projet",
    metaDescription:
      "Formations en management d'équipe, gestion des conflits, recrutement, conduite de projet et formation de formateur. Comparez durée, prix et modalité.",
    h1: "Formations management et ressources humaines",
    accroche: "Encadrer, recruter, gérer les priorités et les tensions, piloter un projet : les parcours pour celles et ceux qui animent un collectif.",
    titreGuide: "Ce qu'il faut regarder dans une formation au management",
    guide: [
      "On ne se forme pas de la même façon quand on vient de prendre ses premières fonctions d'encadrement et quand on dirige une équipe depuis dix ans. Les parcours de ce thème vont des fondamentaux (animer une équipe, fixer des priorités, prendre la parole) à des approches plus spécialisées comme le coaching systémique, l'intelligence collective ou le design thinking.",
      "Le premier critère est la part de pratique. Un bon parcours de management fait travailler sur des cas réels : un entretien difficile, un conflit entre deux collaborateurs, une réunion qui tourne court. Vérifiez dans les objectifs de la fiche que les verbes décrivent des actions concrètes (conduire, mener, préparer) plutôt qu'une vague sensibilisation.",
      "Le format compte aussi. Les sessions courtes, d'un à trois jours, conviennent à un besoin précis. Les parcours plus longs, étalés sur plusieurs semaines, laissent le temps d'essayer entre deux séances et d'en reparler avec le formateur.",
      "Côté ressources humaines, vous trouverez des parcours sur le recrutement et l'intégration des nouveaux collaborateurs, ainsi que des formations de formateur pour celles et ceux qui transmettent leur métier en interne.",
    ],
    faq: [
      {
        q: "Quelle formation suivre quand on devient manager pour la première fois ?",
        r: "Un parcours centré sur l'animation d'équipe et les compétences managériales de base est un bon point de départ. Les sujets plus pointus, comme la gestion des conflits ou le coaching d'équipe, viennent ensuite.",
      },
      {
        q: "Une formation au management peut-elle être prise en charge par l'employeur ?",
        r: "Oui, elle peut entrer dans le plan de développement des compétences de l'entreprise, avec l'appui éventuel de son opérateur de compétences (OPCO). Renseignez-vous auprès de votre service RH ou de l'organisme.",
      },
      {
        q: "Existe-t-il des formations intra-entreprise ?",
        r: "Certains organismes proposent leurs parcours en inter-entreprises et en intra-entreprise, avec des tarifs différents. Quand c'est le cas, le prix affiché sur la fiche le précise.",
      },
      {
        q: "Où trouver une formation de formateur ?",
        r: "Dans ce thème. Ces parcours portent sur la conception d'une séquence, l'animation d'un groupe et l'évaluation des acquis.",
      },
    ],
    voisins: ["vente-commerce", "bilan-de-competences"],
  },

  langues: {
    metaTitle: "Formations en langues professionnelles : anglais, allemand, espagnol",
    metaDescription:
      "Anglais, allemand, espagnol, italien, japonais, mandarin, français professionnel : comparez les formations en langues et repérez les parcours certifiants.",
    h1: "Formations en langues étrangères et français professionnel",
    accroche: "Anglais, allemand, espagnol, italien, portugais, japonais, mandarin et français professionnel : à l'oral comme à l'écrit.",
    titreGuide: "Trouver la bonne formation en langue",
    guide: [
      "La plupart des parcours de ce thème visent un usage professionnel : présenter son entreprise, mener une réunion, rédiger un courriel, négocier au téléphone. Certains travaillent aussi le français écrit, pour les personnes qui veulent fiabiliser leur orthographe et leur expression au travail.",
      "Le point de départ est votre niveau. Les organismes s'appuient en général sur le Cadre européen commun de référence pour les langues (CECRL), de A1 à C2, et font passer un test avant la formation. Ce test sert à fixer un objectif réaliste et à ajuster la durée.",
      "Pour mobiliser le CPF, le parcours doit préparer une certification enregistrée auprès de France Compétences. Les fiches de l'annuaire signalent les parcours qui préparent la certification LILATE. Vous pouvez aussi les filtrer dans la recherche.",
      "Enfin, demandez comment se répartissent les heures. Une formation en langue progresse surtout par la pratique orale régulière : des séances courtes et fréquentes donnent souvent plus de résultats qu'un bloc intensif suivi de plusieurs mois sans pratique.",
    ],
    faq: [
      {
        q: "Comment connaître mon niveau avant de m'inscrire ?",
        r: "La plupart des organismes proposent un test de positionnement gratuit, basé sur les niveaux du CECRL (A1 à C2). Demandez-le en contactant l'organisme depuis la fiche du parcours.",
      },
      {
        q: "Les formations en langue sont-elles éligibles au CPF ?",
        r: "Celles qui préparent une certification enregistrée auprès de France Compétences le sont. Sur l'annuaire, les parcours certifiants LILATE portent une mention dédiée.",
      },
      {
        q: "Quelle différence entre une formation en langue générale et en langue des affaires ?",
        r: "La langue des affaires travaille des situations de travail : réunions, appels, courriels, présentations, négociation. Le vocabulaire et les mises en situation sont choisis pour le contexte professionnel.",
      },
    ],
    voisins: ["vente-commerce", "digital-bureautique"],
  },

  "bien-etre-massage": {
    metaTitle: "Formations massage bien-être et yoga : choisir son parcours",
    metaDescription:
      "Formations au massage bien-être (ayurvédique, pierres chaudes, assis, Lomi) et au yoga. Durée, prix, modalité et organisme de chaque parcours.",
    h1: "Formations massage bien-être et yoga",
    accroche: "Massages du monde, massage assis, pierres chaudes, yoga et ayurveda : des parcours pour exercer ou enrichir une pratique.",
    titreGuide: "Se former au massage bien-être : les points à vérifier",
    guide: [
      "Les formations de ce thème préparent à une pratique de détente et de confort. En France, le massage à visée thérapeutique relève des masseurs-kinésithérapeutes. Un praticien en massage bien-être ne pose donc pas de diagnostic et ne promet pas de soigner. Un organisme sérieux le rappelle dans son programme.",
      "Regardez d'abord la part de pratique encadrée. Un geste s'apprend les mains sur une table de massage, avec un formateur qui corrige la posture et la pression. Les parcours mixtes, qui placent la théorie en ligne et la pratique en présentiel, sont fréquents : vérifiez combien d'heures se font réellement en salle.",
      "Demandez ensuite ce qui est prévu après la formation. Certains parcours visent l'installation comme praticien, d'autres complètent une activité existante (esthétique, spa, accompagnement). Le public visé indiqué sur la fiche vous aidera à faire le tri.",
      "Le yoga a sa propre logique. Les parcours « enseigner le yoga » s'adressent à des pratiquants qui veulent transmettre. Ceux qui associent yoga et ayurveda s'adressent plutôt à un public curieux d'une approche globale de l'hygiène de vie.",
    ],
    faq: [
      {
        q: "Une formation au massage bien-être permet-elle de faire des massages thérapeutiques ?",
        r: "Non. Le massage à visée thérapeutique est réservé aux masseurs-kinésithérapeutes. Les formations de ce thème préparent à une pratique de bien-être, sans visée médicale.",
      },
      {
        q: "Combien d'heures de pratique faut-il prévoir ?",
        r: "Cela dépend de la technique. La durée et la répartition entre heures en ligne et heures en présentiel sont indiquées sur chaque fiche quand l'organisme les a renseignées.",
      },
      {
        q: "Peut-on apprendre le massage à distance ?",
        r: "La théorie, oui. Le geste demande de la pratique encadrée en présentiel. C'est pourquoi beaucoup de parcours de ce thème sont proposés en formule mixte.",
      },
    ],
    voisins: ["metiers-specifiques", "bilan-de-competences"],
  },

  "vente-commerce": {
    metaTitle: "Formations vente et commerce : prospection, closing, grands comptes",
    metaDescription:
      "Formations en vente B2B, prospection téléphonique, closing, vente conseil, grands comptes et commerce en magasin. Comparez les parcours et les organismes.",
    h1: "Formations vente et commerce",
    accroche: "Prospection, vente conseil, closing, grands comptes, plan d'action commercial, vente en magasin : les parcours pour vendre mieux.",
    titreGuide: "Choisir une formation commerciale adaptée à son métier",
    guide: [
      "Vendre en boutique, prospecter des entreprises au téléphone ou suivre quelques grands comptes sur plusieurs années, ce sont trois métiers différents. Avant de comparer les parcours, précisez la situation dans laquelle vous voulez progresser.",
      "Les formations de ce thème couvrent plusieurs étapes de la vente : trouver des prospects, mener un entretien de découverte, argumenter, traiter les objections, conclure. D'autres portent sur l'organisation commerciale, comme bâtir un plan d'action, animer les réunions d'une équipe de vente ou utiliser le numérique en magasin.",
      "Un bon indicateur est la place donnée aux jeux de rôle et aux cas tirés de votre activité. Demandez si le formateur peut travailler sur vos propres offres et vos propres objections clients : c'est ce qui rend la formation utilisable dès le lendemain.",
      "Pour les commerciaux salariés, la prise en charge passe souvent par le plan de développement des compétences de l'employeur. Les indépendants peuvent se tourner vers le fonds d'assurance formation dont ils relèvent.",
    ],
    faq: [
      {
        q: "Quelle formation choisir pour améliorer sa prospection ?",
        r: "Un parcours centré sur la prospection, téléphonique ou multicanale, est le plus direct. Si vous perdez surtout des affaires en fin de cycle, une formation au closing sera plus utile.",
      },
      {
        q: "Les formations commerciales sont-elles adaptées aux débutants ?",
        r: "Certaines oui, d'autres demandent une première expérience de la vente. Le public visé et les prérequis sont précisés sur chaque fiche.",
      },
      {
        q: "Comment financer une formation en vente quand on est indépendant ?",
        r: "Les travailleurs indépendants cotisent à un fonds d'assurance formation qui peut prendre en charge tout ou partie du coût. L'organisme de formation peut vous aider à monter la demande.",
      },
    ],
    voisins: ["management-rh", "digital-bureautique"],
  },

  "comptabilite-finance": {
    metaTitle: "Formations comptabilité, paie et finance d'entreprise",
    metaDescription:
      "Comptabilité générale, paie, fiscalité, analyse financière, audit interne, normes IFRS, gestion de TPE : comparez les formations et leurs conditions.",
    h1: "Formations comptabilité, gestion et finance",
    accroche: "Comptabilité générale, paie, fiscalité, analyse financière, audit, IFRS, pilotage de TPE : les parcours pour fiabiliser les chiffres.",
    titreGuide: "Se former à la comptabilité et à la gestion",
    guide: [
      "Les parcours de ce thème s'adressent à des publics très différents. Un créateur d'entreprise veut comprendre son bilan et suivre sa trésorerie. Un assistant comptable veut sécuriser la paie ou les déclarations fiscales. Un contrôleur de gestion cherche à maîtriser les normes internationales ou l'audit interne.",
      "Commencez par le résultat attendu. Savoir lire un compte de résultat, savoir le produire et savoir l'auditer ne demandent pas le même niveau. Les objectifs affichés sur chaque fiche vous disent ce que vous saurez faire à la fin : comparez-les avant le prix.",
      "La paie et la fiscalité changent souvent. Vérifiez auprès de l'organisme que les supports sont tenus à jour de la réglementation en vigueur et que le formateur exerce ou a exercé dans le domaine.",
      "Pour les dirigeants de petites structures, les parcours de gestion et de pilotage sont souvent plus utiles qu'une formation comptable complète. Ils apprennent à suivre quelques indicateurs, à préparer un budget et à dialoguer avec l'expert-comptable.",
    ],
    faq: [
      {
        q: "Faut-il des bases en comptabilité pour suivre une formation en analyse financière ?",
        r: "En général, oui : il faut savoir lire un bilan et un compte de résultat. Les prérequis exacts figurent sur chaque fiche.",
      },
      {
        q: "Une formation en paie convient-elle à un dirigeant de TPE ?",
        r: "Oui si vous établissez vous-même les bulletins de salaire. Si la paie est confiée à un cabinet, un parcours de gestion et de pilotage répondra mieux à vos besoins.",
      },
      {
        q: "Les formations aux normes IFRS s'adressent-elles à toutes les entreprises ?",
        r: "Elles concernent surtout les professionnels des groupes qui publient des comptes consolidés selon ces normes, ou qui travaillent avec eux.",
      },
    ],
    voisins: ["management-rh", "rse-culture"],
  },

  "metiers-specifiques": {
    metaTitle: "Formations métiers spécifiques : photovoltaïque, photo, artisanat",
    metaDescription:
      "Formations à un métier précis : installation photovoltaïque, photographie, œnologie, prothésie ongulaire, couture, production musicale. Comparez les parcours.",
    h1: "Formations à des métiers spécifiques",
    accroche: "Installation photovoltaïque, photographie, œnologie, prothésie ongulaire, couture, production musicale : des parcours ciblés sur un métier.",
    titreGuide: "Se reconvertir ou se spécialiser dans un métier précis",
    guide: [
      "Ce thème regroupe les parcours qui préparent à un métier ou à une activité bien identifiée, de l'artisanat aux fonctions techniques. On y trouve des projets de reconversion comme des spécialisations pour des professionnels déjà en poste.",
      "Pour une reconversion, renseignez-vous sur le métier avant de choisir la formation. Parlez à des professionnels, regardez les conditions d'installation et les éventuelles obligations réglementaires. Dans l'installation photovoltaïque, par exemple, les clients ne peuvent bénéficier de certaines aides que si l'entreprise détient une qualification reconnue : la formation n'est alors qu'une étape.",
      "Regardez ensuite le volume de pratique et le matériel mis à disposition. Un parcours en photographie, en couture ou en production musicale demande des exercices sur du vrai matériel, et pas seulement des démonstrations.",
      "Enfin, demandez ce qui se passe à la fin : attestation de formation, certification, accompagnement à l'installation. La fiche indique quand un parcours prépare une certification ; à défaut, posez la question à l'organisme.",
    ],
    faq: [
      {
        q: "Une formation suffit-elle pour exercer un métier réglementé ?",
        r: "Pas toujours. Certains métiers demandent un diplôme, une qualification ou une déclaration particulière. Vérifiez les conditions d'exercice avant de vous inscrire et posez la question à l'organisme.",
      },
      {
        q: "Comment savoir si un parcours convient à une reconversion ?",
        r: "Lisez le public visé et les prérequis sur la fiche, puis contactez l'organisme pour décrire votre projet. Un bilan de compétences peut aussi aider à valider l'orientation.",
      },
      {
        q: "Ces formations sont-elles proposées à distance ?",
        r: "Rarement en totalité, car ces métiers demandent de la pratique sur du matériel. La modalité de chaque parcours est indiquée sur sa fiche.",
      },
    ],
    voisins: ["bien-etre-massage", "bilan-de-competences"],
  },

  "rse-culture": {
    metaTitle: "Formations RSE, transition écologique et mécénat d'entreprise",
    metaDescription:
      "Formations pour réduire l'empreinte carbone, intégrer l'économie circulaire ou développer le mécénat d'entreprise. Comparez durée, prix et modalité.",
    h1: "Formations RSE, transition écologique et culture",
    accroche: "Empreinte carbone, économie circulaire, mécénat d'entreprise : des parcours pour passer de l'intention aux actions.",
    titreGuide: "Passer à l'action sur la responsabilité sociétale",
    guide: [
      "La responsabilité sociétale des entreprises recouvre des sujets très concrets : mesurer et réduire ses émissions, revoir un processus de production pour consommer moins de matière, soutenir un projet d'intérêt général. Les clients, les donneurs d'ordre et les financeurs posent de plus en plus de questions sur ces points, y compris aux petites structures.",
      "Les parcours de ce thème sont surtout opérationnels. Ils s'adressent aux dirigeants, aux responsables de production, aux chargés de mission RSE ou aux personnes qui portent le sujet en plus de leur poste. Vérifiez dans les objectifs que la formation débouche sur un livrable : un premier bilan, un plan d'actions, une démarche de mécénat structurée.",
      "Le mécénat d'entreprise a ses propres règles, notamment fiscales. Une formation sur ce sujet doit expliquer le cadre en vigueur et la manière de construire un partenariat durable avec une association ou une structure culturelle.",
      "Pour bien choisir, partez de votre secteur. L'économie circulaire ne se travaille pas de la même façon dans l'industrie et dans les services.",
    ],
    faq: [
      {
        q: "Une petite entreprise a-t-elle intérêt à se former à la RSE ?",
        r: "Oui si ses clients ou ses donneurs d'ordre lui posent des questions sur son impact, ou si elle veut réduire ses coûts d'énergie et de matière. Les parcours opérationnels sont les plus adaptés aux petites structures.",
      },
      {
        q: "Que doit apporter une formation à l'empreinte carbone ?",
        r: "Une méthode pour identifier les principales sources d'émissions de votre activité et un plan d'actions pour les réduire. Comparez les objectifs affichés sur les fiches.",
      },
      {
        q: "Qui peut suivre une formation au mécénat d'entreprise ?",
        r: "Les dirigeants et salariés qui veulent monter ou structurer une démarche de mécénat, ainsi que les porteurs de projets culturels ou associatifs qui cherchent des entreprises partenaires.",
      },
    ],
    voisins: ["comptabilite-finance", "management-rh"],
  },

  "bilan-de-competences": {
    metaTitle: "Bilan de compétences : comparer les organismes et les formules",
    metaDescription:
      "Bilan de compétences : déroulé en trois phases, durée, financement par le CPF, choix du consultant. Comparez les offres des organismes référencés.",
    h1: "Bilan de compétences",
    accroche: "Faire le point sur son parcours, ses envies et ses compétences pour construire un projet professionnel réaliste.",
    titreGuide: "Comment se déroule un bilan de compétences",
    guide: [
      "Le bilan de compétences est encadré par le Code du travail. Il se déroule en trois phases : une phase préliminaire pour clarifier votre demande, une phase d'investigation pour explorer vos compétences, vos motivations et les pistes possibles, puis une phase de conclusion qui aboutit à un document de synthèse. Ce document vous appartient : il ne peut être transmis à un tiers, y compris à votre employeur, sans votre accord.",
      "La durée totale ne peut pas dépasser 24 heures. Les formules varient selon les organismes, en nombre de séances comme en travail personnel entre deux rendez-vous. Comparez ce qui est réellement inclus : entretiens individuels, tests, enquêtes métier, suivi après le bilan.",
      "Le bilan de compétences fait partie des actions finançables par le CPF. Une participation forfaitaire reste en principe à la charge du titulaire du compte, sauf exceptions prévues par la loi. Un salarié peut aussi le réaliser dans le cadre du plan de développement des compétences, avec son accord.",
      "Le critère le plus important reste le consultant. N'hésitez pas à demander un premier échange avant de vous engager.",
    ],
    faq: [
      {
        q: "Combien de temps dure un bilan de compétences ?",
        r: "24 heures au maximum, réparties sur plusieurs semaines. La durée exacte et le nombre de séances dépendent de l'organisme : ils figurent sur la fiche.",
      },
      {
        q: "Mon employeur aura-t-il accès aux résultats ?",
        r: "Non. Le document de synthèse vous est remis et ne peut être communiqué à un tiers qu'avec votre accord.",
      },
      {
        q: "Peut-on financer un bilan de compétences avec le CPF ?",
        r: "Oui, le bilan de compétences est éligible au CPF. Une participation forfaitaire reste en principe à votre charge, sauf cas d'exonération.",
      },
      {
        q: "Le bilan peut-il se faire à distance ?",
        r: "Beaucoup d'organismes le proposent à distance ou en formule mixte. La modalité est indiquée sur chaque fiche.",
      },
    ],
    voisins: ["management-rh", "metiers-specifiques"],
  },
};

export function themeContenu(slug: string): ThemeContenu | undefined {
  return THEMES_CONTENU[slug];
}

/** Nombre de mots d'un texte (utilisé par les tests de contenu). */
export function compterMots(texte: string) {
  return texte.trim().split(/\s+/).filter(Boolean).length;
}
