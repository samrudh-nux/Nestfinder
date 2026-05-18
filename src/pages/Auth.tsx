import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register';
  const [isRegister, setIsRegister] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'BUYER'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    try {
      const res = await api.post(endpoint, formData);
      setAuth(res.data.user, res.data.token);
      if (isRegister && res.data.user.role === 'BUYER') {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-terra-bg">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-terra-sidebar rounded-[48px] p-10 space-y-8 border border-terra-border shadow-sm"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-terra-green rounded-2xl flex items-center justify-center mx-auto shadow-md">
            {isRegister ? <UserPlus className="text-white w-8 h-8" /> : <LogIn className="text-white w-8 h-8" />}
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-serif text-terra-text italic leading-tight">
              {isRegister ? 'Begin Your' : 'Welcome'} <br/><i>{isRegister ? 'Journey' : 'Back'}</i>
            </h1>
            <p className="text-terra-text-muted font-medium text-sm">
              {isRegister ? 'Join NestFinder and find your ecosystem' : 'Enter your credentials to continue your growth'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl text-xs font-bold border border-red-100"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            {isRegister && (
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-terra-text-muted" />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  required
                  className="w-full pl-14 pr-6 py-4 bg-white border border-terra-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-terra-green/10 focus:border-terra-green transition-all font-medium text-sm text-terra-text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-terra-text-muted" />
              <input 
                type="email" 
                placeholder="Email Address" 
                required
                className="w-full pl-14 pr-6 py-4 bg-white border border-terra-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-terra-green/10 focus:border-terra-green transition-all font-medium text-sm text-terra-text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-terra-text-muted" />
              <input 
                type="password" 
                placeholder="Password" 
                required
                className="w-full pl-14 pr-6 py-4 bg-white border border-terra-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-terra-green/10 focus:border-terra-green transition-all font-medium text-sm text-terra-text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {isRegister && (
              <div className="p-1.5 bg-white rounded-2xl border border-terra-border flex gap-1">
                {(['BUYER', 'OWNER', 'AGENT'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`flex-1 py-2.5 text-[10px] uppercase tracking-widest font-bold rounded-[14px] transition-all ${
                      formData.role === role ? 'bg-terra-green text-white shadow-sm' : 'text-terra-text-muted hover:text-terra-text'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-terra-green hover:bg-terra-green/90 disabled:opacity-50 text-white font-bold py-5 rounded-2xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="uppercase tracking-widest text-xs">{isRegister ? 'Plant the SEED' : 'Continue Growth'}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4">
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-terra-text-muted text-xs font-bold uppercase tracking-widest hover:text-terra-green transition-colors"
          >
            {isRegister ? 'Already part of the garden? Login' : "New to the ecosystem? Sign up"}
          </button>
        </div>

        <div className="flex items-center justify-center space-x-2 text-terra-green bg-terra-green-light/20 py-2.5 px-6 rounded-full w-fit mx-auto border border-terra-green/10">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[9px] uppercase font-bold tracking-[0.2em]">Encrypted Root Connection</span>
        </div>
      </motion.div>
    </div>
  );
}
