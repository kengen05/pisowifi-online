# MongoDB Setup Guide for Piso WiFi Admin Portal

## Overview

The application is currently running in **demo mode** with in-memory data storage. To ensure all payments, devices, and transactions are permanently recorded in a database, you need to set up MongoDB.

## Current Status

- **Database**: Currently using in-memory demo data (not persisted)
- **Backend Logic**: Already supports MongoDB - just needs to be running
- **Connection**: Backend will automatically detect MongoDB and switch to database mode

## Setup Options

### Option 1: MongoDB Community Edition (Recommended for Windows)

**Easiest method for local development**

1. **Download MongoDB Community Edition**
   - Visit: https://www.mongodb.com/try/download/community
   - Select Windows, MSI package
   - Download the latest stable version

2. **Install MongoDB**
   - Run the installer (.msi file)
   - Choose "Complete" installation
   - Check "Install MongoDB as a Service"
   - Check "Run service as Network Service user"
   - Finish the installation

3. **Verify Installation**
   - Open PowerShell and run:

   ```powershell
   mongod --version
   ```

   - Should show MongoDB version

4. **Start MongoDB Service**

   ```powershell
   # If installed as service, it should start automatically
   # To check status:
   Get-Service | Where-Object {$_.Name -like "*Mongo*"}

   # To start manually:
   Start-Service MongoDB
   ```

5. **Verify Connection**
   ```powershell
   # Test connection to MongoDB (should not give error)
   mongosh "mongodb://localhost:27017"
   ```

### Option 2: MongoDB Atlas (Cloud - Recommended for production)

**Best for cloud deployment**

1. **Create Account**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Sign up for free account
   - Create a new project

2. **Create a Cluster**
   - Choose "Free Tier" (M0)
   - Select AWS or your preferred provider
   - Create cluster (takes 2-3 minutes)

3. **Get Connection String**
   - Go to "Database" → Click "Connect"
   - Choose "Drivers" → "Node.js"
   - Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net/pisowifi`

4. **Update .env File**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pisowifi
   ```

### Option 3: MongoDB in Docker

**If Docker is running on your machine**

```bash
# Start MongoDB container
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin123 mongo:latest

# Verify it's running
docker ps | grep mongodb

# Stop it later with:
docker stop mongodb
```

## Configuration

### Update .env File (if needed)

The `.env` file already contains the correct MongoDB URI:

```
MONGODB_URI=mongodb://localhost:27017/pisowifi
```

For MongoDB Atlas, replace with your connection string:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pisowifi
```

## Verification

### 1. Start Backend

```powershell
cd backend
npm start
```

### 2. Check Console Output

Look for:

- ✅ **"MongoDB connected"** → Database mode active (data will be saved)
- ❌ **"MongoDB connection error - using demo mode"** → Still in demo mode

### 3. Test Data Persistence

1. Create a test payment via customer portal
2. Restart the backend server
3. Check if payment still appears in admin Payments tab
4. If yes → Database persistence is working ✅

## Database Collections Created

Once MongoDB is running, these collections will be automatically created:

1. **users** - User accounts
2. **payments** - Payment records (all transactions)
3. **devices** - Registered devices (MAC addresses, names, etc.)
4. **packages** - WiFi packages (durations, pricing)
5. **vouchers** - WiFi vouchers
6. **activities** - User activities (logins, payments, etc.)
7. **devicesessions** - Active device sessions

## Data Recorded

### Payments Collection

- Payment ID (unique)
- Amount
- Status (pending/completed/failed)
- Payment method
- Phone number
- Device MAC address
- Date/Time
- Session duration

### Devices Collection

- Device MAC address (unique)
- Device name
- IP address
- Online status
- Last seen timestamp
- Total users connected
- Creation date

### Activities Collection

- User ID
- Activity type (payment, login, device_registration, etc.)
- Description
- Timestamp

## Troubleshooting

### MongoDB Connection Failing

```powershell
# Check if service is running
Get-Service MongoDB

# Check MongoDB logs
Get-Content "C:\Program Files\MongoDB\Server\7.0\log\mongod.log" -Tail 50

# Try manual start
mongod --dbpath "C:\data\db"
```

### Still Showing Demo Mode

- Ensure MongoDB is running (`mongod` or `Start-Service MongoDB`)
- Check that port 27017 is accessible
- Verify backend has been restarted after MongoDB starts

### Port Already in Use

```powershell
# Find process using port 27017
Get-NetTCPConnection -LocalPort 27017 | Select-Object -Property ProcessName,PID

# Kill the process (if needed)
Stop-Process -Id <PID> -Force
```

## Next Steps

1. ✅ Install MongoDB (Option 1, 2, or 3)
2. ✅ Start MongoDB service
3. ✅ Restart backend server
4. ✅ Verify "MongoDB connected" message in backend console
5. ✅ Test payment flow and verify data in admin dashboard

Once MongoDB is running, ALL payments, devices, and activities will be permanently recorded in the database!

---

**Last Updated**: May 11, 2026
**Status**: Documentation created for database persistence setup
