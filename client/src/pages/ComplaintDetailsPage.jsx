import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  MapPin,
  Calendar,
  AlertOctagon,
  ArrowLeft,
  Upload,
  UserCheck,
  Send,
  ShieldCheck,
  RotateCcw,
  FileCheck2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Timeline } from '../components/Timeline';
import { MapView } from '../components/MapView';
import { Modal } from '../components/Modal';

export const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isOfficial, isCitizen } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentOfficials, setDepartmentOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  // Form states
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedOfficial, setSelectedOfficial] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');

  const [newPriority, setNewPriority] = useState('High');
  const [overrideReason, setOverrideReason] = useState('');

  const [escalateReason, setEscalateReason] = useState('');

  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [afterImageFile, setAfterImageFile] = useState(null);
  const [afterImagePreview, setAfterImagePreview] = useState(null);

  const [verifyAction, setVerifyAction] = useState('CONFIRM');
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
        setHistory(res.data.history || []);
        if (res.data.complaint.departmentId) {
          setSelectedDept(res.data.complaint.departmentId._id || res.data.complaint.departmentId);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load grievance dossier.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    if (!isAdmin) return;
    try {
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.departments || []);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchOfficials = async (deptId) => {
    if (!deptId) {
      setDepartmentOfficials([]);
      return;
    }
    try {
      const res = await api.get(`/departments/${deptId}/officials`);
      if (res.data.success) {
        setDepartmentOfficials(res.data.officials || []);
      }
    } catch (err) {
      console.error('Error fetching officials:', err);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
    if (isAdmin) {
      fetchDepartments();
    }
  }, [id, isAdmin]);

  useEffect(() => {
    if (selectedDept) {
      fetchOfficials(selectedDept);
    }
  }, [selectedDept]);

  // Handle Admin Assign
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setModalError('');
      const res = await api.patch(`/complaints/${complaint._id}/assign`, {
        departmentId: selectedDept,
        officialId: selectedOfficial || null,
        remarks: assignRemarks,
      });
      if (res.data.success) {
        setAssignModalOpen(false);
        fetchComplaintDetails();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Assignment failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Admin Priority Override
  const handlePriorityOverride = async (e) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      setModalError('A documented justification reason is required for audit logs.');
      return;
    }
    try {
      setActionLoading(true);
      setModalError('');
      const res = await api.patch(`/complaints/${complaint._id}/priority`, {
        priorityLevel: newPriority,
        reason: overrideReason,
      });
      if (res.data.success) {
        setPriorityModalOpen(false);
        fetchComplaintDetails();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Override failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Admin Escalation
  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!escalateReason.trim()) {
      setModalError('Escalation reason is required.');
      return;
    }
    try {
      setActionLoading(true);
      setModalError('');
      const res = await api.post('/admin/escalate', {
        complaintId: complaint._id,
        reason: escalateReason,
      });
      if (res.data.success) {
        setEscalateModalOpen(false);
        fetchComplaintDetails();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Escalation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Official Status Transition (Accept assignment)
  const handleStartWork = async () => {
    try {
      setActionLoading(true);
      const res = await api.patch(`/complaints/${complaint._id}/status`, {
        status: 'IN PROGRESS',
        remarks: `Work commenced by ${user.name} (${user.department?.name || 'Department'}).`,
      });
      if (res.data.success) {
        fetchComplaintDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Official Evidence Submission
  const handleEvidenceSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionRemarks.trim()) {
      setModalError('Completion description is required.');
      return;
    }
    try {
      setActionLoading(true);
      setModalError('');
      const formData = new FormData();
      formData.append('resolutionRemarks', resolutionRemarks);
      if (afterImageFile) {
        formData.append('afterImage', afterImageFile);
      }

      const res = await api.post(`/complaints/${complaint._id}/evidence`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setEvidenceModalOpen(false);
        fetchComplaintDetails();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Evidence submission failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Citizen Verification (Confirm or Reject)
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setModalError('');
      const res = await api.post(`/complaints/${complaint._id}/verify`, {
        action: verifyAction,
        rating: verifyAction === 'CONFIRM' ? rating : undefined,
        comment: verifyAction === 'CONFIRM' ? feedbackComment : undefined,
        rejectionReason: verifyAction === 'REJECT' ? rejectionReason : undefined,
      });

      if (res.data.success) {
        setVerifyModalOpen(false);
        fetchComplaintDetails();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Verification update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500">
        <Clock className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
        Loading grievance dossier...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Access Restricted or Dossier Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'Grievance could not be retrieved.'}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  const isOwnerCitizen = isCitizen && complaint.citizenId?._id === user?._id;
  const isAssignedOfficial =
    isOfficial &&
    user?.departmentId &&
    complaint.departmentId?._id?.toString() === user.departmentId.toString();

  const isVerificationState =
    complaint.status === 'CITIZEN VERIFICATION' || complaint.status === 'RESOLUTION SUBMITTED';

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-base font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                {complaint.complaintId}
              </span>
              <StatusBadge status={complaint.status} size="lg" />
              <PriorityBadge
                level={complaint.priorityLevel}
                score={complaint.priorityScore}
                showScore
                size="md"
              />
              {complaint.isOverdue && (
                <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-full border border-red-200">
                  OVERDUE
                </span>
              )}
              {complaint.isEscalated && (
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300 flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5 text-amber-700" />
                  ESCALATED (Level {complaint.escalationDetails?.level || 1})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Registered on {new Date(complaint.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Action Controls Bar based on Role */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Admin Controls */}
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => setAssignModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-[#245B8F] hover:bg-[#19446B] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <UserCheck className="w-4 h-4" />
                Assign Department
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewPriority(complaint.priorityLevel);
                  setOverrideReason('');
                  setPriorityModalOpen(true);
                }}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Override Priority
              </button>

              <button
                type="button"
                onClick={() => {
                  setEscalateReason('');
                  setEscalateModalOpen(true);
                }}
                className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold transition flex items-center gap-1"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                Escalate
              </button>
            </>
          )}

          {/* Official Controls */}
          {isAssignedOfficial && (
            <>
              {complaint.status === 'ASSIGNED' && (
                <button
                  type="button"
                  onClick={handleStartWork}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Clock className="w-4 h-4" />
                  {actionLoading ? 'Updating...' : 'Accept & Start Repair'}
                </button>
              )}

              {complaint.status === 'IN PROGRESS' && (
                <button
                  type="button"
                  onClick={() => {
                    setResolutionRemarks('');
                    setAfterImageFile(null);
                    setAfterImagePreview(null);
                    setEvidenceModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  Submit Resolution Evidence
                </button>
              )}
            </>
          )}

          {/* Citizen Verification Control */}
          {isOwnerCitizen && isVerificationState && (
            <button
              type="button"
              onClick={() => {
                setVerifyAction('CONFIRM');
                setRating(5);
                setFeedbackComment('');
                setRejectionReason('');
                setVerifyModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs animate-bounce"
            >
              <ShieldCheck className="w-4 h-4" />
              Verify Resolution
            </button>
          )}
        </div>
      </div>

      {/* Main Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dossier Content (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Content Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Category: {complaint.category}
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">{complaint.title}</h2>
              <p className="text-sm text-slate-700 mt-3 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                {complaint.description}
              </p>
            </div>

            {/* Public Institution Banner */}
            {complaint.isPublicInstitutionAffected && (
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-purple-700 shrink-0" />
                <div>
                  <span className="font-bold">Public Institution Impact Noted: </span>
                  <span>
                    {complaint.publicInstitutionDetails || 'Directly affects nearby school/hospital'}
                  </span>
                </div>
              </div>
            )}

            {/* Priority Rules Factors */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  Transparent Rule-Based Factors:
                </span>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {complaint.priorityScore} Total Points
                </span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1">
                {complaint.priorityFactors?.map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              {complaint.priorityOverridden?.isOverridden && (
                <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-amber-800 bg-amber-50/80 p-2 rounded">
                  <strong>Priority Override:</strong> Changed from{' '}
                  {complaint.priorityOverridden.previousLevel} to{' '}
                  {complaint.priorityOverridden.newLevel}. Reason:{' '}
                  <em>"{complaint.priorityOverridden.reason}"</em>
                </div>
              )}
            </div>

            {/* Photographic Evidence: Before & After */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Photographic Verification
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before Photo */}
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  <div className="p-2.5 bg-slate-100 text-xs font-semibold text-slate-700 flex justify-between">
                    <span>Incident Condition (Before)</span>
                    <span className="text-[10px] text-slate-400">Citizen Upload</span>
                  </div>
                  {complaint.beforeImage ? (
                    <img
                      src={complaint.beforeImage}
                      alt="Before repair"
                      className="w-full h-52 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-52 flex items-center justify-center text-xs text-slate-400">
                      No initial photograph provided
                    </div>
                  )}
                </div>

                {/* After Photo */}
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  <div className="p-2.5 bg-slate-100 text-xs font-semibold text-slate-700 flex justify-between">
                    <span>Restoration Evidence (After)</span>
                    <span className="text-[10px] text-emerald-700 font-bold">Official Evidence</span>
                  </div>
                  {complaint.afterImage ? (
                    <div>
                      <img
                        src={complaint.afterImage}
                        alt="After repair"
                        className="w-full h-52 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      {complaint.resolutionRemarks && (
                        <p className="p-3 text-xs text-slate-700 italic border-t border-slate-200 bg-white">
                          "{complaint.resolutionRemarks}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="h-52 flex flex-col items-center justify-center text-xs text-slate-400 p-4 text-center">
                      <Clock className="w-6 h-6 text-slate-300 mb-1" />
                      Awaiting completion photograph from field official
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Citizen Feedback Banner if Resolved */}
            {complaint.citizenFeedback?.rating && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between text-emerald-900 font-bold">
                  <span>Citizen Confirmation & Rating</span>
                  <span>{'⭐'.repeat(complaint.citizenFeedback.rating)} ({complaint.citizenFeedback.rating}/5)</span>
                </div>
                {complaint.citizenFeedback.comment && (
                  <p className="text-emerald-800 italic">
                    "{complaint.citizenFeedback.comment}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Audit History Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <Timeline history={history} currentStatus={complaint.status} />
          </div>
        </div>

        {/* Right Column: Metadata, Assignment & Location (1 col) */}
        <div className="space-y-6">
          {/* Assignment & Department Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Administrative Assignment
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Designated Department:</span>
                <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-4 h-4 text-primary" />
                  {complaint.departmentId?.name || 'Unassigned'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Lead Official:</span>
                <p className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <User className="w-4 h-4 text-slate-500" />
                  {complaint.assignedOfficialId?.name || 'Pending assignment'}
                </p>
                {complaint.assignedOfficialId?.designation && (
                  <p className="text-[11px] text-slate-400 ml-5.5">
                    {complaint.assignedOfficialId.designation}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 font-medium">Target Resolution SLA:</span>
                <p className="font-bold text-amber-700 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-4 h-4" />
                  {complaint.targetResolutionHours} Hours Target
                </p>
                {complaint.deadline && (
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Deadline: {new Date(complaint.deadline).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Citizen Reporter Card (Protected) */}
          {(isAdmin || isOfficial || isOwnerCitizen) && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Complainant Details
              </h3>
              <div className="text-xs space-y-2">
                <div>
                  <span className="text-slate-400">Reporter:</span>
                  <p className="font-bold text-slate-800">{complaint.citizenId?.name || 'Citizen'}</p>
                </div>
                {complaint.citizenId?.phone && (
                  <div>
                    <span className="text-slate-400">Phone:</span>
                    <p className="font-mono text-slate-800">{complaint.citizenId.phone}</p>
                  </div>
                )}
                <div>
                  <span className="text-slate-400">Email:</span>
                  <p className="text-slate-600 truncate">{complaint.citizenId?.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Location & Map */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              Incident Location
            </h3>

            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-800">{complaint.location?.address}</p>
              {complaint.location?.landmark && (
                <p className="text-slate-500">Landmark: {complaint.location.landmark}</p>
              )}
              <p className="text-slate-500 font-mono text-[11px]">
                {complaint.location?.city} • Lat: {complaint.location?.latitude?.toFixed(4)}, Lng: {complaint.location?.longitude?.toFixed(4)}
              </p>
            </div>

            {complaint.location?.latitude && (
              <MapView
                singlePoint={{
                  latitude: complaint.location.latitude,
                  longitude: complaint.location.longitude,
                  title: complaint.title,
                  address: complaint.location.address,
                }}
                height="h-56"
                zoom={14}
              />
            )}
          </div>
        </div>
      </div>

      {/* Admin Assignment Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Department & Official"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {modalError}
            </div>
          )}

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
              }}
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary"
            >
              <option value="">-- Choose Municipal Department --</option>
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
              <option value="">-- Department Pool / Unassigned Official --</option>
              {departmentOfficials.map((off) => (
                <option key={off._id} value={off._id}>
                  {off.name} - {off.designation || 'Engineer'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Directive / Assignment Remarks
            </label>
            <textarea
              rows={2}
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
              placeholder="e.g. Inspect site immediately; repair scheduled for afternoon shift."
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
              disabled={actionLoading || !selectedDept}
              className="px-5 py-2 text-xs font-bold text-white bg-[#245B8F] hover:bg-[#19446B] rounded-lg transition disabled:opacity-50"
            >
              {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Admin Priority Override Modal */}
      <Modal
        isOpen={priorityModalOpen}
        onClose={() => setPriorityModalOpen(false)}
        title="Administrative Priority Override"
      >
        <form onSubmit={handlePriorityOverride} className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Rule-based priority scoring can be overridden by authorized administrators. All overrides
            require a recorded justification and are preserved in the permanent audit trail.
          </p>

          {modalError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Priority Level *
            </label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary"
            >
              <option value="Critical">Critical (6 Hours SLA Target)</option>
              <option value="High">High (24 Hours SLA Target)</option>
              <option value="Medium">Medium (48 Hours SLA Target)</option>
              <option value="Low">Low (72 Hours SLA Target)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mandatory Justification Reason *
            </label>
            <textarea
              required
              rows={3}
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="e.g. VIP convoy route passage, secondary water line inspection, or heightened local safety alert..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPriorityModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
            >
              {actionLoading ? 'Recording...' : 'Apply Override'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Admin Escalation Modal */}
      <Modal
        isOpen={escalateModalOpen}
        onClose={() => setEscalateModalOpen(false)}
        title="Escalate Grievance to Senior Oversight"
      >
        <form onSubmit={handleEscalateSubmit} className="space-y-4">
          <p className="text-xs text-red-700 bg-red-50 p-3 rounded-lg border border-red-200 leading-relaxed">
            Escalation triggers immediate red-flag alerts to the municipal commissioner and department head.
          </p>

          {modalError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Escalation Cause & Directive *
            </label>
            <textarea
              required
              rows={3}
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              placeholder="e.g. Past target resolution deadline without field updates; urgent student pedestrian safety risk."
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
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              {actionLoading ? 'Escalating...' : 'Trigger Escalation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Resolution Evidence Submission Modal */}
      <Modal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        title="Submit Field Completion Evidence"
      >
        <form onSubmit={handleEvidenceSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Work Description *
            </label>
            <textarea
              required
              rows={3}
              value={resolutionRemarks}
              onChange={(e) => setResolutionRemarks(e.target.value)}
              placeholder="Explain technical work completed (e.g. 4.5 sqm cold-mix asphalt paved and roller compacted, valve pressure normalized to 4 bar)..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Upload Restored Site Photograph (After)
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

          <p className="text-[11px] text-slate-500">
            Note: Submitting this form moves the case into <strong>Citizen Verification</strong>. The citizen will inspect the photograph and confirm resolution.
          </p>

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
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
            >
              {actionLoading ? 'Uploading...' : 'Submit Resolution'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Citizen Verification Modal */}
      <Modal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        title="Citizen Verification & Sign-off"
      >
        <form onSubmit={handleVerifySubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Does the photographic evidence and field remediation meet your satisfaction?
          </p>

          {modalError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {modalError}
            </div>
          )}

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
              <span className="text-xs font-bold">Confirm Resolution</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Problem resolved</p>
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
              <RotateCcw className="w-5 h-5 mx-auto mb-1 text-red-600" />
              <span className="text-xs font-bold">Dispute & Reopen</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Inadequate work</p>
            </button>
          </div>

          {verifyAction === 'CONFIRM' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rate Service Quality
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5) - Excellent</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5) - Good</option>
                  <option value={3}>⭐⭐⭐ (3/5) - Satisfactory</option>
                  <option value={2}>⭐⭐ (2/5) - Needs Improvement</option>
                  <option value={1}>⭐ (1/5) - Unsatisfactory</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Citizen Comments
                </label>
                <textarea
                  rows={2}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="E.g. Thoroughly repaired. Thank you!"
                  className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-red-700">
                Reason for Reopening Complaint *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Describe why the issue remains unresolved..."
                className="w-full p-2 text-xs rounded-lg border border-red-300 focus:outline-none focus:border-red-500 bg-red-50/20"
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
              disabled={actionLoading}
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg transition ${
                verifyAction === 'CONFIRM'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {actionLoading
                ? 'Processing...'
                : verifyAction === 'CONFIRM'
                ? 'Confirm & Resolve'
                : 'Reopen Grievance'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
