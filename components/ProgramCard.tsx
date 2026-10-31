import Image from "next/image";
import Link from "next/link";
import type { ProgramWithOrg } from "@/lib/types";
import { SPHERE_BY_SLUG, modaliteLabel } from "@/lib/spheres";
import { programImage } from "@/lib/visuels";
import { SphereIcon } from "@/components/SphereIcon";

export function ProgramCard({ p, priority = false }: { p: ProgramWithOrg; priority?: boolean }) {
  const sphere = p.sphere ? SPHERE_BY_SLUG[p.sphere] : undefined;
  const img = programImage(p);
  const local = img.startsWith("/");
  return (
    <article className="brut lift relative flex h-full flex-col overflow-hidden bg-white">
      <div className="visual-tint flex aspect-[4/3] flex-col border-b-4 border-encre">
        <div className="relative min-h-0 flex-1">
          {local ? (
            <Image
              src={img}
              alt={`Visuel de la formation ${p.title}, proposée par ${p.organizations.name}`}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="lift-img object-contain p-3"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={`Visuel de la formation ${p.title}, proposée par ${p.organizations.name}`} loading="lazy" className="lift-img absolute inset-0 h-full w-full object-contain p-3" />
          )}
          {sphere && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border-[3px] border-encre bg-white py-0.5 pl-0.5 pr-3 font-pixel text-lg uppercase leading-none tracking-wide">
              <SphereIcon sphere={sphere.slug} color={sphere.fluo} size={28} />
              {sphere.label}
            </span>
          )}
        </div>
        <div className="flex min-h-[4.5rem] items-center border-t-4 border-encre px-3 py-2" style={{ background: sphere?.fluo ?? "#FFF23D" }}>
          <h3 className="line-clamp-2 text-lg leading-tight">
            <Link href={`/formation/${p.slug}`} className="card-link after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {p.title}
            </Link>
          </h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <p className="text-sm text-encre/75">
          {p.organizations.name}
          {p.city ? `, ${p.city}` : ""}
        </p>
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-1 text-xs font-semibold" aria-label="Caractéristiques">
          {p.duration_text && <li className="rounded-md bg-creme px-2 py-1 ring-1 ring-encre/10">{p.duration_text}</li>}
          <li className="rounded-md bg-creme px-2 py-1 ring-1 ring-encre/10">{modaliteLabel(p.modality)}</li>
          {p.cpf_eligible && <li className="rounded-md bg-menthe/25 px-2 py-1 ring-1 ring-encre/10">Éligible CPF</li>}
          {p.certification && <li className="rounded-md bg-jaune px-2 py-1 ring-1 ring-encre/15">Certifiant {p.certification}</li>}
        </ul>
      </div>
    </article>
  );
}
