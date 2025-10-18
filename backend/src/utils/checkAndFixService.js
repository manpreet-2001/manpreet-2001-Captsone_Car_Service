const mongoose = require('mongoose');
const Service = require('../models/Service');

require('dotenv').config();

const checkAndFixService = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car-service');
    console.log('Connected to MongoDB');

    // Find the oil leakage service (case insensitive)
    const service = await Service.findOne({ 
      serviceName: { $regex: /oil.*leakage/i } 
    }).populate('mechanic', 'name email');

    if (!service) {
      console.log('❌ Service "Oil Leakage" not found');
      
      // Show all services to help debug
      const allServices = await Service.find({}).populate('mechanic', 'name email');
      console.log('\nAll services in database:');
      allServices.forEach(s => {
        console.log(`- ${s.serviceName} (mechanic: ${s.mechanic?.name || 'NONE'}, isAvailable: ${s.isAvailable}, isActive: ${s.isActive})`);
      });
    } else {
      console.log('\n✅ Found service:');
      console.log('Service Name:', service.serviceName);
      console.log('Mechanic:', service.mechanic?.name || 'NO MECHANIC ASSIGNED');
      console.log('isAvailable:', service.isAvailable);
      console.log('isActive:', service.isActive);
      console.log('Category:', service.category);
      console.log('Base Cost:', service.baseCost);
      console.log('Duration:', service.estimatedDuration);

      // Check if it needs fixing
      if (!service.isAvailable || !service.isActive) {
        console.log('\n🔧 Fixing service...');
        service.isAvailable = true;
        service.isActive = true;
        await service.save();
        console.log('✅ Service fixed! Now it should be visible to customers.');
      } else {
        console.log('\n✅ Service is already properly configured and should be visible!');
      }

      // Verify it would show in the public query
      const publicQuery = { isAvailable: true, isActive: true };
      const visibleServices = await Service.find(publicQuery).populate('mechanic', 'name');
      console.log(`\nTotal services visible to customers: ${visibleServices.length}`);
      
      const isVisible = visibleServices.some(s => s._id.toString() === service._id.toString());
      if (isVisible) {
        console.log('✅ Oil Leakage service IS visible to customers');
      } else {
        console.log('❌ Oil Leakage service is NOT visible to customers');
      }
    }

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAndFixService();

