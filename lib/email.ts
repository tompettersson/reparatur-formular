import { Resend } from 'resend';

// Initialize Resend client lazily (only when actually sending)
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// Default sender
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@kletterschuhe.de';
const FROM_NAME = 'kletterschuhe.de Reparatur-Service';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const resend = getResendClient();

  // Skip if no API key configured (development mode)
  if (!resend) {
    console.log('[Email] Skipping email (no API key configured)');
    console.log(`[Email] Would send to: ${to}`);
    console.log(`[Email] Subject: ${subject}`);
    return { success: true, messageId: 'dev-mode' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
      text: text || stripHtml(html),
    });

    if (error) {
      console.error('[Email] Error sending email:', error);
      return { success: false, error: error.message };
    }

    console.log(`[Email] Sent successfully to ${to}, ID: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[Email] Exception sending email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// Simple HTML stripping for text version
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ============================================
// Email Templates
// ============================================

const FOOTER = `
<hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e5e5;">
<p style="font-size: 12px; color: #888888; line-height: 1.5;">
  Diese E-Mail wurde automatisch generiert.<br>
  Bei Fragen antworten Sie bitte direkt auf diese E-Mail oder kontaktieren Sie uns unter:<br>
  <a href="mailto:info@kletterschuhe.de" style="color: #ef6a27;">info@kletterschuhe.de</a> |
  <a href="tel:+49XXXXXXXXX" style="color: #ef6a27;">+49 XXX XXXX XXX</a>
</p>
<p style="font-size: 12px; color: #888888;">
  kletterschuhe.de<br>
  Musterstraße 123<br>
  12345 Musterstadt
</p>
`;

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f3f3;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #efa335 0%, #ef6a27 100%); padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 24px;">kletterschuhe.de</h1>
      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Reparatur-Service</p>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      ${content}
      ${FOOTER}
    </div>
  </div>
</body>
</html>
`;

// ============================================
// Email Templates for Different Events
// ============================================

export interface OrderEmailData {
  orderNumber: number;
  customerName: string;
  email: string;
  items: Array<{
    quantity: number;
    manufacturer: string;
    model: string;
    calculatedPrice: number;
  }>;
  totalPrice: number;
  printUrl: string;
}

// 1. Order Confirmation (sent when customer submits order)
export function orderConfirmationEmail(data: OrderEmailData) {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          ${item.quantity}x ${item.manufacturer} ${item.model}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">
          ${item.calculatedPrice.toFixed(2)} €
        </td>
      </tr>
    `
    )
    .join('');

  const html = baseTemplate(`
    <h2 style="margin: 0 0 16px; color: #38362d;">Vielen Dank für Ihren Reparaturauftrag!</h2>

    <p style="color: #666; line-height: 1.6;">
      Guten Tag ${data.customerName},<br><br>
      wir haben Ihren Reparaturauftrag erhalten und bestätigen hiermit den Eingang.
    </p>

    <div style="background: #f8f8f8; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; color: #888;">Auftragsnummer</p>
      <p style="margin: 4px 0 0; font-size: 24px; font-weight: bold; color: #ef6a27;">#${data.orderNumber}</p>
    </div>

    <h3 style="margin: 24px 0 12px; color: #38362d;">Ihre Positionen:</h3>
    <table style="width: 100%; border-collapse: collapse;">
      ${itemsHtml}
      <tr style="background: #f8f8f8;">
        <td style="padding: 12px; font-weight: bold;">Kostenvoranschlag (KVA)</td>
        <td style="padding: 12px; text-align: right; font-weight: bold; color: #ef6a27; font-size: 18px;">
          ${data.totalPrice.toFixed(2)} €
        </td>
      </tr>
    </table>

    <div style="background: #fff8f0; border: 1px solid #ef6a27; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <h4 style="margin: 0 0 8px; color: #ef6a27;">Nächste Schritte:</h4>
      <ol style="margin: 0; padding-left: 20px; color: #666; line-height: 1.8;">
        <li>Drucken Sie den <a href="${data.printUrl}" style="color: #ef6a27; font-weight: bold;">Auftragszettel</a> aus</li>
        <li>Legen Sie den Zettel zu Ihren Schuhen</li>
        <li>Senden Sie das Paket an unsere Werkstatt</li>
        <li>Wir informieren Sie über den Fortschritt</li>
      </ol>
    </div>

    <p style="color: #666; line-height: 1.6;">
      Der KVA ist eine Kostenschätzung. Der endgültige Preis wird nach Begutachtung Ihrer Schuhe festgelegt.
      Bei Abweichungen kontaktieren wir Sie vorher.
    </p>
  `);

  return {
    to: data.email,
    subject: `Auftragsbestätigung #${data.orderNumber} - kletterschuhe.de`,
    html,
  };
}

// 2. Status Update Email
export interface StatusUpdateData {
  orderNumber: number;
  customerName: string;
  email: string;
  newStatus: string;
  statusLabel: string;
  comment?: string;
  trackingNumber?: string;
  trackingCarrier?: string;
}

const STATUS_MESSAGES: Record<string, { title: string; message: string }> = {
  RECEIVED: {
    title: 'Ihre Schuhe sind eingetroffen!',
    message: 'Wir haben Ihre Schuhe erhalten und werden sie in Kürze begutachten.',
  },
  INSPECTED: {
    title: 'Begutachtung abgeschlossen',
    message: 'Wir haben Ihre Schuhe begutachtet. Die Reparatur kann beginnen.',
  },
  REPAIRING: {
    title: 'Reparatur gestartet',
    message: 'Ihre Schuhe befinden sich jetzt in der Reparatur.',
  },
  READY: {
    title: 'Reparatur abgeschlossen!',
    message: 'Ihre Schuhe sind fertig repariert und werden in Kürze versandt.',
  },
  SHIPPED: {
    title: 'Ihre Schuhe sind unterwegs!',
    message: 'Wir haben Ihre reparierten Schuhe versandt.',
  },
  ON_HOLD: {
    title: 'Rückfrage zu Ihrem Auftrag',
    message: 'Wir haben eine Frage zu Ihrem Auftrag. Bitte kontaktieren Sie uns.',
  },
};

export function statusUpdateEmail(data: StatusUpdateData) {
  const statusInfo = STATUS_MESSAGES[data.newStatus] || {
    title: `Status-Update: ${data.statusLabel}`,
    message: 'Der Status Ihres Auftrags wurde aktualisiert.',
  };

  let trackingHtml = '';
  if (data.newStatus === 'SHIPPED' && data.trackingNumber) {
    trackingHtml = `
      <div style="background: #e8f5e9; border: 1px solid #4caf50; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <h4 style="margin: 0 0 8px; color: #2e7d32;">Sendungsverfolgung</h4>
        <p style="margin: 0; color: #666;">
          <strong>Versanddienstleister:</strong> ${data.trackingCarrier || 'DHL'}<br>
          <strong>Sendungsnummer:</strong> ${data.trackingNumber}
        </p>
      </div>
    `;
  }

  let commentHtml = '';
  if (data.comment) {
    commentHtml = `
      <div style="background: #f5f5f5; border-left: 4px solid #ef6a27; padding: 12px 16px; margin: 24px 0;">
        <p style="margin: 0; color: #666; font-style: italic;">"${data.comment}"</p>
      </div>
    `;
  }

  const html = baseTemplate(`
    <h2 style="margin: 0 0 16px; color: #38362d;">${statusInfo.title}</h2>

    <p style="color: #666; line-height: 1.6;">
      Guten Tag ${data.customerName},<br><br>
      ${statusInfo.message}
    </p>

    <div style="background: #f8f8f8; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; color: #888;">Auftrag</p>
      <p style="margin: 4px 0 0; font-size: 20px; font-weight: bold; color: #38362d;">#${data.orderNumber}</p>
      <p style="margin: 8px 0 0;">
        <span style="display: inline-block; padding: 4px 12px; background: #ef6a27; color: white; border-radius: 16px; font-size: 12px; font-weight: bold;">
          ${data.statusLabel}
        </span>
      </p>
    </div>

    ${trackingHtml}
    ${commentHtml}

    <p style="color: #666; line-height: 1.6;">
      Bei Fragen stehen wir Ihnen gerne zur Verfügung.
    </p>
  `);

  return {
    to: data.email,
    subject: `${statusInfo.title} - Auftrag #${data.orderNumber}`,
    html,
  };
}

// 3. Admin Notification (new order)
export function adminNewOrderEmail(data: OrderEmailData, adminEmail: string) {
  const itemsHtml = data.items
    .map(
      (item) => `
      <li>${item.quantity}x ${item.manufacturer} ${item.model} (${item.calculatedPrice.toFixed(2)} €)</li>
    `
    )
    .join('');

  const html = baseTemplate(`
    <h2 style="margin: 0 0 16px; color: #38362d;">Neuer Reparaturauftrag eingegangen</h2>

    <div style="background: #f8f8f8; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; color: #888;">Auftragsnummer</p>
      <p style="margin: 4px 0 0; font-size: 24px; font-weight: bold; color: #ef6a27;">#${data.orderNumber}</p>
    </div>

    <h3 style="margin: 24px 0 12px; color: #38362d;">Kunde:</h3>
    <p style="margin: 0; color: #666;">
      <strong>${data.customerName}</strong><br>
      ${data.email}
    </p>

    <h3 style="margin: 24px 0 12px; color: #38362d;">Positionen:</h3>
    <ul style="margin: 0; padding-left: 20px; color: #666;">
      ${itemsHtml}
    </ul>

    <p style="margin: 16px 0; font-size: 18px; font-weight: bold; color: #ef6a27;">
      KVA: ${data.totalPrice.toFixed(2)} €
    </p>

    <p style="margin-top: 24px;">
      <a href="${data.printUrl.replace('/print', '')}" style="display: inline-block; padding: 12px 24px; background: #ef6a27; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Auftrag im Admin öffnen
      </a>
    </p>
  `);

  return {
    to: adminEmail,
    subject: `[Neu] Reparaturauftrag #${data.orderNumber} von ${data.customerName}`,
    html,
  };
}
