# Devices Table - Data Alignment Fix

## Issues Fixed

### 1. **Column Misalignment**

- **Before**: Status column was showing mixed data, Session Status was showing remaining time
- **After**: Each column now clearly displays its own data with proper separation

### 2. **Column Headers Updated**

- Changed "Status" → "Online Status" (clearer distinction)
- Added "Session Status" (shows Running/Paused)
- Added "Remaining Time" (shows HH:MM:SS)
- Removed "Users" column

### 3. **Frontend Rendering Improved**

**Changes in Devices.jsx:**

```jsx
// Variables are now explicitly calculated before rendering
const isOnline = device.isOnline ? 'Online' : 'Offline';
const sessionStatus = device.sessionStatus === 'running' ? '▶ Running' : '⏸ Paused';
const remainingTimeText = formatTime(device.remainingTime);

// Each cell now uses dedicated class names for clarity
<td className={`status-cell ${device.isOnline ? 'online' : 'offline'}`}>
  {isOnline}
</td>
<td className={`session-status-cell ${device.sessionStatus === 'running' ? 'running' : 'paused'}`}>
  {sessionStatus}
</td>
<td className="remaining-time-cell">
  {remainingTimeText}
</td>
```

### 4. **CSS Styling Clarified**

**Before**: `.status`, `.session-status`, `.remaining-time`
**After**: `.status-cell`, `.session-status-cell`, `.remaining-time-cell`

**Styling improvements:**

- `.remaining-time-cell`: Monospace font, centered, primary color
- `.session-status-cell.running`: Green badge with "▶" icon
- `.session-status-cell.paused`: Gray badge with "⏸" icon
- `.status-cell.online`: Green badge for Online
- `.status-cell.offline`: Red badge for Offline

### 5. **Defensive Checks Added**

```jsx
// Checks for null/undefined data
<td>{device.deviceName || '-'}</td>
<td>{device.macAddress || '-'}</td>
<td>{device.ipAddress || '-'}</td>

// No-data state when no devices exist
{devices.length > 0 ? (
  // render table rows
) : (
  <tr>
    <td colSpan="7" className="no-data">
      No devices registered yet
    </td>
  </tr>
)}
```

## Data Flow

### Backend `/api/devices/admin/all`

Returns enriched device objects:

```javascript
{
  _id: "...",
  deviceId: "...",
  userId: "...",
  deviceName: "Device - AA:BB:CC:DD:XX:XX",
  macAddress: "AA:BB:CC:DD:XX:XX",
  ipAddress: "dynamic",
  isOnline: true,
  lastSeen: "2026-05-11T09:01:00Z",
  totalUsers: 0,
  totalBandwidth: 0,
  createdAt: "...",

  // Added by enrichment logic:
  remainingTime: 10800,  // seconds (3 hours)
  sessionStatus: "running"  // 'running' or 'pause'
}
```

### Frontend Display

| Column         | Source Field    | Display Logic                              | Example                    |
| -------------- | --------------- | ------------------------------------------ | -------------------------- |
| Device Name    | `deviceName`    | Direct text                                | Device - AA:BB:CC:DD:8A:5F |
| MAC Address    | `macAddress`    | Direct text                                | AA:BB:CC:DD:8A:5F          |
| IP Address     | `ipAddress`     | Direct text                                | dynamic                    |
| Online Status  | `isOnline`      | Boolean → "Online"/"Offline"               | 🟢 Online                  |
| Session Status | `sessionStatus` | 'running'/'pause' → "▶ Running"/"⏸ Paused" | 🟢 ▶ Running               |
| Remaining Time | `remainingTime` | Seconds → HH:MM:SS format                  | 03:00:00                   |
| Last Seen      | `lastSeen`      | Date → locale string                       | 5/11/2026, 9:01:00 AM      |

## How Remaining Time & Session Status Are Generated

### Backend Logic (for each device):

```javascript
// Find active session for this device
const activeSession = demoDeviceSessions.find(
  (s) => s.deviceId === device.macAddress && s.status === "active",
);

const now = new Date();
let remainingTime = null;
let sessionStatus = "pause"; // default

if (activeSession && activeSession.endTime) {
  const timeRemaining = activeSession.endTime - now;
  if (timeRemaining > 0) {
    remainingTime = Math.ceil(timeRemaining / 1000); // convert to seconds
    sessionStatus = "running";
  }
}
```

### Frontend Auto-Update:

- Fetches device list every 5 seconds: `setInterval(fetchDevices, 5000)`
- `formatTime()` converts seconds to HH:MM:SS
- Status badges update in real-time

## Testing the Fix

1. ✅ Go to Customer Portal (/)
2. ✅ Select a package (e.g., 3 Hours)
3. ✅ Click "Pay Now"
4. ✅ Click "Payment Confirmed?"
5. ✅ Device registers and shows countdown
6. ✅ Go to Admin → Devices
7. ✅ Verify table shows:
   - Device name with MAC address
   - "Online" status (green)
   - "▶ Running" session status (green)
   - Remaining time in HH:MM:SS format (updates every 5 seconds)

## Expected Display

```
Device Name                MAC Address           IP Address  Online Status  Session Status  Remaining Time
Device - AA:BB:CC:DD:8A:5F AA:BB:CC:DD:8A:5F    dynamic     🟢 Online      🟢 ▶ Running    02:59:30
```

---

**Status**: ✅ Fixed - Data is now properly aligned in separate columns with correct formatting
