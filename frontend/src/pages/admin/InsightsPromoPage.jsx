import { useState } from 'react';
import PricingPlansModal from '../../components/PricingPlansModal.jsx';

export default function InsightsPromoPage({ sectionLabel = 'Bookings' }) {
  const [showPricing, setShowPricing] = useState(false);

  return (
    <section className="panel insights-panel-shell">
      <div className="insights-page-card">
        <div className="insights-feature-card">
          <div className="insights-hero-copy">
            <span className="insights-kicker">Insights</span>
            <h1>See what&apos;s getting booked, and what&apos;s not</h1>
            <p>
              Turn booking data into clarity for you and your team so you can spot gaps, balance workload,
              and make better scheduling decisions.
            </p>

            <ul className="insights-feature-list">
              <li>Understand booking volume and cancellations</li>
              <li>See how meetings are distributed across team members</li>
              <li>Spot trends that help you improve availability and routing</li>
            </ul>

            <div className="routing-availability-line insights-availability-line">
              <span>Available on</span>
              <span className="routing-pill routing-pill-team">Teams</span>
              <span className="routing-pill routing-pill-orgs">Orgs</span>
            </div>

            <div className="routing-actions insights-actions">
              <button type="button" className="button-primary routing-try-btn" onClick={() => setShowPricing(true)}>
                Try it for free
                <span className="routing-arrow">→</span>
              </button>
              <a href="#" className="routing-learn-more">Learn more</a>
            </div>
          </div>

          <div className="insights-preview-wrap" aria-hidden="true">
            <div className="insights-preview-card">
              <div className="insights-preview-top" />

              <section className="insights-chart-panel">
                <h3>Booking hours - by available hours</h3>
                <div className="insights-chart-axis">
                  <span>12</span>
                  <span>24</span>
                  <span>32</span>
                  <span>32</span>
                  <span>8</span>
                  <span>12</span>
                  <span>32</span>
                  <span>40</span>
                  <span>12</span>
                </div>

                <div className="insights-bars-grid">
                  <div className="insights-bars-stack insights-bars-stack-cyan" />
                  <div className="insights-bars-stack insights-bars-stack-cyan tall" />
                  <div className="insights-bars-stack insights-bars-stack-orange taller" />
                  <div className="insights-bars-stack insights-bars-stack-orange taller" />
                  <div className="insights-bars-stack insights-bars-stack-cyan short" />
                  <div className="insights-bars-stack insights-bars-stack-cyan short" />
                  <div className="insights-bars-stack insights-bars-stack-orange taller" />
                  <div className="insights-bars-stack insights-bars-stack-pink tallest" />
                  <div className="insights-bars-stack insights-bars-stack-cyan short" />
                </div>

                <div className="insights-chart-hours">
                  <span>08hr</span>
                  <span>09hr</span>
                  <span>10hr</span>
                  <span>11hr</span>
                  <span>12hr</span>
                  <span>13hr</span>
                  <span>14hr</span>
                  <span>15hr</span>
                  <span>16hr</span>
                </div>
              </section>

              <section className="insights-no-show-panel">
                <h4>No-show</h4>
                <p>Jordan Cook</p>
                <p>James Corcoran</p>
              </section>
            </div>
          </div>
        </div>
      </div>

      <PricingPlansModal
        open={showPricing}
        onClose={() => setShowPricing(false)}
        title="Upgrade plan"
        infoTitle="See what&apos;s getting booked"
        infoDescription={`Unlock Insights ${sectionLabel.toLowerCase()} analytics to understand trends, routing quality, and team performance.`}
        currentPlanLabel="Current plan"
        currentPlanPrice="Free"
        activePlan="Team"
      />
    </section>
  );
}
