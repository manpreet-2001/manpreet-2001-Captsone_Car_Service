const mongoose = require('mongoose');
const User = require('../models/User');
const Service = require('../models/Service');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const setupMechanic = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carservice');
    console.log('Connected to MongoDB');

    // Check if mechanic already exists
    let mechanic = await User.findOne({ email: 'mechanic@carservice.com' });
    
    if (!mechanic) {
      // Create a default mechanic user
      const hashedPassword = await bcrypt.hash('mechanic123', 10);
      
      mechanic = await User.create({
        name: 'John Smith',
        email: 'mechanic@carservice.com',
        password: hashedPassword,
        role: 'mechanic',
        phone: '+1234567890',
        specialization: ['oil_change', 'brake_repair', 'engine_repair', 'general_maintenance'],
        experience: 10,
        hourlyRate: 75,
        status: 'active'
      });
      
      console.log('✅ Created default mechanic user:');
      console.log('   Email: mechanic@carservice.com');
      console.log('   Password: mechanic123');
      console.log('   Name:', mechanic.name);
    } else {
      console.log('✅ Mechanic already exists:', mechanic.name);
    }

    // Assign mechanic to all services that don't have one
    const servicesWithoutMechanic = await Service.find({ 
      $or: [
        { mechanic: null },
        { mechanic: { $exists: false } }
      ]
    });

    if (servicesWithoutMechanic.length > 0) {
      console.log(`\n📝 Assigning mechanic to ${servicesWithoutMechanic.length} services...`);
      
      for (const service of servicesWithoutMechanic) {
        service.mechanic = mechanic._id;
        await service.save();
        console.log(`   ✅ ${service.serviceName} - mechanic assigned`);
      }
      
      console.log(`\n✅ Successfully assigned mechanic to all services!`);
    } else {
      console.log('\n✅ All services already have mechanics assigned');
    }

    console.log('\n🎉 Setup complete! You can now book services.');
    console.log('\nMechanic Login Credentials:');
    console.log('   Email: mechanic@carservice.com');
    console.log('   Password: mechanic123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up mechanic:', error);
    process.exit(1);
  }
};

// Run the setup
setupMechanic();

