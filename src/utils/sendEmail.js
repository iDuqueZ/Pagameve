export async function sendNotificationEmail(userId, subject, html) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, username')
      .eq('id', userId)
      .single()

    if (!profile?.email) {
      console.warn('No email found for user:', userId)
      return
    }

    await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: profile.email,
        subject,
        html,
      }),
    })
  } catch (err) {
    console.error('Email error:', err)
  }
}