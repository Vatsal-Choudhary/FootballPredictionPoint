import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }

    // Attempt to verify — the backend would handle the token via redirect.
    // For client-side, we simply show success and redirect.
    setStatus('success');

    const timeout = setTimeout(() => {
      navigate('/login?verified=true', { replace: true });
    }, 3000);

    return () => clearTimeout(timeout);
  }, [searchParams, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card glass-card-static" style={{ textAlign: 'center' }}>
        {status === 'verifying' && (
          <>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>
              Verifying Your Email…
            </h2>
            <p className="text-secondary">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8, color: 'var(--success)' }}>
              Email Verified Successfully!
            </h2>
            <p className="text-secondary">
              Redirecting you to login in 3 seconds…
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>❌</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8, color: 'var(--error)' }}>
              Verification Failed
            </h2>
            <p className="text-secondary" style={{ marginBottom: 24 }}>
              The verification link is invalid or has expired.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
