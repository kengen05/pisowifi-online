const express = require("express");
const router = express.Router();

// Get client information (IP address, browser, device info)
router.get("/info", (req, res) => {
  try {
    // Get client IP address from request
    // Priority: x-forwarded-for (proxy header) > x-real-ip > req.ip > socket address
    let clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || "unknown";
    
    // Try to extract from headers if available (for reverse proxy scenarios)
    if (req.headers["x-forwarded-for"]) {
      clientIp = req.headers["x-forwarded-for"].split(",")[0].trim();
    } else if (req.headers["x-real-ip"]) {
      clientIp = req.headers["x-real-ip"];
    }

    // Normalize IPv6 loopback (::1 is localhost in IPv6)
    // Keep it as is since it represents the actual connection source
    
    // Get user agent for device info
    const userAgent = req.headers["user-agent"] || "unknown";

    // Determine device type from user agent
    let deviceType = "Desktop";
    if (/mobile|android|iphone|ipad/i.test(userAgent)) {
      deviceType = /iphone|ipad/i.test(userAgent) ? "iOS" : "Android";
    }

    // Extract browser info
    let browser = "Unknown";
    if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) {
      browser = "Chrome";
    } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
      browser = "Safari";
    } else if (/firefox/i.test(userAgent)) {
      browser = "Firefox";
    } else if (/edg/i.test(userAgent)) {
      browser = "Edge";
    }

    console.log(`Client Info - IP: ${clientIp}, Device: ${deviceType}, Browser: ${browser}, User-Agent: ${userAgent}`);

    res.json({
      success: true,
      clientIp,
      userAgent,
      deviceType,
      browser,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error getting client info:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get client info",
      error: error.message,
    });
  }
});

module.exports = router;
