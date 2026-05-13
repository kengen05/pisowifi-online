const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const mongoose = require("mongoose");
const Voucher = require("../models/Voucher");
const Activity = require("../models/Activity");
const { v4: uuidv4 } = require("uuid");
const { demoVouchers, demoActivities } = require("../demoData");

// Helper to check if MongoDB is connected (dynamic check)
const isMongoConnected = () => {
  try {
    return mongoose.connection.readyState > 0;
  } catch (e) {
    return false;
  }
};

// Create Voucher
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { voucherCode, price, duration, dataLimit, quantity, voucherType } =
      req.body;

    const voucherId = uuidv4();

    if (!isMongoConnected()) {
      // Demo mode
      const voucher = {
        _id: voucherId,
        voucherId,
        voucherCode,
        userId: req.user.id,
        price,
        duration,
        dataLimit,
        quantity,
        voucherType,
        isActive: true,
        usedQuantity: 0,
        createdAt: new Date(),
      };

      demoVouchers.push(voucher);
      demoActivities.push({
        _id: uuidv4(),
        userId: req.user.id,
        activityType: "settings_changed",
        description: `New voucher created: ${voucherCode}`,
        details: { voucherId, price },
        createdAt: new Date(),
      });

      return res.status(201).json({
        message: "Voucher created successfully (Demo Mode)",
        voucher,
      });
    }

    // Normal mode
    const voucher = new Voucher({
      voucherId,
      voucherCode,
      userId: req.user.id,
      price,
      duration,
      dataLimit,
      quantity,
      voucherType,
      isActive: true,
    });

    await voucher.save();

    await Activity.create({
      userId: req.user.id,
      activityType: "settings_changed",
      description: `New voucher created: ${voucherCode}`,
      details: { voucherId, price },
    });

    res.status(201).json({ message: "Voucher created successfully", voucher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Vouchers
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      // Demo mode
      const vouchers = demoVouchers.filter((v) => v.userId === req.user.id);
      return res.status(200).json(vouchers);
    }

    // Normal mode
    const vouchers = await Voucher.find({ userId: req.user.id });
    res.status(200).json(vouchers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Voucher
router.put("/:voucherId", authMiddleware, async (req, res) => {
  try {
    const { voucherId } = req.params;
    const { price, duration, dataLimit, quantity, isActive } = req.body;

    if (!isMongoConnected()) {
      // Demo mode
      const voucher = demoVouchers.find(
        (v) => v.voucherId === voucherId && v.userId === req.user.id,
      );
      if (!voucher) {
        return res.status(404).json({ message: "Voucher not found" });
      }

      Object.assign(voucher, {
        price,
        duration,
        dataLimit,
        quantity,
        isActive,
      });

      demoActivities.push({
        _id: uuidv4(),
        userId: req.user.id,
        activityType: "settings_changed",
        description: `Voucher updated: ${voucher.voucherCode}`,
        details: { voucherId },
        createdAt: new Date(),
      });

      return res.status(200).json({
        message: "Voucher updated successfully (Demo Mode)",
        voucher,
      });
    }

    // Normal mode
    const voucher = await Voucher.findOneAndUpdate(
      { voucherId, userId: req.user.id },
      { price, duration, dataLimit, quantity, isActive },
      { new: true },
    );

    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    await Activity.create({
      userId: req.user.id,
      activityType: "settings_changed",
      description: `Voucher updated: ${voucher.voucherCode}`,
      details: { voucherId },
    });

    res.status(200).json({ message: "Voucher updated successfully", voucher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Voucher
router.delete("/:voucherId", authMiddleware, async (req, res) => {
  try {
    const { voucherId } = req.params;

    if (!isMongoConnected()) {
      // Demo mode
      const index = demoVouchers.findIndex(
        (v) => v.voucherId === voucherId && v.userId === req.user.id,
      );
      if (index === -1) {
        return res.status(404).json({ message: "Voucher not found" });
      }

      const voucher = demoVouchers[index];
      demoVouchers.splice(index, 1);

      demoActivities.push({
        _id: uuidv4(),
        userId: req.user.id,
        activityType: "settings_changed",
        description: `Voucher deleted: ${voucher.voucherCode}`,
        createdAt: new Date(),
      });

      return res
        .status(200)
        .json({ message: "Voucher deleted successfully (Demo Mode)" });
    }

    // Normal mode
    const voucher = await Voucher.findOneAndDelete({
      voucherId,
      userId: req.user.id,
    });

    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    await Activity.create({
      userId: req.user.id,
      activityType: "settings_changed",
      description: `Voucher deleted: ${voucher.voucherCode}`,
    });

    res.status(200).json({ message: "Voucher deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
