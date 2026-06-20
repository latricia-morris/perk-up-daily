import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen" style={{ background: '#fef9f2' }}>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link to="/" className="text-sm font-medium hover:underline" style={{ color: '#E8A838' }}>
          ← Back to Perk Up Daily
        </Link>

        <h1 className="font-display text-3xl font-semibold mt-8 mb-2" style={{ color: '#2c1e0f' }}>
          Terms &amp; Conditions
        </h1>
        <p className="text-sm mb-10" style={{ color: '#7a5c3a' }}>Last updated: June 20, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: '#4a3520' }}>
          <p>
            These Terms and Conditions ("Terms") govern your use of the Perk Up Daily app, website, and related
            services (collectively, the "Services") provided by Perk Up Daily ("we," "us," "our"). By accessing or
            using Perk Up Daily, you agree to these Terms.
          </p>
          <p>If you do not agree to these Terms, do not use the Services.</p>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>1. Use of the Services</h2>
            <p className="mb-3">
              Perk Up Daily is a subscription-based service that provides daily encouragement, reflections,
              affirmations, prompts, and related wellness content. The Services are intended for personal,
              non-commercial use.
            </p>
            <p className="mb-3">You agree that you will:</p>
            <ul className="space-y-2 list-disc pl-5">
              <li>Use the Services only in accordance with these Terms and applicable laws.</li>
              <li>Not misuse, interfere with, or attempt to disrupt the operation of the Services.</li>
              <li>Not reverse engineer, decompile, or attempt to access source code of the app or platform.</li>
            </ul>
            <p className="mt-3">We may modify, suspend, or discontinue any part of the Services at any time, with or without notice.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>2. Accounts and Subscriptions</h2>
            <p className="mb-3">To use certain features, you may need to create an account and/or purchase a subscription.</p>
            <ul className="space-y-2 list-disc pl-5">
              <li>You agree to provide accurate, current information and to keep it updated.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.</li>
              <li>Subscription details, including pricing and billing intervals, are presented at the time of purchase. Fees are generally non-refundable except where required by law or as expressly stated in our refund policy.</li>
              <li>We reserve the right to suspend or terminate your account if we believe you have violated these Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>3. SMS Messages and Communications</h2>
            <p className="mb-3">
              By providing your mobile number and opting in, you consent to receive recurring SMS messages from Perk
              Up Daily related to daily content, reminders, encouragement, and occasional updates about features or
              subscriptions.
            </p>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong>Message frequency:</strong> Message frequency varies.</li>
              <li><strong>Charges:</strong> Message and data rates may apply.</li>
              <li><strong>Opt out:</strong> You may reply STOP at any time to stop receiving SMS messages.</li>
              <li><strong>Help:</strong> You may reply HELP at any time for help or contact latriciamorris@gmail.com.</li>
            </ul>
            <p className="mt-3">Consent to receive SMS messages is not a condition of purchasing the app or any subscription where prohibited by law.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>4. Content and Intellectual Property</h2>
            <p className="mb-3">
              All content made available through the Services — including text, graphics, logos, images, audio, and
              software — is owned by us or our licensors and is protected by intellectual property laws.
            </p>
            <p className="mb-3">
              Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable,
              revocable license to access and use the Services for personal, non-commercial purposes.
            </p>
            <p className="mb-3">You may not:</p>
            <ul className="space-y-2 list-disc pl-5">
              <li>Copy, reproduce, distribute, modify, or create derivative works from the Services or content, except as expressly allowed.</li>
              <li>Use our trademarks, logos, or brand elements without prior written permission.</li>
            </ul>
            <p className="mt-3">
              You retain ownership of any content you create or enter into the app (such as journal entries or
              reflections). You grant us a limited license to use that content solely as needed to operate and improve
              the Services, in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>5. No Medical or Mental Health Advice</h2>
            <p className="mb-3">
              Perk Up Daily provides general wellness, motivational, and reflective content. It is not a substitute
              for professional medical, mental health, or other professional advice, diagnosis, or treatment.
            </p>
            <ul className="space-y-2 list-disc pl-5">
              <li>Always seek the advice of a qualified healthcare provider with any questions regarding your physical or mental health.</li>
              <li>Do not disregard professional advice or delay seeking it because of something you read in the app.</li>
              <li>If you are in crisis or think you may harm yourself or others, call your local emergency number or a crisis hotline immediately.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>6. Third-Party Services</h2>
            <p>
              The Services may link to or integrate with third-party services or content. We are not responsible for
              third-party sites, services, or content, and your use of them may be subject to separate terms and
              privacy policies.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>7. Disclaimers</h2>
            <p className="mb-3">
              The Services are provided on an "as is" and "as available" basis, without warranties of any kind,
              express or implied.
            </p>
            <p>
              To the fullest extent permitted by law, we disclaim all warranties, including implied warranties of
              merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee that the
              Services will be uninterrupted, secure, or error-free, or that content will be accurate or complete.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>8. Limitation of Liability</h2>
            <p className="mb-3">
              To the fullest extent permitted by law, Perk Up Daily and its officers, employees, and affiliates will
              not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of
              profits or revenues, arising out of or related to your use of the Services.
            </p>
            <p>
              Our total liability for any claims arising out of or relating to the Services or these Terms will not
              exceed the amount you paid (if any) for the Services in the three (3) months preceding the event giving
              rise to the claim, or a lesser amount if required by applicable law.
            </p>
            <p className="mt-3">Some jurisdictions do not allow exclusion or limitation of certain damages, so some of the above limitations may not apply to you.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>9. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Perk Up Daily and its officers, employees, and affiliates from
              and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys'
              fees) arising out of or related to your use of the Services or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>10. Changes to the Services or Terms</h2>
            <p className="mb-3">
              We may update these Terms from time to time. When we do, we will change the "Last updated" date at the
              top of this page and may provide additional notice where appropriate (for example, in the app or via
              email).
            </p>
            <p>Your continued use of the Services after any changes to the Terms constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>11. Governing Law</h2>
            <p>
              These Terms will be governed by and construed in accordance with the laws of the Commonwealth of
              Pennsylvania, without regard to its conflict-of-law principles, unless applicable law requires a
              different jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>12. Contact Us</h2>
            <p>If you have questions about these Terms or the Services, contact us at:</p>
            <p className="mt-2">Perk Up Daily<br />Email: latriciamorris@gmail.com<br />Website: https://perkupdaily.app</p>
          </section>
        </div>
      </div>
    </div>
  );
}