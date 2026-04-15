import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const PLANS = [
  {
    name: 'Team',
    price: '$12',
    cta: 'Try Teams',
    subtitle: 'For growing teams',
    points: [
      'Round-robin, fixed round-robin',
      'Collective events',
      'Routing forms',
      'Teams workflows',
      'Insights - analyze your booking data',
      'Remove branding'
    ]
  },
  {
    name: 'Organization',
    price: '$28',
    cta: 'Try Orgs',
    subtitle: 'For scaling organizations',
    points: [
      'Everything in Team',
      'Unlimited teams',
      'Verified domain',
      'Directory sync (SCIM)',
      'SAML SSO',
      'Admin panel'
    ]
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cta: 'Get in touch',
    subtitle: 'For large enterprises',
    points: [
      'Everything in Organization',
      'Dedicated support',
      'Custom SLA',
      'Custom integrations',
      'SOC2 & HIPAA compliance'
    ]
  }
];

export default function PricingPlansModal({
  open,
  onClose,
  title = 'Upgrade plan',
  infoTitle = 'Use Cal with your team',
  infoDescription = 'Turn individual scheduling into a system that assigns, distributes, and manages meetings for our team.',
  currentPlanLabel = 'Current plan',
  currentPlanPrice = 'Free',
  activePlan = 'Team'
}) {
  const [billingMode, setBillingMode] = useState('annual');

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const modal = (
    <div className="teams-upgrade-overlay" onClick={onClose}>
      <div className="teams-upgrade-modal" onClick={(event) => event.stopPropagation()}>
        <header className="teams-upgrade-head">
          <h1>{title}</h1>
          <div className="teams-upgrade-head-right">
            <div className="teams-billing-toggle" role="tablist" aria-label="Billing mode">
              <button
                type="button"
                className={billingMode === 'monthly' ? 'teams-toggle-active' : ''}
                onClick={() => setBillingMode('monthly')}
              >
                Monthly
              </button>
              <button
                type="button"
                className={billingMode === 'annual' ? 'teams-toggle-active' : ''}
                onClick={() => setBillingMode('annual')}
              >
                Annual
                <span className="teams-discount-pill">-25%</span>
              </button>
            </div>
            <button className="teams-close" type="button" onClick={onClose} aria-label="Close">
              x
            </button>
          </div>
        </header>

        <div className="teams-info-strip">
          <strong>{infoTitle}</strong>
          <p>{infoDescription}</p>
        </div>

        <div className="teams-plan-grid">
          {PLANS.map((plan) => (
            <article key={plan.name} className="teams-plan-card">
              <div className="teams-plan-top">
                <h2>{plan.name}</h2>
                {plan.name !== 'Enterprise' ? <span className="teams-trial-pill">14 day free trial</span> : null}
              </div>
              <p className="teams-plan-price">{plan.price}</p>
              {plan.name !== 'Enterprise' ? <p className="teams-plan-cycle">per month/user</p> : <p className="teams-plan-cycle">&nbsp;</p>}
              <button type="button" className={`teams-plan-cta ${plan.name === activePlan ? 'teams-plan-cta-primary' : ''}`}>
                {plan.cta}
              </button>
              <p className="teams-plan-subtitle">{plan.subtitle}</p>
              <ul>
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <footer className="teams-upgrade-foot">
          <div>
            <p className="teams-individual-label">Individual</p>
            <p className="teams-individual-price">{currentPlanPrice}</p>
          </div>
          <span className="teams-current-plan">{currentPlanLabel}</span>
        </footer>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}