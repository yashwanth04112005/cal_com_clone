import { Link } from 'react-router-dom';

export default function WorkflowDetailPage() {
  return (
    <section className="panel workflow-editor-panel">
      <header className="workflow-editor-head">
        <div className="workflow-editor-breadcrumb">
          <Link to="/admin/workflows" className="workflow-back-link">←</Link>
          <span>Workflows /</span>
          <strong>Cal.ai 1-hour Meeting Reminder</strong>
          <span className="workflow-editor-edit" aria-hidden="true">✎</span>
        </div>

        <div className="workflow-editor-actions">
          <button type="button" className="workflow-editor-icon-btn" aria-label="Delete workflow">🗑</button>
          <button type="button" className="workflow-editor-save-btn">Save</button>
        </div>
      </header>

      <div className="workflow-editor-canvas">
        <article className="workflow-editor-card">
          <div className="workflow-editor-card-head">
            <span className="workflow-editor-card-title">⚡ Trigger</span>
          </div>

          <div className="workflow-editor-field-group">
            <label htmlFor="workflow-when">When</label>
            <select id="workflow-when" defaultValue="Before event starts">
              <option>Before event starts</option>
              <option>After event ends</option>
              <option>When event is scheduled</option>
            </select>
          </div>

          <div className="workflow-editor-two-col">
            <div className="workflow-editor-field-group">
              <label htmlFor="workflow-offset">How long before event starts?</label>
              <input id="workflow-offset" type="text" defaultValue="1" />
            </div>
            <div className="workflow-editor-field-group workflow-editor-unit-field">
              <label htmlFor="workflow-offset-unit">Unit</label>
              <select id="workflow-offset-unit" defaultValue="hours">
                <option>hours</option>
                <option>minutes</option>
                <option>days</option>
              </select>
            </div>
          </div>

          <div className="workflow-editor-field-group">
            <label htmlFor="workflow-event-type">Which event type will this apply to?</label>
            <select id="workflow-event-type" defaultValue="Select...">
              <option>Select...</option>
              <option>30min Meeting</option>
              <option>60min Meeting</option>
            </select>
          </div>
        </article>

        <article className="workflow-editor-card">
          <div className="workflow-editor-card-head workflow-editor-card-head-action">
            <span className="workflow-editor-card-title">→ Action</span>
            <button type="button" className="workflow-editor-icon-btn" aria-label="Remove action">🗑</button>
          </div>

          <div className="workflow-editor-field-group">
            <label htmlFor="workflow-action">Do this</label>
            <select id="workflow-action" defaultValue="Call attendee using Cal.ai Voice Agent">
              <option>Call attendee using Cal.ai Voice Agent</option>
              <option>Send SMS reminder</option>
              <option>Send email reminder</option>
            </select>
          </div>

          <div className="workflow-agent-card">
            <div>
              <strong>Cal.ai Agent</strong>
              <p>No phone number connected</p>
            </div>

            <div className="workflow-agent-actions">
              <button type="button" className="workflow-agent-btn">Connect phone number</button>
              <button type="button" className="workflow-agent-btn">☏ Test web call</button>
              <button type="button" className="workflow-agent-dots" aria-label="More actions">...</button>
            </div>
          </div>
        </article>

        <button type="button" className="workflow-add-action-btn">Add action</button>
      </div>
    </section>
  );
}
