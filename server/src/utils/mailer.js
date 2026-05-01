import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const service = process.env.SMTP_SERVICE;
  if (!user || !pass || (!host && !service)) {
    console.warn(
      '[mailer] SMTP disabled: set SMTP_USER, SMTP_PASS, and either SMTP_SERVICE (e.g. gmail) or SMTP_HOST + SMTP_PORT'
    );
    return null;
  }

  transporter = nodemailer.createTransport(
    service
      ? { service, auth: { user, pass: pass.replace(/\s+/g, '') } }
      : {
          host,
          port,
          secure: port === 465,
          auth: { user, pass: pass.replace(/\s+/g, '') },
        }
  );
  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter();
  if (!tx) {
    return false;
  }
  await tx.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
  return true;
}
