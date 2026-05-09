import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-5 lg:px-0 py-8 pb-12">
      <div className="lg:max-w-2xl lg:mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 no-select"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <div className="prose prose-invert max-w-none">
          <h1 className="text-3xl font-grotesk font-bold text-foreground mb-6">Terms of Service</h1>
          <p className="text-muted-foreground mb-6">Last updated: May 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">1. Service Description</h2>
            <p className="text-foreground/90">
              QuantDrill is a web-based platform designed to help users practice quantitative reasoning through timed drills across various categories (mental math, percentages, business math, market sizing, and GMAT quant). The service is provided on an "as-is" basis.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">2. User Accounts</h2>
            <p className="text-foreground/90 mb-3">
              By creating an account, you agree to provide accurate information and are responsible for maintaining the confidentiality of your login credentials. You are responsible for all activity under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">3. Free vs. Pro Plans</h2>
            <p className="text-foreground/90 mb-3">
              <strong>Free Plan:</strong> Limited to 12 drills per day, access to medium difficulty only, and selected categories.
            </p>
            <p className="text-foreground/90">
              <strong>Pro Plan:</strong> Unlimited daily drills, access to all difficulty levels (easy, medium, hard), all categories, and advanced analytics.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">4. Subscription & Billing</h2>
            <p className="text-foreground/90 mb-3">
              By subscribing to Pro, you authorize us to charge your payment method monthly, annually, or as a one-time lifetime payment as you select. Subscriptions renew automatically unless cancelled.
            </p>
            <p className="text-foreground/90">
              You can cancel your subscription at any time. Refunds follow local regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">5. EU 14-Day Refund Right</h2>
            <p className="text-foreground/90">
              If you are a consumer in the European Union, you have the right to withdraw from your purchase within 14 days of payment without giving a reason. To exercise this right, contact <span className="font-semibold">support@quantdrill.com</span> with your order details.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">6. Account Termination</h2>
            <p className="text-foreground/90 mb-3">
              You may delete your account at any time through the app settings. Upon deletion, all your data will be permanently removed.
            </p>
            <p className="text-foreground/90">
              We reserve the right to suspend or terminate accounts that violate these terms or engage in abusive behavior.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">7. Limitation of Liability</h2>
            <p className="text-foreground/90">
              QuantDrill is provided "as-is" without warranties. We are not liable for indirect, incidental, or consequential damages from using the service. Our liability is limited to the amount you paid for the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">8. User Conduct</h2>
            <p className="text-foreground/90 mb-3">You agree not to:</p>
            <ul className="text-foreground/90 space-y-2 ml-4">
              <li>• Hack, reverse-engineer, or exploit the platform</li>
              <li>• Share accounts or sell access to others</li>
              <li>• Use the service for illegal purposes</li>
              <li>• Attempt to access other users' data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">9. Intellectual Property</h2>
            <p className="text-foreground/90">
              All content, questions, and materials in QuantDrill are our property. You may not copy, distribute, or reproduce them without permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">10. Governing Law</h2>
            <p className="text-foreground/90">
              These Terms of Service are governed by and construed in accordance with the laws of Italy, without regard to conflicts of law principles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">11. Changes to Terms</h2>
            <p className="text-foreground/90">
              We may update these terms at any time. Continued use of the service after changes constitutes your acceptance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">12. Contact</h2>
            <p className="text-foreground/90">
              Questions about these Terms? Email <span className="font-semibold">support@quantdrill.com</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}