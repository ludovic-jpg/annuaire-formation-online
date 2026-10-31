import { describe, expect, it } from "vitest";
import { isListingIndexable, outboundRel, programRobots } from "@/lib/regles";

describe("outboundRel", () => {
  it("sponsored pour le groupe, ugc sinon, toujours noopener", () => {
    expect(outboundRel("sponsored")).toBe("sponsored noopener");
    expect(outboundRel("ugc")).toBe("ugc noopener");
  });
  it("retombe sur ugc pour une valeur inconnue ou absente", () => {
    expect(outboundRel(undefined)).toBe("ugc noopener");
    expect(outboundRel("dofollow")).toBe("ugc noopener");
  });
});

describe("programRobots", () => {
  it("noindex si indexable = false", () => {
    expect(programRobots({ indexable: false, status: "published" }).index).toBe(false);
    expect(programRobots({ indexable: true, status: "published" }).index).toBe(true);
    expect(programRobots({ indexable: true, status: "pending" }).index).toBe(false);
  });
});

describe("isListingIndexable", () => {
  const p = (org: string, indexable = true) => ({ org_id: org, indexable, status: "published" });
  it("faux sous 3 fiches", () => {
    expect(isListingIndexable([p("a"), p("b")])).toBe(false);
  });
  it("faux avec un seul organisme", () => {
    expect(isListingIndexable([p("a"), p("a"), p("a"), p("a")])).toBe(false);
  });
  it("vrai à partir de 3 fiches de 2 organismes", () => {
    expect(isListingIndexable([p("a"), p("a"), p("b")])).toBe(true);
  });
  it("ignore les fiches non indexables (règle des 30 %)", () => {
    expect(isListingIndexable([p("a"), p("b", false), p("b", false), p("a")])).toBe(false);
  });
  it("ignore les fiches non publiées", () => {
    expect(isListingIndexable([p("a"), p("b"), { org_id: "b", indexable: true, status: "pending" }])).toBe(false);
  });
});
