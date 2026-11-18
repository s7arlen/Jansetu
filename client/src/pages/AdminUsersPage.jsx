import React, { useState, useEffect } from 'react';
import { Users, Shield, User, Mail, Phone, Building2, Search, Plus, KeyRound, Briefcase } from 'lucide-react';
import api from '../services/api';
import { Modal } from '../components/Modal';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  // Create user modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'official',
    departmentId: '',
    designation: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter) params.role = roleFilter;
      const res = await api.get('/admin/users', { params });
      if (res.data.success) setUsers(res.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data.success) setDepartments(res.data.departments || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  });

  const openCreateModal = () => {
    setNewUser({ name: '', email: '', password: '', phone: '', role: 'official', departmentId: '', designation: '' });
    setModalError('');
    setModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      setModalError('Name, email, and password are required.');
      return;
    }
    if (newUser.role === 'official' && !newUser.departmentId) {
      setModalError('Select a department for the official.');
      return;
    }
    try {
      setSubmitting(true);
      setModalError('');
      const res = await api.post('/admin/users', newUser);
      if (res.data.success) {
        setModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Registered Citizens & Municipal Officials
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Overview of authenticated citizens, department engineers, and administrative staff.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#245B8F] hover:bg-[#19446B] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Official
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {[['', 'All Roles'], ['citizen', 'Citizens'], ['official', 'Officials'], ['admin', 'Admins']].map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setRoleFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                roleFilter === val ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Assigned Department</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4 text-right">Registration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">No users found.</td></tr>
              ) : filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center uppercase text-xs shrink-0">
                        {u.name ? u.name[0] : 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                        {u.designation && <p className="text-[11px] text-slate-500 italic">{u.designation}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-semibold uppercase text-[10px] tracking-wider ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-800'
                      : u.role === 'official' ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {u.departmentId?.name ? (
                      <span className="font-medium text-slate-700">{u.departmentId.name} ({u.departmentId.code})</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{u.phone || '—'}</td>
                  <td className="py-3 px-4 text-right text-slate-400 font-mono">
                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Official / Admin Account">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">{modalError}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input type="text" required value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Er. Rajesh Kumar"
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input type="email" required value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="official@jansetu.gov.in"
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
              <input type="password" required value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Min 6 characters"
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input type="tel" value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                placeholder="+91 98..."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
              <select value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value, departmentId: '' })}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary">
                <option value="official">Department Official</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
              <input type="text" value={newUser.designation}
                onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
                placeholder="e.g. Senior Engineer"
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary" />
            </div>

            {newUser.role === 'official' && (
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                <select required value={newUser.departmentId}
                  onChange={(e) => setNewUser({ ...newUser, departmentId: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary">
                  <option value="">-- Select Department --</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#245B8F] hover:bg-[#19446B] rounded-lg transition disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
