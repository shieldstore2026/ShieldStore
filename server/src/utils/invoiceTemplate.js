export function buildInvoiceEmail({ order, invoiceNumber }) {
  const itemsRows = (order.orderItems || [])
    .map((item) => `<tr><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${item.name}</td><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.qty}</td><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">Rs ${Number(item.price).toFixed(2)}</td></tr>`)
    .join('');
  const customerName = order.shippingAddress?.fullName || 'Customer';
  const customerEmail = order.shippingAddress?.email || '-';
  const customerPhone = order.shippingAddress?.phone || '-';
  const shippingAddress = [order.shippingAddress?.address, order.shippingAddress?.city, order.shippingAddress?.country]
    .filter(Boolean)
    .join(', ') || '-';
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString();
  const pc = order.paymentConfirmation || {};
  const playerUid = pc.playerUserId ? String(pc.playerUserId).trim() : '';
  const playerIgn = pc.inGameName ? String(pc.inGameName).trim() : '';

  const html = `
  <div style="background:#f5f7fb;padding:20px 12px;font-family:Arial,sans-serif;color:#111827;">
    <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="background:#111827;color:#ffffff;padding:18px 20px;">
        <h2 style="margin:0;font-size:20px;">The Shield Store</h2>
        <p style="margin:6px 0 0 0;color:#cbd5e1;font-size:13px;">Invoice #${invoiceNumber}</p>
      </div>
      <div style="padding:20px;">
        <p style="margin:0 0 12px 0;">Hi ${customerName}, your order has been placed successfully.</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
          <tr>
            <td style="padding:4px 0;color:#6b7280;">Order Date</td>
            <td style="padding:4px 0;text-align:right;">${orderDate}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280;">Customer Email</td>
            <td style="padding:4px 0;text-align:right;">${customerEmail}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280;">Phone</td>
            <td style="padding:4px 0;text-align:right;">${customerPhone}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280;">Shipping Address</td>
            <td style="padding:4px 0;text-align:right;">${shippingAddress}</td>
          </tr>
          ${playerUid ? `<tr><td style="padding:4px 0;color:#6b7280;">Player user ID</td><td style="padding:4px 0;text-align:right;">${playerUid}</td></tr>` : ''}
          ${playerIgn ? `<tr><td style="padding:4px 0;color:#6b7280;">In-game name</td><td style="padding:4px 0;text-align:right;">${playerIgn}</td></tr>` : ''}
        </table>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
          <thead>
            <tr style="background:#f9fafb;text-align:left;">
              <th style="padding:10px 12px;">Item</th>
              <th style="padding:10px 12px;text-align:center;">Qty</th>
              <th style="padding:10px 12px;text-align:right;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>
        <div style="margin-top:14px;line-height:1.8;">
          <div>Items: <strong>Rs ${Number(order.itemsPrice || 0).toFixed(2)}</strong></div>
          <div>Shipping: <strong>Rs ${Number(order.shippingPrice || 0).toFixed(2)}</strong></div>
          <div style="font-size:18px;">Total: <strong>Rs ${Number(order.totalPrice || 0).toFixed(2)}</strong></div>
        </div>
        <p style="margin-top:14px;color:#374151;">Payment method: ${order.paymentMethod || 'manual_qr'}</p>
        <p style="margin:14px 0 0 0;color:#6b7280;">Thank you for shopping with The Shield Store.</p>
      </div>
    </div>
  </div>`;

  const playerLines = [
    playerUid ? `Player user ID: ${playerUid}` : '',
    playerIgn ? `In-game name: ${playerIgn}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  const text = `Invoice ${invoiceNumber}
Order Date: ${orderDate}
Customer: ${customerName}
${playerLines ? playerLines + '\n' : ''}Items: Rs ${Number(order.itemsPrice || 0).toFixed(2)}
Shipping: Rs ${Number(order.shippingPrice || 0).toFixed(2)}
Total: Rs ${Number(order.totalPrice || 0).toFixed(2)}`;
  return { html, text };
}
