import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

export default function DeleteAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying, success, error

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const confirm = async () => {
      try {
        const response = await base44.functions.invoke('confirmAccountDeletion', { token });
        if (response.data?.success) {
          setStatus('success');
          // Log out after a delay
          setTimeout(() => {
            try { base44.auth.logout('/'); } catch { window.location.href = '/'; }
          }, 3000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    confirm();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#fbf6ef' }}>
      <div className="max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: '#D4830A' }} />
            <h1 className="font-display text-xl font-semibold mb-2" style={{ color: '#2F2C29' }}>
              Verifying your request…
            </h1>
            <p className="text-sm" style={{ color: '#7a5c3a' }}>
              Please wait while we process your account deletion.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #4a7c59 0%, #6b9b78 100%)' }}>
              <Check className="w-8 h-8" style={{ color: '#FFFCF2' }} />
            </div>
            <h1 className="font-display text-xl font-semibold mb-2" style={{ color: '#2F2C29' }}>
              Your account has been deleted
            </h1>
            <p className="text-sm mb-6" style={{ color: '#7a5c3a' }}>
              All your data has been permanently removed. A confirmation email is on its way. Redirecting you home…
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(249,88,38,0.12)' }}>
              <AlertCircle className="w-8 h-8" style={{ color: '#F95826' }} />
            </div>
            <h1 className="font-display text-xl font-semibold mb-2" style={{ color: '#2F2C29' }}>
              Something went wrong
            </h1>
            <p className="text-sm mb-6" style={{ color: '#7a5c3a' }}>
              {!token
                ? 'No deletion token was found. Please request account deletion from Settings.'
                : 'This link is invalid, expired, or has already been used. Please request deletion again from Settings.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="rounded-full px-6 py-2.5 text-sm font-medium transition-all active:scale-95"
              style={{ background: '#D4830A', color: '#FFFCF2' }}
            >
              Back to app
            </button>
          </>
        )}
      </div>
    </div>
  );
}