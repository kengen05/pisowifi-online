// Demo/Mock User Store (In-memory, for development only)
let demoUsers = [
  {
    _id: "1",
    id: "1",
    name: "Admin User",
    email: "admin@pisowifi.com",
    phone: "09171234567",
    shopName: "Main Branch WiFi",
    address: "456 Business Ave, Manila",
    role: "operator",
  },
];

let demoPackages = [
  {
    _id: "PKG-1",
    packageId: "PKG-1",
    name: "1 Hour",
    price: 10,
    duration: 60,
    description: "One hour of unlimited internet",
    dataLimit: "Unlimited",
    isActive: true,
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "PKG-2",
    packageId: "PKG-2",
    name: "3 Hours",
    price: 25,
    duration: 180,
    description: "Three hours of unlimited internet",
    dataLimit: "Unlimited",
    isActive: true,
    displayOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "PKG-3",
    packageId: "PKG-3",
    name: "1 Day",
    price: 50,
    duration: 1440,
    description: "Full day internet access (24 hours)",
    dataLimit: "Unlimited",
    isActive: true,
    displayOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "PKG-4",
    packageId: "PKG-4",
    name: "7 Days",
    price: 300,
    duration: 10080,
    description: "Full week of internet access",
    dataLimit: "Unlimited",
    isActive: true,
    displayOrder: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let demoPayments = [];
let demoVouchers = [];
let demoDevices = [];
let demoActivities = [];
let demoDeviceSessions = [];

module.exports = {
  demoUsers,
  demoPackages,
  demoPayments,
  demoVouchers,
  demoDevices,
  demoActivities,
  demoDeviceSessions,
};
