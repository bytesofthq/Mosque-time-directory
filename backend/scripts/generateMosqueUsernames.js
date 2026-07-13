const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Mosque = require('../models/Mosque');
const User = require('../models/User');

const generateUsernameFromMosqueName = (mosqueName) => {
  if (!mosqueName) return 'mosque';

  let cleaned = mosqueName.toLowerCase();

  // 1. Direct exact matches first
  const normalized = cleaned.replace(/[^a-z0-9]/g, '');
  if (normalized === 'jamamasjid' || normalized === 'jamamasjidchowk') {
    return normalized;
  }

  // 2. Remove unnecessary words
  const wordsToRemove = ['masjid', 'mosque', 'jami', 'jamia', 'markaz', 'center'];
  let words = cleaned.split(/\s+/).filter(w => w.length > 0);
  words = words.filter(word => !wordsToRemove.includes(word.replace(/[^a-z0-9]/g, '')));

  let base = words.join('').replace(/[^a-z0-9]/g, '');

  // 3. Apply preferred conversions
  if (base === 'alnoor' || base === 'noor' || normalized.includes('alnoor')) {
    base = 'alnoor';
  } else if (base === 'bilal' || normalized.includes('bilal')) {
    base = 'bilal';
  } else if (base === 'madina' || base === 'madinah' || normalized.includes('madina') || normalized.includes('madinah')) {
    base = 'madina';
  } else if (base === 'noorani' || normalized.includes('noorani')) {
    base = 'noorani';
  } else if (base === 'jama' || base === 'jamamasjid') {
    base = 'jamamasjid';
  }

  if (!base) {
    base = 'mosque';
  }

  if (base.length > 15) {
    base = base.substring(0, 15);
  }

  return base;
};

const runMigration = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected for Migration...');

    // Drop old email/mobile indexes to prevent duplicate key errors
    try {
      await mongoose.connection.db.collection('users').dropIndex('email_1');
      console.log('Successfully dropped old users email_1 index.');
    } catch (e) {
      // index does not exist, safe to ignore
    }

    try {
      await mongoose.connection.db.collection('users').dropIndex('mobile_1');
      console.log('Successfully dropped old users mobile_1 index.');
    } catch (e) {
      // index does not exist, safe to ignore
    }

    const mosques = await Mosque.find();
    console.log(`Scanning ${mosques.length} mosques in database...`);

    let scannedCount = 0;
    let generatedCount = 0;
    let skippedCount = 0;
    let resolvedConflicts = [];

    for (const mosque of mosques) {
      scannedCount++;

      // Check if it already has a username
      if (mosque.username) {
        skippedCount++;
        continue;
      }

      // Generate base username
      const baseUsername = generateUsernameFromMosqueName(mosque.mosqueName);

      // Enforce unique check across User and Mosque collections
      let suggested = baseUsername;
      let count = 1;
      let exists = (await User.findOne({ username: suggested })) || (await Mosque.findOne({ username: suggested }));
      
      while (exists) {
        count++;
        suggested = `${baseUsername}${count}`;
        exists = (await User.findOne({ username: suggested })) || (await Mosque.findOne({ username: suggested }));
      }

      if (count > 1) {
        resolvedConflicts.push(`${mosque.mosqueName}: ${baseUsername} -> ${suggested}`);
      }

      // Save username and default password to Mosque document
      mosque.username = suggested;
      mosque.password = 'Mosque@123'; // Note: pre-save hook on Mosque will hash this!
      await mosque.save();

      // Check if there is already an admin user for this mosque
      let adminUser = await User.findOne({ mosqueId: mosque._id, role: 'MOSQUE_ADMIN' });
      if (adminUser) {
        adminUser.username = suggested;
        adminUser.password = 'Mosque@123'; // Sync password
        await adminUser.save();
      } else {
        // Create corresponding admin User account if none exists
        adminUser = new User({
          name: mosque.mosqueName,
          username: suggested,
          password: 'Mosque@123',
          role: 'MOSQUE_ADMIN',
          mosqueId: mosque._id,
          isActive: true
        });
        await adminUser.save();
      }

      generatedCount++;
    }

    console.log('\n====================================');
    console.log('MIGRATION COMPLETED SUCCESSFULLY!');
    console.log(`Total mosques scanned: ${scannedCount}`);
    console.log(`Total usernames generated: ${generatedCount}`);
    console.log(`Total skipped: ${skippedCount}`);
    console.log(`Any duplicate conflicts resolved: ${resolvedConflicts.length}`);
    if (resolvedConflicts.length > 0) {
      console.log('Conflicts:');
      resolvedConflicts.forEach(c => console.log(`  - ${c}`));
    }
    console.log('Default Password assigned to migrated accounts: Mosque@123');
    console.log('====================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
