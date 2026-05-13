const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: String, // Can be ObjectId or string for customers
  },
  deviceId: {
    type: String, // Can be ObjectId or string (MAC address)
  },
  activityType: {
    type: String,
    enum: ['login', 'logout', 'payment', 'voucher_used', 'device_online', 'device_offline', 'settings_changed'],
    required: true,
  },
  description: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Activity', activitySchema);
