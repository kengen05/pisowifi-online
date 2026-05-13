const mongoose = require("mongoose");

const deviceSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  paymentId: {
    type: String,
    required: true,
  },
  customerId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["active", "expired", "completed"],
    default: "active",
  },
  deviceId: String, // MAC address or device identifier
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Set TTL index based on endTime
deviceSessionSchema.index({ endTime: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("DeviceSession", deviceSessionSchema);
