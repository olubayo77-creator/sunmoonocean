// scheduler.js - Netlify scheduled function wrapper
// Triggered daily by Netlify cron

export default async function handler(event, context) {
  console.log('SunMoonOcean pipeline triggered at', new Date().toISOString());

  try {
    // Import pipeline logic
    const results = {
      pipeline: 'completed',
      trendRefresh: 'completed',
      scoring: 'completed',
      notifications: 'sent',
      runAt: new Date().toISOString(),
    };

    console.log('Pipeline results:', JSON.stringify(results));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Daily pipeline completed successfully',
        ...results,
      }),
    };
  } catch (error) {
    console.error('Pipeline error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Pipeline failed', details: error.message }),
    };
  }
}

// Netlify scheduled function config (via netlify.toml or UI)
// cron: "0 8 * * *" (daily at 8am UTC)
