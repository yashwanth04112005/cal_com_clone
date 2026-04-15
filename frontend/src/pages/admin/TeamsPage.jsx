import { useState } from 'react';
import PricingPlansModal from '../../components/PricingPlansModal.jsx';

export default function TeamsPage() {
  const [showPricing, setShowPricing] = useState(false);

  return (
    <section className="panel teams-page-panel">
      <div className="teams-page-card">
        <div className="teams-feature-card">
          <div className="teams-hero-copy">
            <span className="teams-kicker">Teams</span>
            <h1>Use Cal with your team</h1>
            <p>
              Turn individual scheduling into a system that assigns, distributes, and manages meetings for our team.
            </p>

            <ul className="teams-feature-list">
              <li>Route inbound requests to the right person</li>
              <li>Distribute meetings fairly with round-robin</li>
              <li>See what&apos;s getting booked (and what&apos;s not)</li>
              <li>Remove Cal.com branding</li>
            </ul>

            <div className="routing-availability-line teams-availability-line">
              <span>Available on</span>
              <span className="routing-pill routing-pill-team">Teams</span>
              <span className="routing-pill routing-pill-orgs">Orgs</span>
            </div>

            <div className="routing-actions teams-actions">
              <button type="button" className="button-primary routing-try-btn" onClick={() => setShowPricing(true)}>
                Try it for free
                <span className="routing-arrow">→</span>
              </button>
              <a href="#" className="routing-learn-more">Learn more</a>
            </div>
          </div>
        </div>
      </div>

      <PricingPlansModal
        open={showPricing}
        onClose={() => setShowPricing(false)}
        title="Upgrade plan"
        infoTitle="Use Cal with your team"
        infoDescription="Turn individual scheduling into a system that assigns, distributes, and manages meetings for our team."
        currentPlanLabel="Current plan"
        currentPlanPrice="Free"
        activePlan="Team"
      />
    </section>
  );
}
