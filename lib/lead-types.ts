// Shared TypeScript shapes for leads, checklist items and contracts.
// Kept as plain interfaces (not Prisma imports) so client components stay
// light and don't depend on the generated client.

export interface ResearchItemT {
  id: string;
  label: string;
  status: string; // todo | in_progress | done
  notes: string | null;
  sourceUrl: string | null;
  sortOrder: number;
}

export interface PropertyPhotoT {
  id: string;
  url: string;
  caption: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
}

/** Condition statuses for remote evaluation. DB stores the stable codes. */
export type ConditionStatus = "unchecked" | "good" | "fair" | "poor";

export interface ConditionItemT {
  id: string;
  /** Stable key: roof | walls | windows | doors | yard | structural | vacancy | utilities */
  itemKey: string;
  status: ConditionStatus;
  notes: string | null;
}

export interface PropertyT {
  id: string;
  address: string;
  city: string;
  zip: string | null;
  tmk: string | null;
  lat: number | null;
  lng: number | null;
  distressNotes: string | null;
  suspectedViolations: string | null;
  ownerName: string | null;
  status: string;
  priority: string;
  followUpDate: string | null;
  /** Validated http(s) URL to a video walkthrough / video-call recording. */
  virtualTourUrl: string | null;
  photos: PropertyPhotoT[];
  conditionItems: ConditionItemT[];
  researchItems: ResearchItemT[];
  createdAt: string;
}

/** The 8 remote condition checklist items, in display order.
 * Display labels live in messages ("remote.items.<key>"). */
export const CONDITION_ITEM_KEYS = [
  "roof",
  "walls",
  "windows",
  "doors",
  "yard",
  "structural",
  "vacancy",
  "utilities",
] as const;

export interface ContractT {
  id: string;
  propertyId: string | null;
  sellerName: string;
  propertyAddress: string;
  tmk: string | null;
  purchasePrice: number;
  earnestMoney: number;
  assignmentFee: number;
  closingDate: string | null;
  inspectionDays: number;
  additionalTerms: string | null;
  /** "hawaii" | "generic" — which legal template the draft renders with. */
  template: string;
  /** ISO timestamp of when attorney review was requested, or null. */
  reviewRequestedAt: string | null;
  updatedAt: string;
  property?: { id: string; address: string } | null;
}

export const PROPERTY_STATUSES = [
  "new",
  "researching",
  "contacted",
  "offer_made",
  "under_contract",
  "assigned",
  "dead",
] as const;

export const PROPERTY_PRIORITIES = ["low", "medium", "high"] as const;

/** Pin color per status on the map. */
export const STATUS_COLORS: Record<string, string> = {
  new: "#f59e0b",
  researching: "#3b82f6",
  contacted: "#8b5cf6",
  offer_made: "#f97316",
  under_contract: "#22c55e",
  assigned: "#047857",
  dead: "#9ca3af",
};

/** Default map view: Oʻahu / Honolulu, Hawaiʻi. Users can pan and zoom
 * anywhere in the world — the default just starts the map at home. */
export const DEFAULT_CENTER: [number, number] = [21.31, -157.86];
export const DEFAULT_ZOOM = 11;
