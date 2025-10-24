const mongoose = require('mongoose');
const dotenv = require('dotenv');
const setupDemoAccounts = require('./src/utils/setupDemoAccounts');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carservice');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const runSetup = async () => {
  try {
    await connectDB();
    await setupDemoAccounts();
    console.log('\n✅ Demo setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
};

runSetup();
