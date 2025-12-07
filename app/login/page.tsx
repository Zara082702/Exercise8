"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { LogIn, UserPlus, MessageSquare } from 'lucide-react';
import { FirebaseError } from 'firebase/app'; // <-- Import FirebaseError for better typing

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in (runs after render)
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // If a user is currently logged in, return null while the redirect happens
  if (user) {
    return null;
  }
  
  // FIX 1: Explicitly type the event 'e' as React.FormEvent
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err: unknown) { // FIX 2 & 3: Type 'err' as unknown
      let errorMessage = 'An unknown error occurred.';

      if (err instanceof FirebaseError) {
         // Handle standard Firebase errors
         const code = err.code.replace('auth/', '').replace(/-/g, ' ');
         errorMessage = code.charAt(0).toUpperCase() + code.slice(1);
      } else if (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string') {
        // Handle generic errors with a message property
        errorMessage = err.message;
      }
        
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-stone-200">
        <div className="flex flex-col items-center mb-8">
          <MessageSquare className="w-10 h-10 text-emerald-600 mb-2" />
          <h1 className="text-3xl font-bold text-stone-800">NeighborNotes</h1>
          <p className="text-stone-500 text-sm">Secure Community Access</p>
        </div>

        <div className="flex mb-6 border-b border-stone-200">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 text-lg font-semibold transition-all ${
              isLogin ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <LogIn className="w-5 h-5 inline mr-2" /> Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 text-lg font-semibold transition-all ${
              !isLogin ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserPlus className="w-5 h-5 inline mr-2" /> Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg border border-red-200 text-sm">
              Error: {error}
            </div>
          )}
          <label className="b;ocl mb-2 text-sm font-medium"></label>
          <input
            required
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-black placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            required
            type="password"
            placeholder="Password (Min 6 characters)"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-black placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || password.length < 6}
            className={`w-full py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${
              loading
                ? 'bg-emerald-300 cursor-not-allowed'
                : 'bg-emerald-600 text-black hover:bg-emerald-700'
            }`}
          >
            {loading ? (
              <span className="animate-spin">🌀</span>
            ) : isLogin ? (
              <>
                <LogIn className="w-5 h-5" /> Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" /> Create Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}