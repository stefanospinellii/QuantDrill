import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Privacy() {
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
          <h1 className="text-3xl font-grotesk font-bold text-foreground mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-6">Last updated: May 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">1. Data We Collect</h2>
            <p className="text-foreground/90 mb-3">When you use QuantDrill, we collect:</p>
            <ul className="text-foreground/90 space-y-2 ml-4">
              <li>• Email address and authentication details</li>
              <li>• Drill session data (scores, accuracy, response times, category)</li>
              <li>• Streak counts and training dates</li>
              <li>• Payment information (processed by Stripe)</li>
              <li>• Device and browser information (for analytics)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">2. How We Use Your Data</h2>
            <p className="text-foreground/90 mb-3">We use your data to:</p>
            <ul className="text-foreground/90 space-y-2 ml-4">
              <li>• Provide and improve the QuantDrill service</li>
              <li>• Calculate your scores, streaks, and performance metrics</li>
              <li>• Process payments and manage your subscription</li>
              <li>• Send service updates and technical notifications</li>
              <li>• Analyze usage patterns to improve performance</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">3. Payment Processing</h2>
            <p className="text-foreground/90">
              All payments are processed securely by Stripe, Inc. We do not store your credit card details. Your payment information is encrypted and governed by Stripe's privacy policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">4. Your Rights (GDPR)</h2>
            <p className="text-foreground/90 mb-3">If you are in the EU, you have the right to:</p>
            <ul className="text-foreground/90 space-y-2 ml-4">
              <li>• Access your personal data</li>
              <li>• Correct inaccurate data</li>
              <li>• Delete your account and all associated data</li>
              <li>• Withdraw consent at any time</li>
              <li>• Data portability (request your data in a standard format)</li>
            </ul>
            <p className="text-foreground/90 mt-4">
              To exercise these rights, email <span className="font-semibold">privacy@quantdrill.com</span> with your request.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">5. Account Deletion</h2>
            <p className="text-foreground/90 mb-3">You can delete your account in two ways:</p>
            <ul className="text-foreground/90 space-y-2 ml-4">
              <li>• Via the Settings modal in the app (delete all data immediately)</li>
              <li>• By emailing <span className="font-semibold">privacy@quantdrill.com</span> with your request</li>
            </ul>
            <p className="text-foreground/90 mt-4">
              Upon deletion, all your personal data, session records, and progress will be permanently removed from our servers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">6. Cookies and Analytics</h2>
            <p className="text-foreground/90 mb-3">
              We use cookies and analytics tools to understand how you use QuantDrill and to improve performance. You can accept or decline cookies when you first visit. If you decline, no analytics data is collected.
            </p>
            <p className="text-foreground/90">
              Declining cookies does not affect app functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">7. Data Security</h2>
            <p className="text-foreground/90">
              We take data security seriously. All data is transmitted over HTTPS and stored securely. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-grotesk font-bold text-foreground mb-4">8. Contact Us</h2>
            <p className="text-foreground/90">
              Questions about this Privacy Policy? Email us at <span className="font-semibold">privacy@quantdrill.com</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}