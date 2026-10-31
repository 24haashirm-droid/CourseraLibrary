import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2, Clock, FolderKanban } from 'lucide-react';
import { submitCourse } from '../services/api';

export default function SubmitCourseModal({ isOpen, onClose, onSubmitted, isLoggedIn, onOpenAuth }) {
  const [formData, setFormData] = useState({
    course_name: '',
    platform: 'Coursera',
    course_link: '',
    duration: '30',
    has_project: true,
    category: 'Computer Science',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onOpenAuth();
      return;
    }

    if (!formData.course_name.trim() || !formData.course_link.trim() || !formData.duration) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitCourse({
        ...formData,
        duration: parseInt(formData.duration),
        has_project: formData.has_project ? 1 : 0,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSubmitted();
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || 'Failed to submit course for review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Contribute a Course to CourseFinder
            </h3>
            <p className="text-xs text-slate-500">
              Submissions enter a pending queue and are reviewed by an administrator.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Course submitted successfully! Redirecting...</span>
            </div>
          )}

          {/* Course Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Course Name *
            </label>
            <input
              type="text"
              required
              value={formData.course_name}
              onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
              placeholder="e.g. Stanford Algorithms Specialization"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Platform and Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Platform *
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Coursera">Coursera</option>
                <option value="edX">edX</option>
                <option value="Udemy">Udemy</option>
                <option value="Udacity">Udacity</option>
                <option value="HarvardX">HarvardX</option>
                <option value="MIT OCW">MIT OpenCourseWare</option>
                <option value="Other">Other Platform</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Duration (Hours) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="30"
                  className="w-full pl-3 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Hours
                </span>
              </div>
            </div>
          </div>

          {/* Course URL Link */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Course URL Link *
            </label>
            <input
              type="url"
              required
              value={formData.course_link}
              onChange={(e) => setFormData({ ...formData, course_link: e.target.value })}
              placeholder="https://www.coursera.org/learn/..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Project Binary Field */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Does this course include a Project or Capstone? *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, has_project: true })}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  formData.has_project
                    ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>★</span>
                <span>Yes, Project Included</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, has_project: false })}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  !formData.has_project
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>No Project</span>
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Subject Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Web Development">Web Development</option>
              <option value="Data Science">Data Science</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="Business & Management">Business & Management</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Description / Academic Syllabus Highlights
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of skills taught, assignments, or certificate details..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting...' : 'Submit for Administrator Approval'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
