const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Service = require('../models/Service');
const dotenv = require('dotenv');

dotenv.config();

const checkBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carservice');
    console.log('Connected to MongoDB\n');

    const bookings = await Booking.find()
      .populate('owner', 'name email')
      .populate('mechanic', 'name email')
      .populate('vehicle', 'make model year licensePlate')
      .populate('service', 'serviceName baseCost')
      .sort({ bookingDate: 1 });
    
    console.log(`Found ${bookings.length} bookings:\n`);
    
    bookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.service?.serviceName || 'Unknown Service'}`);
      console.log(`   ID: ${booking._id}`);
      console.log(`   Customer: ${booking.owner?.name || 'Unknown'} (${booking.owner?.email})`);
      console.log(`   Mechanic: ${booking.mechanic?.name || 'Unknown'} (${booking.mechanic?.email})`);
      console.log(`   Vehicle: ${booking.vehicle?.make} ${booking.vehicle?.model} (${booking.vehicle?.year})`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Date: ${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}`);
      console.log(`   Time: ${booking.bookingTime || 'N/A'}`);
      console.log(`   Cost: $${booking.estimatedCost || 'N/A'}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkBookings();



