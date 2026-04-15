const featuredCategories = [
  { name: 'Conferencing', apps: 27, glyph: '☁' },
  { name: 'Automation', apps: 22, glyph: '⌁' },
  { name: 'Analytics', apps: 11, glyph: '◫' },
  { name: 'Other', apps: 11, glyph: '△' },
  { name: 'Calendar', apps: 10, glyph: '◷' }
];

const popularApps = [
  {
    name: 'Google Calendar',
    tag: '31',
    description:
      'Google Calendar is a time management and scheduling service developed by Google. Create events, share calendars, and sync availability with your booking links.'
  },
  {
    name: 'Google Meet',
    tag: '◰',
    description:
      'Google Meet is Google\'s web-based conferencing platform for secure and reliable video calls, team meetings, and client sessions.'
  },
  {
    name: 'Zoom Video',
    tag: '◉',
    description:
      'Zoom supports one-to-one meetings, webinars, and collaboration rooms. Connect your booking workflow to create links automatically.'
  }
];

export default function AppStorePage() {
  return (
    <section className="panel app-store-panel">
      <header className="app-store-head">
        <div>
          <h1>App store</h1>
          <p>Connecting people, technology and the workplace.</p>
        </div>
        <div className="app-store-head-actions">
          <label className="app-store-search-wrap" htmlFor="apps-search-input">
            <span aria-hidden="true">⌕</span>
            <input id="apps-search-input" type="search" placeholder="Search" />
          </label>
        </div>
      </header>

      <section className="apps-section">
        <div className="apps-section-title-row">
          <h2>Featured categories</h2>
          <div className="apps-carousel-arrows" aria-hidden="true">
            <span>←</span>
            <span>→</span>
          </div>
        </div>

        <div className="app-category-grid">
          {featuredCategories.map((category) => (
            <article key={category.name} className="app-category-card">
              <span className="app-category-glyph" aria-hidden="true">{category.glyph}</span>
              <h3>{category.name}</h3>
              <p>{category.apps} apps →</p>
            </article>
          ))}
        </div>
      </section>

      <section className="apps-section">
        <div className="apps-section-title-row">
          <h2>Most popular</h2>
          <div className="apps-carousel-arrows" aria-hidden="true">
            <span>←</span>
            <span>→</span>
          </div>
        </div>

        <div className="app-popular-grid">
          {popularApps.map((app) => (
            <article key={app.name} className="app-popular-card">
              <div className="app-popular-icon" aria-hidden="true">{app.tag}</div>
              <h3>{app.name}</h3>
              <p>{app.description}</p>
              <button type="button" className="button-ghost app-details-btn">Details</button>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
