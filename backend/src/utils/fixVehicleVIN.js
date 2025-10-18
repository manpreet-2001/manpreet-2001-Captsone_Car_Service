/**
 * Fix Duplicate VIN Issue
 * Removes empty VIN strings from existing vehicles
 * 
 * Run: node src/utils/fixVehicleVIN.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Load models
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

const fixVINs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carservice');
    console.log('✅ Connected to MongoDB\n');

    // Find all vehicles with empty VIN
    const vehiclesWithEmptyVIN = await Vehicle.find({ vin: '' });
    
    console.log(`Found ${vehiclesWithEmptyVIN.length} vehicles with empty VIN\n`);

    if (vehiclesWithEmptyVIN.length > 0) {
      console.log('🔧 Fixing vehicles...\n');
      
      // Update all vehicles with empty VIN to have undefined VIN
      const result = await Vehicle.updateMany(
        { vin: '' },
        { $unset: { vin: 1 } }
      );

      console.log(`✅ Fixed ${result.modifiedCount} vehicles`);
      console.log('   Empty VINs removed - no more duplicate errors!\n');
    } else {
      console.log('✅ No vehicles with empty VIN found - all good!\n');
    }

    // Show all vehicles
    const allVehicles = await Vehicle.find({}).populate('owner', 'name email');
    console.log(`📊 Total vehicles in database: ${allVehicles.length}\n`);
    
    if (allVehicles.length > 0) {
      console.log('Current vehicles:');
      allVehicles.forEach((v, idx) => {
        console.log(`${idx + 1}. ${v.make} ${v.model} (${v.licensePlate}) - Owner: ${v.owner.name}`);
        console.log(`   VIN: ${v.vin || 'Not set'}`);
      });
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    console.log('🎉 VIN issue fixed! You can now add vehicles without errors.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixVINs();

