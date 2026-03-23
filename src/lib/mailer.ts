import nodemailer from 'nodemailer';

const GMAIL_USER = process.env.GMAIL_USER || 'statisticsoftheworldcontact@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD, // Gmail App Password (not regular password)
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  return transporter.sendMail({
    from: `"Statistics of the World" <${GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
