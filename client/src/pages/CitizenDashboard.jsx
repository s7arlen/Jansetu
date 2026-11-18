import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  Filter,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Citizen verification modal state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [verifyAction, setVerifyAction] = useState('CONFIRM'); // 'CONFIRM' or 'REJECT'
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints/my');
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
      }
    } catch (err) {
      console.error('Error fetching citizen complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const totalCount = complaints.length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'IN PROGRESS' || c.status === 'ASSIGNED' || c.status === 'UNDER REVIEW'
  ).length;
  const verificationCount = complaints.filter(
    (c) => c.status === 'CITIZEN VERIFICATION' || c.status === 'RESOLUTION SUBMITTED'
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'ACTIVE') {
      return (
        c.status !== 'RESOLVED' &&
        c.status !== 'CITIZEN VERIFICATION' &&
        c.status !== 'RESOLUTION SUBMITTED'
      );
    }
    if (activeFilter === 'VERIFY') {
      return (
        c.status === 'CITIZEN VERIFICATION' || c.status === 'RESOLUTION SUBMITTED'
      );
    }
    if (activeFilter === 'RESOLVED') {
      return c.status === 'RESOLVED';
    }
    return true;
  });

  const openVerificationModal = (complaint) => {
    setSelectedComplaint(complaint);
    setVerifyAction('CONFIRM');
    setRating(5);
    setComment('');
    setRejectionReason('');
    setActionMessage('');
    setVerifyModalOpen(true);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setSubmittingVerification(true);
      setActionMessage('');
      const res = await api.post(`/complaints/${selectedComplaint._id}/verify`, {
        action: verifyAction,
        rating: verifyAction === 'CONFIRM' ? rating : undefined,
        comment: verifyAction === 'CONFIRM' ? comment : undefined,
        rejectionReason: verifyAction === 'REJECT' ? rejectionReason : undefined,
      });

      if (res.data.success) {
        setVerifyModalOpen(false);
        fetchMyComplaints();
      }
    } catch (err) {
      setActionMessage(
        err.response?.data?.message || 'Verification submission failed.'
      );
    } finally {
      setSubmittingVerification(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {user?.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track submitted civic problems, view workorders, and verify photographic resolution evidence.
          </p>
        </div>

        <Link
          to="/submit-complaint"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C1121F] hover:bg-[#8F0D17] text-white text-xs font-bold transition shadow-md shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Report New Problem
        </Link>
      </div>

      {/* Verification Needed Alert Banner */}
      {verificationCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-200 text-amber-900">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">
                Action Required: {verificationCount} Case{verificationCount === 1 ? '' : 's'} Awaiting Your Sign-Off
              </p>
              <p className="text-xs text-amber-800">
                Municipal teams have completed field work. Inspect the after photos and verify resolution.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveFilter('VERIFY')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition shrink-0"
          >
            Review & Verify Now
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveFilter('ALL')}
          className={`p-5 rounded-xl border transition cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-blue-50/50 border-[#245B8F] shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Filed</span>
            <FileText className="w-4 h-4 text-[#245B8F]" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{totalCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">In your grievance history</span>
        </div>

        <div
          onClick={() => setActiveFilter('ACTIVE')}
          className={`p-5 rounded-xl border transition cursor-pointer ${
            activeFilter === 'ACTIVE'
              ? 'bg-sky-50/50 border-sky-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active In-Field</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black text-sky-700 font-mono">{inProgressCount}</p>
          <span className="text-[11px] text-sky-700 mt-1 block">Under review or repair</span>
        </div>

        <div
          onClick={() => setActiveFilter('VERIFY')}
          className={`p-5 rounded-xl border transition cursor-pointer ${
            activeFilter === 'VERIFY'
              ? 'bg-amber-50 border-amber-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Awaiting Sign-off</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 font-mono">{verificationCount}</p>
          <span className="text-[11px] text-amber-700 mt-1 block">Citizen verification pending</span>
        </div>

        <div
          onClick={() => setActiveFilter('RESOLVED')}
          className={`p-5 rounded-xl border transition cursor-pointer ${
            activeFilter === 'RESOLVED'
              ? 'bg-emerald-50 border-emerald-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Verified Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 font-mono">{resolvedCount}</p>
          <span className="text-[11px] text-emerald-700 mt-1 block">Successfully resolved</span>
        </div>
      </div>

      {/* Complaints List Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeFilter === 'ACTIVE'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Active ({inProgressCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('VERIFY')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeFilter === 'VERIFY'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100 font-semibold'
              }`}
            >
              Needs Verification ({verificationCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('RESOLVED')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeFilter === 'RESOLVED'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Resolved ({resolvedCount})
            </button>
          </div>

          <div className="relative min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Complaints Table/Cards */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <Clock className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
            Loading your grievances...
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm space-y-3">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No matching grievances found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't filed any complaints under this filter yet.
            </p>
            <Link
              to="/submit-complaint"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark"
            >
              <PlusCircle className="w-4 h-4" /> Report an Issue
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredComplaints.map((c) => {
              const isNeedsVerification =
                c.status === 'CITIZEN VERIFICATION' || c.status === 'RESOLUTION SUBMITTED';

              return (
                <div
                  key={c._id}
                  className={`p-5 transition hover:bg-slate-50/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                    isNeedsVerification ? 'bg-amber-50/30' : ''
                  }`}
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {c.complaintId}
                      </span>
                      <StatusBadge status={c.status} size="sm" />
                      <PriorityBadge level={c.priorityLevel} score={c.priorityScore} showScore size="sm" />
                      {c.isOverdue && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                          OVERDUE
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/complaints/${c._id}`}
                      className="block text-sm font-bold text-slate-900 hover:text-primary transition leading-snug"
                    >
                      {c.title}
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {c.departmentId?.name || 'General Administration'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(c.createdAt).toLocaleDateString('en-IN')}
                      </span>
                      {c.deadline && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Target: {new Date(c.deadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                    {isNeedsVerification && (
                      <button
                        type="button"
                        onClick={() => openVerificationModal(c)}
                        className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Verify Solution
                      </button>
                    )}

                    <Link
                      to={`/complaints/${c._id}`}
                      className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1"
                    >
                      View Dossier
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Citizen Verification Modal */}
      <Modal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        title={`Verify Resolution: ${selectedComplaint?.complaintId}`}
      >
        {selectedComplaint && (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <p className="font-bold text-slate-900">{selectedComplaint.title}</p>
              {selectedComplaint.afterImage && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-1">
                    Department Completion Photo Evidence:
                  </p>
                  <img
                    src={selectedComplaint.afterImage}
                    alt="Resolution evidence"
                    className="w-full h-44 object-cover rounded-lg border border-slate-200"
                  />
                </div>
              )}
              {selectedComplaint.resolutionRemarks && (
                <p className="text-slate-700 italic">
                  Official remarks: "{selectedComplaint.resolutionRemarks}"
                </p>
              )}
            </div>

            {actionMessage && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {actionMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Your Verification Verdict
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVerifyAction('CONFIRM')}
                  className={`p-3 rounded-xl border text-center transition ${
                    verifyAction === 'CONFIRM'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-400'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                  <span className="text-xs">Confirm Resolution</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Problem is fixed</p>
                </button>

                <button
                  type="button"
                  onClick={() => setVerifyAction('REJECT')}
                  className={`p-3 rounded-xl border text-center transition ${
                    verifyAction === 'REJECT'
                      ? 'border-red-500 bg-red-50 text-red-900 font-bold ring-2 ring-red-400'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <AlertCircle className="w-5 h-5 mx-auto mb-1 text-red-600" />
                  <span className="text-xs">Dispute & Reopen</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Work is incomplete</p>
                </button>
              </div>
            </div>

            {verifyAction === 'CONFIRM' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rating (1 to 5 Stars)
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5) - Excellent Resolution</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5) - Satisfactory</option>
                    <option value={3}>⭐⭐⭐ (3/5) - Acceptable</option>
                    <option value={2}>⭐⭐ (2/5) - Needs Improvement</option>
                    <option value={1}>⭐ (1/5) - Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Feedback Remarks (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="E.g. The pothole has been patched smoothly. Thank you team!"
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-red-700">
                  Reason for Dispute & Reopening *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain clearly why the work is inadequate (e.g. Debris was left on side, water still leaking)..."
                  className="w-full p-2.5 text-xs rounded-lg border border-red-300 focus:outline-none focus:border-red-500 bg-red-50/20"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setVerifyModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingVerification}
                className={`px-5 py-2 text-xs font-bold text-white rounded-lg transition ${
                  verifyAction === 'CONFIRM'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {submittingVerification
                  ? 'Submitting Verdict...'
                  : verifyAction === 'CONFIRM'
                  ? 'Confirm & Mark Resolved'
                  : 'Dispute & Reopen Case'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
