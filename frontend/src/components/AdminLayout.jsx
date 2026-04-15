import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

const primaryItems = [
  { to: '/admin/event-types', label: 'Event types', icon: '▢' },
  { to: '/admin/bookings', label: 'Bookings', icon: '◫' },
  { to: '/admin/availability', label: 'Availability', icon: '◷' },
  { to: '/admin/teams', label: 'Teams', icon: '◉' },
  { to: '/admin/routing', label: 'Routing', icon: '↗' },
  { to: '/admin/event-types', label: 'Workflows', muted: true, icon: '⌁' }
];

const appItems = [
  { to: '/admin/apps', label: 'App store' },
  { to: '/admin/apps/installed', label: 'Installed apps' }
];

const insightItems = [
  { to: '/admin/insights/bookings', label: 'Bookings' },
  { to: '/admin/insights/routing', label: 'Routing' },
  { to: '/admin/insights/router-position', label: 'Router position' },
  { to: '/admin/insights/call-history', label: 'Call history' },
  { to: '/admin/insights/wrong-routing', label: 'Wrong routing' }
];

const footerItems = [
  { href: '/yashwanthpaladugula', label: 'View public page', icon: '↗', external: true },
  { href: '#', label: 'Copy public page link', icon: '⎘' },
  { href: '#', label: 'Refer and earn', icon: '◎' },
  { href: '#', label: 'Settings', icon: '⚙' }
];

export default function AdminLayout() {
  const location = useLocation();
  const appsPathActive = location.pathname.startsWith('/admin/apps');
  const insightsPathActive = location.pathname.startsWith('/admin/insights');
  const [appsExpanded, setAppsExpanded] = useState(appsPathActive);
  const [insightsExpanded, setInsightsExpanded] = useState(insightsPathActive);

  useEffect(() => {
    if (appsPathActive) {
      setAppsExpanded(true);
    }
  }, [appsPathActive]);

  useEffect(() => {
    if (insightsPathActive) {
      setInsightsExpanded(true);
    }
  }, [insightsPathActive]);

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="workspace-head">
          <div className="workspace-meta">
            <div className="workspace-avatar">YP</div>
            <div className="workspace-label">Yashwanth P...</div>
          </div>
          <button className="sidebar-search" type="button" aria-label="Search workspace">
            ⌕
          </button>
        </div>

        <nav className="sidebar-nav">
          {primaryItems.slice(0, 4).map((item) => (
            <NavLink
              key={`${item.label}-${item.to}`}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive && !item.muted ? 'sidebar-link-active' : ''} ${item.muted ? 'sidebar-link-muted' : ''}`
              }
            >
              <span className="sidebar-link-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="sidebar-group">
            <button
              type="button"
              className={`sidebar-link sidebar-group-toggle ${appsPathActive ? 'sidebar-link-active' : ''}`}
              onClick={() => setAppsExpanded((open) => !open)}
              aria-expanded={appsExpanded}
              aria-controls="apps-subnav"
            >
              <span className="sidebar-link-icon" aria-hidden="true">◧</span>
              <span>Apps</span>
              <span className="sidebar-group-caret" aria-hidden="true">{appsExpanded ? '▾' : '▸'}</span>
            </button>

            {appsExpanded && (
              <div id="apps-subnav" className="sidebar-subnav">
                {appItems.map((item) => (
                  <NavLink
                    key={`${item.label}-${item.to}`}
                    to={item.to}
                    end={item.to === '/admin/apps'}
                    className={({ isActive }) =>
                      `sidebar-sub-link ${isActive ? 'sidebar-sub-link-active' : ''}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {primaryItems.slice(4).map((item) => (
            <NavLink
              key={`${item.label}-${item.to}`}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive && !item.muted ? 'sidebar-link-active' : ''} ${item.muted ? 'sidebar-link-muted' : ''}`
              }
            >
              <span className="sidebar-link-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="sidebar-group">
            <button
              type="button"
              className={`sidebar-link sidebar-group-toggle ${insightsPathActive ? 'sidebar-link-active' : ''}`}
              onClick={() => setInsightsExpanded((open) => !open)}
              aria-expanded={insightsExpanded}
              aria-controls="insights-subnav"
            >
              <span className="sidebar-link-icon" aria-hidden="true">◍</span>
              <span>Insights</span>
              <span className="sidebar-group-caret" aria-hidden="true">{insightsExpanded ? '▾' : '▸'}</span>
            </button>

            {insightsExpanded && (
              <div id="insights-subnav" className="sidebar-subnav">
                {insightItems.map((item) => (
                  <NavLink
                    key={`${item.label}-${item.to}`}
                    to={item.to}
                    className={({ isActive }) =>
                      `sidebar-sub-link ${isActive ? 'sidebar-sub-link-active' : ''}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          {footerItems.map((item) => (
            item.external ? (
              <Link key={item.label} to={item.href} target="_blank" rel="noreferrer">
                <span className="sidebar-footer-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ) : (
              <a key={item.label} href={item.href}>
                <span className="sidebar-footer-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            )
          ))}
          <span className="sidebar-version">© 2026 Cal.com, Inc.</span>
        </div>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
