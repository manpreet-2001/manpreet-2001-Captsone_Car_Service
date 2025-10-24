// Run this to create admin in PRODUCTION database
// Usage: node CREATE_PRODUCTION_ADMIN.js

const mongoose = require('mongoose');

// Production MongoDB connection string
const PRODUCTION_MONGODB_URI = 'mongodb+srv://manpreet123singh987_db_user:E7gaFrH4PP7BAJcj@car-service-cluster.fplug7e.mongodb.net/carservice?retryWrites=true&w=majority&appName=car-service-cluster';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  status: String
});

const bcrypt = require('bcryptjs');

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

const createAdmin = async () => {
  try {
    console.log('Connecting to production database...');
    await mongoose.connect(PRODUCTION_MONGODB_URI);
    console.log('✅ Connected to production MongoDB\n');

    // Check if admin exists
    let admin = await User.findOne({ role: 'admin' });
    
    if (admin) {
      console.log('✅ Admin already exists!');
      console.log('   Email:', admin.email);
      console.log('   Name:', admin.name);
      console.log('\n💡 Use these credentials to login:');
      console.log('   Email: admin@carservice.com');
      console.log('   Password: admin123 (if you created it with default)');
    } else {
      // Create new admin
      admin = new User({
        name: 'Admin',
        email: 'admin@carservice.com',
        password: 'admin123',
        role: 'admin',
        status: 'active'
      });
      
      await admin.save();
      
      console.log('✅ Admin created successfully!\n');
      console.log('🔑 Admin Login Credentials:');
      console.log('   Email: admin@carservice.com');
      console.log('   Password: admin123');
      console.log('\n⚠️  Please change password after first login!');
      console.log('\n🌐 Login at: https://captsone-car-service.vercel.app/login');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();



