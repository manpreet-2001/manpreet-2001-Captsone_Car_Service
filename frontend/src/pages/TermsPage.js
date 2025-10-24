import React from 'react';
import './TermsPage.css';

const TermsPage = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <div className="terms-header">
          <h1>Terms of Service</h1>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="terms-content">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using our car service platform, you accept and agree to be bound by 
              the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              Our platform connects car owners with certified mechanics for automotive services. 
              We facilitate bookings but do not directly provide mechanical services.
            </p>
          </section>

          <section>
            <h2>3. User Responsibilities</h2>
            <p>As a user of our platform, you agree to:</p>
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Use the service only for lawful purposes</li>
              <li>Respect the rights of other users</li>
              <li>Pay for services as agreed</li>
            </ul>
          </section>

          <section>
            <h2>4. Service Bookings</h2>
            <p>
              All service bookings are subject to availability and mechanic confirmation. 
              We reserve the right to cancel or reschedule appointments due to unforeseen circumstances.
            </p>
          </section>

          <section>
            <h2>5. Payment Terms</h2>
            <p>
              Payment is due at the time of service completion unless otherwise arranged. 
              We accept various payment methods and process payments securely.
            </p>
          </section>

          <section>
            <h2>6. Cancellation Policy</h2>
            <p>
              Services may be cancelled up to 24 hours before the scheduled appointment. 
              Late cancellations may be subject to fees.
            </p>
          </section>

          <section>
            <h2>7. Limitation of Liability</h2>
            <p>
              Our platform acts as an intermediary. We are not responsible for the quality of 
              services provided by mechanics or any damages that may occur during service.
            </p>
          </section>

          <section>
            <h2>8. Prohibited Uses</h2>
            <p>You may not use our service:</p>
            <ul>
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            </ul>
          </section>

          <section>
            <h2>9. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, 
              for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>

          <section>
            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any 
              material changes via email or through our platform.
            </p>
          </section>

          <section>
            <h2>11. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p>
              Email: legal@carservice.com<br />
              Phone: +1 (555) 123-4567
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
