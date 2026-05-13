const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Payment = require("./models/Payment");
const Device = require("./models/Device");
const DeviceSession = require("./models/DeviceSession");
const Activity = require("./models/Activity");

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected for cleanup"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

async function cleanupData() {
  try {
    console.log("\n🧹 Starting cleanup process...\n");

    // Delete all payments
    const paymentsDeleted = await Payment.deleteMany({});
    console.log(`✅ Deleted ${paymentsDeleted.deletedCount} payment records`);

    // Delete all device sessions
    const sessionsDeleted = await DeviceSession.deleteMany({});
    console.log(`✅ Deleted ${sessionsDeleted.deletedCount} device session records`);

    // Delete all devices
    const devicesDeleted = await Device.deleteMany({});
    console.log(`✅ Deleted ${devicesDeleted.deletedCount} device records`);

    // Delete all related activities
    const activitiesDeleted = await Activity.deleteMany({});
    console.log(`✅ Deleted ${activitiesDeleted.deletedCount} activity records`);

    console.log("\n📊 Cleanup Summary:");
    console.log(`   • Payments: ${paymentsDeleted.deletedCount} deleted`);
    console.log(`   • Device Sessions: ${sessionsDeleted.deletedCount} deleted`);
    console.log(`   • Devices: ${devicesDeleted.deletedCount} deleted`);
    console.log(`   • Activities: ${activitiesDeleted.deletedCount} deleted`);
    console.log(`   • Total: ${paymentsDeleted.deletedCount + sessionsDeleted.deletedCount + devicesDeleted.deletedCount + activitiesDeleted.deletedCount} records deleted\n`);

  } catch (error) {
    console.error("❌ Cleanup error:", error);
  } finally {
    mongoose.disconnect();
    console.log("🔌 MongoDB connection closed\n");
  }
}

cleanupData();
