import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Building2,
  AlertTriangle,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';

export const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedDept, setSelectedDept] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [departmentOfficials, setDepartmentOfficials] = useState([]);
  const [selectedOfficial, setSelectedOfficial] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (deptFilter) params.departmentId = deptFilter;
      if (priorityFilter) params.priorityLevel = priorityFilter;
      if (overdueOnly) params.isOverdue = 'true';
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/complaints', { params });
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficials = async (deptId) => {
    if (!deptId) { setDepartmentOfficials([]); return; }
    try {
      const res = await api.get(`/departments/${deptId}/officials`);
      if (res.data.success) setDepartmentOfficials(res.data.officials || []);
    } catch (err) {
      console.error('Error fetching officials:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.departments || []);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, deptFilter, priorityFilter, overdueOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedDept(complaint.departmentId?._id || '');
    setSelectedOfficial('');
    setDepartmentOfficials([]);
    setAssignRemarks('');
    setAssignModalOpen(true);
    if (complaint.departmentId?._id) fetchOfficials(complaint.departmentId._id);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDept || !selectedComplaint) return;
    try {
      setAssigning(true);
      const res = await api.patch(`/complaints/${selectedComplaint._id}/assign`, {
        departmentId: selectedDept,
        officialId: selectedOfficial || undefined,
        remarks: assignRemarks,
      });
      if (res.data.success) {
        setAssignModalOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Assignment failed.');
    } finally {
      setAssigning(false);
    }
  };

  const categories = [
    'Roads and potholes',
    'Water supply and leakage',
    'Garbage and sanitation',
    'Drainage and sewage',
    'Streetlights and electricity',
    'Public infrastructure',
    'Other civic issues',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            All Civic Complaints & Triage
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter by SLA status, assign to competent departments, and monitor resolution deadlines.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchComplaints}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, keyword, citizen address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#245B8F] text-white text-xs font-bold rounded-xl hover:bg-[#19446B] transition shrink-0"
          >
            Search
          </button>
        </form>

        {/* Multi Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER REVIEW">Under Review</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="CITIZEN VERIFICATION">Citizen Verification</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REOPENED">Reopened</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Department
            </label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Priority Level
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-red-700 bg-red-50 p-2 rounded-lg border border-red-200 w-full justify-center">
              <input
                type="checkbox"
                checked={overdueOnly}
                onChange={(e) => setOverdueOnly(e.target.checked)}
                className="rounded border-red-300 text-red-600 focus:ring-red-500"
              />
              <span>Overdue Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Complaints Grid/Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center text-xs text-slate-500">
          <span>
            Showing <strong>{complaints.length}</strong> complaints
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <Clock className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
            Loading registry...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No matching grievances found</p>
            <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <div
                key={c._id}
                className="p-5 hover:bg-slate-50/80 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
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
                    className="block text-sm font-bold text-slate-900 hover:text-primary transition line-clamp-1"
                  >
                    {c.title}
                  </Link>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {c.departmentId?.name || 'Unassigned Department'}
                    </span>
                    <span>•</span>
                    <span>Citizen: {c.citizenId?.name || 'Citizen'}</span>
                    <span>•</span>
                    <span>{c.location?.city}</span>
                    <span>•</span>
                    <span>{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openAssignModal(c)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-primary text-slate-700 text-xs font-semibold hover:bg-slate-100 transition flex items-center gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Assign
                  </button>
                  <Link
                    to={`/complaints/${c._id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    Manage
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fast Assignment Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Department: ${selectedComplaint?.complaintId}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Department *
            </label>
            <select
              required
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedOfficial('');
                fetchOfficials(e.target.value);
              }}
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary"
            >
              <option value="">-- Choose Department --</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assign Specific Official (Optional)
            </label>
            <select
              value={selectedOfficial}
              onChange={(e) => setSelectedOfficial(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary"
            >
              <option value="">-- Department Pool (No specific official) --</option>
              {departmentOfficials.map((off) => (
                <option key={off._id} value={off._id}>
                  {off.name} — {off.designation || 'Official'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Directive / Remarks
            </label>
            <textarea
              rows={2}
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
              placeholder="Internal work directive notes..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assigning || !selectedDept}
              className="px-5 py-2 text-xs font-bold text-white bg-[#245B8F] hover:bg-[#19446B] rounded-lg transition disabled:opacity-50"
            >
              {assigning ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
