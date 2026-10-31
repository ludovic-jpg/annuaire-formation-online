export function PageHero({ title, intro, children, tone = "creme" }: { title: string; intro?: React.ReactNode; children?: React.ReactNode; tone?: "creme" | "jaune" | "blanc" }) {
  const bg = tone === "jaune" ? "bg-jaune" : tone === "blanc" ? "bg-white" : "dots";
  return (
    <section className={`${bg} border-b-[3px] border-encre`}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {children}
        <h1 className="mt-4 max-w-3xl text-4xl sm:text-5xl">{title}</h1>
        {intro && <div className="mt-4 max-w-2xl text-lg text-encre/85">{intro}</div>}
      </div>
    </section>
  );
}
