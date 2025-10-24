const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Service = require('../models/Service');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

const setupDemoAccounts = async () => {
  try {
    console.log('🚀 Setting up demo accounts...');

    // Create demo users
    const demoUsers = [
      {
        name: 'John Smith',
        email: 'owner@example.com',
        password: 'password123',
        role: 'owner',
        phone: '+1-555-0101',
        address: '123 Main St, Anytown, USA',
        status: 'active'
      },
      {
        name: 'Mike Johnson',
        email: 'mechanic@example.com',
        password: 'password123',
        role: 'mechanic',
        phone: '+1-555-0102',
        address: '456 Mechanic Ave, Anytown, USA',
        status: 'active',
        experience: 5,
        hourlyRate: 75,
        specialization: ['engine_repair', 'brake_service', 'transmission'],
        rating: { average: 4.8, count: 25 }
      },
      {
        name: 'Sarah Wilson',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        phone: '+1-555-0103',
        address: '789 Admin Blvd, Anytown, USA',
        status: 'active'
      }
    ];

    // Hash passwords and create users
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const user = new User({
          ...userData,
          password: hashedPassword
        });
        await user.save();
        console.log(`✅ Created ${userData.role}: ${userData.name}`);
      } else {
        console.log(`⚠️ User already exists: ${userData.email}`);
      }
    }

    // Create demo services
    const demoServices = [
      {
        serviceName: 'Oil Change Service',
        description: 'Engine oil change with premium filter replacement and fluid level check',
        category: 'maintenance',
        baseCost: 45,
        estimatedDuration: 30,
        costType: 'fixed',
        isAvailable: true,
        mechanic: await User.findOne({ email: 'mechanic@example.com' })
      },
      {
        serviceName: 'Brake Inspection & Service',
        description: 'Complete brake system inspection, pad replacement, and rotor resurfacing',
        category: 'repair',
        baseCost: 120,
        estimatedDuration: 90,
        costType: 'fixed',
        isAvailable: true,
        mechanic: await User.findOne({ email: 'mechanic@example.com' })
      },
      {
        serviceName: 'Engine Diagnostic',
        description: 'Computer diagnostic scan, engine performance analysis, and error code reading',
        category: 'diagnostic',
        baseCost: 85,
        estimatedDuration: 60,
        costType: 'fixed',
        isAvailable: true,
        mechanic: await User.findOne({ email: 'mechanic@example.com' })
      },
      {
        serviceName: 'AC System Service',
        description: 'Air conditioning system check, refrigerant recharge, and filter cleaning',
        category: 'repair',
        baseCost: 95,
        estimatedDuration: 75,
        costType: 'fixed',
        isAvailable: true,
        mechanic: await User.findOne({ email: 'mechanic@example.com' })
      }
    ];

    for (const serviceData of demoServices) {
      const existingService = await Service.findOne({ serviceName: serviceData.serviceName });
      if (!existingService) {
        const service = new Service(serviceData);
        await service.save();
        console.log(`✅ Created service: ${serviceData.serviceName}`);
      } else {
        console.log(`⚠️ Service already exists: ${serviceData.serviceName}`);
      }
    }

    // Create demo vehicles for the owner
    const owner = await User.findOne({ email: 'owner@example.com' });
    if (owner) {
      const demoVehicles = [
        {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          licensePlate: 'ABC123',
          color: 'Silver',
          vin: '1HGBH41JXMN109186',
          owner: owner._id
        },
        {
          make: 'Honda',
          model: 'Civic',
          year: 2019,
          licensePlate: 'XYZ789',
          color: 'Blue',
          vin: '2HGBH41JXMN109187',
          owner: owner._id
        }
      ];

      for (const vehicleData of demoVehicles) {
        const existingVehicle = await Vehicle.findOne({ licensePlate: vehicleData.licensePlate });
        if (!existingVehicle) {
          const vehicle = new Vehicle(vehicleData);
          await vehicle.save();
          console.log(`✅ Created vehicle: ${vehicleData.make} ${vehicleData.model}`);
        } else {
          console.log(`⚠️ Vehicle already exists: ${vehicleData.licensePlate}`);
        }
      }
    }

    // Create demo bookings
    const mechanic = await User.findOne({ email: 'mechanic@example.com' });
    const oilChangeService = await Service.findOne({ serviceName: 'Oil Change Service' });
    const brakeService = await Service.findOne({ serviceName: 'Brake Inspection & Service' });
    const toyotaVehicle = await Vehicle.findOne({ licensePlate: 'ABC123' });

    if (owner && mechanic && oilChangeService && toyotaVehicle) {
      const demoBookings = [
        {
          owner: owner._id,
          mechanic: mechanic._id,
          vehicle: toyotaVehicle._id,
          service: oilChangeService._id,
          bookingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          bookingTime: '10:00',
          status: 'pending',
          estimatedCost: 45,
          serviceLocation: 'at_garage',
          specialInstructions: 'Please check all fluid levels'
        },
        {
          owner: owner._id,
          mechanic: mechanic._id,
          vehicle: toyotaVehicle._id,
          service: brakeService._id,
          bookingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          bookingTime: '14:00',
          status: 'confirmed',
          estimatedCost: 120,
          serviceLocation: 'at_garage',
          specialInstructions: 'Customer mentioned squeaking noise'
        }
      ];

      for (const bookingData of demoBookings) {
        const existingBooking = await Booking.findOne({
          owner: bookingData.owner,
          vehicle: bookingData.vehicle,
          service: bookingData.service,
          bookingDate: bookingData.bookingDate
        });

        if (!existingBooking) {
          const booking = new Booking(bookingData);
          await booking.save();
          console.log(`✅ Created booking: ${bookingData.service.serviceName} for ${bookingData.vehicle.make}`);
        } else {
          console.log(`⚠️ Booking already exists for this date and service`);
        }
      }
    }

    console.log('🎉 Demo accounts setup completed!');
    console.log('\n📋 Demo Account Credentials:');
    console.log('👤 Car Owner: owner@example.com / password123');
    console.log('🔧 Mechanic: mechanic@example.com / password123');
    console.log('👑 Admin: admin@example.com / password123');

  } catch (error) {
    console.error('❌ Error setting up demo accounts:', error);
  }
};

module.exports = setupDemoAccounts;
