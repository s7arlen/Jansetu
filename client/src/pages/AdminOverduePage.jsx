import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  AlertOctagon,
  Building2,
  Calendar,
  ArrowRight,
  Shield,
  FileText,
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';

export const AdminOverduePage = () => {
  const [overdueList, setOverdueList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Escalation Modal
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [escalateReason, setEscalateReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOverdue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/overdue');
      if (res.data.success) {
        setOverdueList(res.data.complaints || []);
      }
    } catch (err) {
      console.error('Error fetching overdue complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const openEscalateModal = (complaint) => {
    setSelectedComplaint(complaint);
    setEscalateReason(
      `Exceeded target resolution window. Urgent field intervention demanded.`
    );
    setEscalateModalOpen(true);
  };

  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!escalateReason.trim() || !selectedComplaint) return;

    try {
      setSubmitting(true);
      const res = await api.post('/admin/escalate', {
        complaintId: selectedComplaint._id,
        reason: escalateReason,
      });
      if (res.data.success) {
        setEscalateModalOpen(false);
        fetchOverdue();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Escalation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const getOverdueHours = (deadline) => {
    if (!deadline) return 0;
    const diff = (Date.now() - new Date(deadline).getTime()) / (1000 * 60 * 60);
    return Math.max(0, Math.round(diff));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-red-50 p-6 rounded-2xl border border-red-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-red-950 tracking-tight">
            Overdue Grievance Directives ({overdueList.length})
          </h1>
          <p className="text-xs text-red-800 mt-1 max-w-xl">
            Cases exceeding target resolution deadlines. Administrators can dispatch high-level escalation orders to department leadership.
          </p>
        </div>
      </div>

      {/* List Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <Clock className="w-8 h-8 mx-auto mb-2 animate-spin text-red-600" />
            Scanning for overdue SLA breaches...
          </div>
        ) : overdueList.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800">Zero Overdue Breaches</p>
            <p className="text-xs text-slate-500">
              All active complaints are currently within their designated SLA turnaround targets.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {overdueList.map((c) => {
              const overdueHours = getOverdueHours(c.deadline);

              return (
                <div
                  key={c._id}
                  className="p-5 hover:bg-red-50/20 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {c.complaintId}
                      </span>
                      <StatusBadge status={c.status} size="sm" />
                      <PriorityBadge level={c.priorityLevel} score={c.priorityScore} showScore size="sm" />
                      <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                        +{overdueHours}h Overdue
                      </span>
                      {c.isEscalated && (
                        <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                          Escalated L{c.escalationDetails?.level || 1}
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/complaints/${c._id}`}
                      className="block text-sm font-bold text-slate-900 hover:text-red-700 transition leading-snug"
                    >
                      {c.title}
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {c.departmentId?.name || 'Unassigned'}
                      </span>
                      <span>•</span>
                      <span>Target: {c.targetResolutionHours}h</span>
                      <span>•</span>
                      <span className="text-red-600 font-medium">
                        Deadline: {new Date(c.deadline).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {c.escalationDetails?.reason && (
                      <p className="text-xs text-red-800 bg-red-50 p-2 rounded border border-red-100 italic">
                        Previous Escalation: "{c.escalationDetails.reason}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEscalateModal(c)}
                      className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <AlertOctagon className="w-4 h-4" />
                      Trigger Escalation
                    </button>
                    <Link
                      to={`/complaints/${c._id}`}
                      className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
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

      {/* Escalation Modal */}
      <Modal
        isOpen={escalateModalOpen}
        onClose={() => setEscalateModalOpen(false)}
        title={`Escalate Overdue Grievance: ${selectedComplaint?.complaintId}`}
      >
        <form onSubmit={handleEscalateSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Escalation elevates priority to senior commissioner review and triggers immediate notifications.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Escalation Directive & Cause *
            </label>
            <textarea
              required
              rows={3}
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEscalateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              {submitting ? 'Dispatching...' : 'Dispatch Escalation Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
