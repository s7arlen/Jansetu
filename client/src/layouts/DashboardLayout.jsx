import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#245B8F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Loading JANSETU Secure Portal...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to correct dashboard based on role
    const target =
      user.role === 'admin'
        ? '/admin'
        : user.role === 'official'
        ? '/official'
        : '/citizen';
    return <Navigate to={target} replace />;
  }

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/analytics')) return 'Municipal Analytics & SLA';
    if (path.includes('/admin/overdue')) return 'Overdue Grievance Escalations';
    if (path.includes('/admin/departments')) return 'Municipal Departments & Staffing';
    if (path.includes('/admin/users')) return 'Citizen & Official Directory';
    if (path.includes('/admin/complaints')) return 'Comprehensive Grievance Registry';
    if (path === '/admin') return 'Municipal Administration Center';
    if (path === '/official') return 'Department Workorders & Field Updates';
    if (path === '/submit-complaint') return 'Register Civic Grievance';
    if (path.includes('/complaints/')) return 'Grievance Dossier & Verification';
    if (path === '/citizen') return 'Citizen Dashboard';
    return 'Portal';
  };

  return (
    <div className="min-h-screen flex bg-[#F4F6F9]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopHeader
          onMenuClick={() => setSidebarOpen(true)}
          title={getPageTitle()}
        />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          <Outlet />
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
};
