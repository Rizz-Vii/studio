import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | RankPilot",
  description: "RankPilot Terms of Service and user agreement.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-muted-foreground mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
          <p>
            By accessing and using RankPilot, you accept and agree to be bound
            by the terms and provision of this agreement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
          <p>RankPilot is an AI-powered SEO analysis platform that provides:</p>
          <ul className="list-disc pl-6">
            <li>Website SEO analysis and recommendations</li>
            <li>Competitor analysis and benchmarking</li>
            <li>Content optimization suggestions</li>
            <li>Link analysis and SERP tracking</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
          <ul className="list-disc pl-6">
            <li>Provide accurate account information</li>
            <li>Keep your login credentials secure</li>
            <li>Use the service for legitimate SEO purposes only</li>
            <li>Respect rate limits and fair usage policies</li>
            <li>Not attempt to reverse engineer or abuse the platform</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Subscription and Billing
          </h2>
          <ul className="list-disc pl-6">
            <li>Subscriptions are billed monthly or annually</li>
            <li>Payments are processed securely through Stripe</li>
            <li>Refunds may be provided at our discretion</li>
            <li>You can cancel your subscription at any time</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
          <p>
            RankPilot and its original content, features, and functionality are
            owned by us and are protected by international copyright, trademark,
            and other intellectual property laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Limitation of Liability
          </h2>
          <p>
            RankPilot shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages resulting from your use of the
            service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior
            notice, for conduct that we believe violates these Terms of Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
          <p>
            We reserve the right to update these terms at any time. We will
            notify users of any material changes via email or platform
            notification.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p>
            Questions about these Terms of Service should be sent to{" "}
            <a
              href="mailto:legal@rankpilot.com"
              className="text-primary hover:underline"
            >
              legal@rankpilot.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
