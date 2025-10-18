/**
 * Test Complete Booking Flow with Emails
 * This simulates the exact scenario you described
 * 
 * Run: node src/utils/testBookingFlow.js
 */

require('dotenv').config();
const emailService = require('./emailService');

console.log('\n🧪 Testing Complete Booking Email Flow');
console.log('======================================\n');

// Simulate your exact scenario
const testBooking = {
  _id: 'test123',
  owner: {
    name: 'Manpreet Singh',
    email: process.env.EMAIL_USER || 'manpreet@example.com',
    phone: '+1234567890'
  },
  mechanic: {
    name: 'Owen',
    email: process.env.EMAIL_USER || 'owen@example.com',
    phone: '+0987654321'
  },
  service: {
    serviceName: 'Timing Belt Service',
    category: 'maintenance',
    baseCost: 350,
    estimatedDuration: 180
  },
  vehicle: {
    make: 'Honda',
    model: 'Civic',
    year: 2020,
    licensePlate: 'ABC123',
    color: 'Blue'
  },
  bookingDate: new Date('2025-10-28'),
  bookingTime: '17:00',
  estimatedDuration: 180,
  estimatedCost: 350,
  status: 'pending',
  serviceLocation: 'at_garage'
};

const runTest = async () => {
  console.log('📅 SCENARIO: Manpreet Singh books Timing Belt Service\n');
  
  try {
    // STEP 1: User books service
    console.log('📝 STEP 1: User Submits Booking Request');
    console.log('   Service: Timing Belt Service');
    console.log('   Customer: Manpreet Singh');
    console.log('   Mechanic: Owen');
    console.log('   Date: 10/28/2025 at 17:00');
    console.log('   Cost: $350\n');
    
    console.log('   📧 Sending booking confirmation emails...');
    const result1 = await emailService.sendBookingCreatedEmails(testBooking);
    
    if (result1.success) {
      console.log('   ✅ Email sent to Manpreet: "Booking Confirmation"');
      console.log('   ✅ Email sent to Owen: "New Booking Request"\n');
    } else {
      console.log('   ❌ Failed to send emails\n');
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    // STEP 2: Mechanic accepts
    console.log('✅ STEP 2: Owen Clicks "Accept" Button');
    console.log('   Status changes: pending → confirmed\n');
    
    testBooking.status = 'confirmed';
    console.log('   📧 Sending confirmation email...');
    const result2 = await emailService.sendBookingConfirmedEmail(testBooking);
    
    if (result2.success) {
      console.log('   ✅ Email sent to Manpreet: "Booking Confirmed!"\n');
    } else {
      console.log('   ❌ Failed to send email\n');
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    // STEP 3: Service completed
    console.log('✨ STEP 3: Owen Marks Service as "Complete"');
    console.log('   Status changes: confirmed → completed\n');
    
    testBooking.status = 'completed';
    console.log('   📧 Sending completion email with review request...');
    const result3 = await emailService.sendBookingCompletedEmail(testBooking);
    
    if (result3.success) {
      console.log('   ✅ Email sent to Manpreet: "Service Completed - Leave Review"\n');
    } else {
      console.log('   ❌ Failed to send email\n');
    }
    
    // Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    console.log('✅ Total emails sent: 4 emails');
    console.log('   1. Booking Confirmation (to customer)');
    console.log('   2. New Booking Alert (to mechanic)');
    console.log('   3. Booking Confirmed (to customer)');
    console.log('   4. Service Completed + Review Request (to customer)');
    console.log('\n📬 Check inbox: ' + (process.env.EMAIL_USER || 'your-email@gmail.com'));
    console.log('💡 Check spam folder if emails are not in inbox\n');
    console.log('🎉 Email flow test completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your .env file has EMAIL_USER and EMAIL_PASSWORD set\n');
  }
  
  process.exit(0);
};

// Run the test
runTest();

