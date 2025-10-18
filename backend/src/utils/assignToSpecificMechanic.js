const mongoose = require('mongoose');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const dotenv = require('dotenv');

dotenv.config();

const assignToOwen = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carservice');
    console.log('Connected to MongoDB\n');

    // Find Owen by email
    const owen = await User.findOne({ email: 'owen@gmail.com', role: 'mechanic' });
    
    if (!owen) {
      console.log('❌ Owen not found. Please check the email address.');
      process.exit(1);
    }

    console.log('✅ Found Owen:', owen.name);
    console.log('   Email:', owen.email);
    console.log('   User ID:', owen._id);
    
    // Update all services to be assigned to Owen
    const servicesResult = await Service.updateMany(
      {},
      { $set: { mechanic: owen._id } }
    );
    
    console.log(`\n✅ Updated ${servicesResult.modifiedCount} services to be assigned to Owen`);
    
    // Update all bookings to be assigned to Owen
    const bookingsResult = await Booking.updateMany(
      {},
      { $set: { mechanic: owen._id } }
    );
    
    console.log(`✅ Updated ${bookingsResult.modifiedCount} bookings to be assigned to Owen`);
    
    // Show summary
    const totalServices = await Service.countDocuments({ mechanic: owen._id });
    const totalBookings = await Booking.countDocuments({ mechanic: owen._id });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total services assigned to Owen: ${totalServices}`);
    console.log(`   Total bookings assigned to Owen: ${totalBookings}`);
    
    // Show booking details
    const bookings = await Booking.find({ mechanic: owen._id })
      .populate('owner', 'name email')
      .populate('vehicle', 'make model year')
      .populate('service', 'serviceName baseCost');
    
    console.log(`\n📋 Bookings for Owen:`);
    bookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.service?.serviceName || 'Unknown Service'}`);
      console.log(`      Customer: ${booking.owner?.name || 'Unknown'}`);
      console.log(`      Vehicle: ${booking.vehicle?.make} ${booking.vehicle?.model} (${booking.vehicle?.year})`);
      console.log(`      Status: ${booking.status}`);
      console.log(`      Date: ${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}`);
      console.log('');
    });
    
    console.log(`\n🎉 Done! Owen can now see all service requests.`);
    console.log(`\nOwen's Login:`);
    console.log(`   Email: owen@gmail.com`);
    console.log(`   Password: (the password you used when registering Owen)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

assignToOwen();
