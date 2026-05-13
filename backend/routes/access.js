const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const DeviceSession = require("../models/DeviceSession");
const { demoDeviceSessions } = require("../demoData");

// Helper to check if MongoDB is connected (dynamic check)
const isMongoConnected = () => {
  try {
    return mongoose.connection.readyState > 0;
  } catch (e) {
    return false;
  }
};

// Check if device has access to internet
router.get("/check/:macAddress", async (req, res) => {
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
        return res.status(403).json({
          message: "Access Denied: No active session found",
          hasAccess: false,
          redirectUrl: "/",
        });
      }

      const session = activeSessions[0];
      const timeRemaining = Math.floor((session.endTime - new Date()) / 1000);

      // Update session status if time expired
      if (timeRemaining <= 0) {
        session.status = "expired";
        return res.status(403).json({
          message: "Access Denied: Session has expired",
          hasAccess: false,
          redirectUrl: "/",
        });
      }

      return res.status(200).json({
        message: "Access Granted",
        hasAccess: true,
        sessionId: session.sessionId,
        timeRemaining,
        sessionData: {
          amount: session.amount,
          duration: session.duration,
          startTime: session.startTime,
          endTime: session.endTime,
          customerId: session.customerId,
        },
      });
    }

    // Normal mode
    const session = await DeviceSession.findOne({
      deviceId: macAddress,
      status: "active",
      endTime: { $gt: new Date() },
    });

    if (!session) {
      return res.status(403).json({
        message: "Access Denied: No active session found",
        hasAccess: false,
        redirectUrl: "/",
      });
    }

    const timeRemaining = Math.floor((session.endTime - new Date()) / 1000);

    if (timeRemaining <= 0) {
      session.status = "expired";
      await session.save();
      return res.status(403).json({
        message: "Access Denied: Session has expired",
        hasAccess: false,
        redirectUrl: "/",
      });
    }

    res.status(200).json({
      message: "Access Granted",
      hasAccess: true,
      sessionId: session.sessionId,
      timeRemaining,
      sessionData: {
        amount: session.amount,
        duration: session.duration,
        startTime: session.startTime,
        endTime: session.endTime,
        customerId: session.customerId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get access status with details (for captive portal)
router.get("/status/:macAddress", async (req, res) => {
  try {
    const { macAddress } = req.params;

    if (!isMongoConnected()) {
      // Demo mode
      const activeSessions = (demoDeviceSessions || []).filter(
        (s) =>
          s.deviceId === macAddress &&
          s.status === "active" &&
          new Date() < s.endTime,
      );

      if (activeSessions.length > 0) {
        const session = activeSessions[0];
        const timeRemaining = Math.floor((session.endTime - new Date()) / 1000);
        return res.status(200).json({
          status: "GRANTED",
          description: "Device has an active internet session",
          timeRemaining,
          session,
        });
      }

      return res.status(200).json({
        status: "RESTRICTED",
        description: "Device is restricted. Please purchase internet access.",
        redirectUrl: "/",
        timeRemaining: 0,
      });
    }

    // Normal mode
    const session = await DeviceSession.findOne({
      deviceId: macAddress,
      status: "active",
      endTime: { $gt: new Date() },
    });

    if (session) {
      const timeRemaining = Math.floor((session.endTime - new Date()) / 1000);
      return res.status(200).json({
        status: "GRANTED",
        description: "Device has an active internet session",
        timeRemaining,
        session,
      });
    }

    res.status(200).json({
      status: "RESTRICTED",
      description: "Device is restricted. Please purchase internet access.",
      redirectUrl: "/",
      timeRemaining: 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Revoke access for a device
router.post("/revoke/:macAddress", async (req, res) => {
  try {
    const { macAddress } = req.params;

    if (!isMongoConnected()) {
      // Demo mode
      const sessions = (demoDeviceSessions || []).filter(
        (s) => s.deviceId === macAddress,
      );
      sessions.forEach((session) => {
        session.status = "revoked";
      });

      return res.status(200).json({
        message: "Access revoked for device",
        devicesAffected: sessions.length,
      });
    }

    // Normal mode
    const result = await DeviceSession.updateMany(
      { deviceId: macAddress, status: "active" },
      { status: "revoked" },
    );

    res.status(200).json({
      message: "Access revoked for device",
      devicesAffected: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
