const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carservice');
    console.log('Connected to MongoDB\n');

    // Check if admin already exists
    let admin = await User.findOne({ role: 'admin' });
    
    if (admin) {
      console.log('✅ Admin user already exists:', admin.name);
      console.log('   Email:', admin.email);
      console.log('\nAdmin Login:');
      console.log('   Email:', admin.email);
      console.log('   Password: (use the password you set when creating this admin)');
    } else {
      // Create admin user - don't pre-hash, let the model do it
      admin = await User.create({
        name: 'Admin',
        email: 'admin@carservice.com',
        password: 'admin123', // Will be hashed by User model pre-save hook
        role: 'admin',
        status: 'active'
      });
      
      console.log('✅ Admin user created successfully!\n');
      console.log('Admin Login Credentials:');
      console.log('   Email: admin@carservice.com');
      console.log('   Password: admin123');
      console.log('\n⚠️  Please change the password after first login!');
    }

    console.log('\n📊 Access Admin Dashboard at:');
    console.log('   http://localhost:3000/admin-dashboard');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
