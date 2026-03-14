"use client";

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Globe, Mail, Lock, TriangleAlert as AlertTriangle, Loader as Loader2, LogIn } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';

interface LoginClientProps {
  locale: Locale;
}

export function LoginClient({ locale }: LoginClientProps) {
  const [mode, setMode] = useState<'google' | 'email'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/${locale}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
    } else {
      window.location.href = `/${locale}/core/hub`;
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at center, #0d1520 0%, #050810 100%)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(74,158,255,0.05) 0%, transparent 60%)',
        }}
      />

      <div
        className="relative w-full max-w-sm"
        style={{
          background: 'linear-gradient(145deg, #151c28 0%, #0d1320 100%)',
          border: '1px solid rgba(74,158,255,0.12)',
          borderRadius: 20,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.7), 0 0 60px rgba(74,158,255,0.05)',
          padding: '2rem',
        }}
      >
        <div
          className="absolute inset-0 rounded-[20px] pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(74,158,255,0.04) 0%, transparent 60%)',
          }}
        />

        <div className="relative space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #1a3a6e 0%, #0d2448 100%)',
                  border: '1px solid rgba(74,158,255,0.3)',
                  boxShadow: '0 0 24px rgba(74,158,255,0.2)',
                }}
              >
                <Globe className="w-7 h-7" style={{ color: '#4A9EFF' }} />
              </div>
            </div>
            <h1
              className="text-xl font-bold text-white"
              style={{ textShadow: '0 0 20px rgba(74,158,255,0.3)' }}
            >
              Colony OS
            </h1>
            <p className="text-sm text-white/35">Fleet Command — Secure Access</p>
          </div>

          {error && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
              style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.25)', color: '#ff6b5b' }}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-150 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #1e3a6e 0%, #0d2348 50%, #081830 100%)',
              color: '#4A9EFF',
              border: '1px solid rgba(74,158,255,0.3)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4), 0 0 16px rgba(74,158,255,0.1), inset 0 1px 0 rgba(74,158,255,0.15)',
              textShadow: '0 0 10px rgba(74,158,255,0.5)',
            }}
          >
            {isLoading && mode === 'google' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-xs text-white/25">or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-1"
              style={{
                background: 'linear-gradient(145deg, #0a0e18 0%, #0d1220 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
              }}
            >
              <Mail className="w-4 h-4 shrink-0 text-white/25" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@colony.os"
                className="flex-1 bg-transparent text-sm py-3 outline-none text-white placeholder:text-white/20"
              />
            </div>

            <div
              className="flex items-center gap-2 rounded-xl px-4 py-1"
              style={{
                background: 'linear-gradient(145deg, #0a0e18 0%, #0d1220 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
              }}
            >
              <Lock className="w-4 h-4 shrink-0 text-white/25" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1 bg-transparent text-sm py-3 outline-none text-white placeholder:text-white/20"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(145deg, #1e2530 0%, #141921 100%)',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>Sign In</span>
            </button>
          </form>

          <p className="text-[11px] text-center text-white/20">
            Authorized operators only. All access is logged.
          </p>
        </div>
      </div>
    </div>
  );
}
