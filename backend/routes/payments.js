const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Device = require("../models/Device");
const DeviceSession = require("../models/DeviceSession");
const Activity = require("../models/Activity");
const { v4: uuidv4 } = require("uuid");
const {
  demoPayments,
  demoActivities,
  demoDeviceSessions,
  demoDevices,
} = require("../demoData");

// Helper to check if MongoDB is connected (dynamic check)
const isMongoConnected = () => {
  try {
    return mongoose.connection.readyState > 0;
  } catch (e) {
    return false;
  }
};

// Create Payment Request (QR Code Generation)
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { amount, deviceId, sessionDuration } = req.body;
    const paymentId = uuidv4();

    if (!isMongoConnected()) {
      // Demo mode
      const payment = {
        _id: paymentId,
        paymentId,
        userId: req.user.id,
        amount,
        deviceId,
        sessionDuration,
        status: "pending",
        paymentMethod: "qr_ph",
        createdAt: new Date(),
      };

      demoPayments.push(payment);
      demoActivities.push({
        _id: uuidv4(),
        userId: req.user.id,
        deviceId,
        activityType: "payment",
        description: `Payment request created: ₱${amount}`,
        details: { paymentId, amount },
        createdAt: new Date(),
      });

      const qrCodeUrl = `https://api.qrph.com/qr/${paymentId}`;

      return res.status(201).json({
        message: "Payment request created (Demo Mode)",
        paymentId,
        qrCodeUrl,
        amount,
      });
    }

    // Normal mode
    const payment = new Payment({
      paymentId,
      userId: req.user.id,
      amount,
      deviceId,
      sessionDuration,
      status: "pending",
      paymentMethod: "qr_ph",
    });

    await payment.save();

    await Activity.create({
      userId: req.user.id,
      deviceId,
      activityType: "payment",
      description: `Payment request created: ₱${amount}`,
      details: { paymentId, amount },
    });

    const qrCodeUrl = `https://api.qrph.com/qr/${paymentId}`;

    res.status(201).json({
      message: "Payment request created",
      paymentId,
      qrCodeUrl,
      amount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Payment Request for Customers (Public - No Auth Required)
router.post("/create-customer", async (req, res) => {
  try {
    const { amount, sessionDuration } = req.body;
    const paymentId = uuidv4();
    const customerId = "customer-" + uuidv4(); // Generate temporary customer ID
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    if (!isMongoConnected()) {
      // Demo mode
      const payment = {
        _id: paymentId,
        paymentId,
        userId: customerId,
        amount,
        sessionDuration,
        status: "pending",
        paymentMethod: "qr_ph",
        createdAt: new Date(),
        expiresAt,
      };

      demoPayments.push(payment);

      return res.status(201).json({
        message: "Payment request created (Demo Mode)",
        paymentId,
        customerId,
        amount,
        expiresIn: 300, // 5 minutes in seconds
      });
    }

    // Normal mode
    const payment = new Payment({
      paymentId,
      userId: customerId,
      amount,
      sessionDuration,
      status: "pending",
      paymentMethod: "qr_ph",
      expiresAt,
    });

    await payment.save();

    res.status(201).json({
      message: "Payment request created",
      paymentId,
      customerId,
      amount,
      expiresIn: 300, // 5 minutes in seconds
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check Payment Status (Public endpoint for customers to poll)
router.get("/status/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!isMongoConnected()) {
      // Demo mode
      const payment = demoPayments.find((p) => p.paymentId === paymentId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      return res.status(200).json({
        paymentId: payment.paymentId,
        status: payment.status,
        amount: payment.amount,
        expiresAt: payment.expiresAt,
      });
    }

    // Normal mode
    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({
      paymentId: payment.paymentId,
      status: payment.status,
      amount: payment.amount,
      expiresAt: payment.expiresAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Confirm Payment (After QR PH confirms) - Creates Device Session
router.post("/confirm/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { qrPhTransactionId, phoneNumber, deviceMacAddress, deviceIp, deviceName } = req.body;

    if (!isMongoConnected()) {
      // Demo mode
      const payment = demoPayments.find((p) => p.paymentId === paymentId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      // Check if payment expired
      if (payment.expiresAt && new Date() > payment.expiresAt) {
        return res.status(410).json({ message: "Payment request expired" });
      }

      payment.status = "completed";
      payment.qrPhTransactionId = qrPhTransactionId;
      payment.phoneNumber = phoneNumber;
      payment.completedAt = new Date();

      // Create device session
      const sessionId = "SESSION-" + uuidv4();
      const startTime = new Date();
      const endTime = new Date(
        startTime.getTime() + (payment.sessionDuration || 60) * 60 * 1000,
      );

      const deviceSession = {
        _id: sessionId,
        sessionId,
        paymentId,
        customerId: payment.userId,
        amount: payment.amount,
        duration: payment.sessionDuration || 60,
        startTime,
        endTime,
        status: "active",
        deviceId: deviceMacAddress || "unknown",
        createdAt: new Date(),
      };

      if (!demoDeviceSessions) {
        // Initialize if doesn't exist
        require("../demoData").demoDeviceSessions = [];
      }
      demoDeviceSessions.push(deviceSession);

      // Also register the device if it doesn't exist
      if (deviceMacAddress) {
        const existingDevice = demoDevices.find(
          (d) => d.macAddress === deviceMacAddress,
        );
        if (!existingDevice) {
          const newDevice = {
            _id: uuidv4(),
            deviceId: uuidv4(),
            userId: payment.userId,
            deviceName: deviceName || `Device - ${deviceMacAddress}`,
            macAddress: deviceMacAddress,
            ipAddress: deviceIp || "dynamic",
            isOnline: true,
            totalUsers: 0,
            totalBandwidth: 0,
            createdAt: new Date(),
          };
          demoDevices.push(newDevice);
        }
      }

      demoActivities.push({
        _id: uuidv4(),
        userId: payment.userId,
        deviceId: deviceMacAddress,
        activityType: "payment",
        description: `Payment confirmed: ₱${payment.amount}`,
        details: { paymentId, qrPhTransactionId, sessionId },
        createdAt: new Date(),
      });

      return res.status(200).json({
        message: "Payment confirmed successfully (Demo Mode)",
        payment,
        session: deviceSession,
        timeRemaining: Math.floor((endTime - new Date()) / 1000), // seconds
      });
    }

    // Normal mode
    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Check if payment expired
    if (payment.expiresAt && new Date() > payment.expiresAt) {
      return res.status(410).json({ message: "Payment request expired" });
    }

    payment.status = "completed";
    payment.qrPhTransactionId = qrPhTransactionId;
    payment.phoneNumber = phoneNumber;
    payment.completedAt = new Date();

    await payment.save();

    // Create device session
    const sessionId = "SESSION-" + uuidv4();
    const startTime = new Date();
    const endTime = new Date(
      startTime.getTime() + (payment.sessionDuration || 60) * 60 * 1000,
    );

    const deviceSession = new DeviceSession({
      sessionId,
      paymentId,
      customerId: payment.userId,
      amount: payment.amount,
      duration: payment.sessionDuration || 60,
      startTime,
      endTime,
      status: "active",
      deviceId: deviceMacAddress || "unknown",
    });

    await deviceSession.save();

    // Also register the device if it doesn't exist
    if (deviceMacAddress) {
      const existingDevice = await Device.findOne({
        macAddress: deviceMacAddress,
      });
      if (!existingDevice) {
        const newDevice = new Device({
          deviceId: uuidv4(),
          userId: payment.userId,
          deviceName: deviceName || `Device - ${deviceMacAddress}`,
          macAddress: deviceMacAddress,
          ipAddress: deviceIp || "dynamic",
          isOnline: true,
        });
        await newDevice.save();
      }
    }

    await Activity.create({
      userId: payment.userId,
      deviceId: deviceMacAddress,
      activityType: "payment",
      description: `Payment confirmed: ₱${payment.amount}`,
      details: { paymentId, qrPhTransactionId, sessionId },
    });

    res.status(200).json({
      message: "Payment confirmed successfully",
      payment,
      session: deviceSession,
      timeRemaining: Math.floor((endTime - new Date()) / 1000), // seconds
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.status(500).json({ message: error.message, error: error.toString() });
  }
});

// Admin: Get All Payments (must come before /history)
router.get("/admin/all", authMiddleware, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      // Demo mode - return all payments sorted by date
      const payments = demoPayments.sort((a, b) => b.createdAt - a.createdAt);
      return res.status(200).json(payments);
    }

    // Normal mode
    const payments = await Payment.find()
      .populate("userId", "email")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Payment History
router.get("/history", authMiddleware, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      // Demo mode
      const payments = demoPayments
        .filter((p) => p.userId === req.user.id)
        .sort((a, b) => b.createdAt - a.createdAt);
      return res.status(200).json(payments);
    }

    // Normal mode
    const payments = await Payment.find({ userId: req.user.id })
      .populate("voucherId")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Payment Stats
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      // Demo mode
      const userPayments = demoPayments.filter((p) => p.userId === req.user.id);
      const totalPayments = userPayments.length;
      const completedPayments = userPayments.filter(
        (p) => p.status === "completed",
      ).length;
      const totalRevenue = userPayments
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + p.amount, 0);

      return res.status(200).json({
        totalPayments,
        completedPayments,
        totalRevenue,
      });
    }

    // Normal mode
    const totalPayments = await Payment.countDocuments({ userId: req.user.id });
    const completedPayments = await Payment.countDocuments({
      userId: req.user.id,
      status: "completed",
    });
    const totalRevenue = await Payment.aggregate([
      {
        $match: {
          userId: require("mongoose").Types.ObjectId(req.user.id),
          status: "completed",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.status(200).json({
      totalPayments,
      completedPayments,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check Device Access (Public - for hotspot portal)
router.get("/device-access/:macAddress", async (req, res) => {
  try {
    const { macAddress } = req.params;

    if (!isMongoConnected()) {
      // Demo mode - check for active session
      const activeSessions = (demoDeviceSessions || []).filter(
        (s) =>
          s.deviceId === macAddress &&
          s.status === "active" &&
          new Date() < s.endTime,
      );

      if (activeSessions.length === 0) {
        return res
          .status(404)
          .json({ message: "No active session found", hasAccess: false });
      }

      const session = activeSessions[0];
      const timeRemaining = Math.floor((session.endTime - new Date()) / 1000);

      return res.status(200).json({
        message: "Device has active session",
        hasAccess: true,
        sessionId: session.sessionId,
        timeRemaining,
        session,
      });
    }

    // Normal mode
    const session = await DeviceSession.findOne({
      deviceId: macAddress,
      status: "active",
      endTime: { $gt: new Date() },
    });

    if (!session) {
      return res
        .status(404)
        .json({ message: "No active session found", hasAccess: false });
    }

    const timeRemaining = Math.floor((session.endTime - new Date()) / 1000);

    res.status(200).json({
      message: "Device has active session",
      hasAccess: true,
      sessionId: session.sessionId,
      timeRemaining,
      session,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Active Sessions by MAC Address (Admin endpoint)
router.get("/sessions/:macAddress", authMiddleware, async (req, res) => {
  try {
    const { macAddress } = req.params;

    if (!isMongoConnected()) {
      // Demo mode
      const sessions = (demoDeviceSessions || []).filter(
        (s) => s.deviceId === macAddress,
      );
      return res.status(200).json(sessions);
    }

    // Normal mode
    const sessions = await DeviceSession.find({ deviceId: macAddress }).sort({
      createdAt: -1,
    });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Session Details
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!isMongoConnected()) {
      // Demo mode
      const session = (demoDeviceSessions || []).find(
        (s) => s.sessionId === sessionId,
      );
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const timeRemaining = Math.max(
        0,
        Math.floor((session.endTime - new Date()) / 1000),
      );
      return res.status(200).json({
        session,
        timeRemaining,
        isActive: session.status === "active" && new Date() < session.endTime,
      });
    }

    // Normal mode
    const session = await DeviceSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const timeRemaining = Math.max(
      0,
      Math.floor((session.endTime - new Date()) / 1000),
    );
    res.status(200).json({
      session,
      timeRemaining,
      isActive: session.status === "active" && new Date() < session.endTime,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
