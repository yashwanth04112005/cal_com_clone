export default function InstalledAppsPage() {
  return (
    <section className="panel app-store-panel">
      <header className="app-store-head">
        <div>
          <h1>Installed apps</h1>
          <p>Manage apps connected to your scheduling workspace.</p>
        </div>
      </header>

      <div className="installed-apps-empty">
        <h2>No apps installed yet</h2>
        <p>
          Install apps from the App store to connect calendars, video platforms, and automation tools.
        </p>
      </div>
    </section>
  );
}
