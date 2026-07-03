const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mosqueRoutes = require('./routes/mosqueRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// ROUTES
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', mosqueRoutes); // handles public searches and /api/mosque/my-mosque
app.use('/api/announcements', announcementRoutes); // handles mosque & admin announcements

// Default route for server health check
app.get('/', (req, res) => {
  res.json({ message: 'Mosque Directory API is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// ==========================================
// SEED DEFAULT ROOT ADMIN
// ==========================================
const seedRootAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@lucknowmasjid.com' });
    if (!adminExists) {
      const rootAdmin = new User({
        name: 'Root Admin',
        email: 'admin@lucknowmasjid.com',
        mobile: '9999999999',
        password: 'Admin@123', // Pre-save hook in User model will hash this automatically
        role: 'ROOT_ADMIN',
        isActive: true
      });
      await rootAdmin.save();
      console.log('====================================');
      console.log('DEFAULT ROOT ADMIN CREATED SUCCESSFULLY!');
      console.log('Email: admin@lucknowmasjid.com');
      console.log('Password: Admin@123');
      console.log('====================================');
    }
  } catch (error) {
    console.error('Error seeding root admin:', error.message);
  }
};

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to DB first
  await connectDB();
  
  // Seed the admin
  await seedRootAdmin();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
