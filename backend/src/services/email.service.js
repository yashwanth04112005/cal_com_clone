import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { execute } from './sql.js';

function hasSmtpConfig() {
  return Boolean(env.smtpHost && env.smtpUser && env.smtpPassword && env.smtpFrom);
}

function createTransport() {
  if (!hasSmtpConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPassword
    }
  });
}

async function recordEmailLog({ bookingId, recipientEmail, subject, body, status, errorMessage = null }) {
  await execute(
    `INSERT INTO email_logs (booking_id, recipient_email, subject, body, status, error_message)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [bookingId || null, recipientEmail, subject, body, status, errorMessage]
  );
}

async function sendOneEmail({ bookingId, to, subject, text, html }) {
  const transport = createTransport();
  if (!transport) {
    await recordEmailLog({
      bookingId,
      recipientEmail: to,
      subject,
      body: text,
      status: 'sent'
    });
    return { delivered: false, mode: 'dry-run' };
  }

  try {
    const info = await transport.sendMail({
      from: env.smtpFrom,
      to,
      subject,
      text,
      html
    });

    await recordEmailLog({
      bookingId,
      recipientEmail: to,
      subject,
      body: text,
      status: 'sent'
    });

    return { delivered: true, messageId: info.messageId };
  } catch (error) {
    await recordEmailLog({
      bookingId,
      recipientEmail: to,
      subject,
      body: text,
      status: 'failed',
      errorMessage: error.message
    });
    throw error;
  }
}

export async function sendBookingConfirmationEmails({ booking, hostEmail }) {
  const whenText = booking.start_time_utc;
  const subject = `Booking confirmed: ${booking.event_title}`;
  const text = `Your booking for ${booking.event_title} has been confirmed for ${whenText}.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2>Booking confirmed</h2>
      <p>Your meeting is scheduled for <strong>${whenText}</strong>.</p>
      <p><strong>Event:</strong> ${booking.event_title}</p>
      <p><strong>Host:</strong> ${booking.user_name || 'Host'}</p>
    </div>
  `;

  const recipients = [booking.booker_email, hostEmail].filter(Boolean);
  const results = [];

  for (const recipient of recipients) {
    results.push(await sendOneEmail({ bookingId: booking.id, to: recipient, subject, text, html }));
  }

  return results;
}

export async function sendBookingCancellationEmails({ booking, hostEmail }) {
  const subject = `Booking cancelled: ${booking.event_title}`;
  const text = `Your booking for ${booking.event_title} has been cancelled.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2>Booking cancelled</h2>
      <p>Your meeting for <strong>${booking.event_title}</strong> has been cancelled.</p>
    </div>
  `;

  const recipients = [booking.booker_email, hostEmail].filter(Boolean);
  const results = [];

  for (const recipient of recipients) {
    results.push(await sendOneEmail({ bookingId: booking.id, to: recipient, subject, text, html }));
  }

  return results;
}

export async function sendBookingRescheduledEmails({ booking, hostEmail }) {
  const subject = `Booking rescheduled: ${booking.event_title}`;
  const text = `Your booking for ${booking.event_title} has been rescheduled.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2>Booking rescheduled</h2>
      <p>Your meeting for <strong>${booking.event_title}</strong> has been rescheduled.</p>
    </div>
  `;

  const recipients = [booking.booker_email, hostEmail].filter(Boolean);
  const results = [];

  for (const recipient of recipients) {
    results.push(await sendOneEmail({ bookingId: booking.id, to: recipient, subject, text, html }));
  }

  return results;
}
