const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const mongoose = require("mongoose");
const Device = require("../models/Device");
const Activity = require("../models/Activity");
const { v4: uuidv4 } = require("uuid");
const {
  demoDevices,
  demoActivities,
  demoDeviceSessions,
} = require("../demoData");

// Helper to check if MongoDB is connected (dynamic check)
const isMongoConnected = () => {
  try {
    return mongoose.connection.readyState > 0;
  } catch (e) {
    return false;
  }
};

// Register Device
router.post("/register", authMiddleware, async (req, res) => {
  try {
    const { deviceName, macAddress, ipAddress } = req.body;

    const deviceId = uuidv4();

    if (!isMongoConnected()) {
      // Demo mode
      const device = {
        _id: deviceId,
        deviceId,
        userId: req.user.id,
        deviceName,
        macAddress,
        ipAddress,
        isOnline: true,
        totalUsers: 0,
        totalBandwidth: 0,
        createdAt: new Date(),
      };

      demoDevices.push(device);
      demoActivities.push({
        _id: uuidv4(),
        userId: req.user.id,
        deviceId: device._id,
        activityType: "device_online",
        description: `Device registered: ${deviceName}`,
        details: { macAddress },
        createdAt: new Date(),
      });

      return res.status(201).json({
        message: "Device registered successfully (Demo Mode)",
        device,
      });
    }

    // Normal mode
    const device = new Device({
      deviceId,
      userId: req.user.id,
      deviceName,
      macAddress,
      ipAddress,
      isOnline: true,
    });

    await device.save();

    await Activity.create({
      userId: req.user.id,
      deviceId: device._id,
      activityType: "device_online",
      description: `Device registered: ${deviceName}`,
      details: { macAddress },
    });

    res.status(201).json({ message: "Device registered successfully", device });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get All Devices (must come before GET /)
router.get("/admin/all", authMiddleware, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      // Demo mode - return all devices with session info
      const devices = (demoDevices || []).map((device) => {
        // Find active session for this device
        const activeSession = (demoDeviceSessions || []).find(
          (s) => s.deviceId === device.macAddress && s.status === "active",
        );

        const now = new Date();
        let remainingTime = null;
        let sessionStatus = "pause"; // default to pause

        if (activeSession && activeSession.endTime) {
          const timeRemaining = activeSession.endTime - now;
          if (timeRemaining > 0) {
            remainingTime = Math.ceil(timeRemaining / 1000); // in seconds
            sessionStatus = "running";
          }
        }

        return {
          ...device,
          remainingTime,
          sessionStatus,
        };
      });

      return res.status(200).json(devices);
    }

    // Normal mode
    const DeviceSession = require("../models/DeviceSession");
    const devices = await Device.find()
      .populate("userId", "email")
      .sort({ createdAt: -1 });

    // Enrich devices with session information
    const enrichedDevices = await Promise.all(
      devices.map(async (device) => {
        const activeSession = await DeviceSession.findOne({
          deviceId: device.macAddress,
          status: "active",
        });

        const now = new Date();
        let remainingTime = null;
        let sessionStatus = "pause"; // default to pause

        if (activeSession && activeSession.endTime) {
          const timeRemaining = activeSession.endTime - now;
          if (timeRemaining > 0) {
            remainingTime = Math.ceil(timeRemaining / 1000); // in seconds
            sessionStatus = "running";
          } else {
            // Session expired, mark as expired
            activeSession.status = "expired";
            await activeSession.save();
          }
        }

        return {
          ...device.toObject(),
          remainingTime,
          sessionStatus,
        };
      }),
    );

    res.status(200).json(enrichedDevices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Devices
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      // Demo mode
      const devices = demoDevices.filter((d) => d.userId === req.user.id);
      return res.status(200).json(devices);
    }

    // Normal mode
    const devices = await Device.find({ userId: req.user.id });
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Device Status
router.put("/:deviceId/status", authMiddleware, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { isOnline } = req.body;

    if (!isMongoConnected()) {
      // Demo mode
      const device = demoDevices.find(
        (d) => d.deviceId === deviceId && d.userId === req.user.id,
      );
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }

      device.isOnline = isOnline;
      device.lastSeen = new Date();

      demoActivities.push({
        _id: uuidv4(),
        userId: req.user.id,
        deviceId: device._id,
        activityType: isOnline ? "device_online" : "device_offline",
        description: `Device ${isOnline ? "online" : "offline"}: ${device.deviceName}`,
        createdAt: new Date(),
      });

      return res.status(200).json({
        message: "Device status updated (Demo Mode)",
        device,
      });
    }

    // Normal mode
    const device = await Device.findOneAndUpdate(
      { deviceId, userId: req.user.id },
      { isOnline, lastSeen: new Date() },
      { new: true },
    );

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    await Activity.create({
      userId: req.user.id,
      deviceId: device._id,
      activityType: isOnline ? "device_online" : "device_offline",
      description: `Device ${isOnline ? "online" : "offline"}: ${device.deviceName}`,
    });

    res.status(200).json({ message: "Device status updated", device });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Device (User - must own device)
router.delete("/:deviceId", authMiddleware, async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!isMongoConnected()) {
      // Demo mode
      const deviceIndex = demoDevices.findIndex(
        (d) => d.deviceId === deviceId && d.userId === req.user.id,
      );
      if (deviceIndex === -1) {
        return res.status(404).json({ message: "Device not found" });
      }

      const device = demoDevices[deviceIndex];
      demoDevices.splice(deviceIndex, 1);

      demoActivities.push({
        _id: uuidv4(),
        userId: req.user.id,
        deviceId: device._id,
        activityType: "device_offline",
        description: `Device removed: ${device.deviceName}`,
        createdAt: new Date(),
      });

      return res.status(200).json({
        message: "Device deleted successfully (Demo Mode)",
        deviceId,
      });
    }

    // Normal mode
    const device = await Device.findOneAndDelete({
      deviceId,
      userId: req.user.id,
    });

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    await Activity.create({
      userId: req.user.id,
      deviceId: device._id,
      activityType: "device_offline",
      description: `Device removed: ${device.deviceName}`,
    });

    res.status(200).json({
      message: "Device deleted successfully",
      deviceId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Device (Admin - can delete any device)
router.delete("/admin/:deviceId", authMiddleware, async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!isMongoConnected()) {
      // Demo mode - allow admin to delete any device by deviceId
      const deviceIndex = demoDevices.findIndex((d) => d.deviceId === deviceId);
      if (deviceIndex === -1) {
        return res.status(404).json({ message: "Device not found" });
      }

      const device = demoDevices[deviceIndex];
      demoDevices.splice(deviceIndex, 1);

      demoActivities.push({
        _id: uuidv4(),
        userId: req.user.id,
        deviceId: device._id,
        activityType: "device_offline",
        description: `Device removed by admin: ${device.deviceName}`,
        createdAt: new Date(),
      });

      return res.status(200).json({
        message: "Device deleted successfully (Demo Mode)",
        deviceId,
      });
    }

    // Normal mode - admin can delete any device
    const device = await Device.findOneAndDelete({ deviceId });

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    await Activity.create({
      userId: req.user.id,
      deviceId: device._id,
      activityType: "device_offline",
      description: `Device removed by admin: ${device.deviceName}`,
    });

    res.status(200).json({
      message: "Device deleted successfully",
      deviceId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Active Session for Customer (Public endpoint - no auth required)
router.get("/active-session/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!isMongoConnected()) {
      // Demo mode
      const session = (demoDeviceSessions || []).find(
        (s) => s.customerId === customerId && s.status === "active",
      );

      if (!session) {
        return res.status(404).json({ message: "No active session found" });
      }

      const now = new Date();
      const remainingTime = Math.max(
        0,
        Math.floor((session.endTime - now) / 1000),
      );

      if (remainingTime <= 0) {
        session.status = "expired";
        return res.status(404).json({ message: "Session expired" });
      }

      return res.status(200).json({
        sessionId: session.sessionId,
        paymentId: session.paymentId,
        customerId: session.customerId,
        amount: session.amount,
        duration: session.duration,
        startTime: session.startTime,
        endTime: session.endTime,
        remainingTime,
        status: "active",
      });
    }

    // Normal mode - MongoDB
    const DeviceSession = require("../models/DeviceSession");
    const session = await DeviceSession.findOne({
      customerId,
      status: "active",
    });

    if (!session) {
      return res.status(404).json({ message: "No active session found" });
    }

    const now = new Date();
    const remainingTime = Math.max(0, Math.floor((session.endTime - now) / 1000));

    if (remainingTime <= 0) {
      // Mark session as expired if time ran out
      session.status = "expired";
      await session.save();
      return res.status(404).json({ message: "Session expired" });
    }

    res.status(200).json({
      sessionId: session.sessionId,
      paymentId: session.paymentId,
      customerId: session.customerId,
      amount: session.amount,
      duration: session.duration,
      startTime: session.startTime,
      endTime: session.endTime,
      remainingTime,
      status: "active",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
