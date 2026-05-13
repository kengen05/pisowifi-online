# Development & Deployment Notes

## Backend (.env configuration)

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pisowifi
JWT_SECRET=your_very_secure_jwt_secret_key_change_this_in_production
QR_PH_API_KEY=your_qr_ph_merchant_key
QR_PH_API_URL=https://api.qrph.com
NODE_ENV=development
```

## Running the Application

### Terminal 1 - Backend

```bash
cd backend
npm install
npm run dev
```

### Terminal 2 - Frontend

```bash
cd frontend
npm install
npm run dev
```

## Next Steps

1. **Database Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - The backend will auto-create collections on first use

2. **QR PH Integration**
   - Get API key from QR PH
   - Update `.env` file with credentials
   - Implement webhook handlers for payment callbacks

3. **Testing**
   - Use Postman to test API endpoints
   - Test user registration and login
   - Create test payments and vouchers

4. **Deployment**
   - Deploy backend to Heroku, AWS, or DigitalOcean
   - Deploy frontend to Vercel, Netlify, or GitHub Pages
   - Configure production environment variables

## Common Issues

- **MongoDB Connection Failed**: Ensure MongoDB is running locally or update MONGODB_URI
- **CORS Errors**: Frontend proxy is configured in vite.config.js
- **Port Already in Use**: Change PORT in .env file

## Features to Implement

- [ ] QR Code generation UI
- [ ] Real-time device status updates
- [ ] Analytics dashboard with charts
- [ ] Export payment reports
- [ ] Email notifications
- [ ] SMS notifications
- [ ] API rate limiting
- [ ] Advanced user management
