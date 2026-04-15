import { Link, NavLink, Outlet } from 'react-router-dom';

const primaryItems = [
  { to: '/admin/event-types', label: 'Event types' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/availability', label: 'Availability' },
  { to: '/admin/event-types', label: 'Teams', muted: true },
  { to: '/admin/event-types', label: 'Apps', muted: true },
  { to: '/admin/event-types', label: 'Routing', muted: true },
  { to: '/admin/event-types', label: 'Workflows', muted: true },
  { to: '/admin/event-types', label: 'Insights', muted: true }
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
            Search
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
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/yashwanthpaladugula" target="_blank" rel="noreferrer">
            View public page
          </Link>
          <a href="#">Copy public page link</a>
          <a href="#">Refer and earn</a>
          <a href="#">Settings</a>
          <span className="sidebar-version">© 2026 Cal.com, Inc.</span>
        </div>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
