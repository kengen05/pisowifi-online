const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String, // Can be ObjectId for admin users or string for customers
    required: true,
  },
  voucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Voucher",
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["qr_ph", "cash", "card"],
    default: "qr_ph",
  },
  qrPhTransactionId: String,
  phoneNumber: String,
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Device",
  },
  sessionDuration: Number, // in minutes
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  },
  completedAt: Date,
});

// Set TTL index for automatic deletion of expired pending payments
paymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Payment", paymentSchema);
