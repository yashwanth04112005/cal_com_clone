INSERT INTO users (id, name, email) VALUES
  (1, 'Demo User', 'admin@example.com');

INSERT INTO availability_schedules (id, user_id, name, timezone, is_default) VALUES
  (1, 1, 'Default Schedule', 'Asia/Kolkata', 1),
  (2, 1, 'Interview Week', 'Asia/Kolkata', 0);

INSERT INTO availability_windows (schedule_id, weekday, start_time, end_time) VALUES
  (1, 1, '09:00:00', '17:00:00'),
  (1, 2, '09:00:00', '17:00:00'),
  (1, 3, '09:00:00', '17:00:00'),
  (1, 4, '09:00:00', '17:00:00'),
  (1, 5, '09:00:00', '17:00:00'),
  (2, 1, '10:00:00', '14:00:00'),
  (2, 3, '10:00:00', '14:00:00');

INSERT INTO event_types (id, user_id, schedule_id, title, description, duration_minutes, slug, is_active, buffer_before_minutes, buffer_after_minutes) VALUES
  (1, 1, 1, 'Intro Call', 'A short introductory meeting.', 30, 'intro-call', 1, 10, 10),
  (2, 1, 1, 'Product Demo', 'Walk through the product and answer questions.', 45, 'product-demo', 1, 15, 15),
  (3, 1, 2, 'Interview', 'Interview slot.', 60, 'interview', 1, 15, 15);

INSERT INTO booking_questions (id, event_type_id, label, question_type, is_required, sort_order) VALUES
  (1, 1, 'What would you like to discuss?', 'textarea', 1, 1),
  (2, 3, 'Years of experience?', 'number', 1, 1);

INSERT INTO bookings (event_type_id, user_id, booker_name, booker_email, start_time_utc, end_time_utc, status) VALUES
  (1, 1, 'Aarav Sharma', 'aarav@example.com', '2026-04-16 04:30:00', '2026-04-16 05:00:00', 'confirmed'),
  (2, 1, 'Neha Patel', 'neha@example.com', '2026-04-16 06:00:00', '2026-04-16 06:45:00', 'confirmed');

INSERT INTO user_settings (
  user_id,
  username,
  bio,
  language,
  timezone,
  time_format,
  week_start,
  dashboard_theme,
  booking_theme,
  dynamic_group_links,
  allow_search_engine_indexing,
  monthly_digest_email,
  prevent_impersonation_on_bookings,
  push_notifications_enabled,
  experimental_features_enabled,
  impersonation_enabled,
  two_factor_enabled
) VALUES (
  1,
  'yashwanthpaladugula',
  '',
  'English',
  'Asia/Calcutta',
  '12-hour',
  'Sunday',
  'system',
  'system',
  0,
  0,
  0,
  0,
  0,
  1,
  0,
  0
);

INSERT INTO teams (user_id, name, slug, bio) VALUES
  (1, 'Acme Inc.', 'acme-inc', 'Core scheduling team');

INSERT INTO app_catalog (name, slug, category, description, is_featured) VALUES
  ('Google Meet', 'google-meet', 'Video', 'Google video conferencing integration.', 1),
  ('Zoom', 'zoom', 'Video', 'Zoom meeting integration.', 1),
  ('Slack', 'slack', 'Communication', 'Send booking updates to Slack.', 1),
  ('Zapier', 'zapier', 'Automation', 'Connect Cal.com to automation flows.', 1);

INSERT INTO installed_apps (user_id, app_id) VALUES
  (1, 1),
  (1, 3);

INSERT INTO workflows (user_id, name, trigger_event, offset_value, offset_unit, event_type_id, action_type, is_active) VALUES
  (1, 'Cal.ai attendee call', 'before_event_starts', 1, 'hours', 1, 'call_attendee', 1),
  (1, 'Reminder email', 'before_event_starts', 30, 'minutes', 2, 'send_email', 1);

INSERT INTO call_history (user_id, contact_name, duration_seconds, status, called_at) VALUES
  (1, 'Rachel Green', 179, 'answered', '2026-04-15 09:10:00'),
  (1, 'Ross Geller', 131, 'no_answer', '2026-04-15 08:50:00'),
  (1, 'Monica Geller', 214, 'answered', '2026-04-14 17:34:00');

INSERT INTO webhooks (user_id, name, target_url, is_active) VALUES
  (1, 'Booking Events', 'https://example.com/webhooks/bookings', 1);

INSERT INTO api_keys (user_id, name, token) VALUES
  (1, 'Primary integration key', 'cal_seed_primary_abc123');

INSERT INTO oauth_clients (user_id, name, client_id, redirect_uri, is_active) VALUES
  (1, 'Main App OAuth', 'oauth_seed_client_001', 'https://example.com/oauth/callback', 1);

INSERT INTO referral_stats (user_id, referral_code, total_clicks, total_signups, total_payout_cents) VALUES
  (1, 'yashwanthpaladugula-jo58', 0, 0, 0);
