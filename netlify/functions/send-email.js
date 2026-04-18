exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const { to, subject, html } = JSON.parse(event.body)

  if (!to || !subject) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) }
  }

  const RESEND_API_KEY = process.env.VITE_RESEND_API_KEY

  if (!RESEND_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'RESEND_API_KEY not configured' }) }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'PágameVe <noreply@pagameve.site>',
        to: [to],
        subject: subject,
        html: html || '',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Resend error:', data)
      return { statusCode: 400, body: JSON.stringify({ error: data.message || 'Failed to send email' }) }
    }

    return { statusCode: 200, body: JSON.stringify({ success: true, data }) }
  } catch (error) {
    console.error('Email error:', error)
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) }
  }
}