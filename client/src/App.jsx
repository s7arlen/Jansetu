import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { HomePage } from './pages/HomePage';
import { PublicDashboardPage } from './pages/PublicDashboardPage';
import { TrackComplaintPage } from './pages/TrackComplaintPage';
import { DepartmentsDirectoryPage } from './pages/DepartmentsDirectoryPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Citizen Pages
import { CitizenDashboard } from './pages/CitizenDashboard';
import { SubmitComplaintPage } from './pages/SubmitComplaintPage';

// Shared Detail Page
import { ComplaintDetailsPage } from './pages/ComplaintDetailsPage';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminComplaintsPage } from './pages/AdminComplaintsPage';
import { AdminOverduePage } from './pages/AdminOverduePage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { AdminDepartmentsPage } from './pages/AdminDepartmentsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';

// Official Pages
import { DepartmentDashboard } from './pages/DepartmentDashboard';

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/public-dashboard" element={<PublicDashboardPage />} />
        <Route path="/track" element={<TrackComplaintPage />} />
        <Route path="/departments" element={<DepartmentsDirectoryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Citizen Protected Routes */}
      <Route element={<DashboardLayout allowedRoles={['citizen']} />}>
        <Route path="/citizen" element={<CitizenDashboard />} />
      </Route>

      {/* Grievance Submission (Citizen & Admin) */}
      <Route element={<DashboardLayout allowedRoles={['citizen', 'admin']} />}>
        <Route path="/submit-complaint" element={<SubmitComplaintPage />} />
      </Route>

      {/* Shared Grievance Dossier View */}
      <Route element={<DashboardLayout allowedRoles={['citizen', 'official', 'admin']} />}>
        <Route path="/complaints/:id" element={<ComplaintDetailsPage />} />
      </Route>

      {/* Department Official Protected Routes */}
      <Route element={<DashboardLayout allowedRoles={['official']} />}>
        <Route path="/official" element={<DepartmentDashboard />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<DashboardLayout allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
        <Route path="/admin/overdue" element={<AdminOverduePage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
