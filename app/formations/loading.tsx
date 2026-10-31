import { CardsSkeleton } from "@/components/CardsSkeleton";

export default function Loading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Chargement des formations…</span>
      <section className="dots border-b-4 border-encre">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <div className="skeleton h-4 w-40" />
          <div className="skeleton mt-5 h-12 w-3/4 max-w-md" />
          <div className="skeleton mt-6 h-36 w-full !rounded-[20px]" />
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="skeleton mb-6 h-4 w-72" />
        <CardsSkeleton />
      </div>
    </div>
  );
}
