/**
 * Check Email Configuration Status
 * Run: node src/utils/checkEmailStatus.js
 */

require('dotenv').config();
const { verifyEmailConfig } = require('../config/email');

console.log('\n🔍 Checking Email Configuration Status...\n');
console.log('═'.repeat(60));

// Check environment variables
const checks = {
  envFile: false,
  emailUser: false,
  emailPassword: false,
  emailService: false,
  frontendUrl: false,
  emailFrom: false
};

// Check .env file
try {
  require('fs').accessSync('.env');
  checks.envFile = true;
  console.log('✅ .env file exists');
} catch (e) {
  console.log('❌ .env file NOT FOUND');
  console.log('   → Create .env file in backend folder');
}

// Check EMAIL_USER
if (process.env.EMAIL_USER) {
  checks.emailUser = true;
  console.log(`✅ EMAIL_USER is set: ${process.env.EMAIL_USER}`);
} else {
  console.log('❌ EMAIL_USER is NOT set');
  console.log('   → Add EMAIL_USER=your-email@gmail.com to .env');
}

// Check EMAIL_PASSWORD
if (process.env.EMAIL_PASSWORD) {
  checks.emailPassword = true;
  console.log(`✅ EMAIL_PASSWORD is set: ${'*'.repeat(process.env.EMAIL_PASSWORD.length)}`);
} else {
  console.log('❌ EMAIL_PASSWORD is NOT set');
  console.log('   → Add EMAIL_PASSWORD=your-app-password to .env');
}

// Check EMAIL_SERVICE
if (process.env.EMAIL_SERVICE) {
  checks.emailService = true;
  console.log(`✅ EMAIL_SERVICE is set: ${process.env.EMAIL_SERVICE}`);
} else {
  console.log('⚠️  EMAIL_SERVICE not set (will use default)');
  console.log('   → Recommended: Add EMAIL_SERVICE=gmail to .env');
}

// Check FRONTEND_URL
if (process.env.FRONTEND_URL) {
  checks.frontendUrl = true;
  console.log(`✅ FRONTEND_URL is set: ${process.env.FRONTEND_URL}`);
} else {
  console.log('⚠️  FRONTEND_URL not set (will use default)');
  console.log('   → Add FRONTEND_URL=http://localhost:3000 to .env');
}

// Check EMAIL_FROM
if (process.env.EMAIL_FROM_NAME) {
  checks.emailFrom = true;
  console.log(`✅ EMAIL_FROM_NAME is set: ${process.env.EMAIL_FROM_NAME}`);
} else {
  console.log('⚠️  EMAIL_FROM_NAME not set (will use default)');
  console.log('   → Add EMAIL_FROM_NAME=Car Service Platform to .env');
}

console.log('═'.repeat(60));

// Overall status
const requiredChecks = checks.emailUser && checks.emailPassword;
const allChecks = Object.values(checks).filter(Boolean).length;
const totalChecks = Object.keys(checks).length;

console.log(`\n📊 Status: ${allChecks}/${totalChecks} checks passed\n`);

if (requiredChecks) {
  console.log('✅ MINIMUM CONFIGURATION COMPLETE!\n');
  console.log('📧 Testing email server connection...\n');
  
  verifyEmailConfig().then(success => {
    if (success) {
      console.log('\n🎉 EMAIL IS CONFIGURED AND WORKING!\n');
      console.log('Next steps:');
      console.log('1. Test emails: node src/utils/testEmail.js');
      console.log('2. Create a booking to see live emails');
      console.log('3. Check your inbox (and spam folder)\n');
    } else {
      console.log('\n❌ EMAIL SERVER CONNECTION FAILED!\n');
      console.log('Possible issues:');
      console.log('• Wrong email/password');
      console.log('• 2FA not enabled (for Gmail)');
      console.log('• Not using app password (for Gmail)');
      console.log('• Wrong SMTP settings\n');
      console.log('💡 For Gmail:');
      console.log('1. Enable 2-Factor Authentication');
      console.log('2. Generate app password: https://myaccount.google.com/apppasswords');
      console.log('3. Use app password (16 chars) in EMAIL_PASSWORD\n');
    }
  });
} else {
  console.log('❌ EMAIL NOT CONFIGURED\n');
  console.log('📝 TO CONFIGURE EMAIL:\n');
  console.log('1. Create/Edit backend/.env file\n');
  console.log('2. Add these lines:\n');
  console.log('   EMAIL_SERVICE=gmail');
  console.log('   EMAIL_USER=your-email@gmail.com');
  console.log('   EMAIL_PASSWORD=your-app-password');
  console.log('   EMAIL_FROM_NAME=Car Service Platform');
  console.log('   FRONTEND_URL=http://localhost:3000\n');
  console.log('3. For Gmail app password:');
  console.log('   https://myaccount.google.com/apppasswords\n');
  console.log('4. Run this script again to verify\n');
  console.log('📖 Full guide: backend/TEST_EMAIL_GUIDE.md\n');
  process.exit(1);
}

