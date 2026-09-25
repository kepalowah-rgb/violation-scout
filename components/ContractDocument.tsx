import type { ContractT } from "@/lib/lead-types";
import { PRICING } from "@/config/pricing";

// Printable wholesale assignment contract template.
//
// Two templates: "hawaii" (Hawaiʻi-appropriate wholesaling disclosures) and
// "generic" (state-neutral language for users in other states).
//
// IMPORTANT: both are starting templates, not legal advice and not a
// substitute for an attorney-drafted agreement. The app labels every
// generated copy as a DRAFT and requires attorney review before use — a
// Hawaiʻi attorney for the Hawaiʻi template, a local real-estate attorney
// for the generic one.

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "_______________";

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="font-bold text-sm uppercase tracking-wide">
        {n}. {title}
      </h3>
      <div className="mt-1 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export default function ContractDocument({ contract, buyerName }: { contract: ContractT; buyerName: string }) {
  const generic = contract.template === "generic";
  return (
    <div className="mx-auto max-w-3xl bg-white p-8 sm:p-12 text-stone-900">
      <div className="rounded-lg border-2 border-red-700 p-3 text-center text-sm font-bold uppercase tracking-wide text-red-700">
        {generic
          ? "Draft — not legal advice. Local real-estate attorney review required before signing."
          : "Draft — not legal advice. Hawaiʻi attorney review required before signing."}
      </div>

      <h1 className="mt-6 text-center text-2xl font-bold">
        Real Estate Purchase Agreement with Right to Assign
      </h1>
      <p className="mt-1 text-center text-sm text-stone-500">
        {generic
          ? "For use with single-family residential property"
          : "For use with single-family residential property in the State of Hawaiʻi"}
      </p>

      <Section n="1" title="Parties">
        <p>
          <strong>Seller:</strong> {contract.sellerName}
        </p>
        <p className="mt-1">
          <strong>Buyer (Assignor):</strong> {buyerName || "________________________________"}
        </p>
        <p className="mt-2">
          Seller agrees to sell, and Buyer agrees to buy, the contractual rights described below
          for the property at:
        </p>
        <p className="mt-1 font-semibold">{contract.propertyAddress}</p>
        {contract.tmk && <p className="text-stone-600">Tax Map Key: {contract.tmk}</p>}
      </Section>

      <Section n="2" title="Purchase price and earnest money">
        <p>
          The total purchase price is <strong>{money(contract.purchasePrice)}</strong>. Buyer has
          deposited, or will deposit within 3 business days, earnest money of{" "}
          <strong>{money(contract.earnestMoney)}</strong> with an escrow or title company
          mutually agreed by the parties, to be applied to the purchase price at closing.
        </p>
      </Section>

      <Section n="3" title="Assignment of contract">
        <p>
          <strong>Disclosure to Seller:</strong> Buyer is a real estate investor who intends to
          assign this contract to a third-party end buyer for a profit. Seller acknowledges and
          agrees that Buyer may market and assign <em>Buyer&apos;s contractual interest under
          this agreement only</em> — not the property itself — and may earn an assignment fee,
          currently estimated at <strong>{money(contract.assignmentFee)}</strong>, which is
          disclosed to Seller by this paragraph.
        </p>
        <p className="mt-2">
          Seller consents to such assignment. The end buyer (assignee) shall assume all of
          Buyer&apos;s obligations under this agreement from the date of assignment.
        </p>
      </Section>

      <Section n="4" title="Inspection period">
        <p>
          Buyer shall have <strong>{contract.inspectionDays} days</strong> from the effective
          date (&ldquo;Inspection Period&rdquo;) to inspect the property and terminate this
          agreement for any reason by written notice, in which case the earnest money shall be
          refunded to Buyer.
        </p>
      </Section>

      <Section n="5" title="Closing">
        <p>
          Closing shall occur on or before <strong>{fmtDate(contract.closingDate)}</strong> through
          escrow with a licensed {generic ? "" : "Hawaiʻi "}escrow or title company. Seller shall convey marketable
          title by warranty deed (or as otherwise agreed), free of liens except those assumed in
          writing.
        </p>
      </Section>

      {contract.additionalTerms && (
        <Section n="6" title="Additional terms">
          <p className="whitespace-pre-wrap">{contract.additionalTerms}</p>
        </Section>
      )}

      <Section n={contract.additionalTerms ? "7" : "6"} title="Disclosures and acknowledgments">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Buyer is acquiring an <em>equitable/contractual interest</em> in the property via
            this agreement, not ownership of the property itself, unless and until closing occurs.
          </li>
          <li>
            Buyer is <strong>not a licensed real estate broker</strong> and is acting as a
            principal in this transaction.
          </li>
          <li>
            Any marketing by Buyer before closing shall describe only Buyer&apos;s contractual
            interest (e.g. &ldquo;assigning my purchase contract&rdquo;), never the property as
            Buyer&apos;s to sell.
          </li>
          {generic && (
            <li>
              Wholesaling and contract-assignment rules vary by state — some states restrict,
              license, or regulate this activity. Buyer and Seller are each advised to confirm
              this transaction complies with the laws of the state where the property is
              located.
            </li>
          )}
          <li>
            Seller is advised to seek independent legal and tax counsel before signing. Both
            parties acknowledge they have read this agreement and had the opportunity for
            attorney review.
          </li>
        </ul>
      </Section>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {["Seller", "Buyer (Assignor)"].map((role) => (
          <div key={role} className="text-sm">
            <p className="font-bold uppercase tracking-wide">{role}</p>
            <div className="mt-8 border-b border-stone-400" />
            <p className="mt-1 text-stone-500">Signature</p>
            <div className="mt-6 border-b border-stone-400" />
            <p className="mt-1 text-stone-500">Printed name</p>
            <div className="mt-6 border-b border-stone-400" />
            <p className="mt-1 text-stone-500">Date</p>
          </div>
        ))}
      </div>

      <p className="mt-10 border-t border-stone-300 pt-4 text-xs text-stone-500">
        This document was generated as a draft template by {PRICING.productName} and does not
        constitute legal advice. Real estate wholesaling is regulated and fact-specific;
        consult a licensed {generic ? "real-estate attorney in the property's state" : "Hawaiʻi attorney"} before signing or marketing any interest.
      </p>
    </div>
  );
}
