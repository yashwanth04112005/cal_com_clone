import { Link } from 'react-router-dom';

const featureCards = [
  {
    title: 'Connect your calendar',
    text: 'We handle cross-referencing for all your connected calendars so double-booking does not happen.'
  },
  {
    title: 'Set your availability',
    text: 'Define day-wise windows, custom date overrides, and meeting buffers in a few clicks.'
  },
  {
    title: 'Choose how to meet',
    text: 'Offer video calls, phone calls, or in-person sessions from one booking experience.'
  }
];

const valuePoints = [
  'Avoid meeting overload with booking limits and buffers',
  'Create clean custom links for each event type',
  'Let bookers reschedule without back-and-forth emails',
  'Send reminders and confirmations automatically'
];

const integrations = [
  'Google Calendar',
  'Outlook',
  'Zoom',
  'Google Meet',
  'Stripe',
  'Teams'
];

export default function LandingPage() {
  return (
    <div className="marketing-shell">
      <header className="marketing-nav">
        <div className="brand">Cal Clone</div>
        <nav>
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#integrations">Integrations</a>
          <Link to="/admin/event-types" className="nav-ghost">Sign in</Link>
          <Link to="/book/intro-call" className="nav-solid">Get started</Link>
        </nav>
      </header>

      <section className="hero-wrap">
        <div className="hero-copy">
          <span className="hero-badge">Open scheduling platform</span>
          <h1>The better way to schedule your meetings</h1>
          <p>
            A customizable scheduling platform for individuals, modern teams, and products where people book people.
          </p>
          <div className="hero-actions">
            <Link to="/book/intro-call" className="hero-primary">Sign up with email</Link>
            <Link to="/book/product-demo" className="hero-secondary">Book a demo</Link>
          </div>
          <small>No credit card required</small>
        </div>

        <div className="hero-preview" aria-hidden="true">
          <div className="preview-card">
            <h3>Photography Session</h3>
            <p>Rock Wall Woods • South America/Rio de Janeiro</p>
            <div className="chips">
              <span>15m</span>
              <span>30m</span>
              <span>45m</span>
              <span>1h</span>
            </div>
          </div>
          <div className="preview-calendar">
            <div className="cal-head">May 2026</div>
            <div className="cal-grid">
              {Array.from({ length: 28 }).map((_, index) => (
                <span key={index}>{index + 1}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section-wrap">
        <p className="section-kicker">How it works</p>
        <h2>With us, appointment scheduling is easy</h2>
        <div className="feature-grid">
          {featureCards.map((card, idx) => (
            <article key={card.title} className="feature-item" style={{ animationDelay: `${idx * 0.08}s` }}>
              <span className="feature-number">0{idx + 1}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="section-wrap section-dark">
        <p className="section-kicker">Your all-purpose scheduling app</p>
        <h2>Smarter, simpler scheduling for every workflow</h2>
        <div className="value-list">
          {valuePoints.map((item) => (
            <article key={item}>
              <h3>{item}</h3>
              <p>
                Designed for modern teams that need precise control, clear links, and less operational scheduling noise.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="integrations" className="section-wrap">
        <p className="section-kicker">App store</p>
        <h2>All your key tools in sync with your meetings</h2>
        <div className="integration-row">
          {integrations.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
      </section>

      <footer className="marketing-footer">
        <div>
          <strong>Cal Clone</strong>
          <p>Built for your fullstack assignment and inspired by Cal.com UX patterns.</p>
        </div>
        <div className="footer-actions">
          <Link to="/book/intro-call" className="nav-solid">Start booking</Link>
          <Link to="/admin/event-types" className="nav-ghost">Open dashboard</Link>
        </div>
      </footer>
    </div>
  );
}
