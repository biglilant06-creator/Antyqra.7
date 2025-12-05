import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setEmail('');
      setPassword('');
      setError(null);
      setMode('signin');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const action = mode === 'signin' ? signIn : signUp;
      const { error: authError } = await action(email.trim(), password);
      if (authError) {
        setError(authError.message);
      } else {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auth error');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-cyan-500/20 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
            Save your progress
          </p>
          <h3 className="text-2xl font-black text-white">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Sync quizzes and paper trading across devices.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs text-slate-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
            />
          </div>
          {error && <p className="text-rose-300 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold hover:from-orange-600 hover:to-yellow-600 disabled:opacity-60 transition-all"
          >
            {loading ? 'Working...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-400">
          {mode === 'signin' ? (
            <button
              onClick={() => setMode('signup')}
              className="text-cyan-300 font-semibold hover:text-cyan-200"
            >
              Need an account? Sign up
            </button>
          ) : (
            <button
              onClick={() => setMode('signin')}
              className="text-cyan-300 font-semibold hover:text-cyan-200"
            >
              Already have an account? Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
