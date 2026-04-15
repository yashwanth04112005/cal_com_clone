import { useEffect, useState } from 'react';

const DEFAULT_FORM = {
  title: '',
  url: 'https://cal.com/yashwanthpaladugula/',
  description: '',
  duration_minutes: 15,
  slug: '',
  buffer_before_minutes: 10,
  buffer_after_minutes: 10
};

const URL_PREFIX = 'https://cal.com/yashwanthpaladugula/';

function buildFormFromEventType(eventType) {
  if (!eventType) {
    return DEFAULT_FORM;
  }

  return {
    title: eventType.title || '',
    url: `${URL_PREFIX}${eventType.slug || ''}`,
    description: eventType.description || '',
    duration_minutes: Number(eventType.duration_minutes) || 15,
    slug: eventType.slug || '',
    buffer_before_minutes: Number(eventType.buffer_before_minutes) || 10,
    buffer_after_minutes: Number(eventType.buffer_after_minutes) || 10
  };
}

function toSlug(value) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/[^/]+\//, '')
    .replace(/^yashwanthpaladugula\//, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return normalized;
}

export default function EventTypeModal({
  open,
  onClose,
  onSubmit,
  mode = 'create',
  initialValues = null
}) {
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (mode === 'edit' && initialValues) {
      setForm(buildFormFromEventType(initialValues));
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [open, mode, initialValues]);

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
    const slugFromUrl = toSlug(form.url);
    const slugFromTitle = toSlug(form.title);

    await onSubmit({
      title: form.title,
      description: form.description,
      duration_minutes: Number(form.duration_minutes) || 15,
      slug: slugFromUrl || slugFromTitle,
      buffer_before_minutes: Number(form.buffer_before_minutes) || 10,
      buffer_after_minutes: Number(form.buffer_after_minutes) || 10
    });
    setForm(DEFAULT_FORM);
  };

  const handleClose = () => {
    setForm(DEFAULT_FORM);
    onClose();
  };

  const handleTitleBlur = () => {
    if (!form.title.trim()) {
      return;
    }
    if (form.url !== URL_PREFIX) {
      return;
    }

    const nextSlug = toSlug(form.title);
    setForm((current) => ({
      ...current,
      url: `${URL_PREFIX}${nextSlug}`
    }));
  };

  return (
    <div className="modal-backdrop event-type-modal-backdrop" onClick={handleClose}>
      <div className="modal-card event-type-modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="event-type-modal-scroll">
          <h3>{mode === 'edit' ? 'Edit event type' : 'Add a new event type'}</h3>
          <p className="muted">
            {mode === 'edit'
              ? 'Update your event type details and public booking link.'
              : 'Set up event types to offer different types of meetings.'}
          </p>

          <form className="form-grid event-type-form-grid" onSubmit={handleSubmit}>
            <label>
              Title
              <input name="title" value={form.title} onChange={handleChange} onBlur={handleTitleBlur} required />
            </label>

            <label>
              URL
              <input
                name="url"
                value={form.url}
                onChange={handleChange}
                required
                placeholder={URL_PREFIX}
              />
            </label>

            <label>
              Description
              <div className="description-editor-shell">
                <div className="description-toolbar">
                  <button type="button" className="description-tool">B</button>
                  <button type="button" className="description-tool">I</button>
                </div>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="A quick video meeting."
                />
              </div>
            </label>

            <label>
              Duration
              <div className="duration-input-wrap">
                <input
                  name="duration_minutes"
                  type="number"
                  min="5"
                  step="5"
                  value={form.duration_minutes}
                  onChange={handleChange}
                  required
                />
                <span>minutes</span>
              </div>
            </label>

            <div className="form-actions event-type-modal-actions">
              <button type="button" className="button-ghost" onClick={handleClose}>
                Close
              </button>
              <button type="submit" className="button-primary">
                {mode === 'edit' ? 'Save changes' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
