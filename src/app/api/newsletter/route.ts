import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/mailer';
import { INDICATORS, formatValue } from '@/lib/data';

/**
 * POST /api/newsletter — Send weekly digest to all subscribers.
 * Called by GitHub Actions cron (weekly Monday 7AM UTC).
 * Protected by a secret token to prevent abuse.
 */

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') || '';

  // Simple auth — must match the secret
  const expectedToken = process.env.NEWSLETTER_SECRET || '';
  if (!expectedToken || token !== expectedToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Get active subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('sotw_subscribers')
      .select('email')
      .eq('active', true);

    if (subError || !subscribers || subscribers.length === 0) {
      return Response.json({ sent: 0, message: 'No active subscribers' });
    }

    // 2. Build digest content from latest data
    const digest = await buildDigest();

    // 3. Send to each subscriber
    let sent = 0;
    let failed = 0;
    for (const sub of subscribers) {
      try {
        await sendEmail(sub.email, digest.subject, digest.html);
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${sub.email}:`, err);
        failed++;
      }
    }

    return Response.json({ sent, failed, total: subscribers.length });
  } catch (error) {
    console.error('Newsletter error:', error);
    return Response.json({ error: 'Failed to send newsletter' }, { status: 500 });
  }
}

async function buildDigest(): Promise<{ subject: string; html: string }> {
  // Fetch some trending/key data for the digest
  const keyIndicators = ['IMF.NGDPD', 'IMF.NGDP_RPCH', 'IMF.PCPIPCH', 'SP.POP.TOTL', 'IMF.LUR'];

  // Get predictions summary
  let predictionsHtml = '';
  try {
    const predRes = await fetch('https://statisticsoftheworld.com/api/predictions?limit=5');
    const predData = await predRes.json();
    if (predData.markets?.length) {
      predictionsHtml = `
        <h2 style="color:#333;font-size:18px;margin-top:24px;">Prediction Markets</h2>
        <p style="color:#999;font-size:13px;">What the crowd expects this week:</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          ${predData.markets.slice(0, 5).map((m: any) => `
            <tr style="border-bottom:1px solid #eee;">
              <td style="padding:8px 0;">${m.question}</td>
              <td style="padding:8px 0;text-align:right;font-weight:bold;color:${Math.round(m.probability * 100) >= 50 ? '#16a34a' : '#dc2626'}">
                ${Math.round(m.probability * 100)}%
              </td>
            </tr>
          `).join('')}
        </table>
      `;
    }
  } catch { /* skip */ }

  const now = new Date();
  const weekStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const subject = `SOTW Weekly — ${weekStr}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="font-size:22px;margin:0;">Statistics of the World</h1>
        <p style="color:#999;font-size:13px;margin:4px 0 0;">Weekly Digest — ${weekStr}</p>
      </div>

      <div style="background:#f8f9fa;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="font-size:14px;color:#555;margin:0;">
          This week's global data highlights from IMF, World Bank, and prediction markets.
        </p>
      </div>

      <h2 style="color:#333;font-size:18px;">Quick Links</h2>
      <ul style="font-size:13px;color:#0066cc;line-height:2;">
        <li><a href="https://statisticsoftheworld.com/predictions" style="color:#0066cc;">Prediction Markets — live odds on elections, Fed rates, geopolitics</a></li>
        <li><a href="https://statisticsoftheworld.com/commodities" style="color:#0066cc;">Commodities — prices + futures curves</a></li>
        <li><a href="https://statisticsoftheworld.com/calendar" style="color:#0066cc;">Economic Calendar — this week's data releases</a></li>
        <li><a href="https://statisticsoftheworld.com/forecasts" style="color:#0066cc;">IMF Forecasts — 2-year projections for every country</a></li>
        <li><a href="https://statisticsoftheworld.com/trending" style="color:#0066cc;">Trending Data</a></li>
      </ul>

      ${predictionsHtml}

      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;text-align:center;">
        <p style="font-size:11px;color:#ccc;">
          <a href="https://statisticsoftheworld.com" style="color:#999;">statisticsoftheworld.com</a>
          — 443 indicators for 218 countries
        </p>
        <p style="font-size:10px;color:#ddd;">
          You received this because you subscribed at statisticsoftheworld.com.
          To unsubscribe, reply to this email with "unsubscribe".
        </p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}
