import Image from "next/image";
import Link from "next/link";
import type { ProgramWithOrg } from "@/lib/types";
import { SPHERE_BY_SLUG, modaliteLabel } from "@/lib/spheres";
import { programImage } from "@/lib/visuels";
import { GroupBadge } from "@/components/GroupBadge";

export function ProgramCard({ p }: { p: ProgramWithOrg }) {
  const sphere = p.sphere ? SPHERE_BY_SLUG[p.sphere] : undefined;
  const img = programImage(p);
  const local = img.startsWith("/");
  return (
    <article className="brut lift relative flex h-full flex-col overflow-hidden bg-white">
      <div className="relative aspect-[16/10] border-b-[3px] border-encre" style={{ background: sphere?.color ?? "#FFCD1C" }}>
        {local ? (
          <Image src={img} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-contain p-3" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        )}
        {sphere && (
          <span className="absolute left-3 top-3 rounded-full border-2 border-encre bg-white px-2.5 py-0.5 text-xs font-bold">
            {sphere.label}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-lg leading-tight">
          <Link href={`/formation/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {p.title}
          </Link>
        </h3>
        <p className="text-sm text-encre/75">
          {p.organizations.name}
          {p.city ? `, ${p.city}` : ""}
        </p>
        <ul className="mt-auto flex flex-wrap gap-1.5 text-xs font-semibold" aria-label="Caractéristiques">
          {p.duration_text && <li className="rounded-md bg-creme px-2 py-1">{p.duration_text}</li>}
          <li className="rounded-md bg-creme px-2 py-1">{modaliteLabel(p.modality)}</li>
          {p.cpf_eligible && <li className="rounded-md bg-menthe/25 px-2 py-1">Éligible CPF</li>}
          {p.certification && <li className="rounded-md bg-jaune px-2 py-1">Certifiant {p.certification}</li>}
        </ul>
        {p.organizations.is_group && <GroupBadge compact />}
      </div>
    </article>
  );
}
