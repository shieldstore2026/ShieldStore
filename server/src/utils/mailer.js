import dns from 'dns';
import nodemailer from 'nodemailer';

let transporter;

/** Force IPv4 for SMTP on hosts where IPv6 targets are unreachable (Render free tier). */
function lookupIpv4(hostname, _options, cb) {
  dns.lookup(hostname, { family: 4, all: false }, cb);
}

const SMTP_TIMEOUT_MS = Number(process.env.SMTP_SOCKET_TIMEOUT_MS) || 55_000;
const SMTP_RETRIES = Math.min(8, Math.max(1, Number(process.env.SMTP_RETRY_ATTEMPTS) || 4));

function isRetriableSmtp(err) {
  const msg = String(err?.message || err?.code || '');
  return /timeout|timed out|ETIMEDOUT|ECONNRESET|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|socket|Connection closed|Tarpitting/i.test(
    msg
  );
}

function resetTransport() {
  transporter = null;
}

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

  const serviceLower = service.toLowerCase();
  const isGmail =
    serviceLower === 'gmail' || host === 'smtp.gmail.com' || host.endsWith('.gmail.com');
  const gmailTls = { ...commonTls, servername: 'smtp.gmail.com' };

  if (isGmail && user && pass) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user, pass },
      tls: gmailTls,
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
 * Resend HTTPS API — reliable on hosts where outbound SMTP hangs (many PaaS / free tiers).
 * Free tier: https://resend.com — set RESEND_API_KEY and RESEND_FROM (verified domain or onboarding@resend.dev for tests).
 */
async function sendViaResend({ to, subject, html, text, replyTo, bccList }) {
  const key = (process.env.RESEND_API_KEY || '').trim();
  const resendFrom = (process.env.RESEND_FROM || '').trim() || 'Shield <onboarding@resend.dev>';

  const normalizeTo = Array.isArray(to) ? to : String(to).split(',').map((s) => s.trim()).filter(Boolean);
  const body = {
    from: resendFrom,
    to: normalizeTo.length === 1 ? normalizeTo[0] : normalizeTo,
    subject,
    ...(html ? { html } : {}),
    ...(text ? { text } : html ? {} : { text: ' ' }),
    ...(replyTo ? { reply_to: replyTo } : {}),
    ...(bccList.length ? { bcc: bccList } : {}),
  };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch (_) {
    data = { raw };
  }

  if (!res.ok) {
    throw new Error(data.message || raw || `Resend HTTP ${res.status}`);
  }
  console.info('[mailer] Resend OK', data.id || '', 'to=', normalizeTo.join(','));
  return true;
}

async function sendMailViaSmtp({ from, mergedBcc, to, subject, text, html, replyTo }) {
  let lastErr;
  for (let attempt = 0; attempt < SMTP_RETRIES; attempt += 1) {
    if (attempt > 0) resetTransport();
    const tx = getTransporter();
    if (!tx) return false;

    try {
      const info = await tx.sendMail({
        from,
        to,
        ...(mergedBcc ? { bcc: mergedBcc } : {}),
        subject,
        text,
        html,
        ...(replyTo ? { replyTo } : {}),
      });
      console.info(`[mailer] SMTP OK to=${to}`, info.messageId || '');
      return true;
    } catch (err) {
      lastErr = err;
      console.warn(`[mailer] SMTP attempt ${attempt + 1}/${SMTP_RETRIES}:`, err.message);
      if (!isRetriableSmtp(err) || attempt === SMTP_RETRIES - 1) {
        console.error('[mailer] sendMail failed:', err.message, err.response ?? '');
        throw err;
      }
      await new Promise((r) => setTimeout(r, 1800 * (attempt + 1)));
    }
  }
  throw lastErr;
}

/**
 * Sends mail. Prefer RESEND_API_KEY on Render — Gmail SMTP often connection-times out from PaaS networks.
 *
 * SMTP: Gmail needs App Password + 2FA. SMTP_FROM must match SMTP_USER unless "Send mail as" verified.
 */
export async function sendMail({ to, subject, html, text, bcc }) {
  const envBcc = (process.env.SMTP_BCC || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const extraBcc = bcc ? (Array.isArray(bcc) ? bcc : String(bcc).split(',')).map((s) => s.trim()).filter(Boolean) : [];
  const bccList = [...new Set([...extraBcc, ...envBcc])];

  const from = (process.env.SMTP_FROM || process.env.SMTP_USER || '').trim();
  const replyTo = (process.env.SMTP_REPLY_TO || from || '').trim();
  const mergedBcc = bccList.filter(Boolean).join(', ') || undefined;

  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  if (resendKey) {
    try {
      return await sendViaResend({
        to,
        subject,
        html,
        text,
        replyTo: replyTo || undefined,
        bccList,
      });
    } catch (e) {
      console.error('[mailer] Resend failed:', e.message);
      const canSmtp =
        !!(process.env.SMTP_USER || '').trim() && !!(process.env.SMTP_PASS || '').replace(/\s+/g, '');
      if (!canSmtp) throw e;
      console.warn('[mailer] Falling back to SMTP…');
    }
  }

  if (!(process.env.SMTP_USER && process.env.SMTP_PASS?.replace(/\s+/g, ''))) {
    if (resendKey) throw new Error('Resend failed and SMTP is not configured');
    console.warn('[mailer] No RESEND_API_KEY and SMTP incomplete');
    return false;
  }

  return sendMailViaSmtp({ from, mergedBcc, to, subject, text, html, replyTo });
}
