import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Users,
  Building2,
  TrendingUp,
  Search,
  ArrowRight,
  Filter,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick Escalation Modal State
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalatingComplaint, setEscalatingComplaint] = useState(null);
  const [escalateReason, setEscalateReason] = useState('');
  const [escalating, setEscalating] = useState(false);
  const [escalateError, setEscalateError] = useState('');

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!escalateReason.trim()) return;

    try {
      setEscalating(true);
      setEscalateError('');
      const res = await api.post('/admin/escalate', {
        complaintId: escalatingComplaint._id,
        reason: escalateReason,
      });
      if (res.data.success) {
        setEscalateModalOpen(false);
        fetchAdminStats();
      }
    } catch (err) {
      setEscalateError(err.response?.data?.message || 'Escalation failed.');
    } finally {
      setEscalating(false);
    }
  };

  const priorityPieData =
    stats?.priorityStats?.map((p) => ({
      name: p._id || 'Standard',
      value: p.count,
    })) || [];

  const categoryChartData =
    stats?.categoryStats?.slice(0, 5).map((c) => ({
      name: c._id.length > 15 ? `${c._id.slice(0, 15)}...` : c._id,
      count: c.count,
    })) || [];

  const COLORS = ['#C1121F', '#D98E04', '#245B8F', '#64748B'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Civic Operations Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time municipal grievance triage, SLA enforcement, and cross-department performance tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/complaints"
            className="px-4 py-2.5 rounded-xl bg-[#245B8F] hover:bg-[#19446B] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            All Grievances
          </Link>
          <Link
            to="/admin/overdue"
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" />
            Overdue Cases ({stats?.overdueCount || 0})
          </Link>
        </div>
      </div>

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Cases</span>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">
            {stats?.totalComplaints ?? 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-blue-700">New Intake</span>
          <p className="text-xl font-black text-blue-700 font-mono mt-1">
            {stats?.newComplaints ?? 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">In Progress</span>
          <p className="text-xl font-black text-sky-600 font-mono mt-1">
            {stats?.inProgressComplaints ?? 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-amber-800">Verification</span>
          <p className="text-xl font-black text-amber-700 font-mono mt-1">
            {stats?.verificationComplaints ?? 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-emerald-800">Resolved</span>
          <p className="text-xl font-black text-emerald-600 font-mono mt-1">
            {stats?.resolvedComplaints ?? 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-300 bg-red-50/40 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-red-700">Overdue</span>
          <p className="text-xl font-black text-red-600 font-mono mt-1">
            {stats?.overdueCount ?? 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-purple-700">Critical Prio</span>
          <p className="text-xl font-black text-purple-700 font-mono mt-1">
            {stats?.criticalPriorityComplaints ?? 0}
          </p>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (2 Cols) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Highest Volume Civic Categories</h3>
            <Link to="/admin/analytics" className="text-xs text-primary font-bold hover:underline">
              View Detailed Analytics →
            </Link>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#245B8F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Engine Triage (1 Col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Rule-Based Priority Ratio</h3>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {priorityPieData.map((entry, index) => {
                    let fill = COLORS[index % COLORS.length];
                    if (entry.name === 'Critical') fill = '#C1121F';
                    if (entry.name === 'High') fill = '#D98E04';
                    if (entry.name === 'Medium') fill = '#245B8F';
                    if (entry.name === 'Low') fill = '#64748B';
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {priorityPieData.map((p, idx) => (
              <div key={idx} className="flex justify-between p-1.5 rounded bg-slate-50 border border-slate-100 text-[11px]">
                <span className="text-slate-600 font-medium">{p.name}</span>
                <span className="font-mono font-bold text-slate-900">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Grievance Intake</h3>
            <p className="text-xs text-slate-400">Latest active municipal cases requiring attention</p>
          </div>
          <Link
            to="/admin/complaints"
            className="text-xs text-[#245B8F] hover:underline font-bold flex items-center gap-1"
          >
            View Complete Registry <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {stats?.recentComplaints?.map((c) => (
            <div
              key={c._id}
              className="p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {c.complaintId}
                  </span>
                  <StatusBadge status={c.status} size="sm" />
                  <PriorityBadge level={c.priorityLevel} score={c.priorityScore} showScore size="sm" />
                </div>
                <Link
                  to={`/complaints/${c._id}`}
                  className="block text-xs font-bold text-slate-900 hover:text-primary transition line-clamp-1"
                >
                  {c.title}
                </Link>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>Dept: {c.departmentId?.name || 'Unassigned'}</span>
                  <span>•</span>
                  <span>Citizen: {c.citizenId?.name || 'Anonymous'}</span>
                  <span>•</span>
                  <span>{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/complaints/${c._id}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Manage Case
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escalation Modal */}
      <Modal
        isOpen={escalateModalOpen}
        onClose={() => setEscalateModalOpen(false)}
        title={`Trigger Escalation: ${escalatingComplaint?.complaintId}`}
      >
        <form onSubmit={handleEscalateSubmit} className="space-y-4">
          <p className="text-xs text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
            Escalation marks this grievance as an emergency directive and flags the assigned department leadership.
          </p>

          {escalateError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {escalateError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Directive & Justification *
            </label>
            <textarea
              required
              rows={3}
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              placeholder="State reason for escalating to senior municipal review..."
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
              disabled={escalating}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              {escalating ? 'Escalating...' : 'Confirm Escalation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
