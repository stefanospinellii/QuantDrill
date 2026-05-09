import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and email verified
    async function checkStatus() {
      try {
        const user = await base44.auth.me();
        if (user?.email_verified) {
          // User is verified, redirect to home
          navigate('/home', { replace: true });
        } else if (user?.email) {
          setEmail(user.email);
        }
      } catch (e) {
        // Not authenticated or error
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, [navigate]);

  const handleResend = async () => {
    setResending(true);
    try {
      // Base44 handles resending via auth SDK
      await base44.auth.resendVerificationEmail?.();
      setResent(true);
      setTimeout(() => setResent(false), 3000);
    } catch (e) {
      console.error('Resend failed:', e);
    } finally {
      setResending(false);
    }
  };

  const handleBack = () => {
    base44.auth.logout('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Icon */}
        <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <Mail size={32} className="text-primary" />
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-grotesk font-bold text-foreground mb-2">
            Verify your email
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We've sent a verification link to<br />
            <span className="font-semibold text-foreground">{email}</span>
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-surface-2 border border-border rounded-2xl p-5 mb-6 space-y-3">
          <div className="flex gap-3">
            <span className="text-sm font-bold text-primary shrink-0">1</span>
            <p className="text-sm text-muted-foreground">Check your inbox for the verification email</p>
          </div>
          <div className="flex gap-3">
            <span className="text-sm font-bold text-primary shrink-0">2</span>
            <p className="text-sm text-muted-foreground">Click the link inside to confirm your email</p>
          </div>
          <div className="flex gap-3">
            <span className="text-sm font-bold text-primary shrink-0">3</span>
            <p className="text-sm text-muted-foreground">Return here or refresh the page to continue</p>
          </div>
        </div>

        {/* Resend button */}
        <motion.button
          onClick={handleResend}
          disabled={resending}
          animate={{ opacity: 1 }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-grotesk font-bold rounded-2xl no-select active:scale-95 transition-transform disabled:opacity-60 mb-3"
        >
          {resending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Sending...
            </>
          ) : (
            'Resend verification email'
          )}
        </motion.button>

        {/* Resent confirmation */}
        {resent && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-xs text-emerald-400 font-medium mb-3"
          >
            ✓ Verification email sent
          </motion.div>
        )}

        {/* Back button */}
        <button
          onClick={handleBack}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-surface-2 border border-border text-foreground font-semibold rounded-2xl no-select hover:border-primary/50 transition-colors active:scale-95"
        >
          <ArrowLeft size={16} />
          Back to login
        </button>

        {/* Help text */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Didn't receive an email?<br />
          Check your spam folder or click "Resend verification email" above
        </p>
      </motion.div>
    </div>
  );
}