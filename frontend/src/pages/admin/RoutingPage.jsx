import { useState } from 'react';
import PricingPlansModal from '../../components/PricingPlansModal.jsx';

export default function RoutingPage() {
  const [showPricing, setShowPricing] = useState(false);

  return (
    <section className="panel routing-panel-shell">
      <div className="routing-page-card">
        <div className="routing-feature-card">
          <div className="routing-hero-copy">
            <span className="routing-kicker">Routing</span>
            <h1>Route bookings to the right team member automatically</h1>
            <p>
              Use routing rules to qualify bookers and assign meetings to the best team member.
            </p>

            <div className="routing-availability-line">
              <span>Available on</span>
              <span className="routing-pill routing-pill-team">Teams</span>
              <span className="routing-pill routing-pill-orgs">Orgs</span>
            </div>

            <div className="routing-actions">
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
