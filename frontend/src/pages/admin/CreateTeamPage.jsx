import { Link } from 'react-router-dom';

export default function CreateTeamPage() {
  return (
    <section className="create-team-page">
      <header className="create-team-head">Cal.com</header>

      <div className="create-team-shell">
        <div className="create-team-form-pane">
          <h1>Create your team</h1>
          <p>Add your team&apos;s name and create a unique URL for your team</p>

          <div className="create-team-logo-row">
            <div className="create-team-logo-avatar" aria-hidden="true">◉</div>
            <button type="button" className="create-team-upload-btn">Upload</button>
          </div>
          <span className="create-team-logo-hint">Recommended size 64x64px (max 5mb)</span>

          <label htmlFor="team-name">Team name</label>
          <input id="team-name" defaultValue="Acme Inc." />

          <label htmlFor="team-url">Team URL</label>
          <input id="team-url" defaultValue="cal.com/team/acme" />

          <label htmlFor="team-bio">Team bio</label>
          <textarea id="team-bio" rows={4} placeholder="Tell us about your team..." />

          <div className="create-team-actions">
            <Link to="/settings" className="create-team-cancel-btn">Cancel</Link>
            <button type="button" className="create-team-continue-btn">Continue</button>
          </div>
        </div>

        <div className="create-team-preview-pane" aria-hidden="true">
          <div className="create-team-browser-bar">app.cal.com/team/</div>
          <div className="create-team-preview-card">
            <h2>Your name</h2>
            <p>Add your bio here</p>
            <ul>
              <li>Demo - 15 mins</li>
              <li>Quick meeting - 15 mins</li>
              <li>Longer meeting - 30 mins</li>
              <li>In-person meeting - 120 mins</li>
              <li>Ask a question - 15 mins</li>
            </ul>
          </div>
        </div>
      </div>

      <footer className="create-team-foot">
        <span>•••</span>
        <button type="button">Sign out</button>
      </footer>
    </section>
  );
}
