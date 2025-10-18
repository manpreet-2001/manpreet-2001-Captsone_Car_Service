/**
 * Debug Booking Visibility for Mechanics
 * Run this to see why a booking might not show up
 * 
 * Run: node src/utils/checkBookingVisibility.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');
const Vehicle = require('../models/Vehicle');

const checkBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carservice');
    console.log('✅ Connected to MongoDB\n');

    // Get all mechanics
    const mechanics = await User.find({ role: 'mechanic' });
    console.log(`Found ${mechanics.length} mechanics:\n`);
    
    for (const mechanic of mechanics) {
      console.log(`\n👨‍🔧 Mechanic: ${mechanic.name} (${mechanic.email})`);
      console.log('   ID:', mechanic._id);
      
      // Get bookings for this mechanic
      const bookings = await Booking.find({ mechanic: mechanic._id })
        .populate('owner', 'name email')
        .populate('service', 'serviceName')
        .populate('vehicle', 'make model');
      
      console.log(`   📋 Total bookings: ${bookings.length}`);
      
      if (bookings.length > 0) {
        bookings.forEach((booking, idx) => {
          console.log(`\n   ${idx + 1}. ${booking.service?.serviceName || 'Unknown Service'}`);
          console.log(`      Customer: ${booking.owner?.name || 'Unknown'}`);
          console.log(`      Vehicle: ${booking.vehicle?.make} ${booking.vehicle?.model}`);
          console.log(`      Status: ${booking.status}`);
          console.log(`      Date: ${new Date(booking.bookingDate).toLocaleDateString()}`);
          console.log(`      Time: ${booking.bookingTime}`);
        });
      } else {
        console.log('   ⚠️  No bookings found for this mechanic');
      }
      
      // Check services for this mechanic
      const services = await Service.find({ mechanic: mechanic._id });
      console.log(`\n   🔧 Services offered: ${services.length}`);
      services.forEach((service, idx) => {
        console.log(`      ${idx + 1}. ${service.serviceName}`);
      });
    }

    // Check for "orphan" bookings (no mechanic assigned)
    const orphanBookings = await Booking.find({ 
      $or: [
        { mechanic: null },
        { mechanic: { $exists: false } }
      ]
    }).populate('owner', 'name').populate('service', 'serviceName');
    
    if (orphanBookings.length > 0) {
      console.log(`\n\n⚠️  Found ${orphanBookings.length} bookings with NO MECHANIC assigned:`);
      orphanBookings.forEach((booking, idx) => {
        console.log(`   ${idx + 1}. ${booking.service?.serviceName} - Customer: ${booking.owner?.name}`);
      });
    }

    // Get all bookings
    const allBookings = await Booking.find({})
      .populate('owner', 'name')
      .populate('mechanic', 'name')
      .populate('service', 'serviceName');
    
    console.log(`\n\n📊 SUMMARY:`);
    console.log(`   Total bookings in database: ${allBookings.length}`);
    console.log(`   Pending: ${allBookings.filter(b => b.status === 'pending').length}`);
    console.log(`   Confirmed: ${allBookings.filter(b => b.status === 'confirmed').length}`);
    console.log(`   Completed: ${allBookings.filter(b => b.status === 'completed').length}`);
    console.log(`   Cancelled: ${allBookings.filter(b => b.status === 'cancelled').length}`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkBookings();

