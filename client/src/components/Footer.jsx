import React from 'react';
import { ExternalLink, PhoneCall, Mail, MapPin, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import emblemOfIndiaGold from '../assets/emblem_of_india_gold.svg';

export const Footer = () => {
  return (
    <footer className="bg-[#0C2340] text-slate-300 text-xs mt-auto border-t-4 border-[#FF9933]">
      {/* 1. Official National Links Strip */}
      <div className="bg-[#07172B] border-b border-[#1A3353] py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4 text-slate-300">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <span>National Governance Initiatives:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px]">
            <a
              href="https://india.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1 transition"
            >
              <span>National Portal of India</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href="https://mygov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1 transition"
            >
              <span>MyGov Citizen Platform</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href="https://digitalindia.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1 transition"
            >
              <span>Digital India</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href="https://pgportal.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1 transition"
            >
              <span>CPGRAMS Central</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Directorate Information Matrix */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Identity & Legal Disclaimer */}
          <div className="space-y-3.5 md:col-span-2 text-left">
            <div className="flex items-center gap-3.5">
              <img
                src={emblemOfIndiaGold}
                alt="State Emblem of India"
                className="h-12 w-auto object-contain filter drop-shadow-xs shrink-0"
              />
              <div className="h-9 w-px bg-white/20 hidden sm:block" />
              <div>
                <span className="text-base font-extrabold text-white block">
                  JANSETU
                </span>
                <span className="text-[11px] text-[#FF9933] font-semibold block">
                  Centralized Public Grievance Redress & Monitoring System
                </span>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed text-xs">
              JANSETU is the official digital grievance redressal mechanism established under the urban civic
              governance framework. Connecting citizens directly with urban local bodies (ULBs) for transparent,
              rule-based prioritization and mandatory photographic proof of resolution.
            </p>

            <div className="p-3 rounded bg-[#07172B] border border-[#1A3353] space-y-1">
              <span className="font-bold text-white text-[11px] block">
                ⚖️ Transparent Citizen Redressal Guarantee:
              </span>
              <p className="text-[11px] text-slate-400">
                Predefined deterministic rule scoring (+40 hazard, +20 school proximity) without black-box predictive AI algorithms. Complainant holds final verification authority.
              </p>
            </div>
          </div>

          {/* Quick Access Links */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-[#1A3353] pb-1.5">
              Portal Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/submit-complaint" className="hover:text-[#FF9933] transition flex items-center gap-1.5">
                  <span>Lodge Public Grievance</span>
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-[#FF9933] transition flex items-center gap-1.5">
                  <span>Track Grievance Status / ATR</span>
                </Link>
              </li>
              <li>
                <Link to="/public-dashboard" className="hover:text-[#FF9933] transition flex items-center gap-1.5">
                  <span>Public SLA & Disposal Metrics</span>
                </Link>
              </li>
              <li>
                <Link to="/departments" className="hover:text-[#FF9933] transition flex items-center gap-1.5">
                  <span>Municipal Jurisdictions Directory</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#FF9933] transition flex items-center gap-1.5">
                  <span>Nodal Official Sign-in</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Grievance Helpdesk & Helplines */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-[#1A3353] pb-1.5">
              Municipal Helpdesk
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <PhoneCall className="w-4 h-4 text-[#FF9933] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Toll-Free Helpline:</span>
                  <span>1913 (24x7 Municipal Desk)</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-[#FF9933] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Email Support:</span>
                  <span>grievance.support@jansetu.gov.in</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FF9933] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Central Directorate:</span>
                  <span>Nirman Bhawan, New Delhi - 110011</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Official Indian Government Legal Disclaimers & GIGW Compliance */}
        <div className="mt-8 pt-6 border-t border-[#1A3353] text-[11px] text-slate-400 space-y-3 text-left">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>
              Website Content Managed by Municipal Administration Directorate, Ministry of Housing & Urban Affairs, Government of India.
            </p>
            <div className="text-right shrink-0">
              <span className="block font-semibold text-slate-300">Last Reviewed and Updated on:</span>
              <span className="font-mono text-slate-400">17 November 2026</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#1A3353]/60 text-slate-500">
            <div className="flex flex-wrap gap-4 text-[10px]">
              <span className="hover:text-slate-300 cursor-pointer">Terms & Conditions</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">Copyright Policy</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">Hyperlinking Policy</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">Accessibility Statement</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">Citizen Charter</span>
            </div>

            <div className="text-[10px]">
              <span>Compliant with Guidelines for Indian Government Websites (GIGW 3.0)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
