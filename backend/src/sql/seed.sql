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
