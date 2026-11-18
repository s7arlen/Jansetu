import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Mail,
  Phone,
  Shield,
  ArrowRight,
  Hammer,
  Droplets,
  Trash2,
  Zap,
  Waves,
} from 'lucide-react';
import api from '../services/api';

export const DepartmentsDirectoryPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/public/departments');
        if (res.data.success) {
          setDepartments(res.data.departments || []);
        }
      } catch (err) {
        console.error('Failed to load public departments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepts();
  }, []);

  const getIcon = (code) => {
    switch (code) {
      case 'ROADS':
        return Hammer;
      case 'WATER':
        return Droplets;
      case 'SANIT':
        return Trash2;
      case 'ELECT':
        return Zap;
      case 'DRAIN':
        return Waves;
      default:
        return Building2;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Municipal Departments Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          The specialized civic operational wings accountable for infrastructure resolution across the city.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const Icon = getIcon(dept.code);

          return (
            <div
              key={dept._id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-blue-50 text-[#245B8F] border border-blue-200">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900">{dept.name}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {dept.description}
                  </p>
                </div>

                {dept.defaultCategories?.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500 block">
                      Assigned Issue Types:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {dept.defaultCategories.map((c) => (
                        <span
                          key={c}
                          className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="text-xs text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dept.code.toLowerCase()}@jansetu.gov.in</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Toll-free 1800-JAN-SETU (Ext: {dept.code})</span>
                  </div>
                </div>

                <Link
                  to={`/submit-complaint?category=${encodeURIComponent(
                    dept.defaultCategories?.[0] || dept.name
                  )}`}
                  className="w-full py-2 bg-slate-50 hover:bg-blue-50 text-primary border border-slate-200 hover:border-primary/40 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  File a Report <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
