import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Upload,
  MapPin,
  ShieldAlert,
  Info,
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
  Scale,
  Camera,
  Shield,
} from 'lucide-react';
import api from '../services/api';
import { MapPicker } from '../components/MapPicker';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';

export const SubmitComplaintPage = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'Roads and potholes';

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: initialCategory,
    severity: 'Medium',
    isPublicInstitutionAffected: false,
    publicInstitutionDetails: '',
    address: '',
    landmark: '',
    city: 'Municipal Area',
    pincode: '',
    latitude: 28.6139,
    longitude: 77.2090,
  });

  const [beforeImage, setBeforeImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Success Modal
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdComplaint, setCreatedComplaint] = useState(null);

  const categories = [
    'Roads and potholes',
    'Water supply and leakage',
    'Garbage and sanitation',
    'Drainage and sewage',
    'Streetlights and electricity',
    'Public infrastructure',
    'Other civic issues',
  ];

  const categoryDeptMap = {
    'Roads and potholes': 'Roads and Infrastructure',
    'Water supply and leakage': 'Water Supply',
    'Garbage and sanitation': 'Sanitation',
    'Drainage and sewage': 'Drainage Department',
    'Streetlights and electricity': 'Electrical Department',
    'Public infrastructure': 'Roads and Infrastructure',
    'Other civic issues': 'General Administration',
  };

  // Rule-based live preview calculation
  const calculatePreviewPriority = () => {
    let score = 0;
    const factors = [];

    if (formData.severity === 'Critical') {
      score += 40;
      factors.push('Critical Safety Risk (+40 pts)');
    } else if (formData.severity === 'High') {
      score += 30;
      factors.push('High Severity (+30 pts)');
    } else if (formData.severity === 'Medium') {
      score += 20;
      factors.push('Medium Severity (+20 pts)');
    } else {
      score += 10;
      factors.push('Low Severity (+10 pts)');
    }

    if (formData.isPublicInstitutionAffected) {
      score += 20;
      factors.push('Public Institution Proximity (+20 pts)');
    }

    let level = 'Low';
    let targetHours = 72;
    if (score >= 50) {
      level = 'Critical';
      targetHours = 6;
    } else if (score >= 35) {
      level = 'High';
      targetHours = 24;
    } else if (score >= 20) {
      level = 'Medium';
      targetHours = 48;
    }

    return { score, level, factors, targetHours };
  };

  const preview = calculatePreviewPriority();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be under 5MB.');
        return;
      }
      setBeforeImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.address) {
      setError('Please provide a title, detailed description, and street address.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const submission = new FormData();
      submission.append('title', formData.title);
      submission.append('description', formData.description);
      submission.append('category', formData.category);
      submission.append('severity', formData.severity);
      submission.append(
        'isPublicInstitutionAffected',
        formData.isPublicInstitutionAffected
      );
      submission.append(
        'publicInstitutionDetails',
        formData.publicInstitutionDetails
      );
      submission.append('address', formData.address);
      submission.append('landmark', formData.landmark);
      submission.append('city', formData.city);
      submission.append('pincode', formData.pincode);
      submission.append('latitude', formData.latitude);
      submission.append('longitude', formData.longitude);

      if (beforeImage) {
        submission.append('beforeImage', beforeImage);
      }

      const res = await api.post('/complaints', submission, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setCreatedComplaint(res.data.complaint);
        setSuccessModalOpen(true);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit grievance. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <span className="text-xs uppercase font-bold tracking-widest text-[#245B8F]">
          Civic Incident Reporting
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
          Submit Citizen Grievance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Provide accurate details and photos. The system transparently assesses priority and assigns the competent department.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Issue Classification */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="text-sm font-bold text-slate-900">Incident Details & Severity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Civic Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary font-medium"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-primary" />
                Auto-assigned to: <strong>{categoryDeptMap[formData.category]}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hazard Severity *
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleInputChange}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary font-medium"
              >
                <option value="Low">Low - Minor cosmetic or non-obstructive issue</option>
                <option value="Medium">Medium - Regular civic defect causing inconvenience</option>
                <option value="High">High - Impeding traffic, health risk, or water loss</option>
                <option value="Critical">Critical - Imminent physical injury or life-safety risk</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Grievance Headline / Title *
            </label>
            <input
              type="text"
              required
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Deep crater pothole opposite St. Xavier school main gate"
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description of Problem *
            </label>
            <textarea
              required
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the nature of problem, size, duration, and consequences..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary leading-relaxed"
            />
          </div>

          {/* Public Institution Checkbox */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isPublicInstitutionAffected"
                checked={formData.isPublicInstitutionAffected}
                onChange={handleInputChange}
                className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800">
                  Public Institution Proximity (School, Hospital, Metro Station)
                </span>
                <p className="text-slate-500 mt-0.5">
                  Check if this hazard directly impacts patients, schoolchildren, or mass transit pedestrians (+20 priority rule).
                </p>
              </div>
            </label>

            {formData.isPublicInstitutionAffected && (
              <div>
                <input
                  type="text"
                  name="publicInstitutionDetails"
                  value={formData.publicInstitutionDetails}
                  onChange={handleInputChange}
                  placeholder="Specify institution name (e.g. Apollo Clinic, Govt High School, Central Metro)"
                  className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary bg-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Live Rule-Based Priority Card */}
        <div className="bg-[#0F1E36] text-white p-5 rounded-xl border border-slate-700/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Rule-Based Triage Assessment Preview
              </span>
            </div>
            <PriorityBadge level={preview.level} score={preview.score} showScore size="sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2 border-t border-slate-700">
            <div>
              <span className="text-slate-400">Calculated Priority Score:</span>
              <p className="text-xl font-black font-mono text-white mt-0.5">
                {preview.score} <span className="text-xs font-normal text-slate-400">pts</span>
              </p>
            </div>
            <div>
              <span className="text-slate-400">Mandated Resolution Window:</span>
              <p className="text-xl font-black font-mono text-amber-400 mt-0.5">
                {preview.targetHours} Hours
              </p>
            </div>
            <div>
              <span className="text-slate-400">Applied Rule Conditions:</span>
              <ul className="text-[11px] text-slate-300 mt-0.5 space-y-0.5">
                {preview.factors.map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-amber-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Step 3: Photographic Evidence Upload */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h2 className="text-sm font-bold text-slate-900">Photographic Evidence</h2>
          </div>

          <div className="border-2 border-dashed border-slate-300 hover:border-primary rounded-xl p-6 text-center transition bg-slate-50/50">
            {imagePreview ? (
              <div className="space-y-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-56 mx-auto rounded-lg shadow-sm border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setBeforeImage(null);
                    setImagePreview(null);
                  }}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Remove Photograph
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block space-y-2">
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <span className="text-xs font-bold text-slate-700 block">
                  Click to upload on-site photograph
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Supports JPEG, JPG, PNG, WebP (Max 5MB)
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Step 4: Geographic Location */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h2 className="text-sm font-bold text-slate-900">Geographic Location</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Street / Avenue Address *
              </label>
              <input
                type="text"
                required
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="e.g. Sector 14 Main Road, near Gate No 2"
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prominent Landmark
              </label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                placeholder="e.g. Opposite Water Tank"
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Interactive Leaflet Map Picker */}
          <div>
            <MapPicker
              initialLat={formData.latitude}
              initialLng={formData.longitude}
              onLocationSelect={handleLocationSelect}
            />
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/citizen')}
            className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-[#245B8F] hover:bg-[#19446B] text-white text-xs font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Logging Grievance...' : 'Submit Grievance'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Success Modal */}
      <Modal
        isOpen={successModalOpen}
        onClose={() => navigate('/citizen')}
        title="Grievance Registered Successfully"
      >
        {createdComplaint && (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                Unique Tracking Reference
              </p>
              <p className="text-2xl font-black text-slate-900 font-mono mt-1">
                {createdComplaint.complaintId}
              </p>
            </div>

            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Your grievance has been dispatched to <strong>{createdComplaint.departmentId?.name || 'Municipal Department'}</strong> with <strong>{createdComplaint.priorityLevel}</strong> priority. Target resolution window: <strong>{createdComplaint.targetResolutionHours} hours</strong>.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                type="button"
                onClick={() => navigate(`/track?id=${createdComplaint.complaintId}`)}
                className="px-4 py-2.5 rounded-lg bg-[#245B8F] text-white text-xs font-bold hover:bg-[#19446B] transition"
              >
                Track Live Status
              </button>
              <button
                type="button"
                onClick={() => navigate('/citizen')}
                className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Go to My Dashboard
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
