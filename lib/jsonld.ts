import { SITE_NAME, SITE_URL, CONTACT_EMAIL } from "@/lib/env";
import type { Organization, ProgramWithOrg } from "@/lib/types";
import { modaliteLabel } from "@/lib/spheres";

export function publisherJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#editeur`,
        name: "Back to Business",
        alternateName: "Formatrix",
        legalName: "Back to Business SASU",
        url: "https://formatrix.fr",
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
        "@id": `${SITE_URL}/#site`,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: "fr-FR",
        publisher: { "@id": `${SITE_URL}/#editeur` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/formations?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function orgJsonLd(o: Pick<Organization, "name" | "slug" | "website" | "city" | "description" | "logo_url">) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: o.name,
    url: o.website ?? `${SITE_URL}/organisme/${o.slug}`,
    ...(o.logo_url ? { logo: o.logo_url } : {}),
    ...(o.description ? { description: o.description } : {}),
    ...(o.city ? { address: { "@type": "PostalAddress", addressLocality: o.city, addressCountry: "FR" } } : {}),
  };
}

export function courseJsonLd(p: ProgramWithOrg) {
  const mode = p.modality === "distanciel" ? "online" : p.modality === "mixte" ? "blended" : "onsite";
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: p.title,
    description: p.summary ?? p.title,
    url: `${SITE_URL}/formation/${p.slug}`,
    inLanguage: "fr-FR",
    ...(p.objectives?.length ? { teaches: p.objectives } : {}),
    ...(p.audience ? { audience: { "@type": "Audience", audienceType: p.audience } } : {}),
    ...(p.prerequisites ? { coursePrerequisites: p.prerequisites } : {}),
    ...(p.certification ? { educationalCredentialAwarded: p.certification } : {}),
    provider: {
      "@type": "EducationalOrganization",
      name: p.organizations.name,
      url: p.organizations.website ?? `${SITE_URL}/organisme/${p.organizations.slug}`,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: mode,
      description: modaliteLabel(p.modality),
      ...(p.city ? { location: { "@type": "Place", name: p.city, address: { "@type": "PostalAddress", addressLocality: p.city, addressCountry: "FR" } } } : {}),
      ...(p.duration_text ? { courseWorkload: p.duration_text } : {}),
    },
    ...(p.price_text ? { offers: { "@type": "Offer", category: p.cpf_eligible ? "Éligible CPF" : "Payant", description: p.price_text } } : {}),
  };
}

