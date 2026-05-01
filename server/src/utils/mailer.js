import nodemailer from 'nodemailer';

let transporter;

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

  transporter = nodemailer.createTransport(
    service
      ? { service, auth: { user, pass } }
      : {
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        }
  );
  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter();
  if (!tx) {
    return false;
  }
  try {
    await tx.sendMail({
      from: (process.env.SMTP_FROM || process.env.SMTP_USER || '').trim(),
      to,
      subject,
      text,
      html,
    });
    console.info(`[mailer] sent OK to=${to} subject=${String(subject).slice(0, 60)}`);
    return true;
  } catch (err) {
    console.error('[mailer] sendMail failed:', err.message, err.response ?? '');
    throw err;
  }
}
