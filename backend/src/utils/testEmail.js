/**
 * Test Email Functionality
 * Run this script to test if email configuration is working
 * 
 * Usage: node src/utils/testEmail.js
 */

require('dotenv').config();
const emailService = require('./emailService');

// Test booking data
const testBooking = {
  _id: 'test123',
  owner: {
    name: 'John Doe',
    email: process.env.TEST_EMAIL || process.env.EMAIL_USER || 'test@example.com',
    phone: '+1234567890'
  },
  mechanic: {
    name: 'Mike Smith',
    email: process.env.EMAIL_USER || 'mechanic@example.com',
    phone: '+0987654321'
  },
  service: {
    serviceName: 'Oil Change & Filter Replacement',
    category: 'maintenance',
    baseCost: 45,
    estimatedDuration: 30
  },
  vehicle: {
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    licensePlate: 'ABC123',
    color: 'Silver'
  },
  bookingDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  bookingTime: '10:00',
  estimatedDuration: 30,
  estimatedCost: 45,
  status: 'pending',
  serviceLocation: 'at_garage',
  specialInstructions: 'Please check tire pressure as well'
};

const runTests = async () => {
  console.log('🧪 Testing Email Configuration...\n');
  console.log('📧 Test emails will be sent to:', testBooking.owner.email);
  console.log('');

  try {
    // Test 1: Booking Created
    console.log('1️⃣ Testing Booking Created Email...');
    const result1 = await emailService.sendBookingCreatedEmails(testBooking);
    if (result1.success) {
      console.log('✅ Booking created emails sent successfully!');
    } else {
      console.log('❌ Failed to send booking created emails:', result1.error);
    }
    console.log('');

    // Test 2: Booking Confirmed
    console.log('2️⃣ Testing Booking Confirmed Email...');
    const result2 = await emailService.sendBookingConfirmedEmail(testBooking);
    if (result2.success) {
      console.log('✅ Booking confirmed email sent successfully!');
    } else {
      console.log('❌ Failed to send booking confirmed email:', result2.error);
    }
    console.log('');

    // Test 3: Booking Completed
    console.log('3️⃣ Testing Booking Completed Email...');
    const result3 = await emailService.sendBookingCompletedEmail(testBooking);
    if (result3.success) {
      console.log('✅ Booking completed email sent successfully!');
    } else {
      console.log('❌ Failed to send booking completed email:', result3.error);
    }
    console.log('');

    console.log('🎉 Email tests completed!');
    console.log('📬 Check your inbox at:', testBooking.owner.email);
    console.log('');
    console.log('⚠️  Note: Emails may take a few seconds to arrive');
    console.log('💡 Check spam folder if you don\'t see the emails');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('1. Make sure EMAIL_USER and EMAIL_PASSWORD are set in .env');
    console.error('2. For Gmail, use an app-specific password');
    console.error('3. Check if 2FA is enabled on your Gmail account');
    console.error('4. Verify SMTP settings are correct');
  }

  process.exit(0);
};

// Run tests
runTests();

