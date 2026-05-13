const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String, // Can be ObjectId for admin users or string for customers
    required: true,
  },
  deviceName: String,
  macAddress: String,
  ipAddress: String,
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastSeen: Date,
  totalUsers: {
    type: Number,
    default: 0,
  },
  totalBandwidth: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Device", deviceSchema);
