import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen" style={{ background: '#fef9f2' }}>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link to="/" className="text-sm font-medium hover:underline" style={{ color: '#E8A838' }}>
          ← Back to Perk Up Daily
        </Link>

        <h1 className="font-display text-3xl font-semibold mt-8 mb-2" style={{ color: '#2c1e0f' }}>
          Privacy Policy
        </h1>
        <p className="text-sm mb-10" style={{ color: '#7a5c3a' }}>Last updated: June 20, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: '#4a3520' }}>
          <p>
            This Privacy Policy explains how Perk Up Daily ("we," "us," "our") collects, uses, and protects
            information in connection with the Perk Up Daily app and related services, including our SMS text
            messaging program ("Services").
          </p>
          <p>By using Perk Up Daily or participating in our SMS program, you agree to the terms of this Privacy Policy.</p>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>1. Information We Collect</h2>
            <p className="mb-3">We may collect:</p>
            <ul className="space-y-2 list-disc pl-5">
              <li>Contact information, such as your name, email address, and mobile phone number.</li>
              <li>Account information, such as your username, settings, subscription details, and app preferences.</li>
              <li>Content and activity, such as saved entries, reflections, and in-app actions (for example, which prompts or categories you interact with most).</li>
              <li>Usage and device data, such as IP address, device type, operating system, app version, and log data.</li>
            </ul>
            <p className="mt-3">
              We do not knowingly collect information from children under 13. If you believe a child has provided us
              information, contact us at latriciamorris@gmail.com.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>2. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="space-y-2 list-disc pl-5">
              <li>Provide, maintain, and improve the Perk Up Daily app and Services.</li>
              <li>Deliver daily encouragement, prompts, affirmations, and other content tailored to you.</li>
              <li>Send SMS messages you have opted in to receive, including reminders, encouragement, and occasional updates about features or subscriptions.</li>
              <li>Communicate with you about your account, support requests, or important service notices.</li>
              <li>Analyze and understand how users engage with the app so we can improve our content and features.</li>
              <li>Enforce our Terms and comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>3. SMS Program and Mobile Information</h2>
            <p className="mb-3">
              When you provide your mobile number and opt in, you agree to receive recurring SMS messages from Perk
              Up Daily related to daily content, reminders, encouragement, and occasional updates about the app and
              subscriptions.
            </p>
            <ul className="space-y-2 list-disc pl-5 mb-3">
              <li><strong>Message frequency:</strong> Message frequency varies based on your settings and app activity.</li>
              <li><strong>Charges:</strong> Message and data rates may apply, depending on your mobile carrier plan.</li>
              <li><strong>Opt out:</strong> You can reply STOP at any time to stop receiving SMS messages.</li>
              <li><strong>Help:</strong> You can reply HELP at any time for help or contact latriciamorris@gmail.com.</li>
            </ul>
            <p>
              Mobile information will not be shared, sold, or transferred to third parties for their own marketing or
              promotional purposes. We may share mobile information with service providers solely to deliver messages
              or operate the Services, subject to appropriate confidentiality and data protection obligations.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>4. Sharing Your Information</h2>
            <p className="mb-3">We may share your information:</p>
            <ul className="space-y-2 list-disc pl-5">
              <li>With trusted service providers who help us operate the app, deliver SMS messages, process payments, or perform analytics.</li>
              <li>If required by law, legal process, or to protect our rights, users, or the public.</li>
              <li>In connection with a merger, acquisition, or sale of all or part of our business, subject to appropriate safeguards.</li>
            </ul>
            <p className="mt-3">We do not sell your personal information, including mobile numbers, to third parties for their own direct marketing.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>5. Cookies and Similar Technologies</h2>
            <p>
              Our website and app may use cookies or similar technologies to remember preferences, analyze usage, and
              improve the Services. You can usually control cookies through your browser settings, but disabling
              cookies may affect certain features.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>6. Data Security</h2>
            <p>
              We use reasonable technical and organizational measures designed to protect your information from
              unauthorized access, use, or disclosure. However, no method of transmission or storage is 100% secure,
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>7. Data Retention</h2>
            <p>
              We retain information for as long as necessary to provide the Services, comply with legal obligations,
              resolve disputes, and enforce our agreements. We may anonymize or aggregate data so it can no longer be
              reasonably associated with you.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>8. Your Choices</h2>
            <p className="mb-3">You may:</p>
            <ul className="space-y-2 list-disc pl-5">
              <li>Update or correct your account information within the app or by contacting us.</li>
              <li>Opt out of marketing emails using the unsubscribe link in those messages.</li>
              <li>Opt out of SMS at any time by replying STOP.</li>
              <li>Request access to or deletion of your personal information by contacting perkupdaily@gmail.com, subject to applicable law.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>9. Third-Party Links</h2>
            <p>
              Our Services may contain links to third-party websites or services. We are not responsible for the
              privacy practices of those third parties. We encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>10. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. If we make material changes, we will notify you by
              updating the date at the top of this page and, where appropriate, by providing additional notice (such
              as in-app notices or email).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>11. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or our data practices, contact us at:</p>
            <p className="mt-2">Perk Up Daily<br />Email: latriciamorris@gmail.com<br />Website: https://perkupdaily.app</p>
          </section>
        </div>
      </div>
    </div>
  );
}