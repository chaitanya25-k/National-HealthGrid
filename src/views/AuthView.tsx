import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  AlertCircle,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, register, health } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [role, setRole] = useState<'manager' | 'viewer'>('manager');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Pune');
  const [tier, setTier] = useState('PHC');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegister && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        if (role === 'viewer') {
          await register('/auth/viewer/register', { email, password });
        } else {
          await register('/auth/manager/register', {
            hospital_name: hospitalName,
            address: hospitalAddress,
            state,
            district,
            tier,
            email,
            password,
          });
        }
      } else {
        const endpoint = role === 'viewer' ? '/auth/viewer/login' : '/auth/manager/login';
        await login(endpoint, { email, password });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Authentication error. Please check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole: 'manager' | 'viewer', demoEmail: string, demoPass: string) => {
    setErrorMsg('');
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);

    try {
      const endpoint = demoRole === 'viewer' ? '/auth/viewer/login' : '/auth/manager/login';
      await login(endpoint, { email: demoEmail, password: demoPass });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Authentication error. Please check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f2efeb] text-[#1a1a18] font-sans flex flex-col lg:grid lg:grid-cols-[1fr_460px] overflow-x-hidden selection:bg-[#059669] selection:text-white">
      {/* Hero Section (Left) */}
      <section className="bg-dot-grid p-6 sm:p-10 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r-[1.5px] border-[#1a1a18] min-h-[60vh] lg:min-h-screen">
        {/* Header Top */}
        <header className="flex justify-between items-start mb-8 lg:mb-0">
          <div className="flex gap-3 sm:gap-4 items-center">
            <div className="w-12 h-12 bg-[#1a1a18] text-[#f2efeb] flex items-center justify-center font-syne font-extrabold text-2xl shadow-ink">
              +
            </div>
            <div>
              <div className="font-syne font-extrabold text-lg sm:text-xl uppercase tracking-tight text-[#1a1a18]">
                HealthGrid India
              </div>
              <div className="font-mono text-[10px] tracking-wider uppercase opacity-70">
                Public Healthcare Intelligence
              </div>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 border border-[#1a1a18] bg-transparent flex items-center justify-center cursor-pointer hover:bg-[#1a1a18]/5 transition-colors focus-visible:ring-2 focus-visible:ring-[#1a1a18]"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-[#1a1a18]" />}
          </button>
        </header>

        {/* Hero Main Content */}
        <div className="my-8 lg:my-auto max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#059669] font-bold block mb-4">
            Federated Health Intelligence
          </span>
          <h1 className="font-syne font-extrabold text-4xl sm:text-5xl lg:text-7xl leading-[0.95] tracking-tight text-[#1a1a18] mb-6">
            India's Public Healthcare Network, Synchronized.
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-[#1a1a18]/70 max-w-xl font-normal">
            Continuous ground-truth visibility into medicine stocks, bed availability, and medical personnel attendance across Primary Health Centres (PHCs) and District Hospitals.
          </p>
        </div>

        {/* Footer Meta */}
        <div className="border-t-[1.5px] border-[#1a1a18] pt-6 mt-8 flex flex-col sm:flex-row justify-between gap-3 font-mono text-[11px] uppercase tracking-wider text-[#1a1a18]/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#059669] inline-block animate-pulse shrink-0" />
            <span>Integrated server running on port 3000 ({health?.facilities || 8} centers loaded)</span>
          </div>
          <div className="text-[#1a1a18]/60">Auth V2.4 // Global Node</div>
        </div>
      </section>

      {/* Login Sidebar (Right) */}
      <aside className="bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-center min-h-[60vh] lg:min-h-screen overflow-y-auto">
        {/* Pane Toggle */}
        <div className="flex bg-[#f2efeb] p-1 mb-8 border border-[#1a1a18]/10">
          <button
            type="button"
            onClick={() => {
              setRole('manager');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 px-2 border-none font-mono text-xs font-bold uppercase cursor-pointer transition-all ${
              role === 'manager'
                ? 'bg-white shadow-ink border border-[#1a1a18] text-[#1a1a18]'
                : 'bg-transparent text-[#1a1a18]/60 hover:text-[#1a1a18]'
            }`}
          >
            PHC / Hospital Officer
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('viewer');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 px-2 border-none font-mono text-xs font-bold uppercase cursor-pointer transition-all ${
              role === 'viewer'
                ? 'bg-white shadow-ink border border-[#1a1a18] text-[#1a1a18]'
                : 'bg-transparent text-[#1a1a18]/60 hover:text-[#1a1a18]'
            }`}
          >
            National Desk
          </button>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h2 className="font-syne font-extrabold uppercase text-2xl tracking-tight text-[#1a1a18] mb-1">
            {isRegister
              ? role === 'manager'
                ? 'Register Health Facility'
                : 'Register National Desk'
              : 'Sign In'}
          </h2>
          <p className="text-xs text-[#1a1a18]/65 font-normal">
            {role === 'manager'
              ? 'Authorized credentials for Primary Health Centre or Hospital.'
              : 'National aggregate situation room access.'}
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="p-3 mb-6 bg-red-50 border-[1.5px] border-red-600 text-red-900 text-xs flex items-start gap-2 font-mono"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && role === 'manager' && (
            <>
              <div>
                <label
                  htmlFor="reg-name"
                  className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1.5 text-[#1a1a18]"
                >
                  Facility Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  placeholder="e.g. Junnar Rural PHC"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  required
                  className="w-full p-3 border-[1.5px] border-[#1a1a18] font-sans text-sm outline-none focus:bg-[#f2efeb] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="reg-tier"
                    className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1.5 text-[#1a1a18]"
                  >
                    Facility Tier
                  </label>
                  <select
                    id="reg-tier"
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full p-3 border-[1.5px] border-[#1a1a18] font-sans text-xs outline-none bg-white focus:bg-[#f2efeb]"
                  >
                    <option value="PHC">PHC (Primary)</option>
                    <option value="CHC">CHC (Community)</option>
                    <option value="SDH">SDH (Sub-District)</option>
                    <option value="DH">DH (District Hospital)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="reg-dist"
                    className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1.5 text-[#1a1a18]"
                  >
                    District
                  </label>
                  <input
                    id="reg-dist"
                    type="text"
                    placeholder="e.g. Pune"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    required
                    className="w-full p-3 border-[1.5px] border-[#1a1a18] font-sans text-sm outline-none focus:bg-[#f2efeb]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-addr"
                  className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1.5 text-[#1a1a18]"
                >
                  Physical Address
                </label>
                <textarea
                  id="reg-addr"
                  rows={2}
                  placeholder="Taluka & Village details"
                  value={hospitalAddress}
                  onChange={(e) => setHospitalAddress(e.target.value)}
                  required
                  className="w-full p-2.5 border-[1.5px] border-[#1a1a18] font-sans text-xs outline-none focus:bg-[#f2efeb] resize-none"
                />
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1.5 text-[#1a1a18]"
            >
              Official Email / Officer ID
            </label>
            <input
              id="auth-email"
              type="email"
              placeholder={role === 'manager' ? 'mo.junnar@healthgrid.gov.in' : 'viewer@healthgrid.gov.in'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border-[1.5px] border-[#1a1a18] font-sans text-sm outline-none focus:bg-[#f2efeb] transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="auth-pass"
              className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1.5 text-[#1a1a18]"
            >
              Password
            </label>
            <input
              id="auth-pass"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full p-3 border-[1.5px] border-[#1a1a18] font-sans text-sm outline-none focus:bg-[#f2efeb] transition-colors"
            />
          </div>

          {isRegister && (
            <div>
              <label
                htmlFor="auth-conf"
                className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1.5 text-[#1a1a18]"
              >
                Confirm Password
              </label>
              <input
                id="auth-conf"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full p-3 border-[1.5px] border-[#1a1a18] font-sans text-sm outline-none focus:bg-[#f2efeb]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 bg-[#1a1a18] text-white border-none font-mono font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-black transition-colors flex justify-between items-center mt-3 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : isRegister ? 'Register & Connect' : 'Sign In to Network'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
              }}
              className="bg-transparent border-none font-mono text-[11px] uppercase font-bold cursor-pointer underline text-[#1a1a18]/70 hover:text-[#1a1a18]"
            >
              {isRegister ? 'Already registered? Sign In' : 'Register a new PHC'}
            </button>
          </div>
        </form>

        {/* Evaluation Credentials Box */}
        <div className="mt-8 border-t border-[#1a1a18]/15 pt-6">
          <label className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-3 text-[#059669]">
            Evaluation Credentials
          </label>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() =>
                handleQuickDemoLogin('manager', 'mo.junnar@healthgrid.gov.in', 'manager1234')
              }
              className="w-full text-left bg-transparent border border-[#1a1a18]/15 hover:border-[#1a1a18] p-3 cursor-pointer transition-colors block group"
            >
              <div className="font-bold text-xs text-[#1a1a18] group-hover:text-[#059669] transition-colors">
                Junnar Rural PHC (Officer)
              </div>
              <div className="font-mono text-[11px] text-[#1a1a18]/60 mt-0.5">
                mo.junnar@healthgrid.gov.in
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickDemoLogin('viewer', 'viewer@healthgrid.gov.in', 'viewer1234')
              }
              className="w-full text-left bg-transparent border border-[#1a1a18]/15 hover:border-[#1a1a18] p-3 cursor-pointer transition-colors block group"
            >
              <div className="font-bold text-xs text-[#1a1a18] group-hover:text-[#059669] transition-colors">
                National Health Desk (Overview)
              </div>
              <div className="font-mono text-[11px] text-[#1a1a18]/60 mt-0.5">
                viewer@healthgrid.gov.in
              </div>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
