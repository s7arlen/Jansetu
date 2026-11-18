import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, LogIn, AlertCircle, User, KeyRound, ArrowRight, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('citizen'); // 'citizen' | 'official' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEvaluatorAccounts, setShowEvaluatorAccounts] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide registered email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await login(email, password);
      if (res.success) {
        const from = location.state?.from?.pathname;
        if (from) {
          navigate(from, { replace: true });
        } else {
          if (res.user.role === 'admin') navigate('/admin');
          else if (res.user.role === 'official') navigate('/official');
          else navigate('/citizen');
        }
      } else {
        setError(res.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError('Connection to municipal authentication service failed. Please check network connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreloadAccount = (accEmail, defaultTab) => {
    setEmail(accEmail);
    setPassword('Password@123');
    setActiveTab(defaultTab);
    setError('');
  };

  const tabDescriptions = {
    citizen: {
      badge: 'Public Redressal Service',
      title: 'Citizen Grievance Portal',
      desc: 'File civic complaints, monitor status timelines, and verify resolution evidence.',
      placeholder: 'citizen@domain.com',
    },
    official: {
      badge: 'Departmental Desk',
      title: 'Municipal Field Official Login',
      desc: 'Inspect work orders, submit photographic proof, and update resolution progress.',
      placeholder: 'official.roads@jansetu.gov.in',
    },
    admin: {
      badge: 'Central Secretariat',
      title: 'Administrative Directorate',
      desc: 'Executive triage oversight, SLA monitoring, rule-based auditing, and department coordination.',
      placeholder: 'admin@jansetu.gov.in',
    },
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white rounded-lg border border-slate-300 shadow-md overflow-hidden">
        {/* Official Header Banner */}
        <div className="bg-[#0A1628] text-white p-6 border-b border-slate-800 text-left">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            {tabDescriptions[activeTab].title}
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-normal leading-relaxed">
            {tabDescriptions[activeTab].desc}
          </p>
        </div>

        {/* Portal Role Selector Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-center font-bold text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('citizen');
              setError('');
            }}
            className={`py-3 transition border-b-2 ${
              activeTab === 'citizen'
                ? 'border-[#245B8F] text-[#245B8F] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Citizen
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('official');
              setError('');
            }}
            className={`py-3 transition border-b-2 ${
              activeTab === 'official'
                ? 'border-[#245B8F] text-[#245B8F] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Official
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setError('');
            }}
            className={`py-3 transition border-b-2 ${
              activeTab === 'admin'
                ? 'border-[#245B8F] text-[#245B8F] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Directorate
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Official Identifier / Email ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={tabDescriptions[activeTab].placeholder}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:border-[#245B8F] focus:ring-1 focus:ring-[#245B8F]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:border-[#245B8F] focus:ring-1 focus:ring-[#245B8F]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#245B8F] hover:bg-[#19446B] text-white font-bold text-sm rounded-md transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {activeTab === 'citizen' && (
            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-600">
                First time filing a complaint?{' '}
                <Link to="/register" className="font-bold text-[#245B8F] hover:underline">
                  Register Citizen Profile
                </Link>
              </p>
            </div>
          )}

          {/* Collapsible Evaluation Directory (Discrete, Professional GovTech Style) */}
          <div className="pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowEvaluatorAccounts(!showEvaluatorAccounts)}
              className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-500 hover:text-slate-800 py-1 transition"
            >
              <span>System Evaluation & Testing Accounts</span>
              {showEvaluatorAccounts ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showEvaluatorAccounts && (
              <div className="mt-2.5 p-3 rounded-md bg-slate-50 border border-slate-200 space-y-2 text-left">
                <p className="text-[11px] text-slate-600 font-medium">
                  Click any role to load seed verification credentials (Password: <code>Password@123</code>):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handlePreloadAccount('admin@jansetu.gov.in', 'admin')}
                    className="p-2 rounded bg-white border border-slate-300 hover:border-[#245B8F] hover:bg-blue-50/50 text-left transition"
                  >
                    <span className="font-bold text-slate-900 block text-[11px]">Administrator</span>
                    <span className="text-[10px] text-slate-500 font-mono truncate block">
                      admin@jansetu.gov.in
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePreloadAccount('official.roads@jansetu.gov.in', 'official')}
                    className="p-2 rounded bg-white border border-slate-300 hover:border-[#245B8F] hover:bg-blue-50/50 text-left transition"
                  >
                    <span className="font-bold text-slate-900 block text-[11px]">Roads Official</span>
                    <span className="text-[10px] text-slate-500 font-mono truncate block">
                      official.roads
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePreloadAccount('official.water@jansetu.gov.in', 'official')}
                    className="p-2 rounded bg-white border border-slate-300 hover:border-[#245B8F] hover:bg-blue-50/50 text-left transition"
                  >
                    <span className="font-bold text-slate-900 block text-[11px]">Water Official</span>
                    <span className="text-[10px] text-slate-500 font-mono truncate block">
                      official.water
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePreloadAccount('citizen1@jansetu.org', 'citizen')}
                    className="p-2 rounded bg-white border border-slate-300 hover:border-[#245B8F] hover:bg-blue-50/50 text-left transition"
                  >
                    <span className="font-bold text-slate-900 block text-[11px]">Citizen (R. Sharma)</span>
                    <span className="text-[10px] text-slate-500 font-mono truncate block">
                      citizen1@jansetu.org
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
