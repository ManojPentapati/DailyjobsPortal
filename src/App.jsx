import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import WhatsAppFloat from "./components/common/WhatsAppFloat";
import Home from "./pages/Home";
import JobListings from "./pages/JobListings";
import JobDetails from "./pages/JobDetails";
import Contact from "./pages/Contact";
import Categories from "./pages/Categories";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import SavedJobs from "./pages/SavedJobs";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import JobFormPage from "./pages/admin/JobFormPage";
import { useAuth } from "./context/AuthContext";

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAdmin } = useAuth();
  const location = useLocation();

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/jobs" element={<PublicLayout><JobListings /></PublicLayout>} />
      <Route path="/jobs/:id" element={<PublicLayout><JobDetails /></PublicLayout>} />
      <Route path="/categories" element={<PublicLayout><Categories /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/privacy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
      <Route path="/terms" element={<PublicLayout><TermsConditions /></PublicLayout>} />
      <Route path="/saved-jobs" element={<PublicLayout><SavedJobs /></PublicLayout>} />

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/add-job" element={<ProtectedRoute><JobFormPage isEdit={false} /></ProtectedRoute>} />
      <Route path="/admin/edit-job/:id" element={<ProtectedRoute><JobFormPage isEdit={true} /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
