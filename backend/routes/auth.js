const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const { demoUsers } = require("../demoData");

// Helper to check if MongoDB is connected (dynamic check)
const isMongoConnected = () => {
  try {
    return mongoose.connection.readyState > 0;
  } catch (e) {
    return false;
  }
};

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, shopName, address } = req.body;

    // Demo mode - use in-memory storage if MongoDB is down
    if (!isMongoConnected()) {
      // Check if user already exists
      if (demoUsers.find((u) => u.email === email)) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcryptjs.hash(password, 10);
      const newUser = {
        _id: String(demoUsers.length + 1),
        id: String(demoUsers.length + 1),
        name,
        email,
        password: hashedPassword,
        phone,
        shopName,
        address,
        role: "operator",
      };

      demoUsers.push(newUser);

      const token = jwt.sign(
        { id: newUser._id, email: newUser.email, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      return res.status(201).json({
        message: "User registered successfully (Demo Mode)",
        token,
        user: { ...newUser, password: undefined },
      });
    }

    // Normal mode - use MongoDB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      shopName,
      address,
      role: "operator",
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res
      .status(201)
      .json({ message: "User registered successfully", token, user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Demo mode
    if (!isMongoConnected()) {
      const user = demoUsers.find((u) => u.email === email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // For demo mode, if user doesn't have password, check against demo credentials
      if (!user.password) {
        if (email === "admin@pisowifi.com" && password === "admin123") {
          const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" },
          );

          return res.status(200).json({
            message: "Login successful (Demo Mode)",
            token,
            user: { ...user, password: undefined },
          });
        } else {
          return res.status(401).json({ message: "Invalid credentials" });
        }
      }

      const isPasswordCorrect = await bcryptjs.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      return res.status(200).json({
        message: "Login successful (Demo Mode)",
        token,
        user: { ...user, password: undefined },
      });
    }

    // Normal mode
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
