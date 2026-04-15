import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const settingsSections = [
  {
    title: 'Personal settings',
    items: [
      { name: 'Profile', description: 'Manage your profile details or delete your account', icon: '◉', path: '/my-account/profile' },
      { name: 'General', description: 'Manage language, timezone, and other preferences', icon: '⚙', path: '/my-account/general' },
      { name: 'Calendars', description: 'Connect and manage your calendar integrations', icon: '◷', path: '/my-account/calendars' },
      { name: 'Conferencing', description: 'Configure your video conferencing apps', icon: '◫', path: '/my-account/conferencing' },
      { name: 'Out of office', description: 'Set your away dates and redirect bookings', icon: '◧', path: '/my-account/out-of-office' },
      { name: 'Manage billing', description: 'View and manage your subscription and invoices', icon: '▭', path: '/billing' },
      { name: 'Plans', description: 'Compare plans and upgrade your subscription', icon: '◈', path: '/billing/plans' },
      { name: 'Appearance', description: 'Customize your booking page theme and branding', icon: '◇', path: '/my-account/appearance' },
      { name: 'Push notifications', description: 'Configure push notification preferences', icon: '◍', path: '/my-account/push-notifications' },
      { name: 'Features', description: 'Opt in to new and experimental features', icon: '⌁', path: '/my-account/features' }
    ]
  },
  {
    title: 'Security',
    items: [
      { name: 'Password', description: 'Update your password or sign-in method', icon: '◌', path: '/security/password' },
      { name: 'Impersonation', description: 'Allow support to sign in on your behalf', icon: '◎', path: '/security/impersonation' },
      { name: 'Two factor authentication', description: 'Add an extra layer of security to your account', icon: '▣', path: '/security/two-factor-authentication' },
      { name: 'Compliance', description: 'Manage data compliance and privacy settings', icon: '◍', path: '/security/compliance' }
    ]
  },
  {
    title: 'Developer',
    items: [
      { name: 'Webhooks', description: 'Subscribe to events and receive real-time notifications', icon: '↺', path: '/developer/webhooks' },
      { name: 'API keys', description: 'Create and manage your API keys', icon: '<>', path: '/developer/api-keys' },
      { name: 'OAuth Clients', description: 'Register and manage OAuth applications', icon: '◍', path: '/developer/oauth' }
    ]
  }
];

const leftNavGroups = [
  {
    title: 'Personal',
    items: [
      { label: 'Profile', path: '/my-account/profile' },
      { label: 'General', path: '/my-account/general' },
      { label: 'Calendars', path: '/my-account/calendars' },
      { label: 'Conferencing', path: '/my-account/conferencing' },
      { label: 'Appearance', path: '/my-account/appearance' },
      { label: 'Out of office', path: '/my-account/out-of-office' },
      { label: 'Push notifications', path: '/my-account/push-notifications' },
      { label: 'Features', path: '/my-account/features' }
    ]
  },
  {
    title: 'Security',
    items: [
      { label: 'Password', path: '/security/password' },
      { label: 'Impersonation', path: '/security/impersonation' },
      { label: 'Two factor authentication', path: '/security/two-factor-authentication' },
      { label: 'Compliance', path: '/security/compliance' }
    ]
  },
  {
    title: 'Billing',
    items: [
      { label: 'Manage billing', path: '/billing' },
      { label: 'Plans', path: '/billing/plans' }
    ]
  },
  {
    title: 'Developer',
    items: [
      { label: 'Webhooks', path: '/developer/webhooks' },
      { label: 'OAuth', path: '/developer/oauth' },
      { label: 'API keys', path: '/developer/api-keys' }
    ]
  }
];

function SettingCard({ name, description, icon, path, settingsRoot }) {
  return (
    <Link to={`${settingsRoot}${path}`} className="settings-card">
      <span className="settings-card-icon" aria-hidden="true">{icon}</span>
      <div>
        <h3>{name}</h3>
        <p>{description}</p>
      </div>
    </Link>
  );
}

export default function SettingsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchWrapRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [webhooks, setWebhooks] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [oauthClients, setOauthClients] = useState([]);
  const [createType, setCreateType] = useState(null);
  const [createName, setCreateName] = useState('');
  const [createValue, setCreateValue] = useState('');
  const [impersonationEnabled, setImpersonationEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const settingsRoot = location.pathname.startsWith('/settings') ? '/settings' : '/admin/settings';
  const isProfilePage = location.pathname.endsWith('/my-account/profile');
  const isGeneralPage = location.pathname.endsWith('/my-account/general');
  const isCalendarsPage = location.pathname.endsWith('/my-account/calendars');
  const isConferencingPage = location.pathname.endsWith('/my-account/conferencing');
  const isAppearancePage = location.pathname.endsWith('/my-account/appearance');
  const isOutOfOfficePage = location.pathname.endsWith('/my-account/out-of-office');
  const isPushNotificationsPage = location.pathname.endsWith('/my-account/push-notifications');
  const isFeaturesPage = location.pathname.endsWith('/my-account/features');
  const isPasswordPage = location.pathname.endsWith('/security/password');
  const isImpersonationPage = location.pathname.endsWith('/security/impersonation');
  const isTwoFactorPage = location.pathname.endsWith('/security/two-factor-authentication');
  const isCompliancePage = location.pathname.endsWith('/security/compliance');
  const isManageBillingPage = location.pathname.endsWith('/billing');
  const isPlansPage = location.pathname.endsWith('/billing/plans');
  const isWebhooksPage = location.pathname.endsWith('/developer/webhooks');
  const isOAuthPage = location.pathname.endsWith('/developer/oauth');
  const isApiKeysPage = location.pathname.endsWith('/developer/api-keys');
  const isTeamsPage = location.pathname.endsWith('/teams');
  const isOverviewPage =
    location.pathname === '/settings'
    || location.pathname === '/admin/settings'
    || location.pathname === '/settings/'
    || location.pathname === '/admin/settings/';

  const searchableItems = useMemo(
    () => settingsSections.flatMap((section) => section.items.map((item) => ({ ...item, sectionTitle: section.title }))),
    []
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    if (!normalizedSearch) {
      return settingsSections;
    }

    return settingsSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          const text = `${item.name} ${item.description} ${section.title}`.toLowerCase();
          return text.includes(normalizedSearch);
        })
      }))
      .filter((section) => section.items.length > 0);
  }, [normalizedSearch]);

  const searchResults = useMemo(() => {
    if (!normalizedSearch) {
      return [];
    }

    return searchableItems
      .filter((item) => {
        const text = `${item.name} ${item.description} ${item.sectionTitle}`.toLowerCase();
        return text.includes(normalizedSearch);
      })
      .slice(0, 8);
  }, [normalizedSearch, searchableItems]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  useEffect(() => {
    setSearchTerm('');
    setIsSearchOpen(false);
  }, [location.pathname]);

  const getItemHref = (item) => {
    if (item.path) {
      return `${settingsRoot}${item.path}`;
    }
    return `${settingsRoot}`;
  };

  const isItemActive = (item) => {
    if (item.path) {
      return location.pathname.endsWith(item.path);
    }
    return false;
  };

  const goToSearchResult = (path) => {
    navigate(`${settingsRoot}${path}`);
    setSearchTerm('');
    setIsSearchOpen(false);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter' && searchResults.length > 0) {
      event.preventDefault();
      goToSearchResult(searchResults[0].path);
    }

    if (event.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  const openCreateModal = (type) => {
    setCreateType(type);
    setCreateName('');
    setCreateValue('');
  };

  const closeCreateModal = () => {
    setCreateType(null);
    setCreateName('');
    setCreateValue('');
  };

  const handleCreateSubmit = (event) => {
    event.preventDefault();

    const trimmedName = createName.trim();
    const trimmedValue = createValue.trim();
    if (!trimmedName || !trimmedValue || !createType) {
      return;
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    if (createType === 'webhook') {
      setWebhooks((current) => [...current, { id, name: trimmedName, target: trimmedValue }]);
    }

    if (createType === 'apiKey') {
      setApiKeys((current) => [...current, { id, name: trimmedName, token: `cal_${Math.random().toString(36).slice(2, 14)}` }]);
    }

    if (createType === 'oauth') {
      setOauthClients((current) => [...current, { id, name: trimmedName, redirectUri: trimmedValue }]);
    }

    closeCreateModal();
  };

  return (
    <div className="settings-shell">
      <aside className="settings-sidebar">
        <Link to="/admin/event-types" className="settings-back-link">← Back</Link>

        <Link to={settingsRoot} className={`settings-overview-link ${isOverviewPage ? 'settings-left-active' : ''}`}>
          Overview
        </Link>

        <div className="settings-user-chip">Yashwanth Paladugula</div>

        {leftNavGroups.map((group) => (
          <section key={group.title} className="settings-nav-group">
            <h2>{group.title}</h2>
            <div>
              {group.items.map((item) => (
                <Link
                  key={item.label}
                  to={getItemHref(item)}
                  className={isItemActive(item) ? 'settings-left-active' : ''}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </section>
        ))}

        <Link to={`${settingsRoot}/teams`} className={`settings-teams-link ${isTeamsPage ? 'settings-left-active' : ''}`}>
          ◍ My teams
        </Link>
        <Link to={`${settingsRoot}/teams/new`} className="settings-add-team-btn">+ Add a team</Link>
      </aside>

      <main className="settings-main">
        {isProfilePage ? (
          <section className="settings-profile-view">
            <header className="settings-profile-head">
              <h1>Profile</h1>
              <p>Manage settings for your Cal.com profile</p>
            </header>

            <article className="settings-profile-card">
              <div className="settings-avatar-row">
                <div className="settings-avatar-dot">YP</div>
                <div className="settings-avatar-text">
                  <strong>Profile picture</strong>
                  <div>
                    <button type="button">Upload avatar</button>
                    <button type="button">Remove</button>
                  </div>
                </div>
              </div>

              <div className="settings-form-row">
                <label htmlFor="settings-username">Username</label>
                <div className="settings-username-wrap">
                  <span>cal.com/</span>
                  <input id="settings-username" defaultValue="yashwanthpaladugula" />
                </div>
              </div>

              <div className="settings-form-row">
                <label htmlFor="settings-fullname">Full name</label>
                <input id="settings-fullname" defaultValue="Yashwanth Paladugula" />
              </div>

              <div className="settings-form-row">
                <label htmlFor="settings-email">Email</label>
                <div className="settings-email-wrap">
                  <input id="settings-email" defaultValue="paladugulayashwanth2005@gmail.com" />
                  <span>Primary</span>
                </div>
                <button type="button" className="settings-inline-btn">+ Add email</button>
              </div>

              <div className="settings-form-row">
                <label htmlFor="settings-about">About</label>
                <textarea id="settings-about" rows={6} defaultValue="" />
              </div>

              <div className="settings-form-row settings-connected-row">
                <label>Connected accounts</label>
                <div className="settings-connected-line">
                  <span>Google</span>
                  <button type="button" className="settings-disconnect-btn">Disconnect</button>
                </div>
              </div>

              <div className="settings-card-actions">
                <button type="button">Update</button>
              </div>
            </article>

            <article className="settings-danger-card">
              <h2>Danger zone</h2>
              <p>Be careful. Account deletion cannot be undone.</p>
              <div>
                <button type="button">Delete account</button>
              </div>
            </article>
          </section>
        ) : isGeneralPage ? (
          <section className="settings-profile-view settings-general-view">
            <header className="settings-profile-head">
              <h1>General</h1>
              <p>Manage settings for your language and timezone</p>
            </header>

            <article className="settings-profile-card settings-general-card">
              <div className="settings-form-row">
                <label htmlFor="settings-language">Language</label>
                <select id="settings-language" defaultValue="English">
                  <option>English</option>
                </select>
              </div>

              <div className="settings-form-row">
                <label htmlFor="settings-timezone">Timezone</label>
                <div className="settings-general-inline-row">
                  <select id="settings-timezone" defaultValue="Asia/Calcutta">
                    <option>Asia/Calcutta</option>
                  </select>
                  <button type="button" className="settings-inline-btn settings-inline-btn-secondary">◷ Schedule timezone change</button>
                </div>
              </div>

              <div className="settings-general-two-col">
                <div className="settings-form-row settings-general-subrow">
                  <label htmlFor="settings-time-format">Time format</label>
                  <select id="settings-time-format" defaultValue="12-hour">
                    <option>12-hour</option>
                    <option>24-hour</option>
                  </select>
                </div>

                <div className="settings-form-row settings-general-subrow">
                  <label htmlFor="settings-start-week">Start of week</label>
                  <select id="settings-start-week" defaultValue="Sunday">
                    <option>Sunday</option>
                    <option>Monday</option>
                  </select>
                </div>
              </div>

              <p className="settings-general-note">
                This is an internal setting and will not affect how times are displayed on your public booking pages.
              </p>

              <div className="settings-card-actions">
                <button type="button">Update</button>
              </div>
            </article>

            <article className="settings-toggle-card">
              <div>
                <h2>Dynamic group links</h2>
                <p>Allow attendees to book you through dynamic group bookings</p>
              </div>
              <label className="settings-switch" aria-label="Dynamic group links toggle">
                <input type="checkbox" />
                <span />
              </label>
            </article>

            <article className="settings-toggle-card">
              <div>
                <h2>Allow search engine indexing</h2>
                <p>Allow search engines to access your public content</p>
              </div>
              <label className="settings-switch" aria-label="Allow search engine indexing toggle">
                <input type="checkbox" />
                <span />
              </label>
            </article>

            <article className="settings-toggle-card">
              <div>
                <h2>Monthly digest email</h2>
                <p>Monthly digest email for teams</p>
              </div>
              <label className="settings-switch" aria-label="Monthly digest email toggle">
                <input type="checkbox" />
                <span />
              </label>
            </article>

            <article className="settings-toggle-card">
              <div>
                <h2>Prevent impersonation on bookings</h2>
                <p>When enabled, anyone trying to book events using your email must verify they own it.</p>
              </div>
              <label className="settings-switch" aria-label="Prevent impersonation on bookings toggle">
                <input type="checkbox" />
                <span />
              </label>
            </article>
          </section>
        ) : isApiKeysPage ? (
          <section className="settings-profile-view settings-webhooks-view">
            <header className="settings-profile-head">
              <h1>API keys</h1>
              <p>API keys allow other apps to communicate with Cal.com</p>
            </header>

            <article className="settings-profile-card settings-webhooks-card">
              {apiKeys.length > 0 ? (
                <div className="settings-resource-list">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="settings-resource-row">
                      <div>
                        <strong>{apiKey.name}</strong>
                        <p>{apiKey.token}</p>
                      </div>
                    </div>
                  ))}
                  <div className="settings-resource-actions">
                    <button type="button" className="settings-calendars-add-btn" onClick={() => openCreateModal('apiKey')}>+ New</button>
                  </div>
                </div>
              ) : (
                <div className="settings-webhooks-empty">
                  <div className="settings-webhooks-empty-icon" aria-hidden="true">🔗</div>
                  <h2>Create your first API key</h2>
                  <p>
                    API keys allow other apps to communicate with Cal.com
                  </p>
                  <button type="button" className="settings-calendars-add-btn" onClick={() => openCreateModal('apiKey')}>+ New</button>
                </div>
              )}
            </article>
          </section>
        ) : isOAuthPage ? (
          <section className="settings-profile-view settings-webhooks-view">
            <header className="settings-profile-head">
              <h1>OAuth Clients</h1>
              <p>Create and manage OAuth clients for third-party integrations</p>
            </header>

            <article className="settings-profile-card settings-webhooks-card">
              {oauthClients.length > 0 ? (
                <div className="settings-resource-list">
                  {oauthClients.map((client) => (
                    <div key={client.id} className="settings-resource-row">
                      <div>
                        <strong>{client.name}</strong>
                        <p>{client.redirectUri}</p>
                      </div>
                    </div>
                  ))}
                  <div className="settings-resource-actions">
                    <button type="button" className="settings-calendars-add-btn" onClick={() => openCreateModal('oauth')}>+ New</button>
                  </div>
                </div>
              ) : (
                <div className="settings-webhooks-empty">
                  <div className="settings-webhooks-empty-icon" aria-hidden="true">◎</div>
                  <h2>No OAuth Clients</h2>
                  <p>
                    You haven&apos;t created any OAuth clients yet. Create one to get started.
                  </p>
                  <button type="button" className="settings-calendars-add-btn" onClick={() => openCreateModal('oauth')}>+ New</button>
                </div>
              )}
            </article>
          </section>
        ) : isWebhooksPage ? (
          <section className="settings-profile-view settings-webhooks-view">
            <header className="settings-profile-head">
              <h1>Webhooks</h1>
              <p>Receive meeting data in real-time when something happens in Cal.com</p>
            </header>

            <article className="settings-profile-card settings-webhooks-card">
              {webhooks.length > 0 ? (
                <div className="settings-resource-list">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="settings-resource-row">
                      <div>
                        <strong>{webhook.name}</strong>
                        <p>{webhook.target}</p>
                      </div>
                    </div>
                  ))}
                  <div className="settings-resource-actions">
                    <button type="button" className="settings-calendars-add-btn" onClick={() => openCreateModal('webhook')}>+ New</button>
                  </div>
                </div>
              ) : (
                <div className="settings-webhooks-empty">
                  <div className="settings-webhooks-empty-icon" aria-hidden="true">↺</div>
                  <h2>Create your first webhook</h2>
                  <p>
                    With Webhooks you can receive meeting data in real-time when something happens in Cal.com.
                  </p>
                  <button type="button" className="settings-calendars-add-btn" onClick={() => openCreateModal('webhook')}>+ New</button>
                </div>
              )}
            </article>
          </section>
        ) : isTeamsPage ? (
          <section className="settings-profile-view settings-webhooks-view">
            <header className="settings-profile-head">
              <h1>My teams</h1>
              <p>Manage teams you belong to and create new ones</p>
            </header>

            <article className="settings-profile-card settings-webhooks-card">
              <div className="settings-webhooks-empty">
                <div className="settings-webhooks-empty-icon" aria-hidden="true">◍</div>
                <h2>No teams yet</h2>
                <p>
                  Create your first team to schedule collectively and manage teammates.
                </p>
                <Link to={`${settingsRoot}/teams/new`} className="settings-calendars-add-btn settings-link-btn">+ Add a team</Link>
              </div>
            </article>
          </section>
        ) : isPlansPage ? (
          <section className="settings-profile-view settings-plans-view">
            <header className="settings-profile-head">
              <h1>Plans</h1>
              <p>Designed for every stage of your journey. If you couldn&apos;t find something, message us</p>
            </header>

            <article className="settings-profile-card settings-plans-card">
              <div className="settings-calendars-section-head">
                <h2>Current plan</h2>
              </div>

              <div className="settings-plans-current-block">
                <strong>Individual</strong>
                <p>Free</p>
              </div>
            </article>

            <article className="settings-profile-card settings-plans-card">
              <div className="settings-calendars-section-head settings-calendars-section-head-row">
                <div>
                  <h2>Compare plans</h2>
                  <p>Find the right plan for you</p>
                </div>

                <div className="settings-feature-mode">
                  <button type="button">Monthly</button>
                  <button type="button" className="settings-feature-mode-active">Annual -25%</button>
                </div>
              </div>

              <div className="settings-plans-grid">
                <article className="settings-plan-tier">
                  <h3>Team</h3>
                  <p className="settings-plan-price">$12</p>
                  <span className="settings-plan-cycle">per month/user, billed annually</span>
                  <button type="button" className="settings-plan-btn settings-plan-btn-primary">◉ Upgrade to Teams</button>
                  <span className="settings-plan-label">For growing teams</span>
                  <ul>
                    <li>✓ 1 team</li>
                    <li>✓ Schedule meetings as a team</li>
                    <li>✓ Round-robin, fixed round-robin</li>
                    <li>✓ Collective events</li>
                    <li>✓ Routing forms</li>
                    <li>✓ Teams workflows</li>
                    <li>✓ Remove branding</li>
                    <li>✓ Same day email, chat support</li>
                  </ul>
                </article>

                <article className="settings-plan-tier settings-plan-tier-mid">
                  <h3>Organization</h3>
                  <p className="settings-plan-price">$28</p>
                  <span className="settings-plan-cycle">per month/user, billed annually</span>
                  <button type="button" className="settings-plan-btn">◉ Upgrade</button>
                  <span className="settings-plan-label">For scaling organizations</span>
                  <ul>
                    <li>✓ Unlimited teams</li>
                    <li>✓ Organization workflows</li>
                    <li>✓ company.cal.com subdomain</li>
                    <li>✓ SOC2, HIPAA, ISO 27001</li>
                    <li>✓ SAML SSO</li>
                    <li>✓ Instant meetings</li>
                    <li>✓ Domain-wide delegation</li>
                    <li>✓ Member attributes</li>
                    <li>✓ Attribute-based routing</li>
                  </ul>
                </article>

                <article className="settings-plan-tier">
                  <h3>Enterprise</h3>
                  <p className="settings-plan-price">Custom</p>
                  <span className="settings-plan-cycle">&nbsp;</span>
                  <button type="button" className="settings-plan-btn">◉ Get in touch</button>
                  <span className="settings-plan-label">For large enterprises</span>
                  <ul>
                    <li>✓ Dedicated Database</li>
                    <li>✓ Organization workflows</li>
                    <li>✓ Cal.ai phone agents</li>
                    <li>✓ Active directory sync</li>
                    <li>✓ Dedicated onboarding and engineering support</li>
                    <li>✓ Enterprise-level support</li>
                    <li>✓ 99% uptime SLA</li>
                    <li>✓ 24/7 real-time Slack Connect</li>
                  </ul>
                </article>
              </div>
            </article>
          </section>
        ) : isManageBillingPage ? (
          <section className="settings-profile-view settings-billing-view">
            <header className="settings-profile-head">
              <h1>Billing</h1>
              <p>Manage all things billing</p>
            </header>

            <article className="settings-profile-card settings-billing-card">
              <div className="settings-billing-row settings-billing-row-top">
                <div>
                  <h2>Manage billing</h2>
                  <p>View and manage your billing details</p>
                </div>
                <button type="button" className="settings-billing-portal-btn">Billing portal ↗</button>
              </div>

              <div className="settings-billing-help-row">
                <span>Need help?</span>
                <button type="button" className="settings-inline-btn settings-inline-btn-secondary">Contact support</button>
              </div>
            </article>

            <article className="settings-profile-card settings-billing-card">
              <div className="settings-calendars-section-head">
                <h2>Credits</h2>
                <p>View and manage credits for sending SMS messages</p>
              </div>

              <div className="settings-billing-row">
                <div className="settings-billing-credits-main">
                  <label htmlFor="settings-additional-credits">Additional credits</label>
                  <div className="settings-billing-credits-input-row">
                    <input id="settings-additional-credits" type="number" defaultValue="50" />
                    <span>Credits</span>
                    <button type="button" className="settings-inline-btn settings-inline-btn-secondary">Buy</button>
                  </div>
                  <p>One credit is worth 1c (USD). Learn more</p>
                </div>
                <div className="settings-billing-balance">Current balance: <strong>0</strong></div>
              </div>

              <div className="settings-billing-row settings-billing-row-last">
                <div className="settings-billing-credits-main">
                  <label htmlFor="settings-expense-log-month">Download Expense Log</label>
                  <div className="settings-billing-credits-input-row">
                    <select id="settings-expense-log-month" defaultValue="April 2026">
                      <option>April 2026</option>
                      <option>March 2026</option>
                    </select>
                    <button type="button" className="settings-inline-btn settings-inline-btn-secondary">Download</button>
                  </div>
                </div>
              </div>
            </article>
          </section>
        ) : isImpersonationPage ? (
          <section className="settings-profile-view settings-password-view">
            <header className="settings-profile-head">
              <h1>Impersonation</h1>
              <p>Allow support to sign in on your behalf</p>
            </header>

            <article className="settings-profile-card settings-password-card">
              <h2>Impersonation controls</h2>
              <p>
                Enable this setting to let authorized support staff temporarily access your account
                for troubleshooting.
              </p>
              <label className="settings-switch settings-password-switch" aria-label="Enable impersonation">
                <input
                  type="checkbox"
                  checked={impersonationEnabled}
                  onChange={(event) => setImpersonationEnabled(event.target.checked)}
                />
                <span />
              </label>
              <p>{impersonationEnabled ? 'Impersonation is enabled' : 'Impersonation is disabled'}</p>
            </article>
          </section>
        ) : isTwoFactorPage ? (
          <section className="settings-profile-view settings-password-view">
            <header className="settings-profile-head">
              <h1>Two factor authentication</h1>
              <p>Add an extra layer of security to your account</p>
            </header>

            <article className="settings-profile-card settings-password-card">
              <h2>Protect your account</h2>
              <p>
                Set up two factor authentication so only you can sign in, even if your password is
                compromised.
              </p>
              <label className="settings-switch settings-password-switch" aria-label="Enable two factor authentication">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(event) => setTwoFactorEnabled(event.target.checked)}
                />
                <span />
              </label>
              <p>{twoFactorEnabled ? 'Two factor authentication is enabled' : 'Two factor authentication is disabled'}</p>
            </article>
          </section>
        ) : isCompliancePage ? (
          <section className="settings-profile-view settings-compliance-view">
            <header className="settings-profile-head">
              <h1>Compliance</h1>
              <p>Access compliance documents, certifications, and data protection agreements</p>
            </header>

            <article className="settings-profile-card settings-compliance-card">
              <div className="settings-calendars-section-head">
                <h2>Data privacy</h2>
              </div>

              <div className="settings-compliance-item-row">
                <div className="settings-compliance-item-main">
                  <span className="settings-compliance-item-icon" aria-hidden="true">◫</span>
                  <div>
                    <strong>Data Protection Agreement</strong>
                    <p>Sign our Data Processing Agreement for GDPR compliance</p>
                  </div>
                </div>
                <button type="button" className="settings-compliance-action">⇩ Download</button>
              </div>
            </article>

            <article className="settings-profile-card settings-compliance-card">
              <div className="settings-calendars-section-head">
                <h2>Compliance reports</h2>
              </div>

              <div className="settings-compliance-item-row">
                <div className="settings-compliance-item-main">
                  <span className="settings-compliance-item-icon" aria-hidden="true">◫</span>
                  <div>
                    <strong>SOC 2 Type II report</strong>
                    <p>System and Organization Controls report for security and availability</p>
                  </div>
                </div>
                <button type="button" className="settings-compliance-action">▣ Upgrade to access</button>
              </div>

              <div className="settings-compliance-item-row settings-compliance-item-row-last">
                <div className="settings-compliance-item-main">
                  <span className="settings-compliance-item-icon" aria-hidden="true">◫</span>
                  <div>
                    <strong>ISO 27001 Certification</strong>
                    <p>Information security management system certification</p>
                  </div>
                </div>
                <button type="button" className="settings-compliance-action">▣ Upgrade to access</button>
              </div>
            </article>

            <article className="settings-profile-card settings-compliance-card">
              <div className="settings-calendars-section-head">
                <h2>Other documents</h2>
              </div>

              <div className="settings-compliance-item-row settings-compliance-item-row-last">
                <div className="settings-compliance-item-main">
                  <span className="settings-compliance-item-icon" aria-hidden="true">◫</span>
                  <div>
                    <strong>Penetration test report</strong>
                    <p>Latest security penetration test results and findings</p>
                  </div>
                </div>
                <button type="button" className="settings-compliance-action">▣ Upgrade to access</button>
              </div>
            </article>
          </section>
        ) : isPasswordPage ? (
          <section className="settings-profile-view settings-password-view">
            <header className="settings-profile-head">
              <h1>Password</h1>
              <p>Manage settings for your account passwords</p>
            </header>

            <article className="settings-profile-card settings-password-card">
              <h2>Your account is managed by GOOGLE</h2>
              <p>
                To change your email, password, enable two-factor authentication and more, please visit
                your GOOGLE account settings.
              </p>
              <button type="button" className="settings-password-btn">Create account password</button>
            </article>
          </section>
        ) : isFeaturesPage ? (
          <section className="settings-profile-view settings-features-view">
            <header className="settings-profile-head">
              <h1>Features</h1>
              <p>Manage experimental features for your account</p>
            </header>

            <article className="settings-profile-card settings-features-card">
              <div>
                <h2>Enhanced bookings</h2>
                <p>A redesigned booking page including a calendar view.</p>
              </div>

              <div className="settings-feature-mode">
                <button type="button">Off</button>
                <button type="button" className="settings-feature-mode-active">On</button>
                <button type="button">Use default</button>
              </div>
            </article>

            <article className="settings-profile-card settings-features-card">
              <div>
                <h2>Automatically opt-in for future experimental features</h2>
                <p>Automatically opt into new experimental features, unless disabled by your team or organization</p>
              </div>

              <label className="settings-switch" aria-label="Automatic experimental features toggle">
                <input type="checkbox" />
                <span />
              </label>
            </article>
          </section>
        ) : isPushNotificationsPage ? (
          <section className="settings-profile-view settings-push-view">
            <header className="settings-profile-head">
              <h1>Push notifications</h1>
              <p>Receive push notifications when booker submits instant meeting booking.</p>
            </header>

            <article className="settings-profile-card settings-push-card">
              <div>
                <h2>Browser notifications</h2>
                <p>Manage whether this browser receives booking alerts.</p>
              </div>
              <button type="button" className="settings-push-allow-btn">Allow browser notifications</button>
            </article>
          </section>
        ) : isOutOfOfficePage ? (
          <section className="settings-profile-view settings-ooo-view">
            <article className="settings-profile-card settings-ooo-card">
              <div className="settings-calendars-section-head settings-calendars-section-head-row settings-ooo-top-row">
                <div>
                  <h2>Out of office</h2>
                  <p>Let your bookers know when you&apos;re OOO.</p>
                </div>
                <div className="settings-ooo-top-actions">
                  <div className="settings-ooo-tabs" role="tablist" aria-label="Out of office scope">
                    <button type="button" className="settings-ooo-tab settings-ooo-tab-active">My OOO</button>
                    <button type="button" className="settings-ooo-tab">Team OOO</button>
                    <button type="button" className="settings-ooo-tab">Holidays</button>
                  </div>
                  <button type="button" className="settings-calendars-add-btn">+ Add</button>
                </div>
              </div>

              <div className="settings-ooo-toolbar">
                <div className="settings-ooo-toolbar-left">
                  <label className="settings-ooo-search-wrap" htmlFor="settings-ooo-search">
                    <span aria-hidden="true">⌕</span>
                    <input id="settings-ooo-search" type="search" placeholder="Search" />
                  </label>
                  <button type="button" className="settings-inline-btn settings-inline-btn-secondary">☰ Filter</button>
                </div>

                <div className="settings-ooo-toolbar-right">
                  <button type="button" className="settings-inline-btn settings-ooo-save-btn">⎙ Save</button>
                  <button type="button" className="settings-inline-btn settings-inline-btn-secondary">☰ Saved filters ▾</button>
                </div>
              </div>

              <div className="settings-ooo-empty">
                <div className="settings-ooo-empty-icon" aria-hidden="true">↻</div>
                <h3>Create an OOO</h3>
                <p>
                  Communicate to your bookers when you&apos;re not available to take bookings. They can still
                  book you upon your return or you can forward them to a team member.
                </p>
                <button type="button" className="settings-calendars-add-btn">+ Add</button>
              </div>
            </article>
          </section>
        ) : isAppearancePage ? (
          <section className="settings-profile-view settings-appearance-view">
            <header className="settings-profile-head">
              <h1>Appearance</h1>
              <p>Manage settings for your booking appearance</p>
            </header>

            <article className="settings-profile-card settings-appearance-card">
              <div className="settings-calendars-section-head">
                <h2>Dashboard theme</h2>
                <p>This only applies to your logged in dashboard</p>
              </div>

              <div className="settings-theme-options">
                <label className="settings-theme-option settings-theme-option-active">
                  <input type="radio" name="dashboard-theme" defaultChecked />
                  <span className="settings-theme-preview settings-theme-preview-system" aria-hidden="true" />
                  <strong>System default</strong>
                </label>

                <label className="settings-theme-option">
                  <input type="radio" name="dashboard-theme" />
                  <span className="settings-theme-preview settings-theme-preview-light" aria-hidden="true" />
                  <strong>Light</strong>
                </label>

                <label className="settings-theme-option">
                  <input type="radio" name="dashboard-theme" />
                  <span className="settings-theme-preview settings-theme-preview-dark" aria-hidden="true" />
                  <strong>Dark</strong>
                </label>
              </div>

              <div className="settings-card-actions">
                <button type="button">Update</button>
              </div>
            </article>

            <article className="settings-profile-card settings-appearance-card">
              <div className="settings-calendars-section-head">
                <h2>Booking page theme</h2>
                <p>This only applies to your public booking pages</p>
              </div>

              <div className="settings-theme-options">
                <label className="settings-theme-option settings-theme-option-active">
                  <input type="radio" name="booking-theme" defaultChecked />
                  <span className="settings-theme-preview settings-theme-preview-system" aria-hidden="true" />
                  <strong>System default</strong>
                </label>

                <label className="settings-theme-option">
                  <input type="radio" name="booking-theme" />
                  <span className="settings-theme-preview settings-theme-preview-light" aria-hidden="true" />
                  <strong>Light</strong>
                </label>

                <label className="settings-theme-option">
                  <input type="radio" name="booking-theme" />
                  <span className="settings-theme-preview settings-theme-preview-dark" aria-hidden="true" />
                  <strong>Dark</strong>
                </label>
              </div>

              <div className="settings-card-actions">
                <button type="button">Update</button>
              </div>
            </article>

            <article className="settings-profile-card settings-appearance-card">
              <div className="settings-calendars-section-head">
                <h2>Booking layout</h2>
                <p>
                  You can select multiple and bookers can switch views. This can be overridden on a per event basis.
                </p>
              </div>

              <div className="settings-layout-options">
                <label className="settings-layout-pill">
                  <input type="checkbox" defaultChecked />
                  <span>Month view</span>
                </label>
                <label className="settings-layout-pill">
                  <input type="checkbox" defaultChecked />
                  <span>Column view</span>
                </label>
              </div>

              <div className="settings-card-actions">
                <button type="button">Update</button>
              </div>
            </article>
          </section>
        ) : isConferencingPage ? (
          <section className="settings-profile-view settings-conferencing-view">
            <article className="settings-profile-card settings-conferencing-card">
              <div className="settings-calendars-section-head settings-calendars-section-head-row">
                <div>
                  <h2>Conferencing</h2>
                  <p>Add your favourite video conferencing apps for your meetings</p>
                </div>
                <button type="button" className="settings-inline-btn settings-inline-btn-secondary">+ Add</button>
              </div>

              <div className="settings-conferencing-row">
                <div className="settings-conferencing-main">
                  <span className="settings-conferencing-icon" aria-hidden="true">◉</span>
                  <div>
                    <h3>
                      Cal Video
                      <span className="settings-conferencing-default">Default</span>
                    </h3>
                    <p>
                      Cal Video is the in-house web-based video conferencing platform powered by Daily.co,
                      which is minimalistic and lightweight, but has most of the features you need.
                    </p>
                  </div>
                </div>
                <button type="button" className="settings-cal-provider-menu" aria-label="Cal Video actions">...</button>
              </div>

              <div className="settings-conferencing-row settings-conferencing-row-last">
                <div className="settings-conferencing-main">
                  <span className="settings-conferencing-icon settings-conferencing-icon-google" aria-hidden="true">◧</span>
                  <div>
                    <h3>Google Meet</h3>
                    <p>
                      Google Meet is Google&apos;s web-based video conferencing platform, designed to compete with
                      major conferencing platforms.
                    </p>
                  </div>
                </div>
                <button type="button" className="settings-cal-provider-menu" aria-label="Google Meet actions">...</button>
              </div>
            </article>
          </section>
        ) : isCalendarsPage ? (
          <section className="settings-profile-view settings-calendars-view">
            <header className="settings-profile-head settings-calendars-head">
              <div>
                <h1>Calendars</h1>
                <p>Configure how your event types interact with your calendars</p>
              </div>
              <button type="button" className="settings-calendars-add-btn">+ Add calendar</button>
            </header>

            <article className="settings-profile-card settings-calendars-card">
              <div className="settings-calendars-section-head">
                <h2>Add to calendar</h2>
                <p>Select where to add events when you&apos;re booked.</p>
              </div>

              <div className="settings-form-row">
                <label htmlFor="settings-events-to">Add events to</label>
                <select id="settings-events-to" defaultValue="paladugulayashwanth2005@gmail.com (Google - paladugulayashwanth2005@gmail.com)">
                  <option>paladugulayashwanth2005@gmail.com (Google - paladugulayashwanth2005@gmail.com)</option>
                </select>
                <p className="settings-general-note settings-note-plain">
                  You can override this on a per-event basis in the advanced settings in each event type.
                </p>
              </div>

              <div className="settings-form-row settings-form-row-last">
                <label htmlFor="settings-default-reminders">Default reminder</label>
                <p className="settings-general-note settings-note-plain">
                  Set the default reminder time for events added to your Google Calendar.
                </p>
                <select id="settings-default-reminders" defaultValue="Use default reminders">
                  <option>Use default reminders</option>
                  <option>No reminders</option>
                </select>
              </div>
            </article>

            <article className="settings-profile-card settings-calendars-card">
              <div className="settings-calendars-section-head settings-calendars-section-head-row">
                <div>
                  <h2>Check for conflicts</h2>
                  <p>Select which calendars you want to check for conflicts to prevent double bookings.</p>
                </div>
                <button type="button" className="settings-inline-btn settings-inline-btn-secondary">+ Add</button>
              </div>

              <div className="settings-cal-provider-row">
                <div className="settings-cal-provider-info">
                  <span className="settings-cal-provider-icon" aria-hidden="true">31</span>
                  <div>
                    <strong>Google Calendar</strong>
                    <p>paladugulayashwanth2005@gmail.com</p>
                  </div>
                </div>
                <button type="button" className="settings-cal-provider-menu" aria-label="Calendar actions">...</button>
              </div>

              <div className="settings-cal-toggle-list">
                <p className="settings-general-note settings-note-plain">
                  Toggle the calendars you want to check for conflicts to prevent double bookings.
                </p>

                <div className="settings-cal-toggle-row">
                  <label className="settings-switch" aria-label="Primary calendar toggle">
                    <input type="checkbox" defaultChecked />
                    <span />
                  </label>
                  <strong>paladugulayashwanth2005@gmail.com</strong>
                </div>

                <div className="settings-cal-toggle-row">
                  <label className="settings-switch" aria-label="Family calendar toggle">
                    <input type="checkbox" />
                    <span />
                  </label>
                  <strong>Family</strong>
                </div>
              </div>
            </article>
          </section>
        ) : (
          <>
            <header className="settings-main-head">
              <h1>Settings</h1>
              <label className="settings-search-wrap" htmlFor="settings-search-input" ref={searchWrapRef}>
                <span aria-hidden="true">⌕</span>
                <input
                  id="settings-search-input"
                  type="search"
                  placeholder="Search"
                  value={searchTerm}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setIsSearchOpen(true);
                  }}
                  onKeyDown={handleSearchKeyDown}
                />

                {isSearchOpen ? (
                  <div className="settings-search-dropdown" role="listbox" aria-label="Settings search results">
                    {searchTerm.trim() === '' ? (
                      <p>Type to search settings</p>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((item) => (
                        <button
                          key={item.path}
                          type="button"
                          className="settings-search-result"
                          onClick={() => goToSearchResult(item.path)}
                        >
                          <strong>{item.name}</strong>
                          <span>{item.sectionTitle}</span>
                        </button>
                      ))
                    ) : (
                      <p>No settings found</p>
                    )}
                  </div>
                ) : null}
              </label>
            </header>

            {filteredSections.map((section) => (
              <section key={section.title} className="settings-section">
                <h2>{section.title}</h2>
                <div className="settings-grid">
                  {section.items.map((item) => (
                    <SettingCard
                      key={item.name}
                      name={item.name}
                      description={item.description}
                      icon={item.icon}
                      path={item.path}
                      settingsRoot={settingsRoot}
                    />
                  ))}
                </div>
              </section>
            ))}

            {normalizedSearch && filteredSections.length === 0 ? (
              <section className="settings-search-empty">
                <h2>No matching settings</h2>
                <p>Try a different search term like profile, billing, security, or webhooks.</p>
              </section>
            ) : null}
          </>
        )}
      </main>

      {createType ? (
        <div className="workflow-create-overlay" role="dialog" aria-modal="true" aria-label="Create settings resource">
          <form className="workflow-create-modal" onSubmit={handleCreateSubmit}>
            <div className="workflow-create-body">
              <h2>
                {createType === 'webhook'
                  ? 'Create webhook'
                  : createType === 'apiKey'
                    ? 'Create API key'
                    : 'Create OAuth client'}
              </h2>
              <p>
                {createType === 'webhook'
                  ? 'Add a webhook destination endpoint.'
                  : createType === 'apiKey'
                    ? 'Create and label a new API key.'
                    : 'Register a new OAuth client configuration.'}
              </p>

              <div className="settings-resource-form">
                <label htmlFor="settings-resource-name">Name</label>
                <input
                  id="settings-resource-name"
                  value={createName}
                  onChange={(event) => setCreateName(event.target.value)}
                  placeholder={createType === 'apiKey' ? 'Server integration key' : 'Production integration'}
                  required
                />

                <label htmlFor="settings-resource-value">
                  {createType === 'webhook' ? 'Target URL' : createType === 'apiKey' ? 'Purpose' : 'Redirect URI'}
                </label>
                <input
                  id="settings-resource-value"
                  value={createValue}
                  onChange={(event) => setCreateValue(event.target.value)}
                  placeholder={createType === 'webhook' ? 'https://example.com/webhooks/cal' : 'Main website callback'}
                  required
                />
              </div>
            </div>

            <div className="workflow-create-foot">
              <button type="button" className="settings-inline-btn workflow-foot-cancel" onClick={closeCreateModal}>Cancel</button>
              <button type="submit" className="settings-calendars-add-btn workflow-foot-create">Create</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
