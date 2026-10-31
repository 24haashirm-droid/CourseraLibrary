import React, { useState, useEffect } from 'react';
import {
  getAllSubmissions,
  reviewSubmission,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getUsers
} from '../services/api';
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  FolderKanban,
  Check,
  X
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'catalog', 'history', 'users'
  const [submissions, setSubmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Edit / Add modal state
  const [editingCourse, setEditingCourse] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState({
    course_name: '',
    platform: 'Coursera',
    course_link: '',
    duration: '35',
    has_project: true,
    category: 'Computer Science',
    description: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subsRes, coursesRes, usersRes] = await Promise.all([
        getAllSubmissions('all'),
        getCourses({ sortBy: 'newest' }),
        getUsers(),
      ]);
      setSubmissions(subsRes.submissions || []);
      setCourses(coursesRes.courses || []);
      setUsersList(usersRes.users || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingSubmissions = submissions.filter((s) => s.status === 'Pending');
  const reviewedSubmissions = submissions.filter((s) => s.status !== 'Pending');

  // Review submission
  const handleReview = async (submissionId, action) => {
    let adminNotes = '';
    if (action === 'reject') {
      adminNotes = prompt('Enter rejection reason (optional):', 'Duplicate or duration does not meet academic guidelines.') || '';
    }

    setActionLoading(true);
    try {
      const res = await reviewSubmission(submissionId, { action, admin_notes: adminNotes });
      setMessage({ type: 'success', text: res.message });
      setTimeout(() => setMessage(null), 4000);
      await fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete course
  const handleDeleteCourse = async (courseId, courseName) => {
    if (!confirm(`Are you sure you want to remove "${courseName}" from the global library?`)) return;

    setActionLoading(true);
    try {
      await deleteCourse(courseId);
      setMessage({ type: 'success', text: `Removed "${courseName}" from library.` });
      setTimeout(() => setMessage(null), 3000);
      await fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Add course directly
  const handleAddCourseDirectly = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await createCourse({
        ...newCourseForm,
        duration: parseInt(newCourseForm.duration),
        has_project: newCourseForm.has_project ? 1 : 0,
      });
      setIsAddModalOpen(false);
      setMessage({ type: 'success', text: 'Course added to Global Library.' });
      setTimeout(() => setMessage(null), 3000);
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Save edited course
  const handleSaveCourseEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await updateCourse(editingCourse.id, {
        ...editingCourse,
        duration: parseInt(editingCourse.duration),
        has_project: editingCourse.has_project ? 1 : 0,
      });
      setEditingCourse(null);
      setMessage({ type: 'success', text: 'Course updated successfully.' });
      setTimeout(() => setMessage(null), 3000);
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl p-6 shadow-md mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-amber-200" />
            <h1 className="text-xl font-extrabold tracking-tight">
              CourseFinder Administrator Control Center
            </h1>
          </div>
          <p className="text-amber-100 text-xs max-w-2xl leading-relaxed">
            Verify community contributions, maintain academic standards (20+ and 30+ hour durations, capstones/projects),
            and curate the global course catalog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-white text-amber-800 hover:bg-amber-50 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            Add Course Directly
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 bg-amber-800/40 hover:bg-amber-800/60 text-white rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Flash message */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-bold mb-6 flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
            ×
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            Pending Queue
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {pendingSubmissions.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Awaiting administrator review
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
            Catalog Courses
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {courses.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Published in global library
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
            Approved Submissions
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {submissions.filter((s) => s.status === 'Approved').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Community contributions merged
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Registered Users
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {usersList.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Students & faculty accounts
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'pending'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Pending Submissions</span>
          {pendingSubmissions.length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {pendingSubmissions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'catalog'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Global Catalog Management ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'border-slate-800 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Review Audit History ({reviewedSubmissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-slate-800 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>User Accounts ({usersList.length})</span>
        </button>
      </div>

      {/* TAB 1: Pending Submissions Queue */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingSubmissions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Queue is Clean! No Pending Submissions
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All community course contributions have been reviewed and verified. New submissions from students will appear here for verification.
              </p>
            </div>
          ) : (
            pendingSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl p-6 border border-amber-200/90 shadow-xs flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Pending Review
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {sub.platform}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Submitted by <strong>{sub.submitter_name}</strong> ({sub.submitter_email}) on{' '}
                      {new Date(sub.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {sub.course_name}
                  </h3>

                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    {sub.description || 'No description provided.'}
                  </p>

                  <div className="flex flex-wrap gap-3 items-center text-xs">
                    <div className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{sub.duration} Hours</span>
                      {sub.duration >= 30 ? (
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1 rounded font-bold">
                          30+ Eligible
                        </span>
                      ) : sub.duration >= 20 ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1 rounded font-bold">
                          20+ Eligible
                        </span>
                      ) : (
                        <span className="text-[10px] bg-rose-100 text-rose-700 px-1 rounded font-bold">
                          Under 20h
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <FolderKanban className="w-3.5 h-3.5 text-amber-500" />
                      <span>Project: {sub.has_project ? 'Yes (Included)' : 'No'}</span>
                    </div>

                    <a
                      href={sub.course_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold underline"
                    >
                      <span>Verify Course URL</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0">
                  <button
                    onClick={() => handleReview(sub.id, 'approve')}
                    disabled={actionLoading}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve &amp; Publish</span>
                  </button>

                  <button
                    onClick={() => handleReview(sub.id, 'reject')}
                    disabled={actionLoading}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-4 py-2 rounded-xl border border-rose-200 transition"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Submission</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Catalog Management */}
      {activeTab === 'catalog' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Course Name</th>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 font-bold text-slate-900 max-w-xs truncate" title={c.course_name}>
                      {c.course_name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold">{c.platform}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">
                      {c.duration}h
                      {c.duration >= 30 ? (
                        <span className="ml-1 text-[10px] text-indigo-700 bg-indigo-50 px-1 rounded">30+</span>
                      ) : (
                        <span className="ml-1 text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded">20+</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {c.has_project ? (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded">★ Yes</span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{c.category || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingCourse(c)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit course details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c.id, c.course_name)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Remove course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Course Name</th>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Submitter</th>
                  <th className="px-4 py-3">Decision</th>
                  <th className="px-4 py-3">Admin Notes</th>
                  <th className="px-4 py-3">Reviewed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviewedSubmissions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 font-bold text-slate-800">{s.course_name}</td>
                    <td className="px-4 py-3">{s.platform}</td>
                    <td className="px-4 py-3 text-slate-600">{s.submitter_name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          s.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 italic">{s.admin_notes || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {s.reviewed_at ? new Date(s.reviewed_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Completed Courses</th>
                  <th className="px-4 py-3">Submissions</th>
                  <th className="px-4 py-3">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 font-bold text-slate-800">{u.name}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{u.completed_courses} courses</td>
                    <td className="px-4 py-3 text-slate-600">{u.submissions_count}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Edit Course Information</h3>
            <form onSubmit={handleSaveCourseEdit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  value={editingCourse.course_name}
                  onChange={(e) => setEditingCourse({ ...editingCourse, course_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Platform</label>
                  <input
                    type="text"
                    required
                    value={editingCourse.platform}
                    onChange={(e) => setEditingCourse({ ...editingCourse, platform: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    required
                    value={editingCourse.duration}
                    onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Course URL</label>
                <input
                  type="url"
                  required
                  value={editingCourse.course_link}
                  onChange={(e) => setEditingCourse({ ...editingCourse, course_link: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Project Included</label>
                <select
                  value={editingCourse.has_project ? '1' : '0'}
                  onChange={(e) => setEditingCourse({ ...editingCourse, has_project: e.target.value === '1' })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="1">Yes (Course Includes Project)</option>
                  <option value="0">No Project</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Directly Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Course Directly to Global Catalog</h3>
            <form onSubmit={handleAddCourseDirectly} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  value={newCourseForm.course_name}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, course_name: e.target.value })}
                  placeholder="e.g. Stanford Algorithms Specialization"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Platform</label>
                  <select
                    value={newCourseForm.platform}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, platform: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Coursera">Coursera</option>
                    <option value="edX">edX</option>
                    <option value="Udemy">Udemy</option>
                    <option value="Udacity">Udacity</option>
                    <option value="HarvardX">HarvardX</option>
                    <option value="MIT OCW">MIT OpenCourseWare</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newCourseForm.duration}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Course URL</label>
                <input
                  type="url"
                  required
                  value={newCourseForm.course_link}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, course_link: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Project Included?</label>
                <select
                  value={newCourseForm.has_project ? '1' : '0'}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, has_project: e.target.value === '1' })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="1">Yes (Course Includes Project)</option>
                  <option value="0">No Project</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
