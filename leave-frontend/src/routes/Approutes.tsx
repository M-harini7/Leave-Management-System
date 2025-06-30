import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../pages/AuthPages';
import AdminDashboard from '../dashboards/AdminDashboard';
import HrDashboard from '../dashboards/HrDashboard';
import ManagerDashboard from '../dashboards/ManagerDashboard';
import TeamLeadDashboard from '../dashboards/TeamleadDashboard';
import DeveloperDashboard from '../dashboards/DeveloperDashboard'; 
import ProtectedRoute from '../components/ProtectedRoute';
import BulkUploadPage from '../components/BulkUpload'; // Adjust path if needed
import ResetPasswordPage from "../pages/ResetPasswordPage";
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/auth" replace />} />
    <Route path="/auth" element={<AuthPage />} />

    <Route
      path="/dashboards/AdminDashboard"
      element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/dashboards/HrDashboard"
      element={
        <ProtectedRoute allowedRoles={['hr']}>
          <HrDashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/dashboards/ManagerDashboard"
      element={
        <ProtectedRoute allowedRoles={['manager']}>
          <ManagerDashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/dashboards/TeamleadDashBoard"
      element={
        <ProtectedRoute allowedRoles={['team lead']}>
          <TeamLeadDashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/dashboards/DeveloperDashboard" 
      element={
        <ProtectedRoute allowedRoles={['developer']}>
          <DeveloperDashboard />
        </ProtectedRoute>
      }
    />
   <Route
  path="/bulk-upload"
  element={
    <ProtectedRoute allowedRoles={['admin', 'hr']}>
      <BulkUploadPage />
    </ProtectedRoute>
  }
/>
<Route path="/reset-password" element={<ResetPasswordPage />} />
  </Routes>
);

export default AppRoutes;
