const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const mongoose = require("mongoose");
const Package = require("../models/Package");
const { v4: uuidv4 } = require("uuid");
const { demoPackages } = require("../demoData");

// Helper to check if MongoDB is connected
const isMongoConnected = () => {
  try {
    return mongoose.connection.readyState > 0;
  } catch (e) {
    return false;
  }
};

// Get All Active Packages (Public endpoint)
router.get("/", async (req, res) => {
  try {
    if (!isMongoConnected()) {
      // Demo mode - filter active packages
      const packages = (demoPackages || [])
        .filter((p) => p.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder);
      return res.status(200).json(packages);
    }

    // Normal mode
    const packages = await Package.find({ isActive: true }).sort({
      displayOrder: 1,
    });
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Packages (Admin endpoint)
router.get("/admin/all", authMiddleware, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      // Demo mode - return all packages
      const packages = (demoPackages || []).sort(
        (a, b) => a.displayOrder - b.displayOrder,
      );
      return res.status(200).json(packages);
    }

    // Normal mode
    const packages = await Package.find().sort({ displayOrder: 1 });
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Single Package
router.get("/:packageId", async (req, res) => {
  try {
    const { packageId } = req.params;

    if (!isMongoConnected()) {
      // Demo mode
      const pkg = (demoPackages || []).find((p) => p.packageId === packageId);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }
      return res.status(200).json(pkg);
    }

    // Normal mode
    const pkg = await Package.findOne({ packageId });
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.status(200).json(pkg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Package (Admin)
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { name, price, duration, description, dataLimit, displayOrder } =
      req.body;

    if (!name || !price || !duration) {
      return res
        .status(400)
        .json({ message: "Name, price, and duration are required" });
    }

    const packageId = "PKG-" + uuidv4();

    if (!isMongoConnected()) {
      // Demo mode
      const pkg = {
        _id: packageId,
        packageId,
        name,
        price,
        duration,
        description,
        dataLimit,
        isActive: true,
        displayOrder: displayOrder || demoPackages?.length || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!demoPackages) {
        require("../demoData").demoPackages = [];
      }
      demoPackages.push(pkg);

      return res.status(201).json({
        message: "Package created successfully (Demo Mode)",
        package: pkg,
      });
    }

    // Normal mode
    const pkg = new Package({
      packageId,
      name,
      price,
      duration,
      description,
      dataLimit,
      isActive: true,
      displayOrder: displayOrder || 0,
      createdBy: req.user.id,
    });

    await pkg.save();

    res.status(201).json({
      message: "Package created successfully",
      package: pkg,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Package (Admin)
router.put("/:packageId", authMiddleware, async (req, res) => {
  try {
    const { packageId } = req.params;
    const {
      name,
      price,
      duration,
      description,
      dataLimit,
      isActive,
      displayOrder,
    } = req.body;

    if (!isMongoConnected()) {
      // Demo mode
      const pkg = (demoPackages || []).find((p) => p.packageId === packageId);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }

      if (name) pkg.name = name;
      if (price !== undefined) pkg.price = price;
      if (duration) pkg.duration = duration;
      if (description !== undefined) pkg.description = description;
      if (dataLimit !== undefined) pkg.dataLimit = dataLimit;
      if (isActive !== undefined) pkg.isActive = isActive;
      if (displayOrder !== undefined) pkg.displayOrder = displayOrder;
      pkg.updatedAt = new Date();

      return res.status(200).json({
        message: "Package updated successfully (Demo Mode)",
        package: pkg,
      });
    }

    // Normal mode
    const pkg = await Package.findOne({ packageId });
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    if (name) pkg.name = name;
    if (price !== undefined) pkg.price = price;
    if (duration) pkg.duration = duration;
    if (description !== undefined) pkg.description = description;
    if (dataLimit !== undefined) pkg.dataLimit = dataLimit;
    if (isActive !== undefined) pkg.isActive = isActive;
    if (displayOrder !== undefined) pkg.displayOrder = displayOrder;
    pkg.updatedAt = new Date();

    await pkg.save();

    res.status(200).json({
      message: "Package updated successfully",
      package: pkg,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Package (Admin)
router.delete("/:packageId", authMiddleware, async (req, res) => {
  try {
    const { packageId } = req.params;

    if (!isMongoConnected()) {
      // Demo mode
      const index = (demoPackages || []).findIndex(
        (p) => p.packageId === packageId,
      );
      if (index === -1) {
        return res.status(404).json({ message: "Package not found" });
      }

      const pkg = demoPackages.splice(index, 1)[0];
      return res.status(200).json({
        message: "Package deleted successfully (Demo Mode)",
        package: pkg,
      });
    }

    // Normal mode
    const pkg = await Package.findOneAndDelete({ packageId });
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.status(200).json({
      message: "Package deleted successfully",
      package: pkg,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle Package Status (Admin)
router.patch("/:packageId/toggle", authMiddleware, async (req, res) => {
  try {
    const { packageId } = req.params;

    if (!isMongoConnected()) {
      // Demo mode
      const pkg = (demoPackages || []).find((p) => p.packageId === packageId);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }

      pkg.isActive = !pkg.isActive;
      pkg.updatedAt = new Date();

      return res.status(200).json({
        message: `Package ${pkg.isActive ? "activated" : "deactivated"} (Demo Mode)`,
        package: pkg,
      });
    }

    // Normal mode
    const pkg = await Package.findOne({ packageId });
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    pkg.isActive = !pkg.isActive;
    pkg.updatedAt = new Date();
    await pkg.save();

    res.status(200).json({
      message: `Package ${pkg.isActive ? "activated" : "deactivated"}`,
      package: pkg,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
