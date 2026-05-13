# Database Persistence Architecture

## Current System State

### Data Flow Architecture

```
Customer Portal → Backend API → [MongoDB or Demo Mode]
                                     ↓
Admin Portal ← Admin API ← [Database or In-Memory Arrays]
```

## Backend Architecture Overview

### Connection Logic

The backend uses a dynamic connection check at EVERY endpoint:

```javascript
const isMongoConnected = () => {
  try {
    return mongoose.connection.readyState > 0;
  } catch (e) {
    return false;
  }
};

// Usage in routes:
if (!isMongoConnected()) {
  // Demo mode: Save to in-memory arrays
} else {
  // Production mode: Save to MongoDB
}
```

### Key Features

- **Automatic fallback**: If MongoDB is unavailable, system uses in-memory demo data
- **No code changes needed**: Backend already supports both modes
- **Seamless switching**: Can upgrade from demo to database mode without redeploying

## Data Being Recorded

### 1. Payments Collection

Every payment is recorded with:

- Payment ID (UUID)
- User ID (who made payment)
- Amount (₱)
- Status (pending → completed)
- Payment method (QR PH, cash, card)
- Phone number
- Device MAC address
- Session duration
- Timestamps (created, completed)
- TTL expiration (auto-cleanup of old pending payments)

**Endpoints that save payments:**

- `POST /api/payments/create` - Creates payment request
- `POST /api/payments/confirm/:paymentId` - Confirms payment & creates device session

### 2. Devices Collection

Device registration with:

- Device ID (UUID)
- MAC address (unique identifier)
- User ID (owner)
- Device name
- IP address
- Online status
- Total users connected
- Last seen timestamp
- Bandwidth usage
- Creation date

**How devices are recorded:**

- `POST /api/devices/register` - Manual registration
- `POST /api/payments/confirm/:paymentId` - Auto-registration on payment (IMPORTANT!)
- During payment confirmation, if MAC address provided and device doesn't exist, auto-creates device record

### 3. Activities Collection

User/system activities logged:

- User ID
- Activity type (login, payment, device_registration, device_online, etc.)
- Description
- Detailed metadata
- Timestamp

**Automatic logging for:**

- User login
- Payment creation
- Payment confirmation
- Device registration
- Device status changes

### 4. Device Sessions Collection

Active WiFi sessions tracked:

- Session ID
- Payment ID (linked)
- Customer ID
- Duration (minutes)
- Start time & End time
- Status (active/expired/used)
- Device MAC address

**Auto-created during:**

- Payment confirmation
- TTL index auto-expires completed sessions

### 5. Other Collections

- **Users**: User accounts, emails, passwords (hashed)
- **Packages**: WiFi packages (1 Hour ₱10, 30 Minutes ₱5, etc.)
- **Vouchers**: Voucher codes and redemption status

## MongoDB Collections Schema

```javascript
// Payments Schema
{
  _id: ObjectId,
  paymentId: "UUID",
  userId: ObjectId,
  voucherId: ObjectId (optional),
  amount: Number,
  paymentMethod: "qr_ph|cash|card",
  qrPhTransactionId: String,
  phoneNumber: String,
  status: "pending|completed|failed|refunded",
  deviceId: ObjectId,
  sessionDuration: Number,
  createdAt: Date,
  expiresAt: Date,
  completedAt: Date
}

// Devices Schema
{
  _id: ObjectId,
  deviceId: "UUID",
  userId: ObjectId,
  deviceName: String,
  macAddress: String (UNIQUE),
  ipAddress: String,
  isOnline: Boolean,
  lastSeen: Date,
  totalUsers: Number,
  totalBandwidth: Number,
  createdAt: Date,
  updatedAt: Date
}

// Activities Schema
{
  _id: ObjectId,
  userId: ObjectId,
  deviceId: ObjectId,
  activityType: String,
  description: String,
  details: Object,
  createdAt: Date
}

// DeviceSessions Schema
{
  _id: ObjectId,
  sessionId: "SESSION-UUID",
  paymentId: "UUID",
  customerId: ObjectId,
  amount: Number,
  duration: Number,
  startTime: Date,
  endTime: Date,
  status: "active|expired|used",
  deviceId: String (MAC address),
  createdAt: Date,
  expiresAt: Date (TTL index)
}
```

## Critical Data Recording Points

### 1. Customer Makes Payment

```
POST /api/payments/create
├─ Generate payment ID
├─ Save to payments collection
├─ Log activity (payment creation)
└─ Return QR code
```

### 2. Customer Confirms Payment

```
POST /api/payments/confirm/:paymentId
├─ Verify payment exists & not expired
├─ Update payment status → "completed"
├─ Create device session record
├─ AUTO-REGISTER DEVICE (if MAC provided)
│  ├─ Check if device exists by MAC address
│  └─ If not: Create new device record
├─ Log activity (payment completed)
└─ Return session countdown
```

### 3. Device Auto-Registration (Key Feature!)

```
When payment confirmed with MAC address:
├─ Check: Device.findOne({ macAddress })
├─ If not found:
│  └─ Create Device record:
│     ├─ deviceId: UUID
│     ├─ userId: payment.userId
│     ├─ macAddress: provided MAC
│     ├─ deviceName: "Device - {MAC}"
│     ├─ ipAddress: "dynamic"
│     ├─ isOnline: true
│     └─ Save to database
└─ All future sessions for this MAC auto-identified
```

### 4. Device Session Management

```
Device connects → Check MAC address
├─ Query: DeviceSession.findOne({ deviceId: MAC, status: "active" })
├─ If found:
│  └─ Grant internet access (automatic)
└─ If not found:
   └─ Redirect to payment portal
```

## Verification Checklist

- [ ] MongoDB installed/running
- [ ] Backend console shows "MongoDB connected"
- [ ] Create test payment via customer portal
- [ ] Confirm payment (clicks "Payment Confirmed?")
- [ ] Check admin Payments tab - payment appears
- [ ] Check admin Devices tab - device appears with MAC address
- [ ] Restart backend server
- [ ] Payment and device still visible (data persisted)

## Admin Dashboard Views

### Payments Tab

Displays: Payment ID, Amount, Status, Phone, Date

- Shows ALL payments from ALL users
- Can filter by status (Pending, Completed, Failed, Refunded)
- Endpoint: `GET /api/payments/admin/all`

### Devices Tab

Displays: Device Name, MAC Address, IP, Status, Users, Last Seen

- Shows ALL devices from ALL users
- Shows online/offline status
- Shows last connection time
- Endpoint: `GET /api/devices/admin/all`

### Activity Log

Shows: User, Activity Type, Description, Timestamp

- Payment logs
- Device registrations
- Login events
- Status changes

## Performance Optimization

### TTL Indexes (Auto-cleanup)

- **Payments**: Pending payments auto-deleted after 5 minutes
- **DeviceSessions**: Expired sessions auto-deleted
- Benefits: Automatic database cleanup, no manual maintenance

### Indexing

- MAC address is unique: Fast device lookups
- Payment ID is unique: Fast payment queries
- User ID indexed: Fast user activity queries

## Troubleshooting Data Issues

### Issue: "Payment confirmed" but device not in admin tab

**Cause**: MongoDB not connected, using demo mode
**Solution**: Ensure MongoDB is running, check backend console for "MongoDB connected"

### Issue: Data disappears after server restart

**Cause**: Using demo mode with in-memory arrays
**Solution**: Setup MongoDB (see MONGODB_SETUP.md)

### Issue: Multiple devices with same MAC

**Cause**: Demo mode doesn't enforce unique constraint
**Solution**: Use MongoDB with unique index on macAddress

## Next Steps to Enable Full Database Persistence

1. ✅ **Install MongoDB**
   - See MONGODB_SETUP.md for options
   - Community Edition (Windows) OR MongoDB Atlas (Cloud)

2. ✅ **Start MongoDB Service**
   - Local: `Start-Service MongoDB` or mongod
   - Atlas: Already running in cloud

3. ✅ **Verify Backend Connection**
   - Restart backend
   - Check console for "MongoDB connected" ✅
   - NOT "MongoDB connection error - using demo mode" ❌

4. ✅ **Test Data Persistence**
   - Create payment → Confirm → Check admin tabs
   - Restart backend → Verify payment/device still there
   - SUCCESS = Data is persisted to MongoDB

Once MongoDB is running, ALL data including payments, devices, vouchers, and activity logs will be permanently recorded and available in the admin dashboard!

---

**Architecture Status**: Production-ready with auto-fallback to demo mode
**Database Support**: MongoDB (local or Atlas)
**Data Recording**: Automatic for all endpoints
**Persistence**: Enabled when MongoDB is available
