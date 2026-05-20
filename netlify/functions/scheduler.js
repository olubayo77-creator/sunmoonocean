// scheduler.js - Netlify scheduled function
// Runs daily at 8am UTC - triggers pipeline + sends email digest

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const DAILY_DIGEST_RECIPIENT = process.env.DAILY_DIGEST_RECIPIENT || ADMIN_EMAIL;

export default async function handler(event, context) {
  console.log('SunMoonOcean daily pipeline triggered at', new Date().toISOString());

  try {
    // 1. Run the product pipeline
    const pipelineResult = await runPipeline();

    // 2. Send daily digest email if configured
    if (SENDGRID_API_KEY && DAILY_DIGEST_RECIPIENT) {
      await sendDailyDigest(pipelineResult);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Daily pipeline completed',
        pipeline: pipelineResult,
        email: SENDGRID_API_KEY ? 'sent' : 'skipped (no key)',
      }),
    };
  } catch (error) {
    console.error('Pipeline error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

async function runPipeline() {
  // Simulate pipeline run - in production this scores products
  return {
    analyzed: 12,
    newCandidates: 3,
    topScorer: 'Galaxy Slime Lab Kit',
    trendScore: 92,
    runAt: new Date().toISOString(),
  };
}

async function sendDailyDigest(pipelineResult) {
  if (!SENDGRID_API_KEY) return;

  const emailData = {
    to: DAILY_DIGEST_RECIPIENT,
    from: 'noreply@sunmoonocean.com',
    subject: `🔥 SunMoonOcean Daily Digest - ${new Date().toLocaleDateString()}`,
    text: `
SunMoonOcean Daily Pipeline Report
===================================
Analyzed: ${pipelineResult.analyzed} products
New candidates: ${pipelineResult.newCandidates}
Top product: ${pipelineResult.topScorer} (score: ${pipelineResult.trendScore})
Run at: ${pipelineResult.runAt}

Log in to your dashboard to review and approve products.
    `,
    html: `
<h2>🔥 SunMoonOcean Daily Pipeline Report</h2>
<p><strong>Analyzed:</strong> ${pipelineResult.analyzed} products</p>
<p><strong>New candidates:</strong> ${pipelineResult.newCandidates}</p>
<p><strong>Top product:</strong> ${pipelineResult.topScorer} (score: ${pipelineResult.trendScore})</p>
<p><strong>Run at:</strong> ${pipelineResult.runAt}</p>
<hr/>
<p>Log in to your dashboard to review and approve products.</p>
    `,
  };

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });
    console.log('Email sent, status:', response.status);
  } catch (error) {
    console.error('SendGrid error:', error.message);
  }
}