import { useState } from 'react';

const DEFAULT_FORM = {
  title: '',
  description: '',
  duration_minutes: 30,
  slug: '',
  buffer_before_minutes: 10,
  buffer_after_minutes: 10
};

export default function EventTypeModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(DEFAULT_FORM);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name.includes('minutes') ? Number(value) : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(form);
    setForm(DEFAULT_FORM);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <h3>Create event type</h3>
        <p className="muted">Add a new event type for your booking page.</p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Title
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>

          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
          </label>

          <label>
            Duration (minutes)
            <input
              name="duration_minutes"
              type="number"
              min="5"
              step="5"
              value={form.duration_minutes}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Slug
            <input name="slug" value={form.slug} onChange={handleChange} placeholder="intro-call" />
          </label>

          <label>
            Buffer before
            <input
              name="buffer_before_minutes"
              type="number"
              min="0"
              value={form.buffer_before_minutes}
              onChange={handleChange}
            />
          </label>

          <label>
            Buffer after
            <input
              name="buffer_after_minutes"
              type="number"
              min="0"
              value={form.buffer_after_minutes}
              onChange={handleChange}
            />
          </label>

          <div className="form-actions">
            <button type="button" className="button-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button-primary">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
