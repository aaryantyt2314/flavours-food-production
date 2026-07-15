// Best-effort admin notifications via Telegram Bot API.
//
// Setup (free): create a bot with @BotFather to get TELEGRAM_BOT_TOKEN, message
// the bot once from the admin's phone, then read the chat id from
// https://api.telegram.org/bot<token>/getUpdates and set TELEGRAM_CHAT_ID.
//
// Notifications must never break the customer-facing request: every failure is
// swallowed after logging, and unconfigured environments are a silent no-op.

const NOTIFY_TIMEOUT_MS = 4000;

export type AdminEvent =
  | { kind: 'order'; orderId: string; total: number; paymentMethod: string; itemCount: number; customer: string }
  | { kind: 'payment'; orderId: string; total: number; customer: string }
  | { kind: 'reservation'; name: string; phone: string; date: string; time: string; partySize: number }
  | { kind: 'inquiry'; name: string; email: string; subject: string | null };

function formatMessage(event: AdminEvent): string {
  switch (event.kind) {
    case 'order':
      return [
        `🛎️ New order #${event.orderId.slice(-8)}`,
        `Total: ₹${event.total} · ${event.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (awaiting payment)'}`,
        `${event.itemCount} item(s) · ${event.customer}`,
      ].join('\n');
    case 'payment':
      return [
        `✅ Payment received for order #${event.orderId.slice(-8)}`,
        `₹${event.total} · ${event.customer}`,
      ].join('\n');
    case 'reservation':
      return [
        `📅 New table reservation`,
        `${event.name} · ${event.phone}`,
        `${event.date} at ${event.time} · ${event.partySize} guest(s)`,
      ].join('\n');
    case 'inquiry':
      return [
        `✉️ New contact inquiry`,
        `${event.name} · ${event.email}`,
        event.subject ? `Subject: ${event.subject}` : 'No subject',
      ].join('\n');
  }
}

export async function notifyAdmin(event: AdminEvent): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: formatMessage(event) }),
      signal: AbortSignal.timeout(NOTIFY_TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error('Admin notification failed:', res.status, await res.text().catch(() => ''));
    }
  } catch (error) {
    console.error('Admin notification error:', error);
  }
}
