const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const mongoose = require("mongoose");
const Activity = require("../models/Activity");
const { demoActivities } = require("../demoData");

// Helper to check if MongoDB is connected (dynamic check)
const isMongoConnected = () => {
  try {
    return mongoose.connection.readyState > 0;
  } catch (e) {
    return false;
  }
};

// Get Activity Log
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { limit = 50, page = 1, activityType } = req.query;

    if (!isMongoConnected()) {
      // Demo mode
      let activities = demoActivities.filter((a) => a.userId === req.user.id);

      if (activityType) {
        activities = activities.filter((a) => a.activityType === activityType);
      }

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedActivities = activities
        .reverse()
        .slice(startIndex, endIndex);
      const totalCount = activities.length;
      const totalPages = Math.ceil(totalCount / limit);

      return res.status(200).json({
        activities: paginatedActivities,
        totalPages,
        currentPage: parseInt(page),
        totalCount,
      });
    }

    // Normal mode
    const query = { userId: req.user.id };
    if (activityType) {
      query.activityType = activityType;
    }

    const activities = await Activity.find(query)
      .populate("userId", "name email")
      .populate("deviceId", "deviceName macAddress")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const totalCount = await Activity.countDocuments(query);

    res.status(200).json({
      activities,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
