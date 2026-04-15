import { Link, NavLink, Outlet } from 'react-router-dom';

const primaryItems = [
  { to: '/admin/event-types', label: 'Event types', icon: '▢' },
  { to: '/admin/bookings', label: 'Bookings', icon: '◫' },
  { to: '/admin/availability', label: 'Availability', icon: '◷' },
  { to: '/admin/event-types', label: 'Teams', muted: true, icon: '◉' },
  { to: '/admin/event-types', label: 'Apps', muted: true, icon: '◧' },
  { to: '/admin/event-types', label: 'Routing', muted: true, icon: '↗' },
  { to: '/admin/event-types', label: 'Workflows', muted: true, icon: '⌁' },
  { to: '/admin/event-types', label: 'Insights', muted: true, icon: '◍' }
];

const footerItems = [
  { href: '/yashwanthpaladugula', label: 'View public page', icon: '↗', external: true },
  { href: '#', label: 'Copy public page link', icon: '⎘' },
  { href: '#', label: 'Refer and earn', icon: '◎' },
  { href: '#', label: 'Settings', icon: '⚙' }
];

export default function AdminLayout() {
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
          {primaryItems.map((item) => (
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
