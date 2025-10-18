const mongoose = require('mongoose');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const dotenv = require('dotenv');

dotenv.config();

const assignToOwen = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carservice');
    console.log('Connected to MongoDB\n');

    // Find Owen (the mechanic)
    const owen = await User.findOne({ role: 'mechanic' }).sort({ createdAt: -1 });
    
    if (!owen) {
      console.log('❌ No mechanic user found. Please create a mechanic account first.');
      process.exit(1);
    }

    console.log('✅ Found mechanic:', owen.name, `(${owen.email})`);
    console.log('   User ID:', owen._id);
    
    // Update all services to be assigned to Owen
    const servicesResult = await Service.updateMany(
      {},
      { $set: { mechanic: owen._id } }
    );
    
    console.log(`\n✅ Updated ${servicesResult.modifiedCount} services to be assigned to ${owen.name}`);
    
    // Update all bookings to be assigned to Owen
    const bookingsResult = await Booking.updateMany(
      {},
      { $set: { mechanic: owen._id } }
    );
    
    console.log(`✅ Updated ${bookingsResult.modifiedCount} bookings to be assigned to ${owen.name}`);
    
    // Show summary
    const totalServices = await Service.countDocuments({ mechanic: owen._id });
    const totalBookings = await Booking.countDocuments({ mechanic: owen._id });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Services assigned to ${owen.name}: ${totalServices}`);
    console.log(`   Bookings assigned to ${owen.name}: ${totalBookings}`);
    
    console.log(`\n🎉 Done! ${owen.name} can now see all service requests.`);
    console.log(`\nLogin as:`);
    console.log(`   Email: ${owen.email}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

assignToOwen();

