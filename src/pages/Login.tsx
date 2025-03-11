
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  
  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    
    checkSession();
  }, [navigate]);
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (isLogin) {
      // Login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Logged in successfully');
        navigate('/');
      }
    } else {
      // Sign up
      const { error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Check your email to confirm your account');
        setIsLogin(true);
      }
    }
    
    setIsLoading(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
      <motion.main
        className="flex-1 flex flex-col items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-full max-w-md mx-auto px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="glass-effect rounded-xl p-8 shadow-card">
            <h1 className="text-2xl font-bold text-center mb-8">
              {isLogin ? 'Login to Vokabelkarten' : 'Create an Account'}
            </h1>
            
            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-primary text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? 'Processing...'
                  : isLogin
                    ? 'Login'
                    : 'Sign Up'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline"
              >
                {isLogin
                  ? 'Need an account? Sign up'
                  : 'Already have an account? Login'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
};

export default Login;
