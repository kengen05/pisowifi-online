const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

// Trust proxy headers for real IP extraction
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 2000,
    connectTimeoutMS: 2000,
    socketTimeoutMS: 2000,
    bufferCommands: false,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) =>
    console.log("MongoDB connection error - using demo mode:", err.message),
  );

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/vouchers", require("./routes/vouchers"));
app.use("/api/activity", require("./routes/activity"));
app.use("/api/devices", require("./routes/devices"));
app.use("/api/packages", require("./routes/packages"));
app.use("/api/access", require("./routes/access"));
app.use("/api/client", require("./routes/client"));
app.use("/api/omada", require("./routes/omada"));

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

const PORT = process.env.PORT || 5000;
const os = require("os");

// Get local IP address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const localIp = getLocalIp();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local network access: http://${localIp}:${PORT}`);
  console.log(`Localhost access: http://localhost:${PORT}`);
});
