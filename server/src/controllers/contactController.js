import { body, validationResult } from 'express-validator';
import { sendMail } from '../utils/mailer.js';

export const validateContact = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message should be at least 10 characters'),
];

export const submit = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array().map((e) => e.msg).join('. ') });

    const { name, email, phone, message } = req.body;
    const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;
    if (!supportEmail) {
      return res.status(500).json({ message: 'Support email is not configured' });
    }

    await sendMail({
      to: supportEmail,
      subject: `New Contact Message - ${name}`,
      html: `<div style="font-family:Arial,sans-serif"><h3>Contact Us Message</h3><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone || '-'}</p><p><strong>Message:</strong><br/>${String(message).replace(/\n/g, '<br/>')}</p></div>`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '-'}\nMessage:\n${message}`,
    });

    await sendMail({
      to: email,
      subject: 'We received your message - The Shield Store',
      html: `<div style="font-family:Arial,sans-serif"><p>Hi ${name},</p><p>Thanks for contacting The Shield Store. Our team will get back to you soon.</p><p>Your message:</p><blockquote>${String(message).replace(/\n/g, '<br/>')}</blockquote></div>`,
      text: `Hi ${name}, we received your message and will get back to you soon.`,
    });

    return res.json({ message: 'Message sent successfully' });
  } catch (err) {
    next(err);
  }
};
