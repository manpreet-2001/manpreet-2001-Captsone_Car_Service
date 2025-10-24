import React from 'react';
import './PrivacyPage.css';

const PrivacyPage = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <div className="privacy-header">
          <h1>Privacy Policy</h1>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="privacy-content">
          <section>
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, 
              book a service, or contact us. This may include:
            </p>
            <ul>
              <li>Name, email address, and phone number</li>
              <li>Vehicle information (make, model, year, license plate)</li>
              <li>Service booking details and preferences</li>
              <li>Payment information (processed securely through third-party providers)</li>
            </ul>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and improve our services</li>
              <li>Process bookings and payments</li>
              <li>Communicate with you about your services</li>
              <li>Send you important updates and notifications</li>
              <li>Provide customer support</li>
            </ul>
          </section>

          <section>
            <h2>3. Information Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              except as described in this policy. We may share your information with:
            </p>
            <ul>
              <li>Service providers who assist us in operating our platform</li>
              <li>Mechanics who will perform your requested services</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access and update your personal information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section>
            <h2>6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              Email: privacy@carservice.com<br />
              Phone: +1 (555) 123-4567
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
