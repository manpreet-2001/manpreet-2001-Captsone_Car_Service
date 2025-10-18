const mongoose = require('mongoose');
const Service = require('../models/Service');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const services = [
  {
    serviceName: 'Oil Change Service',
    description: 'Engine oil change with premium filter replacement and fluid level check',
    category: 'maintenance',
    subcategory: 'oil_change',
    baseCost: 45,
    estimatedDuration: 30,
    isAvailable: true,
    suitableFor: ['all'],
    serviceAreas: ['at_garage']
  },
  {
    serviceName: 'Brake Inspection & Service',
    description: 'Complete brake system inspection, pad replacement, and rotor resurfacing',
    category: 'maintenance',
    subcategory: 'brake_service',
    baseCost: 120,
    estimatedDuration: 90,
    isAvailable: true,
    suitableFor: ['all'],
    serviceAreas: ['at_garage']
  },
  {
    serviceName: 'Engine Diagnostic',
    description: 'Computer diagnostic scan, engine performance analysis, and error code reading',
    category: 'diagnostic',
    subcategory: 'general_inspection',
    baseCost: 85,
    estimatedDuration: 60,
    isAvailable: true,
    suitableFor: ['all'],
    serviceAreas: ['at_garage']
  },
  {
    serviceName: 'Transmission Service',
    description: 'Transmission fluid change, filter replacement, and system inspection',
    category: 'maintenance',
    subcategory: 'transmission',
    baseCost: 150,
    estimatedDuration: 120,
    isAvailable: true,
    suitableFor: ['all'],
    serviceAreas: ['at_garage']
  },
  {
    serviceName: 'AC System Service',
    description: 'Air conditioning system check, refrigerant recharge, and filter cleaning',
    category: 'maintenance',
    subcategory: 'ac_service',
    baseCost: 95,
    estimatedDuration: 75,
    isAvailable: true,
    suitableFor: ['all'],
    serviceAreas: ['at_garage']
  },
  {
    serviceName: 'Tire Rotation & Balance',
    description: 'Tire rotation, wheel balancing, and alignment check',
    category: 'maintenance',
    subcategory: 'tire_service',
    baseCost: 65,
    estimatedDuration: 45,
    isAvailable: true,
    suitableFor: ['all'],
    serviceAreas: ['at_garage']
  },
  {
    serviceName: 'Battery Service',
    description: 'Battery testing, terminal cleaning, and replacement if needed',
    category: 'maintenance',
    subcategory: 'battery',
    baseCost: 75,
    estimatedDuration: 30,
    isAvailable: true,
    suitableFor: ['all'],
    serviceAreas: ['at_garage']
  },
  {
    serviceName: 'Spark Plug Replacement',
    description: 'Spark plug replacement, ignition system check, and performance tuning',
    category: 'maintenance',
    subcategory: 'fuel_system',
    baseCost: 110,
    estimatedDuration: 60,
    isAvailable: true,
    suitableFor: ['all'],
    serviceAreas: ['at_garage']
  },
  {
    serviceName: 'Timing Belt Service',
    description: 'Timing belt replacement, water pump service, and tensioner check',
    category: 'repair',
    subcategory: 'engine_repair',
    baseCost: 350,
    estimatedDuration: 180,
    isAvailable: true,
    suitableFor: ['sedan', 'suv', 'hatchback'],
    serviceAreas: ['at_garage']
  },
  {
    serviceName: 'Suspension Service',
    description: 'Shock absorber inspection, strut replacement, and suspension alignment',
    category: 'repair',
    subcategory: 'suspension',
    baseCost: 200,
    estimatedDuration: 120,
    isAvailable: true,
    suitableFor: ['all'],
    serviceAreas: ['at_garage']
  },
  {
    serviceName: 'Exhaust System Repair',
    description: 'Exhaust pipe inspection, muffler replacement, and emission system check',
    category: 'repair',
    subcategory: 'exhaust',
    baseCost: 180,
    estimatedDuration: 90,
    isAvailable: true,
    suitableFor: ['all'],
    serviceAreas: ['at_garage']
  },
  {
    serviceName: 'Full Vehicle Inspection',
    description: 'Comprehensive 50-point safety inspection and maintenance report',
    category: 'inspection',
    subcategory: 'safety_inspection',
    baseCost: 125,
    estimatedDuration: 90,
    isAvailable: true,
    suitableFor: ['all'],
    serviceAreas: ['at_garage']
  },
  {
    serviceName: 'Coolant System Flush',
    description: 'Radiator flush, coolant replacement, and cooling system inspection',
    category: 'maintenance',
    subcategory: 'cooling_system',
    baseCost: 90,
    estimatedDuration: 60,
    isAvailable: true,
    suitableFor: ['all'],
    serviceAreas: ['at_garage']
  },
  {
    serviceName: 'Wheel Alignment',
    description: 'Precision wheel alignment to improve handling and tire life',
    category: 'maintenance',
    subcategory: 'tire_service',
    baseCost: 80,
    estimatedDuration: 60,
    isAvailable: true,
    suitableFor: ['all'],
    serviceAreas: ['at_garage']
  },
  {
    serviceName: 'Alternator Service',
    description: 'Alternator testing, replacement, and charging system inspection',
    category: 'repair',
    subcategory: 'alternator',
    baseCost: 250,
    estimatedDuration: 90,
    isAvailable: true,
    suitableFor: ['all'],
    serviceAreas: ['at_garage']
  }
];

const seedServices = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carservice');

    console.log('✅ Connected to MongoDB\n');

    // Find ALL mechanic users
    const mechanics = await User.find({ role: 'mechanic', status: 'active' });
    
    console.log(`Found ${mechanics.length} active mechanic(s):\n`);
    mechanics.forEach((m, idx) => {
      console.log(`  ${idx + 1}. ${m.name} (${m.email})`);
    });
    console.log('');
    
    if (mechanics.length === 0) {
      console.log('⚠️  No mechanics found. Services will be created without mechanic assignment.');
      console.log('   Users will need to select a mechanic when booking.');
      console.log('   Create a mechanic account first for better experience.\n');
    }

    // Ask if user wants to clear existing services
    console.log('Creating services...\n');

    // Distribute services among all mechanics (round-robin)
    const servicesWithMechanic = services.map((service, idx) => {
      let assignedMechanic = null;
      
      if (mechanics.length > 0) {
        // Round-robin assignment: distribute evenly
        assignedMechanic = mechanics[idx % mechanics.length]._id;
      }
      
      return {
        ...service,
        mechanic: assignedMechanic,
        isActive: true,  // Ensure visible to customers
        isAvailable: true  // Ensure bookable
      };
    });

    // Create services
    const createdServices = await Service.insertMany(servicesWithMechanic);
    console.log(`✅ Successfully created ${createdServices.length} services!\n`);

    // Show service distribution
    if (mechanics.length > 0) {
      console.log('📊 Service Distribution:\n');
      mechanics.forEach(mechanic => {
        const mechanicServices = createdServices.filter(s => 
          s.mechanic && s.mechanic.toString() === mechanic._id.toString()
        );
        console.log(`  ${mechanic.name}:`);
        mechanicServices.forEach(s => {
          console.log(`    - ${s.serviceName} ($${s.baseCost})`);
        });
        console.log('');
      });
    } else {
      console.log('Services created:\n');
      createdServices.forEach(service => {
        console.log(`  - ${service.serviceName}: $${service.baseCost} (${service.estimatedDuration} min)`);
      });
    }

    console.log('\n🎉 Services seeded successfully!');
    console.log('💡 Users can now book these services and select their preferred mechanic.\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding services:', error);
    process.exit(1);
  }
};

// Run the seed function
seedServices();

