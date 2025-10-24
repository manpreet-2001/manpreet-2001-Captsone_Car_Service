const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const makeUserAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carservice');
    console.log('Connected to MongoDB\n');

    // Update an existing user to admin
    const email = 'manpreet123singh987@gmail.com'; // Use Manpreet's account
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('Found user:', user.name);
    console.log('Current role:', user.role);
    
    // Save original role
    const originalRole = user.role;
    
    // Update to admin
    user.role = 'admin';
    await user.save();
    
    console.log('\n✅ User role updated!');
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Old Role:', originalRole);
    console.log('   New Role: admin');
    console.log('\n📊 Access Admin Dashboard at:');
    console.log('   http://localhost:3000/admin-dashboard');
    console.log('\nLogin with your existing credentials:');
    console.log('   Email:', user.email);
    console.log('   Password: (your existing password)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

makeUserAdmin();



