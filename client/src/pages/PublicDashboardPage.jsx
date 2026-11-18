import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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
  Shield,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { MapView } from '../components/MapView';

export const PublicDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/public/statistics');
      if (res.data.success) {
        setStats(res.data.stats);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed to load public statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const COLORS = ['#0F1E36', '#245B8F', '#15803D', '#B45309', '#A6192E', '#475569'];

  const categoryChartData =
    stats?.categoryDistribution?.map((cat) => ({
      name: cat._id || 'Uncategorized',
      Total: cat.count,
      Resolved: cat.resolved,
    })) || [];

  const departmentChartData =
    stats?.departmentPerformance?.map((dept) => ({
      name: dept.code,
      fullName: dept.name,
      Assigned: dept.total,
      Resolved: dept.resolved,
      Rate: `${dept.rate}%`,
    })) || [];

  const priorityPieData =
    stats?.priorityDistribution?.map((p) => ({
      name: p._id || 'Standard',
      value: p.count,
    })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Public Civic Accountability Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Live, tamper-resistant metrics retrieved directly from the JANSETU municipal database.
            Demonstrating civic throughput, department accountability, and SLA compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-[11px] text-slate-400 hidden sm:block">
            <span>Last Synced:</span>
            <p className="font-mono text-slate-600">{lastRefreshed.toLocaleTimeString('en-IN')}</p>
          </div>
          <button
            type="button"
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Complaints</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {stats?.totalSubmitted ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Logged civic cases</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Confirmed Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
            {stats?.totalResolved ?? 0}
          </p>
          <span className="text-[11px] text-emerald-700 mt-1 block font-medium">
            {stats?.resolutionRate ?? 0}% overall redressal rate
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Active</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
            {stats?.pending ?? 0}
          </p>
          <span className="text-[11px] text-amber-700 mt-1 block">In progress or verification</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Resolution Time</span>
            <Clock className="w-4 h-4 text-[#245B8F]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#245B8F] font-mono">
            {stats?.avgResolutionHours ?? 0}
            <span className="text-sm font-normal text-slate-500 ml-1">hours</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Measured from filing to resolution</span>
        </div>
      </div>

      {/* Row 1: Category Distribution & Priority Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (2 Cols) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Complaints by Civic Category</h3>
              <p className="text-xs text-slate-500">Total submitted vs verified resolved cases</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">
              Database Live
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }} />
                <Bar dataKey="Total" fill="#245B8F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Resolved" fill="#16865B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown (1 Col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Priority Triage Breakdown</h3>
            <p className="text-xs text-slate-500">Calculated by rule-based engine</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
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
            {priorityPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-700">{item.name}</span>
                <span className="font-mono font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Department Performance & Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Department Redressal Rate</h3>
              <p className="text-xs text-slate-500">Assigned workload vs completed resolutions</p>
            </div>
            <Building2 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, name, item) => [value, `${name} (${item.payload.fullName})`]}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Assigned" fill="#3D78B2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Resolved" fill="#16865B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Complaint Trends */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Monthly Registration & Resolution Trend</h3>
            <p className="text-xs text-slate-500">Historical velocity over recent months</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.monthlyTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
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
                <Line type="monotone" dataKey="submitted" stroke="#C1121F" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="resolved" stroke="#16865B" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Geographic Distribution Map */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Geographic Grievance Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated municipal clusters. Specific resident identities and private phone numbers remain protected.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {stats?.geoPoints?.length || 0} geocoded reports
          </span>
        </div>

        <MapView points={stats?.geoPoints || []} height="h-80" zoom={12} />
      </div>
    </div>
  );
};
