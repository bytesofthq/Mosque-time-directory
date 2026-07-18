const mongoose = require('mongoose');
const User = require('../models/User');
const Mosque = require('../models/Mosque');

const ROOT_ADMIN_EMAIL = 'mohammeduzaid2@gmail.com';

const migrateSingleRootAdmin = async () => {
  try {
    console.log('[Migration] Starting Single Root Admin & Role Restructuring Migration...');

    // 1. Find or verify the sole Root Admin user (mohammeduzaid2@gmail.com)
    let rootAdmin = await User.findOne({
      $or: [
        { email: ROOT_ADMIN_EMAIL.toLowerCase() },
        { username: 'rootadmin' }
      ]
    });

    if (rootAdmin) {
      rootAdmin.role = 'ROOT_ADMIN';
      rootAdmin.email = ROOT_ADMIN_EMAIL.toLowerCase();
      rootAdmin.isActive = true;
      await rootAdmin.save();
      console.log(`[Migration] Verified Sole Root Admin: ${rootAdmin.email} (ID: ${rootAdmin._id})`);
    } else {
      rootAdmin = new User({
        name: 'Root Admin',
        username: 'rootadmin',
        email: ROOT_ADMIN_EMAIL.toLowerCase(),
        password: 'AdminPassword123!',
        role: 'ROOT_ADMIN',
        isActive: true
      });
      await rootAdmin.save();
      console.log(`[Migration] Created Sole Root Admin: ${rootAdmin.email} (ID: ${rootAdmin._id})`);
    }

    // 2. Demote all other existing ROOT_ADMIN users to ADMIN
    const formerRootAdmins = await User.find({
      role: 'ROOT_ADMIN',
      _id: { $ne: rootAdmin._id }
    });

    if (formerRootAdmins.length > 0) {
      console.log(`[Migration] Migrating ${formerRootAdmins.length} former Root Admin accounts to ADMIN role...`);
      for (const admin of formerRootAdmins) {
        admin.role = 'ADMIN';
        await admin.save();
        console.log(`[Migration] Converted user '${admin.username}' (${admin.email || admin._id}) to ADMIN`);
      }
    } else {
      console.log('[Migration] No other Root Admin accounts required demotion.');
    }

    // 3. Update mosque ownership fields if not set
    const mosquesWithoutOwner = await Mosque.find({
      $or: [
        { adminOwner: null },
        { adminOwner: { $exists: false } }
      ]
    });

    if (mosquesWithoutOwner.length > 0) {
      console.log(`[Migration] Found ${mosquesWithoutOwner.length} mosques without adminOwner. Assigning default owner...`);
      for (const mosque of mosquesWithoutOwner) {
        const mosqueAdmin = await User.findOne({ mosqueId: mosque._id, role: 'MOSQUE_ADMIN' });
        mosque.adminOwner = mosqueAdmin ? mosqueAdmin._id : (mosque.createdBy || rootAdmin._id);
        if (!mosque.createdBy) {
          mosque.createdBy = rootAdmin._id;
        }
        await mosque.save();
      }
      console.log('[Migration] All mosques updated with adminOwner.');
    }

    console.log('[Migration] Single Root Admin migration completed successfully.');
    return { success: true };
  } catch (error) {
    console.error('[Migration] Error running single Root Admin migration:', error);
    return { success: false, error: error.message };
  }
};

module.exports = migrateSingleRootAdmin;
