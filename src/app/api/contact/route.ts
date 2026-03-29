import { sendEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!email || !message) {
      return Response.json({ error: 'Email and message are required' }, { status: 400 });
    }

    const subjectLabels: Record<string, string> = {
      general: 'General Inquiry',
      api: 'API Support',
      billing: 'Billing',
      partnership: 'Partnership',
      data: 'Data Request',
      bug: 'Bug Report',
    };

    const subjectLine = `[SOTW Contact] ${subjectLabels[subject] || subject} — ${name || email}`;

    await sendEmail(
      'statisticsoftheworldcontact@gmail.com',
      subjectLine,
      `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#0d1b2a;margin-bottom:16px">New Contact Form Submission</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="color:#64748b;padding:6px 12px 6px 0;vertical-align:top;white-space:nowrap">From</td><td style="color:#0d1b2a;padding:6px 0">${name || '(not provided)'} &lt;${email}&gt;</td></tr>
          <tr><td style="color:#64748b;padding:6px 12px 6px 0;vertical-align:top;white-space:nowrap">Subject</td><td style="color:#0d1b2a;padding:6px 0">${subjectLabels[subject] || subject}</td></tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#f4f6f9;border-radius:8px;font-size:14px;color:#0d1b2a;white-space:pre-wrap">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        <hr style="border:none;border-top:1px solid #e8e8e8;margin:24px 0">
        <p style="color:#94a3b8;font-size:12px">Reply directly to this email to respond to ${email}</p>
      </div>
      `
    );

    // Send confirmation to the user
    await sendEmail(
      email,
      'We received your message — SOTW',
      `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#0d1b2a;margin-bottom:4px">We got your message</h2>
        <p style="color:#64748b;font-size:15px">Thanks for reaching out. We'll get back to you within 24 hours.</p>
        <div style="margin-top:16px;padding:16px;background:#f4f6f9;border-radius:8px;font-size:14px;color:#64748b;white-space:pre-wrap">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        <hr style="border:none;border-top:1px solid #e8e8e8;margin:24px 0">
        <p style="color:#94a3b8;font-size:12px">Statistics of the World — <a href="https://statisticsoftheworld.com" style="color:#0066cc">statisticsoftheworld.com</a></p>
      </div>
      `
    );

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
