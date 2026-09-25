// ---------------------------------------------------------------------------
// Public-record lookup links used by the research checklist.
//
// Violation Scout is Hawaiʻi-first: the default preset deep-links Honolulu's
// official lookups (RPAD tax records for ownership, DPP HNL Build for
// permits/violations). Users outside Hawaiʻi can point the checklist at
// their own county's sites in Dashboard → Settings ("Custom" region).
//
// No county in Hawaiʻi offers a public API for ownership or violation data,
// so the app cannot auto-pull these. Instead each research step deep-links
// the user to the official lookup page. Verify each URL still resolves
// before launch — government sites change paths without notice.
//
// INTERNATIONALIZATION: all user-facing strings here are translation KEYS
// (resolved against the "research" message namespace). Link `label`s are
// proper nouns of official sites and intentionally stay in English.
// ---------------------------------------------------------------------------

export interface ResearchLink {
  /** Short label shown on the checklist item (proper noun — stays English). */
  label: string;
  /** Official public lookup page (opens in a new tab). */
  url: string;
  /** Translation key for the one-line guidance, e.g. "linkHints.rpad". */
  hintKey: string;
}

/** The two region options a user can choose in Settings. */
export type RegionId = "hawaii" | "custom";

/** Region ids only — names/descriptions live in messages (research.regions.*). */
export const REGIONS: { id: RegionId }[] = [{ id: "hawaii" }, { id: "custom" }];

/** Built-in Hawaiʻi preset — the default for every new account. */
export const HAWAII_OWNER_LINKS: ResearchLink[] = [
  {
    label: "Honolulu Real Property Assessment Division (RPAD)",
    url: "https://www.realpropertyhonolulu.com/",
    hintKey: "linkHints.rpad",
  },
  {
    label: "qPublic — Honolulu County",
    url: "https://qpublic.schneidercorp.com/Application.aspx?App=HonoluluCountyHI",
    hintKey: "linkHints.qpublic",
  },
];

export const HAWAII_VIOLATION_LINKS: ResearchLink[] = [
  {
    label: "HNL Build — search permits & violations (DPP)",
    url: "https://www.honolulu.gov/dpp/search-for-records-submit-a-request-to-daib/",
    hintKey: "linkHints.hnlbuild",
  },
];

/** The user's stored region preference (from the User table). */
export interface RegionSettings {
  region: string; // "hawaii" | "custom"
  customAssessorLabel: string | null;
  customAssessorUrl: string | null;
  customViolationLabel: string | null;
  customViolationUrl: string | null;
}

/** Lookup links resolved for a specific user: the Hawaiʻi preset, or their
 * custom URLs when region is "custom". Empty custom fields are skipped. */
export interface ResolvedRegion {
  regionId: RegionId;
  /** Short name used in generated step labels, e.g. "Hawaiʻi" or "your county". */
  regionLabel: string;
  ownerLinks: ResearchLink[];
  violationLinks: ResearchLink[];
}

export function resolveRegion(s: RegionSettings): ResolvedRegion {
  if (s.region === "custom") {
    const ownerLinks: ResearchLink[] = [];
    const violationLinks: ResearchLink[] = [];
    if (s.customAssessorUrl) {
      ownerLinks.push({
        label: s.customAssessorLabel?.trim() || "County tax assessor",
        url: s.customAssessorUrl,
        hintKey: "linkHints.customAssessor",
      });
    }
    if (s.customViolationUrl) {
      violationLinks.push({
        label: s.customViolationLabel?.trim() || "Code enforcement",
        url: s.customViolationUrl,
        hintKey: "linkHints.customViolation",
      });
    }
    return { regionId: "custom", regionLabel: "your county", ownerLinks, violationLinks };
  }
  return {
    regionId: "hawaii",
    regionLabel: "Hawaiʻi",
    ownerLinks: HAWAII_OWNER_LINKS,
    violationLinks: HAWAII_VIOLATION_LINKS,
  };
}

/** One checklist step template: translation keys + params + optional deep-link.
 * Resolved to display strings by lib/research-i18n.ts (server) using the
 * user's locale. */
export interface ResearchStepTemplate {
  labelKey: string;
  labelParams?: Record<string, string>;
  hintKey: string;
  hintParams?: Record<string, string>;
  url?: string;
}

/**
 * Build the default research checklist for a newly logged property from the
 * resolved region. The first steps deep-link the user's configured official
 * lookups; the remaining steps (skip-trace, evidence, contact) are
 * region-agnostic and identical everywhere.
 */
export function buildResearchStepTemplates(r: ResolvedRegion): ResearchStepTemplate[] {
  const steps: ResearchStepTemplate[] = [];

  r.ownerLinks.forEach((link, i) => {
    steps.push({
      labelKey: i === 0 ? "steps.findOwner" : "steps.crossCheck",
      labelParams: { source: link.label },
      hintKey: i === 0 ? "steps.findOwnerHint" : "steps.crossCheckHint",
      url: link.url,
    });
  });

  r.violationLinks.forEach((link) => {
    steps.push({
      labelKey: "steps.checkViolations",
      labelParams: { source: link.label },
      hintKey: link.hintKey,
      url: link.url,
    });
  });

  steps.push(
    {
      labelKey: "steps.skipTrace",
      hintKey: "steps.skipTraceHint",
    },
    {
      labelKey: "steps.confirmViolation",
      hintKey: "steps.confirmViolationHint",
    },
    {
      labelKey: "steps.makeContact",
      hintKey: "steps.makeContactHint",
    }
  );

  return steps;
}
