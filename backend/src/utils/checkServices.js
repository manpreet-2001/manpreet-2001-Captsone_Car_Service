const mongoose = require('mongoose');
const Service = require('../models/Service');
const User = require('../models/User'); // Need to load User model for populate
const dotenv = require('dotenv');

dotenv.config();

const checkServices = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carservice');
    console.log('Connected to MongoDB\n');

    const services = await Service.find().populate('mechanic', 'name email');
    
    console.log(`Found ${services.length} services:\n`);
    
    services.forEach((service, index) => {
      console.log(`${index + 1}. ${service.serviceName}`);
      console.log(`   ID: ${service._id}`);
      console.log(`   Cost: $${service.baseCost}`);
      console.log(`   Duration: ${service.estimatedDuration} min`);
      console.log(`   Mechanic: ${service.mechanic ? service.mechanic.name + ' (' + service.mechanic.email + ')' : 'NOT ASSIGNED'}`);
      console.log(`   Available: ${service.isAvailable}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkServices();
