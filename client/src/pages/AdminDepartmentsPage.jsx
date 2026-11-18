import React, { useState, useEffect } from 'react';
import { Building2, Users, Mail, Phone, Plus, Pencil, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { Modal } from '../components/Modal';

export const AdminDepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', code: '', description: '', contactEmail: '', contactPhone: '' });
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', contactEmail: '', contactPhone: '' });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      if (res.data.success) setDepartments(res.data.departments || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setCreateSubmitting(true);
      setCreateError('');
      const res = await api.post('/departments', newDept);
      if (res.data.success) {
        setCreateModalOpen(false);
        setNewDept({ name: '', code: '', description: '', contactEmail: '', contactPhone: '' });
        fetchDepartments();
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create department.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setEditForm({
      name: dept.name,
      description: dept.description || '',
      contactEmail: dept.contactEmail || '',
      contactPhone: dept.contactPhone || '',
    });
    setEditError('');
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingDept) return;
    try {
      setEditSubmitting(true);
      setEditError('');
      const res = await api.patch(`/departments/${editingDept._id}`, editForm);
      if (res.data.success) {
        setEditModalOpen(false);
        fetchDepartments();
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update department.');
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Municipal Departments & Divisions ({departments.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Administrative wings responsible for urban civic infrastructure operations.
          </p>
        </div>
        <button type="button" onClick={() => { setCreateError(''); setCreateModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-[#245B8F] hover:bg-[#19446B] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-sm">Loading departments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((d) => (
            <div key={d._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-primary bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{d.code}</span>
                  <h3 className="font-bold text-base text-slate-900 mt-1.5">{d.name}</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => openEditModal(d)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition" title="Edit Department">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed min-h-12">
                {d.description || 'Public municipal works division.'}
              </p>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Assigned</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{d.totalAssigned || 0}</span>
                </div>
                <div className="bg-emerald-50 p-2 rounded-lg">
                  <span className="text-[10px] text-emerald-700 font-bold block uppercase">Resolved</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">{d.resolvedCount || 0}</span>
                </div>
                <div className="bg-amber-50 p-2 rounded-lg">
                  <span className="text-[10px] text-amber-700 font-bold block uppercase">Active</span>
                  <span className="font-mono font-bold text-amber-700 text-sm">{d.pendingCount || 0}</span>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{d.officials?.length || 0} official(s)</span>
                </div>
                {d.contactEmail && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{d.contactEmail}</span>
                  </div>
                )}
                {d.contactPhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{d.contactPhone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dept Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Municipal Department">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">{createError}</div>}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
            <input type="text" required value={newDept.name}
              onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
              placeholder="e.g. Parks and Horticulture"
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Unique Code *</label>
            <input type="text" required value={newDept.code}
              onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
              placeholder="e.g. PARKS"
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary font-mono uppercase" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea rows={2} value={newDept.description}
              onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
              placeholder="Scope of work and responsibilities..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
              <input type="email" value={newDept.contactEmail}
                onChange={(e) => setNewDept({ ...newDept, contactEmail: e.target.value })}
                placeholder="dept@jansetu.gov.in"
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Helpline Phone</label>
              <input type="text" value={newDept.contactPhone}
                onChange={(e) => setNewDept({ ...newDept, contactPhone: e.target.value })}
                placeholder="+91 11 ..."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={createSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#245B8F] hover:bg-[#19446B] rounded-lg transition disabled:opacity-50">
              {createSubmitting ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Dept Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit: ${editingDept?.name}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {editError && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">{editError}</div>}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
            <input type="text" required value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea rows={2} value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
              <input type="email" value={editForm.contactEmail}
                onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Helpline Phone</label>
              <input type="text" value={editForm.contactPhone}
                onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={editSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#245B8F] hover:bg-[#19446B] rounded-lg transition disabled:opacity-50">
              {editSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
