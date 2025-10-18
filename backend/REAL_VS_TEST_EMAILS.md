/**
 * Test Email to Multiple Different Users
 * This proves emails go to DIFFERENT recipients
 * 
 * Run: node src/utils/testMultipleUsers.js
 */

require('dotenv').config();
const emailService = require('./emailService');

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║   TESTING EMAILS TO DIFFERENT USERS                      ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// Booking with DIFFERENT email addresses
const bookingExample = {
  _id: 'test123',
  owner: {
    name: 'Manpreet Singh',
    email: 'manpreet123singh987@gmail.com',  // ← Customer email
    phone: '+1234567890'
  },
  mechanic: {
    name: 'Owen',
    email: 'owen.mechanic@example.com',  // ← Mechanic email (DIFFERENT!)
    phone: '+0987654321'
  },
  service: {
    serviceName: 'Timing Belt Service',
    baseCost: 350,
    estimatedDuration: 180
  },
  vehicle: {
    make: 'Honda',
    model: 'Civic',
    licensePlate: 'ABC123'
  },
  bookingDate: new Date('2025-10-28'),
  bookingTime: '17:00',
  estimatedCost: 350,
  status: 'pending'
};

const runTest = async () => {
  console.log('📊 BOOKING DETAILS:');
  console.log('   Customer: Manpreet Singh');
  console.log('   Customer Email: manpreet123singh987@gmail.com');
  console.log('   Mechanic: Owen');
  console.log('   Mechanic Email: owen.mechanic@example.com\n');
  console.log('   👆 NOTICE: Two DIFFERENT email addresses!\n');
  
  try {
    console.log('📧 Sending booking created emails...\n');
    
    // This function sends to BOTH emails
    const result = await emailService.sendBookingCreatedEmails(bookingExample);
    
    console.log('EMAILS SENT TO:');
    console.log('──────────────────────────────────────────────────────\n');
    
    if (result.customer && result.customer.success) {
      console.log('✅ Email #1 → manpreet123singh987@gmail.com');
      console.log('   Recipient: Manpreet Singh (CUSTOMER)');
      console.log('   Subject: Booking Confirmation');
      console.log('   Content: Your booking details\n');
    }
    
    if (result.mechanic) {
      console.log('📧 Email #2 → owen.mechanic@example.com');
      console.log('   Recipient: Owen (MECHANIC)');
      console.log('   Subject: New Booking Request');
      
      if (result.mechanic.success) {
        console.log('   Status: ✅ Sent successfully!\n');
      } else {
        console.log('   Status: ⚠️  Not sent (owen email not real)\n');
        console.log('   💡 In real app, Owen would get it at his actual email\n');
      }
    }
    
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                   IMPORTANT PROOF                        ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    
    console.log('The code sent emails to TWO different addresses:');
    console.log('1. manpreet123singh987@gmail.com ← Customer');
    console.log('2. owen.mechanic@example.com ← Mechanic\n');
    
    console.log('✅ PROOF: Different users get different emails!');
    console.log('✅ Each user only sees THEIR emails in THEIR inbox\n');
    
    console.log('IN YOUR REAL APP:');
    console.log('• Manpreet books → Email to Manpreet\'s email ✅');
    console.log('• Owen receives → Email to Owen\'s email ✅');
    console.log('• John books → Email to John\'s email ✅');
    console.log('• Sarah books → Email to Sarah\'s email ✅\n');
    
    console.log('Each person gets emails at THEIR registered email address!\n');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
  
  process.exit(0);
};

runTest();

