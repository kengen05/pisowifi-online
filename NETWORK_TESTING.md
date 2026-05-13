# Network Testing Guide for PisoWifi

## Overview
The application is now configured to be accessible from network devices. This allows you to test the device IP capture feature with real network IPs instead of localhost (::1).

## Getting Your Machine's Local IP Address

### Windows (PowerShell)
```powershell
# Run this command to find your local IP:
ipconfig

# Look for "IPv4 Address" under your active network adapter
# Example: 192.168.1.100 or 10.0.0.15
```

### macOS/Linux (Terminal)
```bash
# Run this command:
ifconfig

# Or:
hostname -I

# Look for an address like 192.168.x.x or 10.0.0.x (not 127.0.0.1)
```

## Starting the Services

### 1. Start Backend Server
The backend will now automatically display available network URLs:

```powershell
cd "c:\Users\VSLC-092\VS Code\Pisowifi-online\backend"
npm start
# Output will show:
# Server running on port 5000
# Local network access: http://192.168.1.100:5000
# Localhost access: http://localhost:5000
```

### 2. Start Frontend Server (in another terminal)
```powershell
cd "c:\Users\VSLC-092\VS Code\Pisowifi-online\frontend"
npm run dev
# Output will show something like:
# ➜  Local:   http://localhost:5000
# ➜  press h to show help
```

## Testing from Another Device on the Network

### Option 1: Same Machine (Simulate Network)
Use your machine's local IP instead of localhost:

1. Find your machine's IP (see above)
2. Open browser and navigate to: `http://<YOUR_MACHINE_IP>:3000`
   - Example: `http://192.168.1.100:3000`
3. The frontend will automatically detect the network IP and connect the backend to the same IP

### Option 2: Different Device on Same Network
1. Get your machine's local IP (e.g., `192.168.1.100`)
2. On another device (phone, laptop, tablet on same WiFi):
   - Open browser
   - Navigate to: `http://<YOUR_MACHINE_IP>:3000`
   - Example: `http://192.168.1.100:3000`

### Option 3: Mobile Device Testing
1. Ensure mobile device is on same WiFi network as your computer
2. Get your computer's IP address
3. On mobile browser, visit: `http://<YOUR_IP>:3000`
4. Complete a payment transaction
5. Check Admin → Devices to see the captured device IP

## What to Expect

### Localhost Testing (Current)
```
Device Name: Desktop - Chrome
MAC Address: AA:BB:CC:DD:XX:XX
IP Address: ::1  ← IPv6 loopback (expected for localhost)
Session Status: Running
Remaining Time: 59:45
```

### Network Device Testing
```
Device Name: Desktop - Chrome (or iOS - Safari, Android - Chrome, etc.)
MAC Address: AA:BB:CC:DD:XX:XX
IP Address: 192.168.1.105  ← Real network IP (what we want to see!)
Session Status: Running
Remaining Time: 59:45
```

## Troubleshooting

### "Cannot reach http://<IP>:3000"
- ✅ Ensure both devices are on **same WiFi network**
- ✅ Check firewall isn't blocking ports 3000 and 5000
- ✅ Verify IP address is correct (run `ipconfig` again)

### "Port already in use"
```powershell
# Find process using port:
netstat -ano | findstr :<PORT>

# Kill process (replace PID):
taskkill /PID <PID> /F

# Or use different port:
$env:PORT=5001; npm start
```

### "Network IP not being captured (still shows ::1)"
- Ensure you're accessing from a different IP than localhost
- Check browser console for errors (F12)
- Verify backend console shows the correct IP

### "Mixed Content Error" (http vs https)
- Make sure to use `http://` not `https://` for local network access
- Secure (https) requires certificates not needed for development

## Testing Steps

1. **Start Services**
   ```powershell
   # Terminal 1 - Backend
   cd backend; npm start
   
   # Terminal 2 - Frontend  
   cd frontend; npm run dev
   ```

2. **Access from Network**
   - Get your IP: `ipconfig` → IPv4 Address
   - Open browser on same/different device: `http://<YOUR_IP>:3000`

3. **Test Payment Flow**
   - Select package
   - Click "Pay Now"
   - Click "Payment Confirmed?"
   - Verify success screen shows device registered

4. **Verify IP Capture**
   - Go to Admin Dashboard → Devices
   - Look for the most recent device entry
   - **Check IP Address column**
     - Network device: Should show actual IP (e.g., 192.168.1.105)
     - Localhost: Will show ::1 (IPv6 loopback) - this is normal

5. **Check Backend Logs**
   - Backend terminal should show:
   ```
   Client Info - IP: 192.168.1.105, Device: Desktop, Browser: Chrome, User-Agent: Mozilla/5.0...
   ```

## Environment Variable (Optional)

If you want to force a specific backend URL, create a `.env` file in the frontend directory:

```
# frontend/.env.local
VITE_API_URL=http://192.168.1.100:5000
```

Then restart the frontend server.

## Network Topology

```
Your Machine (192.168.1.100)
├── Backend Server (Port 5000)
│   └── Listens on 0.0.0.0:5000
│       - Accessible at http://192.168.1.100:5000
│       - Also accessible at http://localhost:5000
├── Frontend Server (Port 3000)
│   └── Listens on 0.0.0.0:3000
│       - Accessible at http://192.168.1.100:3000
│       - Also accessible at http://localhost:3000
│
└─ Connected Network Devices
   ├── Mobile Phone (192.168.1.105)
   │   └── Accesses http://192.168.1.100:3000
   │       IP will be captured as: 192.168.1.105
   │
   └── Tablet (192.168.1.108)
       └── Accesses http://192.168.1.100:3000
           IP will be captured as: 192.168.1.108
```

## IP Capture Flow

```
Device A (192.168.1.105) on WiFi
         ↓
    Visits http://192.168.1.100:3000
         ↓
    Frontend loads and calls /api/client/info
         ↓
    Backend receives request from 192.168.1.105
         ↓
    Extracts IP from request source
         ↓
    Returns: {clientIp: "192.168.1.105", ...}
         ↓
    Frontend makes payment with captured IP
         ↓
    Device registered in database with IP: 192.168.1.105
         ↓
    Admin can see: Desktop - Chrome with IP 192.168.1.105
```

## Notes

- ✅ IPv6 loopback (::1) is normal for localhost development
- ✅ Real network IPs (192.168.x.x, 10.0.0.x) will be captured when accessing from network
- ✅ Proxy headers (X-Forwarded-For) are properly handled
- ✅ Works with any network adapter (WiFi, Ethernet)
- ✅ Automatic fallback to localhost if network detection fails
