const quickstartCards = [
  {
    title: 'Share your link',
    description: 'Use your Cal.com link to drive traffic and track every click, lead, and referral.',
    glyph: '◧'
  },
  {
    title: 'Program resources',
    description: 'Access files, assets, and materials provided to support you wherever you share.',
    glyph: '◎'
  },
  {
    title: 'Receive earnings',
    description: 'Connect payouts to get rewarded for activity you drive with referral conversions.',
    glyph: '◫'
  }
];

const sectionTabs = ['Quickstart', 'Earnings', 'Links', 'Leaderboard', 'FAQ', 'Resources'];

export default function ReferEarnPage() {
  return (
    <section className="panel refer-panel">
      <div className="refer-hero-card">
        <div className="refer-link-block">
          <h2>Referral link</h2>
          <div className="refer-link-row">
            <select defaultValue="refer.cal.com/yashwanthpaladugula-jo58" aria-label="Referral link selector">
              <option>refer.cal.com/yashwanthpaladugula-jo58</option>
            </select>
            <button type="button" className="refer-copy-btn">⎘ Copy link</button>
          </div>

          <div className="refer-rewards-card">
            <div className="refer-rewards-head">
              <h3>Rewards</h3>
              <a href="#">View terms ↗</a>
            </div>

            <ul>
              <li>◫ 20% per sale for 1 year</li>
              <li>◎ New users get 20% off for 12 months</li>
            </ul>

            <p>$10 minimum payout amount · 30-day holding period</p>
          </div>
        </div>

        <div className="refer-brand-block" aria-hidden="true">
          <div className="refer-brand-tile">
            <span>Cal.com</span>
          </div>
          <span className="refer-powered-pill">Powered by dub</span>
        </div>
      </div>

      <div className="refer-metrics-grid">
        <article className="refer-metric-wide">
          <div className="refer-chart-placeholder" aria-hidden="true" />
          <h3>No activity yet</h3>
          <p>After your first click, your stats will show</p>
        </article>

        <article className="refer-metric-side">
          <div className="refer-metric-title-row">
            <h3>Earnings</h3>
            <button type="button">Settings</button>
          </div>
          <div className="refer-metric-list">
            <span>Upcoming</span>
            <strong>$0.00</strong>
            <span>Paid</span>
            <strong>$0.00</strong>
          </div>
        </article>
      </div>

      <nav className="refer-tabs" aria-label="Refer sections">
        {sectionTabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`refer-tab ${index === 0 ? 'refer-tab-active' : ''}`}
          >
            {tab}
          </button>
        ))}
        <button type="button" className="refer-menu-btn" aria-label="More sections">⋮</button>
      </nav>

      <div className="refer-quickstart-grid">
        {quickstartCards.map((card) => (
          <article key={card.title} className="refer-quickstart-card">
            <div className="refer-quickstart-visual" aria-hidden="true">{card.glyph}</div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
