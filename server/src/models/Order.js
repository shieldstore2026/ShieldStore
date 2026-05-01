import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      state: String,
      zip: String,
      country: { type: String, default: '' },
    },
    paymentMethod: { type: String, default: 'esewa' },
    invoiceNumber: { type: String, default: '' },
    paymentResult: {
      id: String,
      status: String,
      updateTime: String,
      email: String,
    },
    paymentConfirmation: {
      transactionId: { type: String, default: '' },
      playerUserId: { type: String, default: '' },
      inGameName: { type: String, default: '' },
      screenshotData: { type: String, default: '' },
      screenshotName: { type: String, default: '' },
      reviewed: { type: Boolean, default: false },
    },
    itemsPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
    status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model('Order', orderSchema);
