import React, { useState } from 'react';
import { X, Clock, FolderKanban, ExternalLink, CheckCircle2, Award, BookOpen, Layers, Edit3 } from 'lucide-react';

export default function CourseDetailsModal({
  course,
  onClose,
  onStatusChange,
  isLoggedIn,
  onOpenAuth
}) {
  const [notes, setNotes] = useState(course?.personal_notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!course) return null;

  const handleSaveNotes = async () => {
    if (!isLoggedIn) {
      onOpenAuth();
      return;
    }
    setSavingNotes(true);
    try {
      await onStatusChange(course.id, course.personal_status || 'NOT_COMPLETED', notes);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              {course.platform}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {course.category || 'Academic Course'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3 leading-snug">
            {course.course_name}
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            {course.description || 'Verified long-duration academic course suited for marks and university credits.'}
          </p>

          {/* Academic Criteria Checklist Grid */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 mb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Academic Criteria Verification
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Total Duration</div>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {course.duration} Hours
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {course.duration >= 20 && (
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded">
                      ✓ 20+ Hours
                    </span>
                  )}
                  {course.duration >= 30 && (
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded">
                      ✓ 30+ Hours
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Project / Capstone</div>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5 flex items-center gap-1">
                  {course.has_project ? (
                    <span className="text-amber-600">Yes, Included</span>
                  ) : (
                    <span className="text-slate-500">No Project</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {course.has_project ? 'Meets project coursework rule' : 'Theory & quizzes only'}
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Difficulty Level</div>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {course.level || 'Beginner'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Recommended for undergrads
                </div>
              </div>
            </div>
          </div>

          {/* Personal Academic Status Switcher */}
          <div className="border border-slate-200 rounded-xl p-4 mb-6">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Your Personal Status for this Course
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onStatusChange(course.id, 'NOT_COMPLETED', notes)}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition text-center ${
                  course.personal_status === 'NOT_COMPLETED' || !course.personal_status
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                You can do this — Not Completed
              </button>
              <button
                onClick={() => onStatusChange(course.id, 'IN_PROGRESS', notes)}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition text-center ${
                  course.personal_status === 'IN_PROGRESS'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Currently In Progress
              </button>
              <button
                onClick={() => onStatusChange(course.id, 'COMPLETED', notes)}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition text-center ${
                  course.personal_status === 'COMPLETED'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Already Completed
              </button>
            </div>

            {/* Student Personal Notes */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Personal Academic Notes / Semester Credit Target
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Approved by advisor for Fall Elective, Semester 6..."
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  {savingNotes ? 'Saving...' : saveSuccess ? 'Saved ✓' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition"
          >
            Close
          </button>

          <a
            href={course.course_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition"
          >
            <span>Go to Official Course Page ({course.platform})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
