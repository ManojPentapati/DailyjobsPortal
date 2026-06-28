import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase, Building2, TrendingUp,
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search,
  Eye,
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useJobs } from "../../context/JobContext";
import { formatDate } from "../../components/utils/dateUtils";
import { resolveLogo } from "../../components/utils/logoUtils";
import Modal from "../../components/common/Modal";

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    blue:   "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    emerald:"bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    violet: "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400",
    amber:  "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="card-flat p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { adminJobs, totalJobs, dispatch } = useJobs();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);
  const [toggleModal, setToggleModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    document.title = "Admin Dashboard – Daily Jobs Portal";
  }, []);

  const filtered = adminJobs.filter((j) => {
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || (statusFilter === "active" ? j.is_active : !j.is_active);
    return matchSearch && matchStatus;
  });

  const handleDelete = (id) => {
    dispatch({ type: "DELETE_JOB", payload: id });
    setDeleteModal(null);
  };

  const activeCount = adminJobs.filter((j) => j.is_active).length;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950" id="admin-dashboard-page">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="lg:ml-0 ml-12">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-xs text-slate-400">Welcome back, Admin</p>
          </div>
          <Link to="/admin/add-job" className="btn-primary text-sm py-2" id="admin-add-job-btn">
            <Plus className="w-4 h-4" /> Add New Job
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          {(() => {
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const jobsThisWeek = adminJobs.filter((j) => new Date(j.posted_date) >= weekAgo).length;

            // Category distribution
            const catCount = {};
            adminJobs.forEach((j) => { if (j.category) catCount[j.category] = (catCount[j.category] || 0) + 1; });
            const catEntries = Object.entries(catCount).sort((a, b) => b[1] - a[1]);
            const topCategory = catEntries[0];
            const maxCount = topCategory ? topCategory[1] : 1;

            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard label="Total Jobs" value={totalJobs} icon={Briefcase} color="amber" />
                  <StatCard label="Active Jobs" value={activeCount} icon={TrendingUp} color="emerald" />
                  <StatCard label="Companies" value={new Set(adminJobs.map(j => j.company)).size} icon={Building2} color="violet" />
                  <StatCard label="This Week" value={jobsThisWeek} icon={TrendingUp} color="blue" />
                </div>

                {/* Category Distribution */}
                {catEntries.length > 0 && (
                  <div className="card-flat p-5 mb-8" id="admin-category-chart">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">Jobs by Category</h3>
                      {topCategory && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full">
                          🏆 Top: {topCategory[0]}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2.5">
                      {catEntries.slice(0, 6).map(([name, count]) => (
                        <div key={name} className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 dark:text-slate-400 w-32 truncate flex-shrink-0" title={name}>{name}</span>
                          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${(count / maxCount) * 100}%`,
                                background: "linear-gradient(90deg, #f59e0b, #d97706)",
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-6 text-right">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* Jobs Table */}
          <div className="card-flat overflow-hidden" id="admin-jobs-table-container">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-slate-900 dark:text-white">Job Listings</h2>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5" id="status-filter-tabs">
                  {["all", "active", "inactive"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                        statusFilter === s
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                      id={`filter-${s}`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 w-full sm:w-56">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search jobs..."
                  className="bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none w-full"
                  id="admin-job-search"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm" id="admin-jobs-table" role="table" aria-label="Job listings">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Title</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Company</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Posted</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">No jobs found</td>
                    </tr>
                  ) : (
                    filtered.map((job, idx) => (
                      <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group" id={`admin-table-row-${job.id}`}>
                        <td className="px-4 py-3 text-slate-400 text-xs">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0 border border-slate-200 dark:border-slate-600">
                              <img src={resolveLogo(job.company_logo || job.logo)} alt={job.company} className="w-full h-full object-contain p-0.5"
                                onError={(e) => { e.currentTarget.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-amber-600 dark:text-amber-400 text-xs font-bold">${job.company[0]}</div>`; }} />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white text-sm">{job.title}</p>
                              <p className="text-xs text-slate-400">{job.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 hidden md:table-cell">{job.company}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 hidden lg:table-cell text-xs">{job.location}</td>
                        <td className="px-4 py-3 text-slate-400 text-xs hidden xl:table-cell">{formatDate(job.posted_date)}</td>
                        <td className="px-4 py-3">
                          <span className={job.is_active ? "badge-active" : "badge-inactive"}>
                            {job.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/jobs/${job.id}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                              title="View"
                              id={`admin-view-${job.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/admin/edit-job/${job.id}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                              title="Edit"
                              id={`admin-edit-${job.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setToggleModal(job)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                              title={job.is_active ? "Deactivate" : "Activate"}
                              id={`admin-toggle-${job.id}`}
                            >
                              {job.is_active
                                ? <ToggleRight className="w-4 h-4 text-emerald-500" />
                                : <ToggleLeft className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => setDeleteModal(job)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete"
                              id={`admin-delete-${job.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Confirm Delete" size="sm">
        {deleteModal && (
          <div className="space-y-5">
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900 dark:text-white">"{deleteModal.title}"</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="btn-secondary flex-1 justify-center text-sm"
                id="cancel-delete-btn"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.id)}
                className="btn-danger flex-1 justify-center"
                id="confirm-delete-btn"
              >
                Delete Job
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toggle Status Confirmation Modal */}
      <Modal isOpen={!!toggleModal} onClose={() => setToggleModal(null)} title={toggleModal?.is_active ? "Deactivate Job" : "Activate Job"} size="sm">
        {toggleModal && (
          <div className="space-y-5">
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              {toggleModal.is_active ? (
                <>Are you sure you want to deactivate <span className="font-semibold text-slate-900 dark:text-white">"{toggleModal.title}"</span>? It will be hidden from the public portal.</>
              ) : (
                <>Are you sure you want to activate <span className="font-semibold text-slate-900 dark:text-white">"{toggleModal.title}"</span>? It will become visible on the public portal.</>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setToggleModal(null)}
                className="btn-secondary flex-1 justify-center text-sm"
                id="cancel-toggle-btn"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  dispatch({ type: "TOGGLE_JOB_STATUS", payload: toggleModal.id });
                  setToggleModal(null);
                }}
                className={`flex-1 justify-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  toggleModal.is_active
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
                id="confirm-toggle-btn"
              >
                {toggleModal.is_active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
