import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Briefcase, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    document.title = "Admin Login – Daily Jobs Portal";
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email address.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!validate()) return;
    
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/admin/dashboard");
    } catch (err) {
      setLoginError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    if (loginError) setLoginError("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-950 via-[#0d1526] to-stone-950 flex items-center justify-center px-4 py-12" id="admin-login-page">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6" id="admin-login-logo">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Daily<span className="text-amber-500">Jobs</span></span>
          </Link>
          <h1 className="text-2xl font-extrabold text-white mb-1">Admin Panel</h1>
          <p className="text-slate-400 text-sm">Sign in to manage job listings</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8 animate-scale-in">
          {loginError && (
            <div className="flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-5 text-red-700 dark:text-red-400 text-sm" id="login-error-msg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {loginError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate id="admin-login-form" className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@dailyjobs.in"
                  className={`input-field pl-10 ${errors.email ? "border-red-400 focus:ring-red-400" : ""}`}
                  aria-describedby={errors.email ? "admin-email-error" : undefined}
                  aria-invalid={!!errors.email}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p id="admin-email-error" className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="admin-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                  id="forgot-password-link"
                  onClick={() => alert("Password reset link sent to your email!")}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="admin-password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input-field pl-10 pr-10 ${errors.password ? "border-red-400 focus:ring-red-400" : ""}`}
                  aria-describedby={errors.password ? "admin-password-error" : undefined}
                  aria-invalid={!!errors.password}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPass ? "Hide password" : "Show password"}
                  id="toggle-password-visibility"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p id="admin-password-error" className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2.5 cursor-pointer" id="remember-me-label">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                id="remember-me-checkbox"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">Remember me for 30 days</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base disabled:opacity-60"
              id="admin-login-submit"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>


        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          <Link to="/" className="hover:text-amber-500 transition-colors">← Back to Job Portal</Link>
        </p>
      </div>
    </main>
  );
}
