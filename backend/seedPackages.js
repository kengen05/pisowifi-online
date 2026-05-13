const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
const Package = require("./models/Package");

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected for seeding"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Sample packages
const packages = [
  {
    packageId: "PKG-1HR",
    name: "1 Hour",
    price: 10,
    duration: 60,
    description: "One hour of unlimited internet access",
    dataLimit: "Unlimited",
    isActive: true,
    displayOrder: 1,
  },
  {
    packageId: "PKG-3HR",
    name: "3 Hours",
    price: 25,
    duration: 180,
    description: "Three hours of unlimited internet access",
    dataLimit: "Unlimited",
    isActive: true,
    displayOrder: 2,
  },
  {
    packageId: "PKG-1DAY",
    name: "1 Day",
    price: 50,
    duration: 1440,
    description: "Full day internet access (24 hours)",
    dataLimit: "Unlimited",
    isActive: true,
    displayOrder: 3,
  },
  {
    packageId: "PKG-3DAYS",
    name: "3 Days",
    price: 120,
    duration: 4320,
    description: "Three days of continuous internet access",
    dataLimit: "Unlimited",
    isActive: true,
    displayOrder: 4,
  },
  {
    packageId: "PKG-7DAYS",
    name: "7 Days (Weekly)",
    price: 250,
    duration: 10080,
    description: "Full week of internet access",
    dataLimit: "Unlimited",
    isActive: true,
    displayOrder: 5,
  },
  {
    packageId: "PKG-30DAYS",
    name: "30 Days (Monthly)",
    price: 900,
    duration: 43200,
    description: "Full month of unlimited internet",
    dataLimit: "Unlimited",
    isActive: true,
    displayOrder: 6,
  },
  {
    packageId: "PKG-LITE",
    name: "Lite (5GB)",
    price: 15,
    duration: 1440,
    description: "1 day with 5GB data limit",
    dataLimit: "5GB",
    isActive: true,
    displayOrder: 7,
  },
  {
    packageId: "PKG-PREMIUM",
    name: "Premium (50GB/month)",
    price: 500,
    duration: 43200,
    description: "Monthly plan with 50GB high-speed data",
    dataLimit: "50GB",
    isActive: true,
    displayOrder: 8,
  },
];

async function seedPackages() {
  try {
    // Clear existing packages
    await Package.deleteMany({});
    console.log("🗑️  Cleared existing packages");

    // Insert new packages
    const result = await Package.insertMany(packages);
    console.log(`✅ Successfully created ${result.length} packages:`);
    
    result.forEach((pkg) => {
      console.log(
        `   • ${pkg.name} - ₱${pkg.price} (${pkg.duration} mins) - ${pkg.dataLimit}`
      );
    });

    console.log("\n📊 Package Summary:");
    console.log(`   Total Packages: ${result.length}`);
    console.log(`   Price Range: ₱${Math.min(...packages.map(p => p.price))} - ₱${Math.max(...packages.map(p => p.price))}`);
    console.log(`   Duration Range: ${Math.min(...packages.map(p => p.duration))} - ${Math.max(...packages.map(p => p.duration))} minutes`);

  } catch (error) {
    console.error("❌ Seeding error:", error);
  } finally {
    mongoose.disconnect();
    console.log("\n🔌 MongoDB connection closed");
  }
}

seedPackages();
