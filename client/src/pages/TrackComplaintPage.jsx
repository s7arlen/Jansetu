import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  FileText,
  Clock,
  Building2,
  Calendar,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  Printer,
  Share2,
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Timeline } from '../components/Timeline';

export const TrackComplaintPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [inputCode, setInputCode] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [showEvaluatorDirectory, setShowEvaluatorDirectory] = useState(false);

  const fetchTrackData = async (code) => {
    if (!code) return;
    try {
      setLoading(true);
      setError('');
      setComplaint(null);
      const res = await api.get(`/public/track/${encodeURIComponent(code.trim().toUpperCase())}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
        setHistory(res.data.history || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `No registered record found for tracking ID "${code}". Please ensure the ID is formatted correctly (e.g. JAN-2026-00001).`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchTrackData(initialId);
    }
  }, [initialId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputCode.trim()) {
      setSearchParams({ id: inputCode.trim().toUpperCase() });
      fetchTrackData(inputCode.trim().toUpperCase());
    }
  };

  const sampleDemoCodes = [
    { id: 'JAN-2026-00001', desc: 'Deep pothole on SV Road (Roads Dept)' },
    { id: 'JAN-2026-00002', desc: 'Main water pipeline burst (Water Supply)' },
    { id: 'JAN-2026-00003', desc: 'Overflowing community garbage (Sanitation)' },
    { id: 'JAN-2026-00004', desc: 'Non-functional streetlights (Electrical)' },
    { id: 'JAN-2026-00005', desc: 'Clogged monsoon drain (Drainage)' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Official GovTech Header & Search Console */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-sm p-6 sm:p-8 space-y-6 text-left">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1628] tracking-tight">
            Grievance Status & Action Taken Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl font-normal leading-relaxed">
            Enter your official complaint registration reference number to inspect real-time progress, assigned
            administrative division, field action milestones, and signed resolution evidence.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Complaint Reference Number
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="JAN-2026-00001"
                className="w-full pl-10 pr-3 py-2.5 text-sm font-bold font-mono text-slate-900 rounded-md border border-slate-300 focus:outline-none focus:border-[#245B8F] focus:ring-1 focus:ring-[#245B8F] uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputCode.trim()}
              className="px-6 py-2.5 bg-[#245B8F] hover:bg-[#19446B] text-white text-xs sm:text-sm font-bold rounded-md transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
            >
              <span>{loading ? 'Searching Ledger...' : 'Retrieve Dossier'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Standard Format: <code>JAN-YYYY-XXXXX</code> (Printed on registration receipt or SMS alert)
          </p>
        </form>

        {/* Collapsible Evaluator Registry */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowEvaluatorDirectory(!showEvaluatorDirectory)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <span>Evaluation Reference Cases</span>
            {showEvaluatorDirectory ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showEvaluatorDirectory && (
            <div className="mt-3 p-3 rounded-md bg-slate-50 border border-slate-200 space-y-2">
              <p className="text-[11px] text-slate-600 font-medium">
                Click any reference case below to inspect its live Action Taken Report:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {sampleDemoCodes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setInputCode(item.id);
                      setSearchParams({ id: item.id });
                      fetchTrackData(item.id);
                    }}
                    className="p-2 rounded bg-white border border-slate-300 hover:border-[#245B8F] hover:bg-blue-50/50 text-left transition flex items-start gap-2"
                  >
                    <span className="font-mono font-bold text-[#245B8F] text-[11px] shrink-0">
                      {item.id}
                    </span>
                    <span className="text-[11px] text-slate-600 truncate">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 text-left">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div>
            <p className="font-bold text-xs uppercase tracking-wider">Record Not Located</p>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Official Action Taken Report (ATR) / Municipal Dossier */}
      {complaint && (
        <div className="bg-white rounded-lg border border-slate-300 shadow-md overflow-hidden text-left">
          {/* Official Dossier Top Banner */}
          <div className="bg-[#0A1628] text-white p-5 sm:p-6 border-b border-slate-800 flex flex-wrap justify-between items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">
                  Grievance Reference:
                </span>
                <span className="font-mono text-sm sm:text-base font-extrabold text-amber-400 bg-white/10 px-2.5 py-0.5 rounded border border-white/20">
                  {complaint.complaintId}
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-2 pt-0.5">
                <span>Filed: {new Date(complaint.createdAt).toLocaleString('en-IN')}</span>
                <span>•</span>
                <span>Division: {complaint.departmentId?.name || 'General Municipal Administration'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <StatusBadge status={complaint.status} size="lg" />
              <PriorityBadge level={complaint.priorityLevel} />
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Title and Description */}
            <div className="border-b border-slate-200 pb-5 space-y-2">
              <span className="text-xs font-semibold text-slate-500 block">
                Grievance Subject & Details
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {complaint.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-md border border-slate-200">
                {complaint.description}
              </p>
            </div>

            {/* Jurisdiction & Technical Attributes Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-md border border-slate-200 text-xs">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 block">
                  Category
                </span>
                <p className="font-bold text-slate-800">{complaint.category}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 block">
                  Location / Ward
                </span>
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#245B8F] shrink-0" />
                  <span className="truncate">{complaint.location?.address || 'Municipal Ward Area'}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 block">
                  Target Resolution SLA
                </span>
                <p className="font-bold text-slate-800 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    {complaint.deadline
                      ? new Date(complaint.deadline).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Standard SLA'}
                  </span>
                </p>
              </div>
            </div>

            {/* Rule-Based Deterministic Scoring Transparency Card */}
            <div className="bg-slate-50 border border-slate-300 rounded-md p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-[#245B8F]" />
                  Deterministic Rule-Based Triage Assessment
                </span>
                <span className="text-xs font-extrabold font-mono text-[#0A1628] bg-white px-2 py-0.5 rounded border border-slate-300">
                  Calculated Score: {complaint.priorityScore ?? '—'} / 100
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {complaint.priorityReason ||
                  'Evaluated by transparent rule matrix: severity weight, public institution proximity, and elapsed resolution duration.'}
              </p>
              {complaint.priorityFactors && complaint.priorityFactors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {complaint.priorityFactors.map((factor, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-mono font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-300"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Photographic Evidence Section */}
            {(complaint.beforeImage || complaint.afterImage) && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                    Mandatory Field Documentation & Verification Photos
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {complaint.beforeImage && (
                    <div className="rounded-md border border-slate-300 overflow-hidden bg-white">
                      <div className="p-2.5 bg-slate-100 text-xs font-bold text-slate-800 border-b border-slate-200 flex justify-between">
                        <span>Original Condition (Before Action)</span>
                        <span className="text-[10px] text-slate-500 font-normal">Citizen Submission</span>
                      </div>
                      <img
                        src={complaint.beforeImage}
                        alt="Initial Condition"
                        className="w-full h-52 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {complaint.afterImage && (
                    <div className="rounded-md border border-emerald-300 overflow-hidden bg-white">
                      <div className="p-2.5 bg-emerald-50 text-xs font-bold text-emerald-900 border-b border-emerald-200 flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          Remediation Completed (After Action)
                        </span>
                        <span className="text-[10px] text-emerald-700 font-normal">Field Officer Proof</span>
                      </div>
                      <img
                        src={complaint.afterImage}
                        alt="Remediated Condition"
                        className="w-full h-52 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      {complaint.resolutionRemarks && (
                        <div className="p-3 text-xs text-slate-700 bg-emerald-50/40 border-t border-emerald-100">
                          <span className="font-bold text-slate-800 block mb-0.5">Officer Sign-Off Remarks:</span>
                          <p className="italic">"{complaint.resolutionRemarks}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chronological Action History Timeline */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">
                Official Redressal Workflow Audit Trail
              </h3>
              <Timeline history={history} currentStatus={complaint.status} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
