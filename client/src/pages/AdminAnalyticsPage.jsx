import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';

export const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/analytics');
      if (res.data.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const departmentPerformance = analytics?.departmentPerformance || [];
  const monthlyTrends = analytics?.monthlyTrends || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Operational Analytics & Turnaround Times
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Auditing departmental turnaround velocity, overdue rates, and monthly civic volume.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Recalculate
        </button>
      </div>

      {/* Department Scorecard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            Department Performance & Resolution Velocity
          </h3>
          <p className="text-xs text-slate-400">
            Evaluation metrics computed from live database history
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Assigned</th>
                <th className="py-3 px-4 text-center">Resolved</th>
                <th className="py-3 px-4 text-center">Overdue</th>
                <th className="py-3 px-4 text-center">Resolution Rate</th>
                <th className="py-3 px-4 text-right">Avg Turnaround</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departmentPerformance.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span>{dept.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({dept.code})</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">{dept.assigned}</td>
                  <td className="py-3.5 px-4 text-center font-mono text-emerald-600 font-bold">
                    {dept.resolved}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">
                    {dept.overdue > 0 ? (
                      <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">
                        {dept.overdue}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        dept.resolutionRate >= 75
                          ? 'bg-emerald-50 text-emerald-700'
                          : dept.resolutionRate >= 40
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {dept.resolutionRate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#245B8F]">
                    {dept.avgResolutionHours} hrs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Intake vs Resolution Trend */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Monthly Grievance Intake vs Verified Resolution
          </h3>
          <p className="text-xs text-slate-500">Historical trend across all city wards</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                name="Intake Submitted"
                type="monotone"
                dataKey="submitted"
                stroke="#C1121F"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                name="Confirmed Resolved"
                type="monotone"
                dataKey="resolved"
                stroke="#16865B"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
