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
};

export type ProgramWithOrg = Program & {
  organizations: Pick<Organization, "id" | "name" | "slug" | "link_rel" | "is_group" | "qualiopi" | "website" | "city" | "logo_url" | "nda">;
};
