import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Shield, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { authAPI, saveAuth } from '../services/api';

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<'student' | 'manager' | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isSignUp && loginType === 'student') {
        result = await authAPI.register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
        });
      } else {
        result = await authAPI.login({
          email: formData.email.trim(),
          password: formData.password,
        });
      }

      // Save token + user to localStorage
      saveAuth(result.token, result.user);

      onClose();

      if (result.user.role === 'manager') {
        navigate('/manager-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl">Login Portal</h2>
          <p className="text-blue-100 text-sm mt-1">Access your account</p>
        </div>

        <div className="p-6">
          {!loginType ? (
            <div className="space-y-4">
              <p className="text-gray-600 text-center mb-6">Select your login type</p>
              <button
                onClick={() => { setLoginType('student'); setError(''); }}
                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-900 hover:bg-blue-50 transition-all duration-200 group"
              >
                <User className="w-12 h-12 mx-auto mb-3 text-blue-900 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl mb-1">Student Login</h3>
                <p className="text-sm text-gray-600">Access your student portal</p>
              </button>
              <button
                onClick={() => { setLoginType('manager'); setError(''); }}
                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-900 hover:bg-blue-50 transition-all duration-200 group"
              >
                <Shield className="w-12 h-12 mx-auto mb-3 text-blue-900 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl mb-1">Manager Login</h3>
                <p className="text-sm text-gray-600">Access admin dashboard</p>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-6">
                {loginType === 'student' ? (
                  <User className="w-16 h-16 mx-auto text-blue-900 mb-2" />
                ) : (
                  <Shield className="w-16 h-16 mx-auto text-blue-900 mb-2" />
                )}
                <h3 className="text-xl">{loginType === 'student' ? 'Student' : 'Manager'} Login</h3>
              </div>

              {/* Error alert */}
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Toggle between Sign In and Sign Up for Students */}
              {loginType === 'student' && (
                <div className="flex justify-center mb-2">
                  <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                    <button
                      type="button"
                      onClick={() => { setIsSignUp(false); setError(''); }}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${!isSignUp ? 'bg-white shadow-sm text-blue-900' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsSignUp(true); setError(''); }}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${isSignUp ? 'bg-white shadow-sm text-blue-900' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              )}

              {isSignUp && loginType === 'student' && (
                <>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                      placeholder="Enter your phone number"
                      required
                      disabled={loading}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm mb-2 text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  placeholder={loginType === 'student' ? 'student@email.com' : 'admin@stjoseph'}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  placeholder={isSignUp ? 'Create a password (min 6 chars)' : 'Enter your password'}
                  required
                  disabled={loading}
                  minLength={isSignUp ? 6 : undefined}
                />
              </div>

              {loginType === 'manager' && (
                <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  Default admin: <strong>admin@stjoseph</strong> / <strong>admin123</strong>
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isSignUp ? 'Creating Account...' : 'Signing in...'}
                  </>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>

              <button
                type="button"
                onClick={() => { setLoginType(null); setError(''); setIsSignUp(false); setFormData({ name: '', email: '', password: '', phone: '' }); }}
                disabled={loading}
                className="w-full text-gray-600 hover:text-gray-800 py-2"
              >
                ← Back to login type selection
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
