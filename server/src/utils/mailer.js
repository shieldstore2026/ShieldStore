import dns from 'dns';
import nodemailer from 'nodemailer';

let transporter;

/** Force IPv4 for SMTP on hosts where IPv6 to Google is unreachable (common on Render free tier). */
function lookupIpv4(hostname, _options, cb) {
  dns.lookup(hostname, { family: 4, all: false }, cb);
}

const SMTP_TIMEOUT_MS = Number(process.env.SMTP_SOCKET_TIMEOUT_MS) || 25_000;

function getTransporter() {
  if (transporter) return transporter;
  const host = (process.env.SMTP_HOST || '').trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = (process.env.SMTP_USER || '').trim();
  const rawPass = process.env.SMTP_PASS || '';
  const pass = rawPass.replace(/\s+/g, '');
  const service = (process.env.SMTP_SERVICE || '').trim();
  if (!user || !pass || (!host && !service)) {
    console.warn(
      '[mailer] SMTP disabled: set SMTP_USER, SMTP_PASS, and either SMTP_SERVICE (e.g. gmail) or SMTP_HOST + SMTP_PORT'
    );
    return null;
  }

  const commonTls = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  };

  const timeouts = {
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
  };

  /** Nodemailer’s `service: gmail` preset uses port 465; many clouds hit ENETUNREACH on IPv6. Prefer 587 + STARTTLS + IPv4-only lookup. */
  const serviceLower = service.toLowerCase();
  const isGmail =
    serviceLower === 'gmail' || host === 'smtp.gmail.com' || host.endsWith('.gmail.com');
  if (isGmail && user && pass) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user, pass },
      tls: commonTls,
      lookup: lookupIpv4,
      ...timeouts,
    });
  } else if (service) {
    transporter = nodemailer.createTransport({
      service,
      auth: { user, pass },
      tls: commonTls,
      lookup: lookupIpv4,
      ...timeouts,
    });
  } else {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: commonTls,
      lookup: lookupIpv4,
      ...timeouts,
    });
  }
  return transporter;
}

/**
 * Send email. Gmail: use App Password + 2FA; SMTP_FROM must be the Gmail account (or a verified "Send mail as" alias).
 * Optional comma-separated SMTP_BCC for a copy on every outbound message (e.g. audit inbox).
 */
export async function sendMail({ to, subject, html, text, bcc }) {
  const tx = getTransporter();
  if (!tx) {
    return false;
  }
  const from = (process.env.SMTP_FROM || process.env.SMTP_USER || '').trim();
  const envBcc = (process.env.SMTP_BCC || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const mergedBcc = [...new Set([...(bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : []), ...envBcc])].join(', ') || undefined;

  try {
    const replyTo = (process.env.SMTP_REPLY_TO || from || '').trim();
    const info = await tx.sendMail({
      from,
      to,
      ...(mergedBcc ? { bcc: mergedBcc } : {}),
      subject,
      text,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    console.info(`[mailer] sent OK to=${to}`, info.messageId || '');
    return true;
  } catch (err) {
    console.error('[mailer] sendMail failed:', err.message, err.response ?? '');
    throw err;
  }
}
