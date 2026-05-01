import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendMail } from '../utils/mailer.js';
import { buildInvoiceEmail } from '../utils/invoiceTemplate.js';

/**
 * POST /api/orders - Create order (protected or guest with shippingAddress).
 */
export const create = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, paymentConfirmation } = req.body;
    if (!orderItems?.length || !shippingAddress?.fullName || !shippingAddress?.email) {
      return res.status(400).json({ message: 'Missing order items or customer details' });
    }

    const uniqueIds = [...new Set(orderItems.map((item) => String(item.product)))];
    const dbProducts = await Product.find({ _id: { $in: uniqueIds } }).populate('category', 'slug name');
    const byId = new Map(dbProducts.map((p) => [String(p._id), p]));

    let itemsPrice = 0;
    const resolvedItems = [];
    let requiresShipping = false;
    for (const item of orderItems) {
      const product = byId.get(String(item.product));
      if (!product) return res.status(400).json({ message: `Product not found: ${item.product}` });
      const catSlug = String(product.category?.slug || '').toLowerCase();
      const catName = String(product.category?.name || '').toLowerCase();
      if (catSlug.includes('fashion') || catName.includes('fashion')) {
        requiresShipping = true;
      }
      const qty = Math.max(1, parseInt(item.qty) || 1);
      const price = product.price;
      itemsPrice += price * qty;
      resolvedItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price,
        qty,
      });
    }

    if (requiresShipping && (!shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.country)) {
      return res.status(400).json({ message: 'Address, city and country are required for fashion items' });
    }

    if ((paymentMethod || 'manual_qr') === 'manual_qr') {
      const uid = String(paymentConfirmation?.playerUserId || '').trim();
      const ign = String(paymentConfirmation?.inGameName || '').trim();
      if (!uid || !ign) {
        return res.status(400).json({ message: 'Player user ID and in-game name are required for QR payment confirmation' });
      }
    }

    // Tax is intentionally disabled per business requirement.
    const taxPrice = 0;
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    const order = await Order.create({
      user: req.user?._id || null,
      orderItems: resolvedItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'manual_qr',
      paymentConfirmation: {
        transactionId: paymentConfirmation?.transactionId || '',
        playerUserId: String(paymentConfirmation?.playerUserId || '').trim(),
        inGameName: String(paymentConfirmation?.inGameName || '').trim(),
        screenshotData: paymentConfirmation?.screenshotData || '',
        screenshotName: paymentConfirmation?.screenshotName || '',
      },
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: 'pending',
    });
    order.invoiceNumber = `INV-${new Date().getFullYear()}-${String(order._id).slice(-6).toUpperCase()}`;
    await order.save();

    const invoiceTo = shippingAddress.email;
    const invoiceNumber = order.invoiceNumber;
    const orderForMail = typeof order.toObject === 'function' ? order.toObject() : { ...order };
    Promise.resolve()
      .then(async () => {
        try {
          const { html, text } = buildInvoiceEmail({ order: orderForMail, invoiceNumber });
          await sendMail({
            to: invoiceTo,
            subject: `Shield Invoice ${invoiceNumber}`,
            html,
            text,
          });
        } catch (mailErr) {
          console.error('Invoice email failed:', mailErr.message);
        }
      })
      .catch(() => {});

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders - List orders for current user or all for admin.
 */
export const list = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const skip = (page - 1) * limit;
      const [orders, total] = await Promise.all([
        Order.find({})
          .sort('-createdAt')
          .skip(skip)
          .limit(limit)
          .populate('user', 'name email')
          .lean(),
        Order.countDocuments({}),
      ]);
      const pages = Math.max(1, Math.ceil(total / limit));
      return res.json({ orders, total, pages, page, limit });
    }

    const orders = await Order.find({ user: req.user._id }).sort('-createdAt').populate('user', 'name email').lean();
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/:id - Get single order.
 */
export const getOne = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user?.role !== 'admin' && order.user?._id?.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/orders/:id/status - Update order status (admin).
 */
export const updateStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const { status } = req.body;
    if (['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      const previousStatus = order.status;
      order.status = status;
      if (status === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = new Date();
      }
      await order.save();

      const shouldNotifyCustomer = ['delivered', 'cancelled'].includes(status);
      const notifyEmail = order.shippingAddress?.email;
      if (status !== previousStatus && shouldNotifyCustomer && notifyEmail) {
        const customerName = order.shippingAddress?.fullName || 'Customer';
        const orderRef = order.invoiceNumber || order._id;
        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
        const statusColor = status === 'delivered' ? '#166534' : '#991b1b';
        const statusBg = status === 'delivered' ? '#dcfce7' : '#fee2e2';
        Promise.resolve()
          .then(async () => {
            try {
              await sendMail({
                to: notifyEmail,
                subject: `Order ${orderRef} status: ${statusLabel}`,
                html: `<div style="background:#f5f7fb;padding:20px 12px;font-family:Arial,sans-serif;color:#111827;"><div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;"><div style="background:#111827;color:#ffffff;padding:16px 18px;"><h2 style="margin:0;font-size:18px;">Order Status Update</h2></div><div style="padding:18px;"><p style="margin:0 0 12px 0;">Hi ${customerName},</p><p style="margin:0 0 12px 0;">Your order <strong>${orderRef}</strong> has been updated.</p><p style="display:inline-block;margin:2px 0 12px 0;padding:7px 12px;border-radius:999px;background:${statusBg};color:${statusColor};font-weight:700;">${statusLabel}</p><p style="margin:10px 0 0 0;color:#6b7280;">Thank you for shopping with The Shield Store.</p></div></div></div>`,
                text: `Hi ${customerName}, your order ${orderRef} status is now ${statusLabel}. Thank you for shopping with The Shield Store.`,
              });
            } catch (mailErr) {
              console.error('Order status email failed:', mailErr.message);
            }
          })
          .catch(() => {});
      }
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};
