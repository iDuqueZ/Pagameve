import { supabase } from '../lib/supabase'

const EMAIL_STYLES = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    * { box-sizing: border-box; }
    body { 
      font-family: 'Inter', system-ui, sans-serif;
      background: #0d0f14; color: #e8eaf0;
      margin: 0; padding: 20px;
    }
    .container { 
      max-width: 480px; margin: 0 auto;
      background: #1a1e28; border-radius: 10px;
      border: 1px solid #2a2f3f;
      padding: 24px;
    }
    .header { 
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 24px; padding-bottom: 16px;
      border-bottom: 1px solid #2a2f3f;
    }
    .logo { 
      width: 36px; height: 36px;
      background: #1e1a3a; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: #9d8ff9; font-size: 16px; font-weight: 600;
    }
    .title { font-size: 14px; font-weight: 500; color: #e8eaf0; }
    .content { font-size: 13px; line-height: 1.6; color: #e8eaf0; }
    .highlight { color: #7c6af7; font-weight: 500; }
    .amount { 
      font-size: 22px; font-weight: 500;
      color: #22c97a; margin: 16px 0;
    }
    .amount-red { color: #f45b5b; }
    .card {
      background: #13161e; border-radius: 8px;
      padding: 16px; margin: 16px 0;
      border: 1px solid #2a2f3f;
    }
    .label { font-size: 11px; color: #8b90a0; margin-bottom: 4px; }
    .value { font-size: 13px; color: #e8eaf0; }
    .btn { 
      display: inline-block; background: #7c6af7;
      color: #fff; padding: 12px 24px;
      border-radius: 6px; text-decoration: none;
      font-weight: 500; font-size: 13px;
      margin-top: 16px;
    }
    .footer { 
      margin-top: 24px; padding-top: 16px;
      border-top: 1px solid #2a2f3f;
      font-size: 11px; color: #555c70; text-align: center;
    }
    .badge {
      display: inline-block; padding: 4px 10px;
      border-radius: 99px; font-size: 11px; font-weight: 500;
      margin-right: 8px;
    }
    .badge-green { background: #0d2a1e; color: #22c97a; }
    .badge-amber { background: #2a1e08; color: #f0a640; }
    .badge-red { background: #2a1010; color: #f45b5b; }
    .badge-accent { background: #1e1a3a; color: #9d8ff9; }
  </style>
`

function getEmailTemplate(content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${EMAIL_STYLES}
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">P</div>
      <span class="title">PágameVe</span>
    </div>
    ${content}
    <div class="footer">
      © 2024 PágameVe — Gestiona tus deudas fácilmente
    </div>
  </div>
</body>
</html>
  `.trim()
}

export function getNewDebtEmailHtml(creditorName, amount, description) {
  const content = `
    <div class="content">
      <p>Hola,</p>
      <p><span class="highlight">${creditorName}</span> te ha creado una nueva deuda.</p>
      
      <div class="card">
        <div class="label">MONTO</div>
        <div class="amount">$${parseInt(amount).toLocaleString('es-CO')}</div>
        
        ${description ? `
        <div class="label" style="margin-top: 12px;">DESCRIPCIÓN</div>
        <div class="value">${description}</div>
        ` : ''}
      </div>
      
      <a href="https://pagameve.netlify.app" class="btn">Ver en PágameVe</a>
    </div>
  `
  return getEmailTemplate(content)
}

export function getDebtAcceptedEmailHtml(debtorName) {
  const content = `
    <div class="content">
      <p>Hola,</p>
      <p><span class="highlight">${debtorName}</span> ha aceptado tu deuda.</p>
      
      <div class="card">
        <span class="badge badge-green">✓ Aceptada</span>
      </div>
      
      <a href="https://pagameve.netlify.app" class="btn">Ver detalles</a>
    </div>
  `
  return getEmailTemplate(content)
}

export function getDebtRejectedEmailHtml(debtorName) {
  const content = `
    <div class="content">
      <p>Hola,</p>
      <p><span class="highlight">${debtorName}</span> ha rechazado tu deuda.</p>
      
      <div class="card">
        <span class="badge badge-red">✗ Rechazada</span>
      </div>
      
      <a href="https://pagameve.netlify.app" class="btn">Ver detalles</a>
    </div>
  `
  return getEmailTemplate(content)
}

export function getPaymentRegisteredEmailHtml(amount, debtorName, remaining) {
  const content = `
    <div class="content">
      <p>Hola,</p>
      <p>Se ha registrado un nuevo pago.</p>
      
      <div class="card">
        <div class="label">PAGO REGISTRADO</div>
        <div class="amount">$${parseInt(amount).toLocaleString('es-CO')}</div>
        
        ${remaining > 0 ? `
        <div class="label" style="margin-top: 12px;">MONTO PENDIENTE</div>
        <div class="value">$${parseInt(remaining).toLocaleString('es-CO')}</div>
        ` : `
        <div class="label" style="margin-top: 12px;">ESTADO</div>
        <span class="badge badge-green">✓ Pagada</span>
        `}
      </div>
      
      <a href="https://pagameve.netlify.app" class="btn">Ver detalles</a>
    </div>
  `
  return getEmailTemplate(content)
}

export function getDebtForgivenEmailHtml(creditorName) {
  const content = `
    <div class="content">
      <p>Hola,</p>
      <p><span class="highlight">${creditorName}</span> ha perdonado tu deuda.</p>
      
      <div class="card">
        <span class="badge badge-accent">❤ Perdonada</span>
      </div>
      
      <a href="https://pagameve.netlify.app" class="btn">Ver detalles</a>
    </div>
  `
  return getEmailTemplate(content)
}

export async function sendNotificationEmail(userId, subject, htmlTemplateFn, ...args) {
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

    const html = htmlTemplateFn(...args)

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