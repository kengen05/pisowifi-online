const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  voucherId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  voucherCode: {
    type: String,
    required: true,
    unique: true,
  },
  voucherType: {
    type: String,
    enum: ['time-based', 'data-based'],
    default: 'time-based',
  },
  price: {
    type: Number,
    required: true,
  },
  duration: Number, // in minutes
  dataLimit: Number, // in MB
  quantity: Number,
  usedQuantity: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: Date,
});

module.exports = mongoose.model('Voucher', voucherSchema);
