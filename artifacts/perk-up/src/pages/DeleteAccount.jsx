import { Link } from 'react-router-dom';
import { LifeBuoy } from 'lucide-react';

export default function DeleteAccount() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#fbf6ef' }}>
      <div className="max-w-md w-full text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(212,131,10,0.12)' }}
        >
          <LifeBuoy className="w-8 h-8" style={{ color: '#D4830A' }} />
        </div>
        <h1 className="font-display text-xl font-semibold mb-2" style={{ color: '#2F2C29' }}>
          Account closure support
        </h1>
        <p className="text-sm mb-6" style={{ color: '#7a5c3a' }}>
          Online account deletion is not available yet. To close your account, sign in and contact support from Settings so we can verify your request safely.
        </p>
        <Link
          to="/settings"
          className="inline-flex rounded-full px-6 py-2.5 text-sm font-medium transition-all active:scale-95"
          style={{ background: '#D4830A', color: '#FFFCF2' }}
        >
          Go to Settings
        </Link>
      </div>
    </div>
  );
}