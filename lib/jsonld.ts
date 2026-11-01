import { SITE_NAME, SITE_URL, CONTACT_EMAIL } from "@/lib/env";
import type { Organization, ProgramWithOrg } from "@/lib/types";
import { modaliteLabel, sphereLabel } from "@/lib/spheres";
import { dureeIso } from "@/lib/seo";
import { programImage } from "@/lib/visuels";

export const EDITEUR_ID = `${SITE_URL}/#editeur`;
export const SITE_ID = `${SITE_URL}/#site`;
export const orgId = (slug: string) => `${SITE_URL}/organisme/${slug}#organisme`;
const abs = (u: string) => (u.startsWith("/") ? `${SITE_URL}${u}` : u);

export function publisherJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": EDITEUR_ID,
        name: "Back to Business",
        alternateName: "Formatrix",
        legalName: "Back to Business SASU",
        url: "https://formatrix.fr",
        logo: `${SITE_URL}/visuels/logo-formatrix.webp`,
        email: CONTACT_EMAIL,
        address: {
          "@type": "PostalAddress",
          streetAddress: "91 Grand Rue Pierre Braun",
          postalCode: "68170",
          addressLocality: "Rixheim",
          addressCountry: "FR",
        },
      },
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        description:
          "Annuaire français de parcours de formation professionnelle : durée, prix, modalité, éligibilité CPF et organisme de chaque parcours.",
        inLanguage: "fr-FR",
        image: `${SITE_URL}/visuels/logo-annuaire-formation.png`,
        publisher: { "@id": EDITEUR_ID },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/formations?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function orgJsonLd(
  o: Pick<Organization, "name" | "slug" | "website" | "city" | "description" | "logo_url" | "siret" | "nda">,
) {
  const page = `${SITE_URL}/organisme/${o.slug}`;
  const identifiers = [
    ...(o.siret ? [{ "@type": "PropertyValue", propertyID: "SIRET", value: o.siret }] : []),
    ...(o.nda ? [{ "@type": "PropertyValue", propertyID: "Numéro de déclaration d'activité", value: o.nda }] : []),
  ];
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": orgId(o.slug),
    name: o.name,
    url: o.website ?? page,
    mainEntityOfPage: page,
    ...(o.website ? { sameAs: [o.website] } : {}),
    ...(o.logo_url ? { logo: abs(o.logo_url) } : {}),
    ...(o.description ? { description: o.description } : {}),
    ...(identifiers.length ? { identifier: identifiers } : {}),
    ...(o.city ? { address: { "@type": "PostalAddress", addressLocality: o.city, addressCountry: "FR" } } : {}),
  };
}

/**
 * Course + CourseInstance : balisage sémantique (GEO, autres moteurs).
 * Google n'affiche plus de résultat enrichi « Course » depuis juin 2025 : on ne promet rien.
 * Le provider est l'organisme réel ; les champs absents ne sont pas inventés.
 */
export function courseJsonLd(p: ProgramWithOrg) {
  const mode = p.modality === "distanciel" ? "online" : p.modality === "mixte" ? "blended" : p.modality === "presentiel" ? "onsite" : undefined;
  const url = `${SITE_URL}/formation/${p.slug}`;
  const workload = dureeIso(p.duration_text);
  const instanceDesc = [modaliteLabel(p.modality), p.duration_text].filter(Boolean).join(", ");
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${url}#formation`,
    name: p.title,
    description: p.summary ?? p.title,
    url,
    mainEntityOfPage: url,
    image: abs(programImage(p)),
    inLanguage: "fr-FR",
    ...(p.sphere ? { about: sphereLabel(p.sphere) } : {}),
    ...(p.objectives?.length ? { teaches: p.objectives } : {}),
    ...({ audience: { "@type": "Audience", audienceType: p.audience && p.audience.trim() ? p.audience : "Tout public" } }),
    ...(p.prerequisites ? { coursePrerequisites: p.prerequisites } : {}),
    ...(p.certification ? { educationalCredentialAwarded: p.certification } : {}),
    provider: {
      "@type": "EducationalOrganization",
      "@id": orgId(p.organizations.slug),
      name: p.organizations.name,
      url: p.organizations.website ?? `${SITE_URL}/organisme/${p.organizations.slug}`,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      ...(mode ? { courseMode: mode } : {}),
      ...(instanceDesc ? { description: instanceDesc } : {}),
      ...(workload ? { courseWorkload: workload } : {}),
      ...(p.city && p.modality !== "distanciel"
        ? { location: { "@type": "Place", name: p.city, address: { "@type": "PostalAddress", addressLocality: p.city, addressCountry: "FR" } } }
        : {}),
    },
    ...(p.price_text
      ? {
          offers: {
            "@type": "Offer",
            category: p.cpf_eligible ? "Éligible CPF" : "Payant",
            description: p.price_text,
            ...(p.source_url ? { url: p.source_url } : {}),
            offeredBy: { "@id": orgId(p.organizations.slug) },
          },
        }
      : {}),
  };
}

/** FAQPage : à n'émettre que si les questions sont visibles sur la page. */
export function faqJsonLd(faq: { q: string; r: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ q, r }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: r } })),
  };
}
