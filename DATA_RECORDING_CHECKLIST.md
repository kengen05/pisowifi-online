# Data Recording Checklist

## What Gets Recorded When?

### 1. ✅ USER REGISTRATION

**When**: Customer creates account via login page
**Data Recorded**:

- Username/Email
- Password (hashed with bcrypt)
- Creation date
- User ID (UUID)

**Location**: `users` collection
**Endpoint**: `POST /api/auth/register`

---

### 2. ✅ PAYMENT CREATION

**When**: Customer selects package and clicks "Pay Now"
**Data Recorded**:

- Payment ID (UUID)
- Amount (₱)
- Duration (minutes)
- Creation timestamp
- Expiration time (5 minutes from creation)
- User ID
- Status: "pending"

**Location**: `payments` collection
**Endpoint**: `POST /api/payments/create`
**Auto-Cleanup**: Pending payments auto-deleted after 5 minutes (TTL index)

---

### 3. ✅ PAYMENT CONFIRMATION (CRITICAL!)

**When**: Customer clicks "Payment Confirmed?" button
**Data Recorded**:

- Payment status: "pending" → "completed"
- Phone number (from customer input)
- QR PH Transaction ID
- Completion timestamp

**ALSO RECORDED**:

- **DeviceSession created**:
  - Session ID
  - Start time & end time (based on package duration)
  - Device MAC address
  - Amount paid
  - Session status: "active"

- **Device AUTO-REGISTERED** (KEY FEATURE!):
  - Device ID (UUID)
  - MAC address (unique)
  - Device name: "Device - {MAC}"
  - IP address: "dynamic"
  - Online status: true
  - User ID (associated with purchaser)
  - Creation timestamp

- **Activity logged**:
  - Activity type: "payment"
  - Description: "Payment confirmed: ₱{amount}"
  - Timestamp

**Locations**:

- `payments` collection (status update)
- `devicesessions` collection (new session)
- `devices` collection (new device - IF NOT EXISTS)
- `activities` collection (activity log)

**Endpoint**: `POST /api/payments/confirm/:paymentId`

---

### 4. ✅ DEVICE ACCESS

**When**: Device connects to WiFi portal and scans QR
**Data Recorded**:

- Device MAC address lookup
- Session status check
- Access granted/denied determination
- Last seen timestamp (if active session)

**Location**: Check `devicesessions` and `devices` collections
**Endpoint**: `GET /api/access/check-status`

---

### 5. ✅ DEVICE MANUAL REGISTRATION

**When**: Admin registers device via "Register Device" button
**Data Recorded**:

- Device ID (UUID)
- MAC address
- Device name
- IP address
- Online status: true
- User ID (admin)
- Creation timestamp

**ALSO RECORDED**:

- Activity log entry:
  - Activity type: "device_online"
  - Description: "Device registered: {name}"

**Locations**:

- `devices` collection
- `activities` collection

**Endpoint**: `POST /api/devices/register`

---

### 6. ✅ VOUCHER CREATION

**When**: Admin creates voucher
**Data Recorded**:

- Voucher ID (UUID)
- Voucher code
- Price (₱)
- Duration (minutes)
- Data limit
- Quantity
- Voucher type
- Active status
- Created timestamp
- User ID (admin)

**ALSO RECORDED**:

- Activity log:
  - Activity type: "settings_changed"
  - Description: "New voucher created: {code}"

**Locations**:

- `vouchers` collection
- `activities` collection

**Endpoint**: `POST /api/vouchers/create`

---

### 7. ✅ PACKAGE MANAGEMENT

**When**: Admin creates/updates package
**Data Recorded**:

- Package ID (UUID)
- Name (e.g., "1 Hour")
- Price (e.g., ₱10)
- Duration (60 minutes)
- Description
- Data limit
- Display order (for sorting)
- Active status
- Created/updated timestamp

**Location**: `packages` collection
**Endpoints**:

- `POST /api/packages/create` (create)
- `PUT /api/packages/update/:packageId` (update)
- `PUT /api/packages/reorder` (drag-drop reordering)

---

### 8. ✅ ACTIVITY LOGS

**When**: Any significant action occurs
**Data Recorded**:

- Activity ID
- User ID
- Activity type (payment, login, device_online, etc.)
- Description
- Additional details (JSON)
- Timestamp

**Tracked Activities**:

- User login
- Payment creation
- Payment confirmation
- Device registration
- Device status changes
- Voucher creation
- Settings changes

**Location**: `activities` collection
**Endpoint**: `GET /api/activity` (get all activities)

---

## Data Verification in Admin Dashboard

### ✅ Payments Tab

- **Visible**: All payments system-wide
- **Shows**: Payment ID, Amount, Status, Phone, Date
- **Filter**: By status (Pending, Completed, Failed)
- **Data Source**: `payments` collection
- **Test**: Create payment → Confirm → Check tab

### ✅ Devices Tab

- **Visible**: All devices system-wide
- **Shows**: Device Name, MAC Address, IP, Status, Users, Last Seen
- **Data Source**: `devices` collection
- **Test**: Complete payment → Device appears with MAC address

### ✅ Packages Tab

- **Visible**: All packages (admin)
- **Shows**: Package Name, Price, Duration, Order
- **Drag-Drop**: Reorder packages
- **Data Source**: `packages` collection
- **Persisted**: Display order updates saved to database

### ✅ Vouchers Tab

- **Visible**: Vouchers created by admin
- **Shows**: Voucher Code, Price, Duration, Quantity
- **Data Source**: `vouchers` collection

### ✅ Activity Log

- **Visible**: All system activities
- **Shows**: User, Activity Type, Description, Timestamp
- **Filter**: By user or activity type
- **Data Source**: `activities` collection

---

## Database Collections Summary

| Collection     | Records                 | Permanent | Auto-Cleanup               |
| -------------- | ----------------------- | --------- | -------------------------- |
| users          | Accounts                | ✅ Yes    | ❌ No                      |
| payments       | Transactions            | ✅ Yes    | ✅ Expired pending (5 min) |
| devices        | Registered WiFi devices | ✅ Yes    | ❌ No                      |
| devicesessions | Active WiFi sessions    | ✅ Yes    | ✅ After expiration        |
| packages       | WiFi packages           | ✅ Yes    | ❌ No                      |
| vouchers       | Voucher codes           | ✅ Yes    | ❌ No                      |
| activities     | User/system logs        | ✅ Yes    | ❌ No                      |

---

## End-to-End Data Flow Example

### Complete Customer Journey with Data Recording:

```
1. Customer Register (User Data Recorded)
   └─ users collection: New user account

2. Customer Selects Package
   └─ packages collection: Read package data

3. Customer Clicks "Pay Now" (Payment Created)
   └─ payments collection: Payment record (status: pending)
   └─ activities collection: "Payment request created"

4. Customer Confirms Payment (Payment Confirmed!)
   ├─ payments collection: Update status to "completed"
   ├─ devicesessions collection: New active session
   ├─ devices collection: NEW DEVICE RECORD (auto-registered)
   └─ activities collection: "Payment confirmed"

5. Device Has Internet Access
   └─ devicesessions collection: Check for active session

6. Admin Checks Dashboard
   ├─ Payments tab: Sees completed payment with ₱10, MAC address
   ├─ Devices tab: Sees registered device with MAC address "AA:BB:CC:DD:66:E1"
   └─ Activity log: Sees all user actions with timestamps

7. Session Expires (60 minutes later)
   ├─ devicesessions collection: Auto-cleanup by TTL index
   └─ activities collection: "Session expired" (if logged)

8. Server Restart
   └─ All data persists (MongoDB storage)
   └─ Admin still sees all payments and devices ✅
```

---

## How to Verify Data is Being Recorded

### Option 1: Check Admin Dashboard (Easiest)

1. Complete a test payment via customer portal
2. Go to `/devices` page
3. Should see device with MAC address ✅

### Option 2: Check MongoDB Directly

```powershell
# Connect to MongoDB
mongosh "mongodb://localhost:27017/pisowifi"

# Check payments
db.payments.find()

# Check devices
db.devices.find()

# Check activities
db.activities.find()
```

### Option 3: Check Backend Logs

```
Backend console should show:
✅ "MongoDB connected" = Database mode active
❌ "MongoDB connection error - using demo mode" = Need to fix connection
```

---

## Important Notes

⚠️ **Demo Mode Warning**

- If MongoDB is not running, backend uses in-memory arrays
- Data is NOT persisted across server restarts
- Solution: Setup MongoDB (see MONGODB_SETUP.md)

✅ **Production Ready**

- Once MongoDB is running, all data is automatically persisted
- No code changes needed
- Automatic backup recommended for MongoDB

📊 **Data Integrity**

- All payments are immutable once confirmed
- Device MAC addresses are unique (no duplicates)
- User IDs are always tracked for accountability
- Activity logs provide complete audit trail
