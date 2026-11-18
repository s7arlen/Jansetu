import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Search,
  PlusCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  ArrowRight,
  Hammer,
  Droplets,
  Trash2,
  Zap,
  Waves,
  Building2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileText,
  FileCheck2,
  Scale,
  Users,
  MapPin,
  ExternalLink,
  PhoneCall,
  BellRing,
  HelpCircle,
  TrendingUp,
  Camera,
  Activity,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import civicHero1Img from '../assets/civic_hero_1.jpg';
import civicHero2Img from '../assets/civic_hero.jpg';
import civicHero3Img from '../assets/civic_hero_3.jpg';
import deptRoadsImg from '../assets/dept_roads.jpg';
import deptWaterImg from '../assets/dept_water.jpg';
import deptSanitationImg from '../assets/dept_sanitation.jpg';
import deptElectricalImg from '../assets/dept_electrical.jpg';
import deptDrainageImg from '../assets/dept_drainage.jpg';
import deptAdminImg from '../assets/dept_admin.jpg';

export const HomePage = () => {
  const [trackId, setTrackId] = useState('');
  const [showReviewerTools, setShowReviewerTools] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [stats, setStats] = useState({
    totalSubmitted: 0,
    totalResolved: 0,
    resolutionRate: 0,
    pending: 0,
    avgResolutionHours: 28,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const navigate = useNavigate();

  // 3 Distinct Civic Background Images for Full-Width Hero Carousel
  const heroSlides = [
    {
      image: civicHero1Img,
      badge: 'Directorate of Municipal Administration',
      subtitle: 'Government of India • Ministry of Housing & Urban Affairs',
    },
    {
      image: civicHero2Img,
      badge: 'Urban Infrastructure & Civic Engineering',
      subtitle: 'Field Operations • Municipal Works & Transit Network',
    },
    {
      image: civicHero3Img,
      badge: 'Smart Governance & Resident Redressal',
      subtitle: 'Time-Bound Public Service Delivery & ATR Verification',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/public/statistics');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Error fetching public stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackId.trim()) {
      navigate(`/track?id=${encodeURIComponent(trackId.trim().toUpperCase())}`);
    }
  };

  const faqs = [
    {
      q: 'How do I track my grievance without creating an account?',
      a: 'Any resident can track real-time progress simply by entering their grievance reference number (e.g. JAN-2026-00001) in the search box above. No login or registration is required for public tracking.',
    },
    {
      q: 'What happens if the municipal repair is unsatisfactory or incomplete?',
      a: 'Under Step 5 of the JANSETU Citizen Redressal Mechanism, a grievance cannot be marked resolved without resident confirmation. If the work is substandard, you can dispute the resolution with one click, explain the issue, and return it to the municipal engineer for rework.',
    },
    {
      q: 'How are priority resolution deadlines (SLAs) determined?',
      a: 'JANSETU operates a transparent, deterministic priority scoring algorithm. Life-safety hazards (like open manholes, active pipeline bursts, or exposed live cables) receive an immediate +40 point score and 6-hour Critical SLA, while proximity to schools or hospitals adds +20 points, eliminating discretionary delays.',
    },
    {
      q: 'What is the First Appellate Authority escalation process?',
      a: 'If an assigned division fails to remediate a verified grievance within its mandatory SLA window, the system automatically flags the ticket as Overdue and escalates it to the Municipal Commissioner and Nodal Grievance Directorate under the Public Service Guarantee Act.',
    },
  ];

  const departmentCatalog = [
    {
      code: 'ROADS',
      divCode: 'ULB-RD-01',
      title: 'Roads & Infrastructure',
      deptName: 'Roads and Infrastructure',
      image: deptRoadsImg,
      icon: Hammer,
      tags: ['Potholes', 'Road Divider', 'Footpath Hazard'],
      desc: 'Pothole restoration, asphalt paving, road dividers, pedestrian footpaths, and guardrail maintenance.',
      sla: '6h – 48h',
    },
    {
      code: 'WATER',
      divCode: 'ULB-WS-02',
      title: 'Water Supply & Pipelines',
      deptName: 'Water Supply',
      image: deptWaterImg,
      icon: Droplets,
      tags: ['Pipeline Burst', 'Water Contamination', 'Low Pressure'],
      desc: 'Pipeline bursts, water contamination, valve chamber leaks, pressure drops, and tanker dispatch.',
      sla: '6h – 24h',
    },
    {
      code: 'SANIT',
      divCode: 'ULB-SW-03',
      title: 'Solid Waste & Sanitation',
      deptName: 'Sanitation',
      image: deptSanitationImg,
      icon: Trash2,
      tags: ['Garbage Overflow', 'Uncollected Waste', 'Litter Clearing'],
      desc: 'Refuse dump clearing, community container clearance, roadside litter sweep, and dead animal removal.',
      sla: '12h – 24h',
    },
    {
      code: 'ELECT',
      divCode: 'ULB-EL-04',
      title: 'Streetlights & Electrical',
      deptName: 'Electrical Department',
      image: deptElectricalImg,
      icon: Zap,
      tags: ['Dark Streetlights', 'Sparking Transformer', 'Exposed Cables'],
      desc: 'Dark streetlights, transformer sparking, exposed live wiring, and public illumination outages.',
      sla: '12h – 48h',
    },
    {
      code: 'DRAIN',
      divCode: 'ULB-DR-05',
      title: 'Drainage & Stormwater',
      deptName: 'Drainage Department',
      image: deptDrainageImg,
      icon: Waves,
      tags: ['Open Manhole', 'Waterlogged Lanes', 'Blocked Culvert'],
      desc: 'Clogged stormwater culverts, open manhole hazards, waterlogged lanes, and sewage line backflow.',
      sla: '6h – 24h',
    },
    {
      code: 'GENAD',
      divCode: 'ULB-GA-06',
      title: 'General Administration',
      deptName: 'General Administration',
      image: deptAdminImg,
      icon: Building2,
      tags: ['Public Parks', 'Signage Damage', 'Encroachment'],
      desc: 'Public park upkeep, municipal signage damage, public property encroachment, and civic utilities.',
      sla: '24h – 72h',
    },
  ];

  return (
    <div className="pb-16 bg-[#F4F6F9] text-[#1B2533]">
      {/* 1. Official Citizen Notice Ticker */}
      <div className="bg-[#FFFBEB] border-b border-[#FDE68A] px-4 py-2.5 text-xs text-[#92400E] shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center gap-3 text-left">
          <span className="font-bold bg-[#D97706] text-white px-2.5 py-0.5 rounded-full text-[10px] uppercase shrink-0 flex items-center gap-1.5 shadow-xs tracking-wider">
            <BellRing className="w-3 h-3" />
            Citizen Notice
          </span>
          <p className="truncate font-semibold text-[11px] sm:text-xs text-[#78350F]">
            Monsoon Rapid Action Teams mobilized across all municipal wards. Report open manholes, major pipeline bursts, or waterlogged roads for 6-hour rapid response under Critical SLA.
          </p>
        </div>
      </div>

      {/* 2. FULL-WIDTH HERO SECTION (Inspired by Karnataka.gov.in Majestic Civic Banner with 3-Slide BG Carousel) */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full min-h-[75vh] lg:min-h-[88vh] flex items-center bg-[#07162C] text-white overflow-hidden border-b-4 border-[#E65100]"
      >
        {/* Carousel Background Images (3 High-Resolution Civic Scenes) */}
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out transform ${
              idx === currentSlide
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105 pointer-events-none'
            }`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}

        {/* Balanced Semi-Transparent Overlay: Keeps civic photos clearly visible while ensuring WCAG AAA text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07162C]/90 via-[#0C2340]/70 to-[#07162C]/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07162C]/80 via-transparent to-black/30 pointer-events-none" />

        {/* Subtle Civic Architectural Watermark */}
        <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-96 h-96 sm:w-[550px] sm:h-[550px] rounded-full border-16 border-white/5 pointer-events-none" />

        {/* Left & Right Edge Manual Carousel Navigation Arrows */}
        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          aria-label="Previous Slide"
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-black/40 hover:bg-[#E65100] text-white border border-white/20 backdrop-blur-sm transition duration-200 shadow-lg hover:scale-105 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          aria-label="Next Slide"
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-black/40 hover:bg-[#E65100] text-white border border-white/20 backdrop-blur-sm transition duration-200 shadow-lg hover:scale-105 cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#FBBF24] tracking-wider uppercase">
                <Shield className="w-4 h-4 text-[#FBBF24]" />
                <span>Government of India • Ministry of Housing & Urban Affairs</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Centralized Public Grievance Redress & Monitoring System
              </h1>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-normal">
                JANSETU connects citizens directly with municipal local bodies and maintenance divisions. Every complaint receives a verifiable tracking ID, transparent rule-based SLA resolution target, and mandatory photographic proof of completed work.
              </p>

              {/* Direct Actions in Hero */}
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/submit-complaint"
                  className="px-6 py-3 rounded bg-[#E65100] hover:bg-[#D94E00] text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Lodge Grievance Online →</span>
                </Link>
                <Link
                  to="/public-dashboard"
                  className="px-5 py-3 rounded bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-2 border border-white/20"
                >
                  <BarChart3 className="w-4 h-4 text-[#FBBF24]" />
                  <span>Public SLA Dashboard</span>
                </Link>
              </div>
            </div>

            {/* Right Simple Tracking Box */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-lg shadow-xl border border-slate-200 p-6 text-[#1B2533] text-left">
                <div className="flex items-center gap-2 mb-4">
                  <Search className="w-5 h-5 text-[#E65100]" />
                  <h2 className="text-base sm:text-lg font-bold text-[#0C2340]">
                    Track Grievance Status
                  </h2>
                </div>

                <form onSubmit={handleTrackSubmit} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      required
                      value={trackId}
                      onChange={(e) => setTrackId(e.target.value)}
                      placeholder="Enter Complaint ID (e.g. JAN-2026-00001)"
                      className="w-full px-3.5 py-3 text-sm font-mono font-bold rounded border border-slate-300 focus:border-[#1B365D] focus:ring-1 focus:ring-[#1B365D] focus:outline-none uppercase bg-[#F8F9FA] text-[#0C2340] placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded bg-[#1B365D] hover:bg-[#0C2340] text-white text-sm font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Track Status →</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. REAL-TIME MUNICIPAL PERFORMANCE LEDGER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 mb-12 sm:mb-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-6 text-left">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0C2340]">
              Real-Time Municipal Disposal Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Live disposal metrics updated across 6 Urban Local Body divisions
            </p>
          </div>
          <Link
            to="/public-dashboard"
            className="text-xs font-bold text-[#1B365D] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Detailed SLA Performance Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {/* Stat 1: Total Registered */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600">Total Grievances</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#0C2340] font-mono">
                {loadingStats ? '—' : stats.totalSubmitted}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Verified public complaints filed
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-600">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>All 6 Municipal Divisions</span>
            </div>
          </div>

          {/* Stat 2: Verified Disposals */}
          <div className="bg-white rounded-xl p-5 border border-emerald-200 bg-emerald-50/20 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-800">Verified Disposals</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-700 font-mono">
                {loadingStats ? '—' : stats.totalResolved}
              </p>
              <p className="text-xs text-emerald-700/80 mt-1">
                Confirmed resolved by citizens
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Citizen Sign-off Verified</span>
            </div>
          </div>

          {/* Stat 3: Disposal Rate */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600">Disposal Compliance</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-indigo-700 font-mono">
                {loadingStats ? '—' : `${stats.resolutionRate}%`}
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, stats.resolutionRate)}%` }}
                />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-600">
              <span>SLA Target: <strong>&gt;85%</strong></span>
            </div>
          </div>

          {/* Stat 4: Turnaround Window */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600">Average Turnaround</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-amber-700 font-mono">
                {loadingStats ? '—' : `${stats.avgResolutionHours}h`}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Average lodging-to-closure time
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
              <span>Mandatory Max: <strong>72h</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VISUAL 5-STEP CITIZEN REDRESSAL ROADMAP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
        <div className="border-b border-slate-200 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 text-left">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0C2340]">
              How Redressal Works — A Citizen-First Journey
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Mandated by Municipal Administration & Urban Governance Directives
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-left">
          {/* Step 1 */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-[#1B365D] text-white font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <Camera className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="font-bold text-sm text-[#0C2340]">
                Report & Geotag
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Provide on-site photographs, precise OpenStreetMap coordinates, and problem description.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-[#1B365D]">
              Instant Tracking Reference
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-[#1B365D] text-white font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <Scale className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="font-bold text-sm text-[#0C2340]">
                Rule-Based Triage
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Transparent rules (+40 hazard, +20 school zone) calculate binding resolution deadlines.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-[#E65100]">
              6h to 72h SLA Deadline
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-[#1B365D] text-white font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <Hammer className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="font-bold text-sm text-[#0C2340]">
                Field Remediation
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Assigned departmental engineers dispatch repair crews directly to the physical site.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
              Department Crew Deployed
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-[#1B365D] text-white font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <FileCheck2 className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="font-bold text-sm text-[#0C2340]">
                ATR & Photo Proof
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Field engineers must upload 'After' restoration photographs and formal Action Taken Report remarks.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
              Proof Upload Required
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-emerald-50/40 rounded-xl p-5 border-2 border-emerald-500 shadow-xs flex flex-col justify-between space-y-4 relative">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  5
                </span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-bold text-sm text-[#0C2340]">
                Citizen Verification
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The grievance cannot be closed by officials alone. You confirm resolution or dispute & reopen.
              </p>
            </div>
            <div className="pt-2 border-t border-emerald-200 text-[11px] font-bold text-emerald-700">
              Resident Holds the Veto
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE CIVIC ISSUE SELECTOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-6 text-left">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0C2340]">
              What Civic Issue Are You Facing?
            </h2>
          </div>
          <Link
            to="/departments"
            className="text-xs font-bold text-[#1B365D] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View Complete Municipal Staffing Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {departmentCatalog.map((dept) => (
            <div
              key={dept.code}
              className="bg-white rounded-xl border border-slate-200 hover:border-[#1B365D] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* 1. Realistic Photographic Header Banner with Division Code */}
                <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={dept.image}
                    alt={dept.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Subtle Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />


                  {/* Icon & Category Title Overlaid on bottom of photo */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5 text-white">
                    <div className="w-8 h-8 rounded-lg bg-[#E65100] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <dept.icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-base text-white tracking-tight drop-shadow-xs leading-snug">
                      {dept.title}
                    </h3>
                  </div>
                </div>

                {/* 2. Card Content Body */}
                <div className="p-4 sm:p-5 space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {dept.desc}
                  </p>

                  {/* Actionable Issue Pill Triggers */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Common Grievance Types:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dept.tags.map((tag) => (
                        <Link
                          key={tag}
                          to={`/submit-complaint?category=${encodeURIComponent(dept.deptName)}`}
                          className="text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#0C2340] px-2.5 py-1 rounded border border-slate-200 transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Card Footer with SLA Window & Action CTA */}
              <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link
                  to={`/submit-complaint?category=${encodeURIComponent(dept.deptName)}`}
                  className="px-4 py-2 rounded-lg bg-[#1B365D] hover:bg-[#0C2340] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Report Issue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. WHY JANSETU IS DIFFERENT — RESIDENT EMPOWERMENT PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
        <div className="bg-[#0C2340] rounded-2xl p-6 sm:p-10 text-white text-left relative overflow-hidden">
          <div className="max-w-3xl mb-8 space-y-2">
            <h2 className="text-xl sm:text-3xl font-extrabold leading-tight">
              A Municipal Portal Built for Citizen Power, Not Official Secrecy
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Traditional grievance portals disappear complaints into bureaucratic black holes. JANSETU re-engineers municipal governance with four non-negotiable guarantees:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#E65100]/20 text-[#FBBF24] flex items-center justify-center border border-[#E65100]/30 font-bold">
                01
              </div>
              <h3 className="font-bold text-sm text-white">
                Zero VIP Prioritization
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tickets are ranked by mathematical severity (+40 hazard, +20 school zone) without human discretion or political interference.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-bold">
                02
              </div>
              <h3 className="font-bold text-sm text-white">
                Mandatory Photographic Evidence
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Engineers cannot close a grievance with paper remarks. They must upload tamper-evident 'After' photos showing the completed fix.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 font-bold">
                03
              </div>
              <h3 className="font-bold text-sm text-white">
                Automatic Commissioner Escalation
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Overdue complaints breach automatically into the Municipal Commissioner's audit ledger under the Public Service Guarantee Act.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CITIZEN FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0C2340]">
            Frequently Asked Citizen Questions
          </h2>
          <p className="text-xs text-slate-500">
            Clear answers on how your grievance is logged, prioritized, and verified.
          </p>
        </div>

        <div className="space-y-3 text-left">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={faq.q}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-xs sm:text-sm text-[#0C2340] hover:text-[#1B365D]"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-[#E65100] shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. APPELLATE AUTHORITY & CITIZEN CHARTER GUARANTEE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-14">
        <div className="bg-[#1B365D] rounded-xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs border border-[#0C2340]">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-bold leading-snug">
              Time-Bound Escalation to First Appellate Authority
            </h3>
            <p className="text-xs text-slate-200 max-w-xl leading-relaxed">
              If an assigned municipal grievance remains unattended past the stipulated demonstration SLA,
              the case is automatically flagged as Overdue and escalated to the Municipal Commissioner's Administrative Directorate.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto shrink-0">
            <Link
              to="/public-dashboard"
              className="px-5 py-2.5 rounded bg-white text-[#0C2340] hover:bg-slate-100 font-bold text-xs text-center shadow-xs transition"
            >
              Public SLA Dashboard
            </Link>
            <Link
              to="/track"
              className="px-5 py-2.5 rounded bg-[#E65100] hover:bg-[#D94E00] text-white font-bold text-xs text-center transition"
            >
              Track by Reference ID
            </Link>
          </div>
        </div>
      </section>

      {/* 10. EVALUATOR / AUDITOR SYSTEM TOOLS (Collapsible) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <div className="border border-slate-200 bg-white rounded-xl p-3 text-xs">
          <button
            type="button"
            onClick={() => setShowReviewerTools(!showReviewerTools)}
            className="w-full flex items-center justify-between text-slate-600 hover:text-slate-900 font-semibold"
          >
            <span className="flex items-center gap-2 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#1B365D]" />
              System Evaluation & Seeded Test Registry ({showReviewerTools ? 'Collapse' : 'Expand'})
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showReviewerTools ? 'rotate-180' : ''}`} />
          </button>

          {showReviewerTools && (
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left">
              <div className="space-y-1.5">
                <span className="font-bold text-[#0C2340] block">Sample Grievance Reference IDs:</span>
                <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                  {sampleDemoCodes.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => navigate(`/track?id=${code}`)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-100 text-[#1B365D] border border-slate-200 font-bold"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-[#0C2340] block">Nodal Portals:</span>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <Link to="/login" className="text-[#1B365D] font-bold hover:underline">
                    Official & Commissioner Sign-in →
                  </Link>
                  <span className="text-slate-300">•</span>
                  <Link to="/register" className="text-slate-600 font-semibold hover:underline">
                    New Citizen Registration
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
