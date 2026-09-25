// ---------------------------------------------------------------------------
// Subscriber testimonials / deal stories.
//
// Ship EMPTY. The landing page shows an inviting "be our first success
// story" call-to-action until the owner adds REAL entries here.
//
// NEVER fabricate testimonials: no invented names, quotes, locations, or
// deals. Add an entry only with the subscriber's explicit permission, using
// their real words (lightly edited for clarity if needed, never rewritten).
// ---------------------------------------------------------------------------

export interface Testimonial {
  /** Subscriber's name (or however they want to be credited). */
  name: string;
  /** City/area, e.g. "Nanakuli, Oʻahu". */
  location: string;
  /** Their words about Violation Scout. */
  quote: string;
  /** Short deal detail, e.g. "Assigned a contract on a vacant Waiʻanae duplex — $18,500 fee." */
  deal: string;
}

export const TESTIMONIALS: Testimonial[] = [
  // Example of a REAL entry (do not ship with this uncommented):
  // {
  //   name: "—",
  //   location: "—",
  //   quote: "—",
  //   deal: "—",
  // },
];
