import { PageHero } from "@/components/layout/PageHero";
import { site } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using the J&M Rentals website.",
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        subtitle={`Last updated: ${site.termsLastUpdated}`}
      />
      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-3xl prose-navy space-y-8 text-navy/80 leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-navy mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using the {site.legalName} website (&quot;Site&quot;), you
              agree to be bound by these Terms and Conditions. If you do not agree,
              please do not use this Site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy mb-3">
              2. Use of the Website
            </h2>
            <p>
              This Site is provided for informational purposes regarding rental
              properties managed by {site.name}. You may not use the Site for any
              unlawful purpose or in any way that could damage, disable, or impair
              the Site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy mb-3">
              3. Property Information
            </h2>
            <p>
              Descriptions, photos, amenities, and availability information are
              provided for general reference and may change without notice. Actual
              lease terms, pricing, and unit availability are confirmed only through
              a signed rental agreement.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy mb-3">
              4. Online Booking
            </h2>
            <p>
              Online booking features displayed on this Site may be marked as
              &quot;Coming Soon.&quot; Until officially launched, all reservations and
              applications must be completed through direct contact with {site.name}.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy mb-3">
              5. Disclaimer of Warranties
            </h2>
            <p>
              The Site and its content are provided &quot;as is&quot; without warranties of
              any kind, either express or implied. {site.legalName} does not warrant
              that the Site will be uninterrupted or error-free.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy mb-3">
              6. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, {site.legalName} shall not be
              liable for any indirect, incidental, special, or consequential damages
              arising from your use of the Site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy mb-3">
              7. External Links
            </h2>
            <p>
              The Site may contain links to third-party websites (including social
              media and mapping services). We are not responsible for the content or
              practices of those sites.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy mb-3">
              8. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. Continued use of
              the Site after changes constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy mb-3">
              9. Contact
            </h2>
            <p>
              For questions about these Terms, contact us at{" "}
              <a href={`mailto:${site.email}`} className="text-gold hover:underline">
                {site.email}
              </a>{" "}
              or {site.phone}.
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
