import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div style={{ background: '#0B0F14', fontFamily: 'Inter, sans-serif', minHeight: '100vh', color: '#fff' }}>

      {/* Nav */}
      <nav
        className="flex items-center justify-between"
        style={{
          padding: 'clamp(16px, 3vw, 24px) clamp(20px, 6vw, 96px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <Link to="/" className="font-grotesk font-black text-lg no-underline" style={{ color: '#fff', letterSpacing: '-0.01em' }}>
          Quant<span style={{ color: '#9B6FE8' }}>Drill</span>
        </Link>
        <Link
          to="/"
          className="text-sm font-semibold px-5 py-2.5 rounded-xl no-select no-underline"
          style={{ color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.28)', background: 'rgba(124,58,237,0.07)' }}
        >
          ← Back
        </Link>
      </nav>

      {/* Main content */}
      <main
        className="mx-auto"
        style={{ maxWidth: 760, padding: 'clamp(48px, 8vw, 96px) clamp(20px, 6vw, 40px)' }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: 'rgba(124,58,237,0.7)', letterSpacing: '0.14em' }}
        >
          About QuantDrill
        </p>

        <h1
          className="font-grotesk font-black"
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.4rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            marginBottom: '2rem',
            backgroundImage: 'linear-gradient(135deg, #fff 0%, rgba(196,181,253,0.9) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          The mental math training platform built for elite performance
        </h1>

        <div
          className="space-y-6"
          style={{ color: 'rgba(255,255,255,0.58)', fontSize: '1rem', lineHeight: 1.85 }}
        >
          <p>
            QuantDrill is a daily numerical training platform designed for professionals and students who
            compete in environments where speed and accuracy under pressure are non-negotiable. Whether
            you are preparing for MBB consulting interviews, cracking the GMAT or GRE quantitative
            sections, or sharpening your edge for investment banking and private equity technical rounds,
            QuantDrill gives you a structured, measurable way to build the reflexes you need.
          </p>

          <p>
            Most interview prep resources focus on frameworks and theory. QuantDrill focuses on
            <em style={{ color: 'rgba(196,181,253,0.9)' }}> execution speed</em>. The difference between a
            candidate who gets the offer and one who does not often comes down to how confidently and
            quickly they move through quantitative reasoning under time pressure. Our platform replicates
            that exact environment: timed questions, instant feedback, and progressive difficulty — all
            calibrated to the pace of a real interviewer or standardised test.
          </p>

          <h2
            className="font-grotesk font-bold"
            style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', color: '#fff', letterSpacing: '-0.02em', paddingTop: '0.5rem' }}
          >
            What we train
          </h2>

          <p>
            QuantDrill covers six core quantitative disciplines. <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Mental math</strong> builds
            your baseline arithmetic speed — additions, multiplications, and divisions without a
            calculator. <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Percentages &amp; growth</strong> covers the language of business
            cases: percentage changes, CAGR, and compound growth. <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Business math</strong> trains
            the applied numerics of consulting and finance, including margins, ratios, and break-even
            analysis. <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Market sizing</strong> develops structured estimation under
            ambiguity — a core skill tested in case interviews at McKinsey, BCG, and Bain.
            <strong style={{ color: 'rgba(255,255,255,0.8)' }}> GMAT Quant</strong> mirrors the problem types and time constraints of
            the GMAT Focus Edition, helping MBA applicants reach the 700+ benchmark consistently.
            Finally, <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Daily Drill</strong> mixes all categories into a single adaptive
            session — the fastest way to maintain a well-rounded quantitative edge.
          </p>

          <h2
            className="font-grotesk font-bold"
            style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', color: '#fff', letterSpacing: '-0.02em', paddingTop: '0.5rem' }}
          >
            How the platform works
          </h2>

          <p>
            Each session is fully timed and self-paced. You choose the category, difficulty level
            (easy, medium, or hard), session duration (2, 5, or 10 minutes), and pace mode. In
            <em style={{ color: 'rgba(196,181,253,0.9)' }}> Normal mode</em>, a soft per-question urgency indicator nudges you
            without enforcing a hard cutoff. In <em style={{ color: 'rgba(196,181,253,0.9)' }}> Fast-Paced mode</em>, the session
            timer runs at interview pace and questions rotate rapidly — no time to second-guess.
            Answers are validated instantly; correct responses advance automatically, incorrect ones
            reveal the right answer before moving on.
          </p>

          <p>
            After each session, QuantDrill calculates a composite score that weights accuracy,
            response speed, and difficulty. Your speed rating — from <em>Slow</em> all the way to
            <em> Lightning</em> — is benchmarked against a simulated distribution so you always
            know where you stand relative to the competition. Progress data, category breakdowns,
            streaks, and historical trends are available in the dashboard, giving you actionable
            insight into exactly where to focus your next training session.
          </p>

          <h2
            className="font-grotesk font-bold"
            style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', color: '#fff', letterSpacing: '-0.02em', paddingTop: '0.5rem' }}
          >
            Who uses QuantDrill
          </h2>

          <p>
            Our users include MBA candidates at top business schools, undergraduates recruiting for
            MBB and bulge-bracket IB, and working professionals preparing for lateral moves into
            strategy, consulting, and finance. QuantDrill is also used by GMAT and GRE test-takers
            targeting competitive quant percentiles, and by anyone who wants to keep their numerical
            reasoning sharp as a long-term professional habit. Short daily sessions — ten minutes or
            less — are enough to see measurable improvement in speed and accuracy within weeks.
          </p>

          <p>
            QuantDrill is free to start. Pro subscribers unlock unlimited daily drills, all six
            training categories, hard-mode questions, premium analytics, and more than 200 achievement
            badges that track long-term milestones across accuracy, speed, and consistency.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-12">
          <Link
            to="/"
            className="inline-block font-grotesk font-bold text-white no-underline no-select"
            style={{
              padding: '14px 36px',
              borderRadius: 14,
              fontSize: '0.95rem',
              background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
              boxShadow: '0 0 36px rgba(124,58,237,0.38)',
            }}
          >
            Start Training Free →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ padding: 'clamp(22px, 3vw, 36px) clamp(20px, 6vw, 96px)', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 80 }}
      >
        <span className="font-grotesk font-black text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Quant<span style={{ color: 'rgba(155,111,232,0.45)' }}>Drill</span>
        </span>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {[
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
            { label: 'About', href: '/about' },
          ].map(l => (
            <Link
              key={l.label}
              to={l.href}
              className="text-xs no-underline transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.28)' }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}