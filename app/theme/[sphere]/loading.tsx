import { CardsSkeleton } from "@/components/CardsSkeleton";

export default function Loading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Chargement du thème…</span>
      <section className="dots border-b-4 border-encre">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="skeleton h-4 w-40" />
          <div className="skeleton mt-8 h-12 w-2/3 max-w-lg" />
          <div className="skeleton mt-4 h-5 w-full max-w-xl" />
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <CardsSkeleton />
      </div>
    </div>
  );
}
