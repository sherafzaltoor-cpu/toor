import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Globe2, 
  Server,
  Cpu
} from 'lucide-react';
import { Language } from '../types';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  lang,
  setLang
}) => {
  const isUrdu = lang === 'ur';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: cleanPass })
      });

      if (res.ok) {
        if (rememberMe) {
          localStorage.setItem('mikrotik_admin_auth', 'true');
          localStorage.setItem('mikrotik_admin_user', 'admin');
        } else {
          sessionStorage.setItem('mikrotik_admin_auth', 'true');
          sessionStorage.setItem('mikrotik_admin_user', 'admin');
        }
        setIsLoading(false);
        onLoginSuccess();
        return;
      } else {
        setIsLoading(false);
        setError(
          isUrdu
            ? 'غلط یوزر نیم یا پاس ورڈ! برائے مہربانی درست ایڈمن معلومات درج کریں۔'
            : 'Invalid username or password! Please check your credentials and try again.'
        );
        return;
      }
    } catch {
      // Fallback local validation
      const savedPass = localStorage.getItem('toor_net_admin_pass') || '7780';
      if (cleanUser === 'admin' && (cleanPass === savedPass || cleanPass === '7780' || cleanPass === 'admin')) {
        if (rememberMe) {
          localStorage.setItem('mikrotik_admin_auth', 'true');
          localStorage.setItem('mikrotik_admin_user', 'admin');
        } else {
          sessionStorage.setItem('mikrotik_admin_auth', 'true');
          sessionStorage.setItem('mikrotik_admin_user', 'admin');
        }
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setError(
          isUrdu
            ? 'غلط یوزر نیم یا پاس ورڈ! ایڈمنسٹریٹر پاس ورڈ 7780 ہے۔'
            : 'Invalid username or password! Administrator password is 7780.'
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-amber-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-400/80 shadow-md ring-2 ring-amber-500/20 shrink-0">
            <img 
              src="/toor-net-badge.jpg" 
              alt="TOOR NET" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight text-sm">TOOR NET PANEL</span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 bg-amber-950/80 text-amber-300 border border-amber-800 rounded font-mono">
                RB750Gr3
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isUrdu ? 'ہاٹ سپاٹ اور PPPoE کلاؤڈ کنٹرول پینل' : 'ISP Hotspot & PPPoE Cloud Panel'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setLang(isUrdu ? 'en' : 'ur')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs border border-slate-700"
          title="Switch Language"
        >
          <Globe2 className="w-3.5 h-3.5 text-amber-400" />
          <span>{isUrdu ? 'English' : 'اردو'}</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 my-6 sm:my-8">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur space-y-6">
          {/* Logo & Title */}
          <div className="text-center space-y-3">
            <div className="relative mx-auto w-28 h-28 sm:w-32 sm:h-32 group">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/40 via-yellow-500/30 to-amber-600/20 blur-xl group-hover:blur-2xl transition duration-500"></div>
              <img
                src="/toor-net-badge.jpg"
                alt="TOOR NET Logo"
                className="relative w-full h-full rounded-full object-cover shadow-2xl border-2 border-amber-400 ring-4 ring-amber-500/25"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isUrdu ? 'ٹور نیٹ پینل لاگ ان' : 'TOOR NET PANEL'}
              </h2>
              <p className="text-[11px] uppercase tracking-widest text-amber-400/90 font-medium mt-0.5">
                Connecting Your World
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-950/70 border border-red-800/80 rounded-xl flex items-start gap-2.5 text-red-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                {isUrdu ? 'ایڈمن یوزر نیم (Username):' : 'Administrator Username:'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isUrdu ? 'ایڈمن یوزر نیم درج کریں' : 'Enter admin username'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                {isUrdu ? 'پاس ورڈ (Password):' : 'Administrator Password:'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900 w-4 h-4"
                />
                <span>{isUrdu ? 'لاگ ان سیشن یاد رکھیں' : 'Keep me signed in'}</span>
              </label>

              <span className="text-slate-500 text-[11px] font-mono">
                RB750Gr3 v6 / v7
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isUrdu ? 'پینل میں لاگ ان کریں' : 'Sign In to TOOR NET Panel'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </>
              )}
            </button>
          </form>

          {/* Quick Info & Router Architecture spec */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <Server className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">RB750Gr3 (hEX)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">MMIPS 880MHz</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-800/60 bg-slate-900/40 z-10">
        <p>
          TOOR NET PANEL • Connecting Your World • MikroTik Cloud Remote Management System
        </p>
      </footer>
    </div>
  );
};
