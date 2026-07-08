const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

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
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
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
        isActive: true,
        isEmailVerified: true
      });
      await rootAdmin.save();
      console.log('====================================');
      console.log('DEFAULT ROOT ADMIN CREATED SUCCESSFULLY!');
      console.log('Email: admin@lucknowmasjid.com');
      console.log('Password: Admin@123');
      console.log('====================================');
    }

    const newAdminExists = await User.findOne({ email: 'mohammeduzaid2@gmail.com' });
    if (!newAdminExists) {
      const newAdmin = new User({
        name: 'Root Admin',
        email: 'mohammeduzaid2@gmail.com',
        mobile: '9876543210',
        password: '123456',
        role: 'ROOT_ADMIN',
        isActive: true,
        isEmailVerified: true
      });
      await newAdmin.save();
      console.log('====================================');
      console.log('NEW ROOT ADMIN CREATED SUCCESSFULLY!');
      console.log('Email: mohammeduzaid2@gmail.com');
      console.log('Password: 123456');
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
  // Check if Hadith JSON file exists
  const hadithJsonPath = path.join(__dirname, './data/sahih_bukhari.json');
  if (fs.existsSync(hadithJsonPath)) {
    console.log(`[Startup] Hadith JSON file found at: ${hadithJsonPath}`);
  } else {
    console.error(`[Startup] Hadith JSON file NOT found. Path checked: ${hadithJsonPath}`);
  }

  // Connect to DB first
  await connectDB();
  console.log('MongoDB connected');

  // Log Hadith count in MongoDB (and auto-import if empty)
  try {
    const Hadith = require('./models/Hadith');
    let totalHadiths = await Hadith.countDocuments();
    console.log(`Total Hadith count in MongoDB: ${totalHadiths}`);

    if (totalHadiths === 0) {
      console.log('Hadith collection is empty. Attempting auto-import...');
      if (fs.existsSync(hadithJsonPath)) {
        const content = fs.readFileSync(hadithJsonPath, 'utf8');
        const volumes = JSON.parse(content);
        let flattened = [];

        volumes.forEach(volume => {
          if (volume.books) {
            volume.books.forEach(book => {
              if (book.hadiths) {
                book.hadiths.forEach(hadith => {
                  flattened.push({
                    volumeName: volume.name,
                    bookName: book.name,
                    info: hadith.info || '',
                    by: hadith.by || '',
                    text: hadith.text || ''
                  });
                });
              }
            });
          }
        });

        console.log(`Auto-importing ${flattened.length} Hadiths into MongoDB...`);
        const result = await Hadith.insertMany(flattened);
        console.log(`Successfully auto-imported ${result.length} Hadiths into MongoDB.`);
      } else {
        console.error(`Cannot auto-import: Hadith JSON file not found at ${hadithJsonPath}`);
      }
    }
  } catch (error) {
    console.error(`[Startup] Error during Hadith collection setup: ${error.message}`);
  }

  // Seed mosque slugs if any are missing
  const seedMosqueSlugs = async () => {
    try {
      const Mosque = require('./models/Mosque');
      const mosques = await Mosque.find({ $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: null }] });
      if (mosques.length > 0) {
        console.log(`[Startup] Found ${mosques.length} mosques without slugs. Generating slugs...`);
        for (const mosque of mosques) {
          await mosque.save();
        }
        console.log(`[Startup] Successfully generated slugs for all mosques.`);
      }
    } catch (error) {
      console.error('[Startup] Error generating mosque slugs:', error);
    }
  };
  await seedMosqueSlugs();

  // Seed the admin
  await seedRootAdmin();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
