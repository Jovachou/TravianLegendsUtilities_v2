
// Fix: Added React import to resolve namespace errors for FC and FormEvent types
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Mail, Lock, User, ArrowRight, CheckCircle, AlertCircle, RefreshCw, Undo2, KeyRound, Send } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot' | 'verify_email' | 'reset_sent';

export const AuthSystem: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResendStatus(null);

    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else if (mode === 'register') {
        // Use window.location.origin to ensure the email link returns here, not localhost
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: username },
            emailRedirectTo: window.location.origin
          }
        });
        if (signUpError) throw signUpError;
        setMode('verify_email');
      } else if (mode === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });
        if (resetError) throw resetError;
        setMode('reset_sent');
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    setError(null);
    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      if (resendErr) throw resendErr;
      setResendStatus("New dispatch sent successfully.");
    } catch (err: any) {
      setError(err.message || "Could not resend verification.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl mb-6 group transition-all hover:border-amber-500/50">
            <Shield className="w-12 h-12 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Travian Legends Utilities</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Tactical Alliance Network</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
              <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Contacting Command...</span>
            </div>
          )}

          {mode === 'verify_email' ? (
            <div className="text-center space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="flex justify-center">
                <div className="relative">
                  <Mail className="w-16 h-16 text-amber-500 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-ping"></div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white uppercase mb-2">Check Your Inbox</h2>
                <p className="text-sm text-slate-400">
                  A tactical link has been dispatched to <span className="text-amber-500 font-bold">{email}</span>. Click it to confirm your identity.
                </p>
              </div>
              
              <div className="space-y-3 pt-4">
                {resendStatus && (
                  <p className="text-[10px] font-bold text-emerald-500 uppercase">{resendStatus}</p>
                )}
                {error && (
                  <p className="text-[10px] font-bold text-red-500 uppercase">{error}</p>
                )}
                <button 
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isResending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Resend Verification Dispatch
                </button>
                <button 
                  onClick={() => setMode('login')}
                  className="w-full py-3 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  Back to Login
                </button>
              </div>
              
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed italic">
                  Note: The link is now configured to return to this dashboard. Ensure you check your spam folder.
                </p>
              </div>
            </div>
          ) : mode === 'reset_sent' ? (
            <div className="text-center space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="flex justify-center">
                <KeyRound className="w-16 h-16 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white uppercase mb-2">Reset Link Sent</h2>
                <p className="text-sm text-slate-400">
                  Instructions to reclaim your account have been sent to <span className="text-emerald-500 font-bold">{email}</span>.
                </p>
              </div>
              <button 
                onClick={() => setMode('login')}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase text-sm rounded-2xl shadow-lg transition-all"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleAuthAction} className="space-y-6">
              <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-2">
                <button 
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'login' || mode === 'forgot' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Sign In
                </button>
                <button 
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'register' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Create Account
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-[10px] font-bold text-red-500 uppercase leading-tight">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {mode === 'register' && (
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                    <input 
                      type="text" 
                      required
                      placeholder="Empire Username" 
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>
                )}

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                  <input 
                    type="email" 
                    required
                    placeholder="Email Address" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-700"
                  />
                </div>

                {mode !== 'forgot' && (
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                    <input 
                      type="password" 
                      required
                      placeholder="Security Password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>
                )}
              </div>

              {mode === 'login' && (
                <div className="text-right">
                  <button 
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-amber-500 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase text-sm rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {mode === 'login' && 'Authorize Access'}
                {mode === 'register' && 'Initialize Account'}
                {mode === 'forgot' && 'Send Recovery Link'}
                <ArrowRight className="w-5 h-5" />
              </button>

              {mode === 'forgot' && (
                <button 
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-amber-500 transition-colors mt-2"
                >
                  Return to Headquarters
                </button>
              )}
            </form>
          )}
        </div>
        
        <p className="mt-8 text-center text-[10px] text-slate-700 uppercase font-black tracking-[0.2em] px-8 leading-relaxed">
          Proprietary Intelligence Utility. Authentication is secured by Supabase Cloud.
        </p>
      </div>
    </div>
  );
};
