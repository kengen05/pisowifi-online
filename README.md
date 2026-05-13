# Piso WiFi QR PH Payment System

A full-stack admin portal for managing Piso WiFi access using QR PH payment integration.

## 📋 Project Structure

```
pisowifi-online/
├── backend/           # Node.js + Express backend
├── frontend/          # React admin portal
└── README.md
```

## 🚀 Features

### Admin Portal

- **Dashboard**: Real-time statistics and overview
- **Payment Monitoring**: Track all QR PH payments with status
- **Voucher Management**: Create, update, and delete WiFi vouchers
- **Device Management**: Monitor and register WiFi routers
- **Activity Logging**: Complete audit trail of all activities
- **User Authentication**: Secure login and authorization

### Core Functionality

- QR PH payment integration
- Time-based and data-based WiFi vouchers
- Real-time device status monitoring
- Comprehensive activity logs
- Revenue tracking
- Payment history

## 🛠️ Tech Stack

**Backend:**

- Node.js & Express.js
- MongoDB
- JWT Authentication
- Axios for API calls

**Frontend:**

- React 18
- React Router
- Zustand (State Management)
- Vite (Build tool)
- Chart.js (For analytics)

## 📦 Installation & Setup

### Prerequisites

- Node.js >= 16
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Create .env file with:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pisowifi
JWT_SECRET=your_jwt_secret_key_here
QR_PH_API_KEY=your_qr_ph_api_key_here
QR_PH_API_URL=https://api.qrph.com
NODE_ENV=development
```

Start backend:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`
Backend API on `http://localhost:5000`

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new operator
- `POST /api/auth/login` - Login operator

### Payments

- `POST /api/payments/create` - Create payment request (QR Code)
- `POST /api/payments/confirm/:paymentId` - Confirm payment after QR PH callback
- `GET /api/payments/history` - Get payment history
- `GET /api/payments/stats` - Get payment statistics

### Vouchers

- `POST /api/vouchers/create` - Create voucher
- `GET /api/vouchers` - Get all vouchers
- `PUT /api/vouchers/:voucherId` - Update voucher
- `DELETE /api/vouchers/:voucherId` - Delete voucher

### Devices

- `POST /api/devices/register` - Register WiFi device
- `GET /api/devices` - Get all devices
- `PUT /api/devices/:deviceId/status` - Update device status

### Activity

- `GET /api/activity` - Get activity log

## 📝 Usage

1. **Register** a new account as an operator
2. **Login** to the admin portal
3. **Register WiFi devices** (routers) in Device Management
4. **Create vouchers** with pricing (1 PHP, 5 PHP, etc.)
5. **Generate payment requests** for customers
6. **Monitor payments and activity** in real-time

## 🔗 QR PH Integration

For QR PH payment callback integration:

- Endpoint: `POST /api/payments/confirm/:paymentId`
- Payload: `{ qrPhTransactionId, phoneNumber }`

## 📊 Database Schema

**Collections:**

- `users` - Operator accounts
- `devices` - WiFi routers
- `payments` - Transaction records
- `vouchers` - WiFi access vouchers
- `activities` - Activity audit logs

## 🔒 Security

- JWT token-based authentication
- Password hashing with bcryptjs
- Role-based access control (admin/operator)
- Activity logging for all transactions

## 📄 License

MIT

## 👥 Support

For issues or questions, please create an issue in the repository.

---

**Note**: This is a development version. Before production deployment:

- Set secure JWT secret
- Configure MongoDB for production
- Integrate actual QR PH API credentials
- Add HTTPS/SSL
- Set up proper error handling and monitoring
