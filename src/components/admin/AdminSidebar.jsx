import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, PlusCircle, LogOut, Menu, X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const sidebarLinks = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/add-job", icon: PlusCircle, label: "Add New Job" },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await logout();
      navigate("/admin/login");
    }
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl shadow-lg"
        aria-label="Open sidebar"
        id="admin-sidebar-toggle"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-auto
          h-screen lg:h-screen overflow-y-auto
          bg-slate-900 dark:bg-slate-950 text-white
          flex flex-col transition-all duration-300 flex-shrink-0
          ${collapsed ? "lg:w-16" : "lg:w-60"}
          ${mobileOpen ? "w-60 translate-x-0" : "-translate-x-full lg:translate-x-0"}
          shadow-2xl lg:shadow-none border-r border-slate-800
        `}
        aria-label="Admin sidebar"
        id="admin-sidebar"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          {!collapsed && (
            <Link to="/admin/dashboard" className="flex items-center gap-2" id="admin-sidebar-logo">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-slate-950">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm">Admin Panel</span>
            </Link>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 hover:bg-slate-800 rounded-lg"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCollapsed((p) => !p)}
              className="hidden lg:flex p-1.5 hover:bg-slate-800 rounded-lg"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              id="sidebar-collapse-btn"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? "" : "rotate-180"}`} />
            </button>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 flex flex-col gap-1" aria-label="Admin navigation">
          {sidebarLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin/dashboard"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                } ${collapsed ? "justify-center" : ""}`
              }
              title={collapsed ? label : undefined}
              id={`sidebar-link-${label.replace(/\s/g, "-").toLowerCase()}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "View Portal" : undefined}
            id="admin-view-portal"
          >
            <Briefcase className="w-5 h-5 flex-shrink-0" />
            {!collapsed && "View Portal"}
          </Link>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all text-sm ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Log Out" : undefined}
            id="admin-logout-btn"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && "Log Out"}
          </button>
        </div>
      </aside>
    </>
  );
}
