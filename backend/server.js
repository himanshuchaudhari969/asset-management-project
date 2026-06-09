const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const authRoutes = require('./routes/authRoutes');
const assetRoutes = require('./routes/assetRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit', auditRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server chal raha hai!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server port ${PORT} pe chal raha hai`);
});