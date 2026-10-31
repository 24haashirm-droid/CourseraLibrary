import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserStatuses, updateUserStatus, resetUserStatus, getMySubmissions } from '../services/api';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  PlayCircle,
  FolderKanban,
  Award,
  ExternalLink,
  Trash2,
  PlusCircle,
  HelpCircle,
  FileText
} from 'lucide-react';

export default function MyLearningDashboard({ onOpenSubmitModal, onOpenCourseDetails }) {
  const { user, stats, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('in-progress'); // 'in-progress', 'completed', 'saved', 'submissions'
  const [statusRecords, setStatusRecords] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, subsRes] = await Promise.all([
        getUserStatuses(),
        getMySubmissions(),
      ]);
      setStatusRecords(statusRes.records || []);
      setMySubmissions(subsRes.submissions || []);
      await refreshUser();
    } catch (err) {
      console.error('Error fetching student learning data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (courseId, newStatus) => {
    try {
      await updateUserStatus(courseId, newStatus);
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReset = async (courseId) => {
    if (!confirm('Remove this course from your tracked list?')) return;
    try {
      await resetUserStatus(courseId);
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const inProgressList = statusRecords.filter((r) => r.status === 'IN_PROGRESS');
  const completedList = statusRecords.filter((r) => r.status === 'COMPLETED');
  const savedList = statusRecords.filter((r) => r.status === 'NOT_COMPLETED');

  const totalCompletedHours = completedList.reduce((acc, c) => acc + (c.duration || 0), 0);
  const completedProjectsCount = completedList.filter((c) => c.has_project).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 shadow-md mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-6 h-6 text-indigo-300" />
            <h1 className="text-xl font-extrabold tracking-tight">
              Personal Academic Learning Tracker
            </h1>
          </div>
          <p className="text-indigo-200 text-xs max-w-2xl leading-relaxed">
            Welcome, <strong>{user?.name}</strong>! Track courses meeting your university marks &amp; credit requirements.
            Course metadata is global, but your completion progress is 100% private and synchronized with the browser extension.
          </p>
        </div>

        <button
          onClick={onOpenSubmitModal}
          className="inline-flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Submit New Course
        </button>
      </div>

      {/* Academic Stats Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Completed Hours
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {totalCompletedHours} hrs
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Total verified academic coursework
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Courses Completed
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {completedList.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {completedList.filter((c) => c.duration >= 30).length} of which are 30+ hrs
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1 flex items-center gap-1">
            <FolderKanban className="w-3.5 h-3.5" />
            Completed Projects
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {completedProjectsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Capstone &amp; portfolio projects
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 flex items-center gap-1">
            <PlayCircle className="w-3.5 h-3.5" />
            In Progress
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {inProgressList.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Active studies underway
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('in-progress')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'in-progress'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlayCircle className="w-4 h-4 text-amber-500" />
          <span>Currently In Progress ({inProgressList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'completed'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Already Completed ({completedList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'saved'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          <span>Saved / Not Completed ({savedList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'submissions'
              ? 'border-slate-800 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-slate-600" />
          <span>My Submissions ({mySubmissions.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: In Progress */}
      {activeTab === 'in-progress' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inProgressList.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200">
              <PlayCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No active courses in progress</p>
              <p className="text-xs text-slate-500 mt-1">
                Browse the Global Course Library to find a 20+ or 30+ hour course and mark it as "In Progress".
              </p>
            </div>
          ) : (
            inProgressList.map((r) => (
              <div
                key={r.course_id}
                className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Currently In Progress
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">{r.platform}</span>
                  </div>

                  <h3
                    onClick={() => onOpenCourseDetails(r)}
                    className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition cursor-pointer mb-2 line-clamp-2"
                  >
                    {r.course_name}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-600 mb-3">
                    <span className="font-semibold text-slate-800">⏱ {r.duration} Hours</span>
                    <span>•</span>
                    <span className="text-amber-700 font-medium">
                      {r.has_project ? '★ Project Included' : 'No Project'}
                    </span>
                  </div>

                  {r.notes && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 italic mb-4">
                      "{r.notes}"
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleStatusChange(r.course_id, 'COMPLETED')}
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition"
                  >
                    Mark as Completed ✓
                  </button>

                  <div className="flex items-center gap-1">
                    <a
                      href={r.course_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-500 hover:text-indigo-600 transition"
                      title="Open course"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleReset(r.course_id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      title="Untrack course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: Completed */}
      {activeTab === 'completed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedList.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No completed courses yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Mark courses as "Already Completed" once you finish them to track your credit hours.
              </p>
            </div>
          ) : (
            completedList.map((r) => (
              <div
                key={r.course_id}
                className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Already Completed
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">{r.platform}</span>
                  </div>

                  <h3
                    onClick={() => onOpenCourseDetails(r)}
                    className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition cursor-pointer mb-2 line-clamp-2"
                  >
                    {r.course_name}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-600 mb-3">
                    <span className="font-bold text-emerald-700">⏱ {r.duration} Hours Earned</span>
                    <span>•</span>
                    <span className="text-slate-700 font-medium">
                      {r.has_project ? '★ Capstone Project' : 'Theory'}
                    </span>
                  </div>

                  {r.notes && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 italic mb-4">
                      "{r.notes}"
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    Updated {new Date(r.updated_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1">
                    <a
                      href={r.course_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-500 hover:text-indigo-600 transition"
                      title="Open course"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleReset(r.course_id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      title="Untrack course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: Saved / Not Completed */}
      {activeTab === 'saved' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedList.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No saved courses</p>
              <p className="text-xs text-slate-500 mt-1">
                Save prospective courses you are considering for upcoming semesters.
              </p>
            </div>
          ) : (
            savedList.map((r) => (
              <div
                key={r.course_id}
                className="bg-white rounded-2xl p-5 border border-indigo-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      You can do this — Not Completed
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">{r.platform}</span>
                  </div>

                  <h3
                    onClick={() => onOpenCourseDetails(r)}
                    className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition cursor-pointer mb-2 line-clamp-2"
                  >
                    {r.course_name}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-600 mb-3">
                    <span className="font-semibold text-slate-800">⏱ {r.duration} Hours</span>
                    <span>•</span>
                    <span>{r.has_project ? '★ Project Included' : 'No Project'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleStatusChange(r.course_id, 'IN_PROGRESS')}
                    className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg transition"
                  >
                    Start Course →
                  </button>

                  <div className="flex items-center gap-1">
                    <a
                      href={r.course_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-500 hover:text-indigo-600 transition"
                      title="Open course"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleReset(r.course_id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      title="Untrack course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: Submissions */}
      {activeTab === 'submissions' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Course Name</th>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Review Status</th>
                  <th className="px-4 py-3">Administrator Notes</th>
                  <th className="px-4 py-3">Date Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mySubmissions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                      You haven't submitted any courses to the library yet.
                    </td>
                  </tr>
                ) : (
                  mySubmissions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-bold text-slate-800">{s.course_name}</td>
                      <td className="px-4 py-3">{s.platform}</td>
                      <td className="px-4 py-3 font-bold">{s.duration} Hours</td>
                      <td className="px-4 py-3 font-semibold">
                        {s.has_project ? <span className="text-amber-700">★ Yes</span> : 'No'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            s.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : s.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 italic">
                        {s.admin_notes || (s.status === 'Pending' ? 'In review queue...' : '—')}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
