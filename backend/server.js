const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const User = require('./models/User');
const migrateSingleRootAdmin = require('./scripts/migrateSingleRootAdmin');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mosqueRoutes = require('./routes/mosqueRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const sitemapRoutes = require('./routes/sitemapRoutes');

const app = express();

// ==========================================
// MIDDLEWARES & COOKIE/CSRF SETUP
// ==========================================
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174'
];
if (process.env.FRONTEND_URL) {
  // Support comma-separated origins
  const origins = process.env.FRONTEND_URL.split(',').map(o => o.trim());
  allowedOrigins.push(...origins);
}
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  exposedHeaders: ['x-csrf-token']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Cookie Parser Middleware
app.use((req, res, next) => {
  const rawCookies = req.headers.cookie || '';
  req.cookies = {};
  rawCookies.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      req.cookies[name] = decodeURIComponent(val);
    }
  });
  next();
});

// Automatic CSRF Cookie Generation
app.use((req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';
  if (!req.cookies.csrfToken) {
    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('csrfToken', csrfToken, {
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    req.cookies.csrfToken = csrfToken;
  }
  
  // Set the CSRF token in a custom header so the frontend can retrieve it cross-origin
  res.setHeader('x-csrf-token', req.cookies.csrfToken);
  next();
});

// CSRF Protection Middleware
const csrfProtection = require('./middlewares/csrfMiddleware');
app.use('/api', csrfProtection);

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// ROUTES
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', mosqueRoutes); // handles public searches and /api/mosque/my-mosque
app.use('/api/announcements', announcementRoutes); // handles mosque & admin announcements
app.use('/', sitemapRoutes); // Serves /sitemap.xml

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
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const rootAdmin = new User({
        name: 'Root Admin',
        username: 'admin',
        email: 'admin@lucknowmasjid.com',
        password: 'Admin@123',
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

    const newAdminExists = await User.findOne({ username: 'rootadmin' });
    if (!newAdminExists) {
      const newAdmin = new User({
        name: 'Root Admin',
        username: 'rootadmin',
        email: 'mohammeduzaid2@gmail.com',
        password: '123456',
        role: 'ROOT_ADMIN',
        isActive: true
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

  // Drop old unique indexes if they exist
  try {
    const mongoose = require('mongoose');
    await mongoose.connection.db.collection('users').dropIndex('email_1');
    console.log('[Startup] Successfully dropped old users email_1 index.');
  } catch (e) {
    // index does not exist, ignore
  }

  try {
    const mongoose = require('mongoose');
    await mongoose.connection.db.collection('users').dropIndex('mobile_1');
    console.log('[Startup] Successfully dropped old users mobile_1 index.');
  } catch (e) {
    // index does not exist, ignore
  }

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

  // Verify and sync all mosque locations for GeoJSON geospatial queries
  const syncAllMosqueCoordinates = async () => {
    try {
      const Mosque = require('./models/Mosque');
      const mosques = await Mosque.find({
        latitude: { $ne: null },
        longitude: { $ne: null }
      });
      
      let updatedCount = 0;
      for (const mosque of mosques) {
        const expectedLng = Number(mosque.longitude);
        const expectedLat = Number(mosque.latitude);
        
        if (
          !mosque.location ||
          !mosque.location.coordinates ||
          mosque.location.coordinates.length !== 2 ||
          mosque.location.coordinates[0] !== expectedLng ||
          mosque.location.coordinates[1] !== expectedLat
        ) {
          mosque.location = {
            type: 'Point',
            coordinates: [expectedLng, expectedLat]
          };
          mosque.markModified('location');
          await mosque.save();
          updatedCount++;
        }
      }
      
      if (updatedCount > 0) {
        console.log(`[Startup] Successfully synchronized coordinates for ${updatedCount} mosques in the database.`);
      } else {
        console.log(`[Startup] All mosque coordinates are fully in sync.`);
      }
    } catch (error) {
      console.error('[Startup] Error verifying/synchronizing mosque locations:', error);
    }
  };
  await syncAllMosqueCoordinates();

  // Seed the admin
  await seedRootAdmin();

  // Run single root admin migration & role restructuring
  await migrateSingleRootAdmin();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
