const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carservice');
    console.log('Connected to MongoDB\n');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@carservice.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found. Run createAdmin.js first.');
      process.exit(1);
    }

    console.log('✅ Found admin:', admin.name);
    
    // Update password (will be hashed by pre-save hook)
    admin.password = 'admin123';
    await admin.save();
    
    console.log('✅ Admin password reset successfully!\n');
    console.log('Admin Login Credentials:');
    console.log('   Email: admin@carservice.com');
    console.log('   Password: admin123');
    console.log('\n📊 Access Admin Dashboard at:');
    console.log('   http://localhost:3000/admin-dashboard');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
    process.exit(1);
  }
};

resetAdminPassword();



