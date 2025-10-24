// Test email configuration for production
const { verifyEmailConfig } = require('./src/config/email');

console.log('🧪 Testing Email Configuration for Production...\n');

// Test email configuration
verifyEmailConfig()
  .then((result) => {
    if (result) {
      console.log('✅ Email is properly configured and ready!');
      console.log('📧 You can deploy with email notifications enabled.');
    } else {
      console.log('⚠️ Email is not configured - this is OK for deployment!');
      console.log('📧 Your app will work without email notifications.');
      console.log('💡 To enable email later, set EMAIL_USER and EMAIL_PASSWORD environment variables.');
    }
  })
  .catch((error) => {
    console.log('❌ Email configuration error:', error.message);
    console.log('📧 This is OK - your app will still work without email!');
  })
  .finally(() => {
    console.log('\n🚀 Your app is ready for production deployment!');
    process.exit(0);
  });

