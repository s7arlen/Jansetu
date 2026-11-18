import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  LogIn,
  LayoutDashboard,
  BarChart3,
  Building2,
  PhoneCall,
  Menu,
  X,
  ChevronDown,
  Clock,
  ArrowRight,
  Hammer,
  Droplets,
  Trash2,
  Zap,
  Waves,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import emblemOfIndia from '../assets/emblem_of_india.svg';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [divisionsDropdownOpen, setDivisionsDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [fontSize, setFontSize] = useState('normal'); // 'small' | 'normal' | 'large'
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll detection for sticky header background transition (india.gov.in UX4G pattern)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 45);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDivisionsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus search input when search modal opens
  useEffect(() => {
    if (searchModalOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  }, [searchModalOpen]);

  // Handle escape key to close modals/menus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setDivisionsDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getDashboardPath = () => {
    if (!isAuthenticated || !user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'official') return '/official';
    return '/citizen';
  };

  const handleQuickSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toUpperCase();
      setSearchModalOpen(false);
      setSearchQuery('');
      navigate(`/track?id=${encodeURIComponent(q)}`);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Lodge Grievance', path: '/submit-complaint', highlight: true },
    { label: 'View Status / ATR', path: '/track' },
    { label: 'Municipal Divisions', path: '/departments', hasDropdown: true },
    { label: 'Public SLA Dashboard', path: '/public-dashboard' },
  ];

  const divisionItems = [
    { title: 'Roads & Infrastructure', path: '/departments', icon: Hammer, desc: 'Pothole restoration & paving' },
    { title: 'Water Supply & Pipelines', path: '/departments', icon: Droplets, desc: 'Pipeline bursts & water purity' },
    { title: 'Solid Waste & Sanitation', path: '/departments', icon: Trash2, desc: 'Garbage dumps & container clearance' },
    { title: 'Streetlights & Electrical', path: '/departments', icon: Zap, desc: 'Dark streetlights & power hazards' },
    { title: 'Drainage & Stormwater', path: '/departments', icon: Waves, desc: 'Culvert blockage & waterlogging' },
    { title: 'General Administration', path: '/departments', icon: Building2, desc: 'Public property & civic signage' },
  ];

  return (
    <header className="relative w-full z-40 bg-white">
      {/* 1. National Tricolor Accent Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white via-50% to-[#138808]" />

      {/* 2. Top Accessibility & National Identity Bar (GIGW Standard) */}
      <div className="bg-[#F8F9FA] border-b border-slate-200 text-slate-700 text-[11px] py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          {/* Official Endorsement */}
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-[#0C2340]">Government of India</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium">
              Ministry of Housing & Urban Affairs (MoHUA)
            </span>
          </div>

          {/* Accessibility & Helpline Tools */}
          <div className="flex items-center gap-3 sm:gap-4 text-slate-600">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:bg-[#0C2340] focus:text-white px-2 py-0.5 rounded text-[10px] font-semibold"
            >
              Skip to Main Content
            </a>

            <div className="hidden sm:flex items-center gap-1.5 border-r border-slate-200 pr-3">
              <span className="text-[10px] text-slate-500 font-medium">Text Size:</span>
              <button
                type="button"
                onClick={() => setFontSize('small')}
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded hover:bg-slate-200 transition ${
                  fontSize === 'small' ? 'bg-[#0C2340] text-white' : 'text-slate-700'
                }`}
                title="Decrease Font Size"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`px-1.5 py-0.5 text-[11px] font-bold rounded hover:bg-slate-200 transition ${
                  fontSize === 'normal' ? 'bg-[#0C2340] text-white' : 'text-slate-700'
                }`}
                title="Normal Font Size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`px-1.5 py-0.5 text-[12px] font-bold rounded hover:bg-slate-200 transition ${
                  fontSize === 'large' ? 'bg-[#0C2340] text-white' : 'text-slate-700'
                }`}
                title="Increase Font Size"
              >
                A+
              </button>
            </div>

            <a
              href="tel:1913"
              className="flex items-center gap-1.5 font-semibold text-[#0C2340] hover:text-[#E65100] transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#E65100]" />
              <span>National Helpline: <strong className="text-[#E65100]">1913</strong></span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Main Brand Crest & Portal Title Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
        <div className="flex justify-between items-center gap-4">
          {/* National Emblem & Title Block */}
          <Link to="/" className="flex items-center gap-3.5 group text-left">
            {/* Authentic State Emblem of India */}
            <div className="flex items-center gap-3 shrink-0">
              <img
                src={emblemOfIndia}
                alt="State Emblem of India"
                className="h-13 sm:h-15 w-auto object-contain filter drop-shadow-xs"
              />
              <div className="h-10 w-px bg-slate-300 hidden sm:block" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#0C2340]">
                  JANSETU
                </span>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#0C2340] leading-tight">
                Centralized Public Grievance Redress & Monitoring System
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight">
                Directorate of Municipal Administration • Government of India
              </span>
            </div>
          </Link>

          {/* Right Action / Auth Button */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="border-r border-slate-200 pr-4 text-right">
              <span className="text-xs font-bold text-[#0C2340] block">
                Citizen Redressal Portal
              </span>
              <span className="text-[11px] text-slate-500 block">
                Directorate of Urban Local Bodies
              </span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={getDashboardPath()}
                  className="px-4 py-2 rounded-lg bg-[#0C2340] hover:bg-[#1B365D] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard ({user.role})</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-[#E65100] hover:bg-[#D94E00] text-white text-xs font-bold transition-all duration-200 flex items-center gap-2 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Official / Citizen Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="p-2 rounded-lg border border-slate-200 text-[#0C2340] hover:bg-slate-100"
              aria-label="Open Quick Search"
            >
              <Search className="w-5 h-5 text-[#E65100]" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-slate-200 text-[#0C2340] hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Sticky Primary Navigation Bar (india.gov.in Smooth Sticky Animation & Styling) */}
      <nav
        className={`w-full transition-all duration-300 ease-in-out z-50 ${
          isScrolled
            ? 'sticky top-0 bg-[#0C2340]/95 backdrop-blur-md shadow-lg border-b border-[#07162C]'
            : 'bg-[#0C2340] text-white border-y border-[#07162C] shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 text-xs">
            {/* Left Nav Elements with Animated Active Underline Indicators */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Compact Logo Mark visible only in Sticky Mode */}
              <div
                className={`transition-all duration-300 overflow-hidden flex items-center gap-2 mr-2 ${
                  isScrolled ? 'w-auto opacity-100' : 'w-0 opacity-0 pointer-events-none'
                }`}
              >
                <Link to="/" className="flex items-center gap-1.5 text-white font-extrabold text-sm tracking-tight shrink-0">
                  <span className="text-[#FF9933]">JAN</span>SETU
                </Link>
                <div className="h-4 w-px bg-white/20 hidden xl:block" />
              </div>

              {/* Navigation Items */}
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;

                // Highlighted Action: "Lodge Grievance" Button
                if (link.highlight) {
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="px-3.5 sm:px-4 py-1.5 font-bold transition-all duration-200 flex items-center gap-1.5 bg-[#E65100] hover:bg-[#D94E00] text-white rounded-md shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 text-xs shrink-0"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{link.label}</span>
                    </Link>
                  );
                }

                // Dropdown link: Municipal Divisions
                if (link.hasDropdown) {
                  return (
                    <div
                      key={link.path}
                      ref={dropdownRef}
                      className="relative"
                      onMouseEnter={() => setDivisionsDropdownOpen(true)}
                      onMouseLeave={() => setDivisionsDropdownOpen(false)}
                    >
                      <button
                        type="button"
                        onClick={() => setDivisionsDropdownOpen(!divisionsDropdownOpen)}
                        className={`relative py-3.5 px-3 font-semibold transition-colors duration-200 text-xs flex items-center gap-1 group cursor-pointer ${
                          isActive || divisionsDropdownOpen ? 'text-white font-bold' : 'text-slate-200 hover:text-white'
                        }`}
                      >
                        <span>{link.label}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${
                            divisionsDropdownOpen ? 'rotate-180 text-[#FBBF24]' : 'group-hover:text-white'
                          }`}
                        />
                        {/* Animated Underline Indicator */}
                        <span
                          className={`absolute bottom-0 left-0 w-full h-[3px] bg-[#E65100] rounded-t-sm transition-all duration-300 ease-out origin-center ${
                            isActive || divisionsDropdownOpen
                              ? 'scale-x-100 opacity-100'
                              : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-75'
                          }`}
                        />
                      </button>

                      {/* Animated Dropdown Menu (india.gov.in / UX4G Flyout Standard) */}
                      <div
                        className={`absolute left-0 top-full pt-1 w-80 sm:w-96 z-50 transition-all duration-200 ease-out origin-top ${
                          divisionsDropdownOpen
                            ? 'opacity-100 translate-y-0 visible scale-100'
                            : 'opacity-0 translate-y-2 invisible scale-98 pointer-events-none'
                        }`}
                      >
                        <div className="bg-white rounded-lg shadow-2xl border border-slate-200 p-3 text-slate-800 text-left">
                          <div className="px-2 py-1.5 border-b border-slate-100 mb-1.5 flex justify-between items-center">
                            <span className="text-[11px] font-bold text-[#0C2340] uppercase tracking-wider">
                              Municipal Local Bodies
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">6 ULB Divisions</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {divisionItems.map((dept, idx) => {
                              const DeptIcon = dept.icon;
                              return (
                                <Link
                                  key={idx}
                                  to={dept.path}
                                  onClick={() => setDivisionsDropdownOpen(false)}
                                  className="p-2 rounded-md hover:bg-slate-50 transition-colors flex items-start gap-2 group/item"
                                >
                                  <div className="p-1 rounded bg-[#0C2340]/5 group-hover/item:bg-[#E65100]/10 text-[#0C2340] group-hover/item:text-[#E65100] transition-colors shrink-0 mt-0.5">
                                    <DeptIcon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-[#0C2340] group-hover/item:text-[#E65100] transition-colors leading-tight">
                                      {dept.title}
                                    </p>
                                    <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                                      {dept.desc}
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-100">
                            <Link
                              to="/departments"
                              onClick={() => setDivisionsDropdownOpen(false)}
                              className="w-full py-1.5 px-2 rounded text-center text-xs font-bold text-[#1B365D] hover:text-[#E65100] hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
                            >
                              <span>Explore All Municipal Divisions & Staffing</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Standard Links with Animated Saffron Underline
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative py-3.5 px-3 font-semibold transition-colors duration-200 text-xs flex items-center gap-1.5 group shrink-0 ${
                      isActive ? 'text-white font-bold' : 'text-slate-200 hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    {/* Animated Underline Indicator */}
                    <span
                      className={`absolute bottom-0 left-0 w-full h-[3px] bg-[#E65100] rounded-t-sm transition-all duration-300 ease-out origin-center ${
                        isActive
                          ? 'scale-x-100 opacity-100'
                          : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-75'
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Right Tools: Quick Search Trigger + Citizen Charter SLA badge */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
              {/* Interactive Quick Search / Track Button (like india.gov.in header search) */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                aria-label="Quick Search / Track Grievance"
                className="py-1 px-2.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition flex items-center gap-1.5 border border-white/15 cursor-pointer shadow-xs"
                title="Quick Search or Track Reference ID"
              >
                <Search className="w-3.5 h-3.5 text-[#FBBF24]" />
                <span className="hidden md:inline text-[11px] font-semibold">Track / Search</span>
              </button>

              {/* Citizen Charter SLA Pill */}
              <span className="hidden sm:flex items-center gap-1.5 text-amber-300 font-medium text-[11px] bg-white/5 px-2.5 py-1 rounded border border-white/10 select-none">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>SLA: 6h – 72h</span>
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* 5. Quick Search & Tracking Modal Overlay (india.gov.in Search Dialog Pattern) */}
      {searchModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-200"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-6 text-left transform transition-all duration-200 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2 text-[#0C2340]">
                <Search className="w-5 h-5 text-[#E65100]" />
                <h3 className="text-base font-bold">Quick Track Grievance / ATR</h3>
              </div>
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                aria-label="Close search modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleQuickSearchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0C2340] mb-1.5">
                  Enter Complaint Reference Number:
                </label>
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    required
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. JAN-2026-00001"
                    className="w-full px-3.5 py-2.5 pl-10 text-sm font-mono font-bold rounded-lg border border-slate-300 focus:border-[#1B365D] focus:ring-2 focus:ring-[#1B365D]/20 focus:outline-none uppercase bg-[#F8F9FA] text-[#0C2340] placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Instantly inspect action taken remarks, field engineer notes, and verification photos.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#1B365D] hover:bg-[#0C2340] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Track Status →</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold border transition ${
                  link.highlight
                    ? 'bg-[#E65100] text-white border-[#E65100] font-bold shadow-xs'
                    : location.pathname === link.path
                    ? 'bg-[#0C2340] text-white border-[#0C2340]'
                    : 'text-[#0C2340] hover:bg-slate-50 border-transparent'
                }`}
              >
                <span>{link.label}</span>
                {link.hasDropdown && <ChevronDown className="w-4 h-4 text-slate-400" />}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#0C2340] text-white text-xs font-bold shadow-xs"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Access Dashboard ({user.role})</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2 rounded-lg text-xs font-bold text-red-700 bg-red-50 border border-red-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#E65100] hover:bg-[#D94E00] text-white text-xs font-bold shadow-xs transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Official / Citizen Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
