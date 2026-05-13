# 🚀 Network Testing Quick Start

## Your Machine IP: 192.168.15.87

### Quick Test (Same Machine)

**Step 1: Open 2 Terminals**

Terminal 1 - Backend:
```powershell
cd "c:\Users\VSLC-092\VS Code\Pisowifi-online\backend"
npm start
```

Terminal 2 - Frontend:
```powershell
cd "c:\Users\VSLC-092\VS Code\Pisowifi-online\frontend"
npm run dev
```

**Step 2: Access from Network IP**

Instead of `http://localhost:3000`, use:
```
http://192.168.15.87:3000
```

**Step 3: Test Payment**
1. Select a package
2. Click "Pay Now"
3. Click "Payment Confirmed?"
4. Go to Admin → Devices
5. ✅ See the real IP in the table!

---

## Testing from Another Device

**Requirements:**
- Another device on same WiFi network (phone, laptop, tablet)

**Steps:**
1. Start backend and frontend (see above)
2. On the other device, open browser
3. Visit: `http://192.168.15.87:3000`
4. Complete payment
5. Admin table will show the other device's actual IP address! 

Example:
- Your laptop IP: 192.168.15.87
- Your phone IP: 192.168.15.150
- Phone accesses: `http://192.168.15.87:3000`
- Admin table shows device IP: **192.168.15.150** ✅

---

## Expected Results

### Localhost Access
```
IP Address: ::1  (IPv6 loopback - expected)
```

### Network Device Access
```
IP Address: 192.168.15.XXX  (Real network IP!)
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't access 192.168.15.87:3000 | Check both devices on same WiFi |
| Connection refused | Ensure backend/frontend are running |
| Still shows ::1 | Make sure you're accessing from network IP, not localhost |

---

## Backend Will Show:
```
Server running on port 5000
Local network access: http://192.168.15.87:5000
Localhost access: http://localhost:5000
```

This confirms the backend is listening on all network interfaces! 🎉
