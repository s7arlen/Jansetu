import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  FileText,
  Search,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';

export const DepartmentDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState('');

  // Evidence submission modal
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [afterImageFile, setAfterImageFile] = useState(null);
  const [afterImagePreview, setAfterImagePreview] = useState(null);
  const [submittingEvidence, setSubmittingEvidence] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchDepartmentComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints');
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
      }
    } catch (err) {
      console.error('Error fetching department complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentComplaints();
  }, []);

  const totalAssigned = complaints.length;
  const newAssignments = complaints.filter(
    (c) => c.status === 'ASSIGNED' || c.status === 'SUBMITTED' || c.status === 'UNDER REVIEW'
  ).length;
  const inProgress = complaints.filter((c) => c.status === 'IN PROGRESS').length;
  const verification = complaints.filter(
    (c) => c.status === 'CITIZEN VERIFICATION' || c.status === 'RESOLUTION SUBMITTED'
  ).length;
  const resolved = complaints.filter((c) => c.status === 'RESOLVED').length;
  const overdueCount = complaints.filter((c) => c.isOverdue).length;

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'NEW') {
      return c.status === 'ASSIGNED' || c.status === 'SUBMITTED' || c.status === 'UNDER REVIEW';
    }
    if (activeFilter === 'IN_PROGRESS') {
      return c.status === 'IN PROGRESS';
    }
    if (activeFilter === 'VERIFICATION') {
      return c.status === 'CITIZEN VERIFICATION' || c.status === 'RESOLUTION SUBMITTED';
    }
    if (activeFilter === 'RESOLVED') {
      return c.status === 'RESOLVED';
    }
    if (activeFilter === 'OVERDUE') {
      return c.isOverdue;
    }
    return true;
  });

  const handleStartWork = async (complaintId) => {
    try {
      const res = await api.patch(`/complaints/${complaintId}/status`, {
        status: 'IN PROGRESS',
        remarks: `Assigned task accepted by field official ${user.name}. Field execution initiated.`,
      });
      if (res.data.success) {
        fetchDepartmentComplaints();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const openEvidenceModal = (complaint) => {
    setSelectedComplaint(complaint);
    setResolutionRemarks('');
    setAfterImageFile(null);
    setAfterImagePreview(null);
    setModalError('');
    setEvidenceModalOpen(true);
  };

  const handleEvidenceSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionRemarks.trim()) {
      setModalError('Please describe the technical remediation completed.');
      return;
    }

    try {
      setSubmittingEvidence(true);
      setModalError('');
      const formData = new FormData();
      formData.append('resolutionRemarks', resolutionRemarks);
      if (afterImageFile) {
        formData.append('afterImage', afterImageFile);
      }

      const res = await api.post(`/complaints/${selectedComplaint._id}/evidence`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setEvidenceModalOpen(false);
        fetchDepartmentComplaints();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to submit evidence.');
    } finally {
      setSubmittingEvidence(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {user?.department?.name || 'Department Work Orders'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official: {user?.name} ({user?.designation || 'Engineer'}) • Isolated to your department's jurisdiction.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div
          onClick={() => setActiveFilter('ALL')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-blue-50/50 border-[#245B8F] shadow-xs'
              : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Workorders</span>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">{totalAssigned}</p>
        </div>

        <div
          onClick={() => setActiveFilter('NEW')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeFilter === 'NEW'
              ? 'bg-indigo-50 border-indigo-400 shadow-xs'
              : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase text-indigo-700">New Intake</span>
          <p className="text-xl font-black text-indigo-700 font-mono mt-1">{newAssignments}</p>
        </div>

        <div
          onClick={() => setActiveFilter('IN_PROGRESS')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeFilter === 'IN_PROGRESS'
              ? 'bg-sky-50 border-sky-400 shadow-xs'
              : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase text-sky-700">In Progress</span>
          <p className="text-xl font-black text-sky-700 font-mono mt-1">{inProgress}</p>
        </div>

        <div
          onClick={() => setActiveFilter('VERIFICATION')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeFilter === 'VERIFICATION'
              ? 'bg-amber-50 border-amber-400 shadow-xs'
              : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase text-amber-700">Awaiting Citizen</span>
          <p className="text-xl font-black text-amber-700 font-mono mt-1">{verification}</p>
        </div>

        <div
          onClick={() => setActiveFilter('OVERDUE')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeFilter === 'OVERDUE'
              ? 'bg-red-50 border-red-400 shadow-xs'
              : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase text-red-700">Overdue SLA</span>
          <p className="text-xl font-black text-red-600 font-mono mt-1">{overdueCount}</p>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeFilter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({totalAssigned})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('NEW')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeFilter === 'NEW' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              New Dispatches ({newAssignments})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeFilter === 'IN_PROGRESS'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              In Progress ({inProgress})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('VERIFICATION')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeFilter === 'VERIFICATION'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100 font-semibold'
              }`}
            >
              Verification ({verification})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('RESOLVED')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeFilter === 'RESOLVED'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Resolved ({resolved})
            </button>
          </div>

          <div className="relative min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search work orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <Clock className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
            Loading assigned field workorders...
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No work orders in this view</p>
            <p className="text-xs text-slate-500">Your department has no active cases matching this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredComplaints.map((c) => {
              const canStart = c.status === 'ASSIGNED' || c.status === 'SUBMITTED' || c.status === 'UNDER REVIEW';
              const canSubmitEvidence = c.status === 'IN PROGRESS';

              return (
                <div
                  key={c._id}
                  className="p-5 hover:bg-slate-50/80 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
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
                      <span>Address: {c.location?.address}</span>
                      <span>•</span>
                      <span>SLA: {c.targetResolutionHours}h window</span>
                      {c.deadline && (
                        <>
                          <span>•</span>
                          <span className={c.isOverdue ? 'text-red-600 font-bold' : ''}>
                            Deadline: {new Date(c.deadline).toLocaleString('en-IN')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {canStart && (
                      <button
                        type="button"
                        onClick={() => handleStartWork(c._id)}
                        className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        Accept & Start
                      </button>
                    )}

                    {canSubmitEvidence && (
                      <button
                        type="button"
                        onClick={() => openEvidenceModal(c)}
                        className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Submit Evidence
                      </button>
                    )}

                    <Link
                      to={`/complaints/${c._id}`}
                      className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                    >
                      View Dossier
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolution Evidence Modal */}
      <Modal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        title={`Submit Resolution Evidence: ${selectedComplaint?.complaintId}`}
      >
        <form onSubmit={handleEvidenceSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Document completed field repair. The reporting citizen will inspect the after photograph and confirm resolution.
          </p>

          {modalError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Completion Description *
            </label>
            <textarea
              required
              rows={3}
              value={resolutionRemarks}
              onChange={(e) => setResolutionRemarks(e.target.value)}
              placeholder="Detail technical remediation completed (e.g. Cleared 600mm stormwater pipe blockage with high-pressure water jetter; tested drainage flow rate)..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Photographic Evidence of Work (After)
            </label>
            <div className="border border-slate-300 rounded-lg p-3 text-center bg-slate-50">
              {afterImagePreview ? (
                <div className="space-y-2">
                  <img
                    src={afterImagePreview}
                    alt="Preview"
                    className="max-h-40 mx-auto rounded shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAfterImageFile(null);
                      setAfterImagePreview(null);
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs text-primary font-semibold">Choose photo file</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (f) {
                        setAfterImageFile(f);
                        setAfterImagePreview(URL.createObjectURL(f));
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEvidenceModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingEvidence}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
            >
              {submittingEvidence ? 'Submitting...' : 'Forward for Citizen Verification'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
