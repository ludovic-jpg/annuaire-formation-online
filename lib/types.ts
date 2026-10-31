export type LinkRel = "sponsored" | "ugc";
export type ProgramStatus = "draft" | "pending" | "published" | "rejected";
export type Modality = "presentiel" | "distanciel" | "mixte";

export type Organization = {
  id: string;
  owner_id: string | null;
  name: string;
  slug: string;
  siret: string | null;
  nda: string | null;
  qualiopi: boolean;
  website: string | null;
  logo_url: string | null;
  city: string | null;
  region: string | null;
  description: string | null;
  is_group: boolean;
  link_rel: LinkRel;
  status: "pending" | "active" | "rejected";
  created_at: string;
};

export type AlsoOffered = { name: string; url: string; rel?: LinkRel };

export type Program = {
  id: string;
  org_id: string;
  slug: string;
  title: string;
  summary: string | null;
  objectives: string[];
  audience: string | null;
  prerequisites: string | null;
  duration_text: string | null;
  price_text: string | null;
  modality: Modality | null;
  sphere: string | null;
  city: string | null;
  certification: "LILATE" | "ICDL" | null;
  cpf_eligible: boolean;
  source_url: string | null;
  image_url: string | null;
  also_offered_by: AlsoOffered[];
  status: ProgramStatus;
  reject_reason: string | null;
  completeness: number;
  indexable: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  // Matrice complète reprise 1/1 de la page source (migration 0003)
  level_text?: string | null;
  short_objective?: string | null;
  highlights?: string | null;
  modalities_text?: string | null;
  program_md?: string | null;
  results_expected?: string | null;
  evaluation?: string | null;
  accessibility?: string | null;
  access_delay?: string | null;
  extra_sections?: { rubrique: string; contenu: string }[];
  source_site?: string | null;
  title_source?: string | null;
  lead_text?: string | null;
  meta_description?: string | null;
  key_points?: string[];
  program_summary_md?: string | null;
  audience_rewrite?: string | null;
  prerequisites_rewrite?: string | null;
  objectives_source?: string[];
  rewritten_at?: string | null;
  source_synced_at?: string | null;
};

export type ProgramWithOrg = Program & {
  organizations: Pick<Organization, "id" | "name" | "slug" | "link_rel" | "is_group" | "qualiopi" | "website" | "city" | "logo_url" | "nda">;
};

/** Article d'organisme (table posts, migration 0005), vu par son auteur ou l'admin. */
export type OrgPost = {
  id: string;
  org_id: string;
  slug: string;
  title: string;
  seo_title: string | null;
  description: string | null;
  keyword: string | null;
  body_md: string;
  cover_url: string | null;
  status: ProgramStatus;
  reject_reason: string | null;
  word_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};
