import { PageHero } from "@/components/layout/PageHero";
import { site } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for J&M Rentals website visitors and contact form users.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle={`Last updated: ${site.privacyLastUpdated}`}
      />
      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-3xl space-y-8 text-navy/80 leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-navy mb-3">
              1. Information We Collect
            </h2>
            <p>
              When you submit our contact form, we collect your name, email address,
              optional phone number, and message content. We may also collect
              technical information such as your IP address for security and rate
              limiting purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy mb-3">
              2. How We Use Your Information
            </h2>
            <p>
              We use contact form submissions to respond to your inquiries about
              rental properties. We do not sell your personal information to third
              parties.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy mb-3">
              3. Email Processing (Mailgun)
            </h2>
            <p>
              Contact form messages are transmitted via Mailgun, our email delivery
              service provider. Mailgun processes message data on our behalf in
              accordance with their privacy policy and applicable data protection
              laws.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy mb-3">
              4. Maps (Mapbox)
            </h2>
            <p>
              Our property map is powered by Mapbox. When you view the map, Mapbox
              may collect usage data as described in the Mapbox Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy mb-3">
              5. Cookies
            </h2>
            <p>
              This Site may use essential cookies required for basic functionality.
              If analytics or marketing tools are added in the future, this policy
              will be updated accordingly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy mb-3">
              6. Data Retention
            </h2>
            <p>
              Contact inquiries are retained only as long as necessary to respond to
              your request and manage our business relationship, unless a longer
              retention period is required by law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy mb-3">
              7. Your Rights
            </h2>
            <p>
              You may request access to, correction of, or deletion of your personal
              information by contacting us at{" "}
              <a href={`mailto:${site.email}`} className="text-gold hover:underline">
                {site.email}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy mb-3">
              8. Security
            </h2>
            <p>
              We implement reasonable technical measures including form validation,
              honeypot spam protection, and rate limiting to protect your
              information. No method of transmission over the Internet is 100%
              secure.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy mb-3">
              9. Contact Us
            </h2>
            <p>
              For privacy-related questions, contact {site.legalName} at{" "}
              <a href={`mailto:${site.email}`} className="text-gold hover:underline">
                {site.email}
              </a>
              .
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
