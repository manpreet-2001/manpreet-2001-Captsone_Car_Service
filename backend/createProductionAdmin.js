// Create admin in PRODUCTION database
const mongoose = require('mongoose');
const User = require('./src/models/User');

const PRODUCTION_MONGODB = 'mongodb+srv://manpreet123singh987_db_user:E7gaFrH4PP7BAJcj@car-service-cluster.fplug7e.mongodb.net/carservice?retryWrites=true&w=majority&appName=car-service-cluster';

const createAdmin = async () => {
  try {
    console.log('🔄 Connecting to PRODUCTION database...');
    await mongoose.connect(PRODUCTION_MONGODB);
    console.log('✅ Connected to production MongoDB\n');

    // Check if admin already exists
    let admin = await User.findOne({ role: 'admin' });
    
    if (admin) {
      console.log('✅ Admin user already exists!');
      console.log('   Name:', admin.name);
      console.log('   Email:', admin.email);
      console.log('\n🔑 Login with:');
      console.log('   Email:', admin.email);
      console.log('   Password: (the password you set when creating)');
    } else {
      // Create admin user
      admin = await User.create({
        name: 'Admin',
        email: 'admin@carservice.com',
        password: 'admin123',
        role: 'admin',
        status: 'active'
      });
      
      console.log('✅ Admin user created successfully!\n');
      console.log('🔑 Admin Login Credentials:');
      console.log('   Email: admin@carservice.com');
      console.log('   Password: admin123');
      console.log('\n⚠️  Please change the password after first login!');
      console.log('\n🌐 Login at: https://captsone-car-service.vercel.app/login');
    }

    await mongoose.disconnect();
    console.log('\n✅ Done! Disconnected from database.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();



