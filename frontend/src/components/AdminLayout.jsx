import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

const primaryItems = [
  { to: '/admin/event-types', label: 'Event types', icon: '▢' },
  { to: '/admin/bookings/upcoming', label: 'Bookings', icon: '◫' },
  { to: '/admin/availability', label: 'Availability', icon: '◷' },
  { to: '/admin/teams', label: 'Teams', icon: '◉' },
  { to: '/admin/routing', label: 'Routing', icon: '↗' },
  { to: '/admin/workflows', label: 'Workflows', icon: '⌁' }
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
  { href: '/admin/refer', label: 'Refer and earn', icon: '◎' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙' }
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const settingsRoot = location.pathname.startsWith('/settings') ? '/settings' : '/admin/settings';
  const appsPathActive = location.pathname.startsWith('/admin/apps');
  const insightsPathActive = location.pathname.startsWith('/admin/insights');
  const [appsExpanded, setAppsExpanded] = useState(appsPathActive);
  const [insightsExpanded, setInsightsExpanded] = useState(insightsPathActive);
  const [copiedPublicLink, setCopiedPublicLink] = useState(false);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const publicPagePath = '/yashwanthpaladugula';

  const handleCopyPublicLink = async () => {
    const publicUrl = `${window.location.origin}${publicPagePath}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(publicUrl);
      } else {
        const fallbackInput = document.createElement('textarea');
        fallbackInput.value = publicUrl;
        fallbackInput.setAttribute('readonly', '');
        fallbackInput.style.position = 'absolute';
        fallbackInput.style.left = '-9999px';
        document.body.appendChild(fallbackInput);
        fallbackInput.select();
        document.execCommand('copy');
        document.body.removeChild(fallbackInput);
      }

      setCopiedPublicLink(true);
      window.setTimeout(() => setCopiedPublicLink(false), 1800);
    } catch (error) {
      console.error('Failed to copy public page link:', error);
      setCopiedPublicLink(false);
    }
  };

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

  useEffect(() => {
    if (!openProfileMenu) {
      return;
    }

    const handleOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setOpenProfileMenu(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpenProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openProfileMenu]);

  const handleSignOut = () => {
    setOpenProfileMenu(false);
    try {
      window.localStorage.removeItem('bookings_meta_state_v1');
    } catch {
      // ignore localStorage errors
    }
    navigate('/');
  };

  const goToProfileSection = (pathSuffix) => {
    setOpenProfileMenu(false);
    navigate(`${settingsRoot}${pathSuffix}`);
  };

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="workspace-head" ref={profileMenuRef}>
          <button
            type="button"
            className="workspace-meta workspace-meta-button"
            onClick={() => setOpenProfileMenu((open) => !open)}
            aria-expanded={openProfileMenu}
            aria-haspopup="menu"
          >
            <div className="workspace-avatar-wrap">
              <div className="workspace-avatar">YP</div>
              <span className="workspace-online-dot" aria-hidden="true" />
            </div>
            <div className="workspace-label">Yashwanth P...</div>
            <span className={`workspace-meta-caret ${openProfileMenu ? 'workspace-meta-caret-open' : ''}`} aria-hidden="true">▾</span>
          </button>

          {openProfileMenu ? (
            <div className="profile-dropdown" role="menu" aria-label="Profile options">
              <button type="button" className="profile-dropdown-item" onClick={() => goToProfileSection('/my-account/profile')}>
                <span aria-hidden="true">◌</span>
                <span>My profile</span>
              </button>
              <button type="button" className="profile-dropdown-item" onClick={() => goToProfileSection('/my-account/general')}>
                <span aria-hidden="true">⚙</span>
                <span>My settings</span>
              </button>
              <button type="button" className="profile-dropdown-item" onClick={() => goToProfileSection('/my-account/out-of-office')}>
                <span aria-hidden="true">◔</span>
                <span>Out of office</span>
              </button>

              <div className="profile-dropdown-divider" />

              <a href="https://cal.com/help" target="_blank" rel="noreferrer" className="profile-dropdown-item" onClick={() => setOpenProfileMenu(false)}>
                <span aria-hidden="true">?</span>
                <span>Help</span>
              </a>
              <a href="https://cal.com/apps" target="_blank" rel="noreferrer" className="profile-dropdown-item profile-dropdown-item-split" onClick={() => setOpenProfileMenu(false)}>
                <span className="profile-dropdown-item-main">
                  <span aria-hidden="true">↓</span>
                  <span>Download app</span>
                </span>
                <span aria-hidden="true">▸</span>
              </a>

              <div className="profile-dropdown-divider" />

              <button type="button" className="profile-dropdown-item profile-dropdown-item-signout" onClick={handleSignOut}>
                <span aria-hidden="true">↪</span>
                <span>Sign out</span>
              </button>
            </div>
          ) : null}

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
          {footerItems.map((item, index) => (
            <Fragment key={item.label}>
              {item.external ? (
                <Link to={item.href} target="_blank" rel="noreferrer">
                  <span className="sidebar-footer-icon" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ) : (
                <Link to={item.href}>
                  <span className="sidebar-footer-icon" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )}

              {index === 0 ? (
                <button type="button" className="sidebar-footer-button" onClick={handleCopyPublicLink}>
                  <span className="sidebar-footer-icon" aria-hidden="true">⎘</span>
                  <span>{copiedPublicLink ? 'Copied public page link' : 'Copy public page link'}</span>
                </button>
              ) : null}
            </Fragment>
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
