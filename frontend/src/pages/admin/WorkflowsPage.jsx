import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const aiTemplates = [
  {
    title: 'Call to confirm booking',
    subtitle: '2 hrs before event starts',
    icon: '☎'
  },
  {
    title: 'Follow up with no shows',
    subtitle: '30m after event ends',
    icon: '☎'
  },
  {
    title: 'Remind attendees to bring ID',
    subtitle: '1 day before event starts',
    icon: '☎'
  }
];

const standardTemplates = [
  {
    title: 'Send SMS reminder',
    subtitle: '24 hours before event starts',
    icon: '◫'
  },
  {
    title: 'Follow up with no shows',
    subtitle: '30m after event ends',
    icon: '◫'
  },
  {
    title: 'Remind attendees to bring ID',
    subtitle: '1 day before event starts',
    icon: '✉'
  },
  {
    title: 'Email reminder',
    subtitle: '1 hour before event starts',
    icon: '✉'
  },
  {
    title: 'Custom email reminder',
    subtitle: 'Event is rescheduled to host',
    icon: '✉'
  },
  {
    title: 'Custom SMS reminder',
    subtitle: 'When event is scheduled',
    icon: '◫'
  }
];

function TemplateCard({ title, subtitle, icon }) {
  return (
    <article className="workflow-template-card">
      <span className="workflow-template-icon" aria-hidden="true">{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </article>
  );
}

export default function WorkflowsPage() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStartType, setSelectedStartType] = useState('cal-ai-template');

  const handleCreateWorkflow = () => {
    if (selectedStartType === 'cal-ai-template') {
      navigate('/admin/workflows/324501');
      return;
    }

    navigate('/admin/workflows/324502');
  };

  return (
    <>
      <section className="panel workflows-panel">
        <header className="workflows-head">
          <div>
            <h1>Workflows</h1>
            <p>Create workflows to automate notifications and reminders</p>
          </div>

          <button type="button" className="workflows-new-btn" onClick={() => setShowCreateModal(true)}>
            + New
          </button>
        </header>

        <div className="workflows-shell">
          <div className="workflows-empty-state">
            <div className="workflows-empty-icon" aria-hidden="true">⚡</div>
            <h2>Workflows</h2>
            <p>
              Workflows enable simple automation to send notifications &amp; reminders enabling you to
              build processes around your events.
            </p>
          </div>

          <section className="workflows-templates-group">
            <h3>Cal.ai templates</h3>
            <div className="workflows-template-grid workflows-template-grid-three">
              {aiTemplates.map((template) => (
                <TemplateCard
                  key={template.title}
                  title={template.title}
                  subtitle={template.subtitle}
                  icon={template.icon}
                />
              ))}
            </div>
          </section>

          <section className="workflows-templates-group">
            <h3>Standard templates</h3>
            <div className="workflows-template-grid">
              {standardTemplates.map((template) => (
                <TemplateCard
                  key={template.title}
                  title={template.title}
                  subtitle={template.subtitle}
                  icon={template.icon}
                />
              ))}
            </div>
          </section>
        </div>
      </section>

      {showCreateModal && (
        <div className="workflow-create-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="workflow-create-modal" onClick={(event) => event.stopPropagation()}>
            <div className="workflow-create-body">
              <h2>New workflow</h2>
              <p>How would you like to start?</p>

              <div className="workflow-create-options">
                <button
                  type="button"
                  className={`workflow-create-option ${selectedStartType === 'scratch' ? 'workflow-create-option-active' : ''}`}
                  onClick={() => setSelectedStartType('scratch')}
                >
                  <span className="workflow-create-option-icon" aria-hidden="true">⊕</span>
                  <span className="workflow-create-radio" aria-hidden="true" />
                  <strong>Start from scratch</strong>
                  <small>Create your own workflow from scratch.</small>
                </button>

                <button
                  type="button"
                  className={`workflow-create-option ${selectedStartType === 'cal-ai-template' ? 'workflow-create-option-active' : ''}`}
                  onClick={() => setSelectedStartType('cal-ai-template')}
                >
                  <span className="workflow-create-option-icon workflow-create-option-icon-ai" aria-hidden="true">☎</span>
                  <span className="workflow-create-radio" aria-hidden="true" />
                  <strong>Cal.ai template</strong>
                  <small>AI agents that book meetings, send reminders, and follow up!</small>
                </button>
              </div>
            </div>

            <footer className="workflow-create-foot">
              <button
                type="button"
                className="button-ghost workflow-foot-cancel"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button type="button" className="button-primary workflow-foot-create" onClick={handleCreateWorkflow}>
                Create
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
