import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  ExternalLink,
  Award,
  Sparkles,
  PlayCircle,
  HelpCircle,
  ChevronDown,
  Layers,
  FolderKanban
} from 'lucide-react';

export default function CourseCard({
  course,
  onStatusChange,
  onOpenDetails,
  onOpenAuth,
  isLoggedIn
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Status mapping
  const currentStatus = course.personal_status || 'NOT_COMPLETED';

  const handleSelectStatus = async (newStatus) => {
    setDropdownOpen(false);
    if (!isLoggedIn) {
      onOpenAuth();
      return;
    }
    setUpdating(true);
    try {
      await onStatusChange(course.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  // Status style config
  const statusConfig = {
    COMPLETED: {
      label: 'Already Completed',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    IN_PROGRESS: {
      label: 'Currently In Progress',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    },
    NOT_COMPLETED: {
      label: 'You can do this — Not Completed',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      dot: 'bg-indigo-500',
    },
  };

  const statusInfo = statusConfig[currentStatus] || statusConfig.NOT_COMPLETED;

  // Platform badges
  const getPlatformBadge = (platform) => {
    switch (platform.toLowerCase()) {
      case 'coursera':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'edx':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'udemy':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getPlatformBadge(
                course.platform
              )}`}
            >
              {course.platform}
            </span>

            {course.category && (
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {course.category}
              </span>
            )}
          </div>

          {/* Academic Hours Eligible Tag */}
          {course.duration >= 30 ? (
            <span className="text-[10px] font-bold tracking-tight bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Award className="w-3 h-3 text-indigo-600" />
              30+ & 20+ Eligible
            </span>
          ) : course.duration >= 20 ? (
            <span className="text-[10px] font-bold tracking-tight bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              20+ Eligible
            </span>
          ) : null}
        </div>

        {/* Course Title */}
        <h3
          onClick={() => onOpenDetails(course)}
          className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer mb-2 leading-snug"
          title={course.course_name}
        >
          {course.course_name}
        </h3>

        {/* Course Description snippet */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {course.description || 'Verified long-duration academic online course.'}
        </p>

        {/* Highlights: Duration & Project */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-3 rounded-xl border border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Duration
              </div>
              <div className="text-xs font-bold text-slate-800">
                {course.duration} Hours
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FolderKanban
              className={`w-4 h-4 shrink-0 ${
                course.has_project ? 'text-amber-500' : 'text-slate-400'
              }`}
            />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Project Included
              </div>
              <div
                className={`text-xs font-bold flex items-center gap-1 ${
                  course.has_project ? 'text-amber-700' : 'text-slate-500'
                }`}
              >
                {course.has_project ? (
                  <>
                    <span>Yes</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded">
                      Portfolio
                    </span>
                  </>
                ) : (
                  <span>No</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Course Status Dropdown (Key Feature from PDF) */}
        <div className="relative">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center justify-between">
            <span>Your Personal Academic Status</span>
            {!isLoggedIn && (
              <span
                onClick={onOpenAuth}
                className="text-indigo-600 hover:underline cursor-pointer normal-case"
              >
                Sign in to track
              </span>
            )}
          </div>

          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={updating}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border transition ${
              statusInfo.bg
            } ${updating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
              <span>{updating ? 'Updating...' : statusInfo.label}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-30 animate-in fade-in">
              <button
                onClick={() => handleSelectStatus('NOT_COMPLETED')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-50 text-indigo-700 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                You can do this — Not Completed
              </button>
              <button
                onClick={() => handleSelectStatus('IN_PROGRESS')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-amber-50 text-amber-700 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Currently In Progress
              </button>
              <button
                onClick={() => handleSelectStatus('COMPLETED')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-50 text-emerald-700 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Already Completed
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onOpenDetails(course)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          View Details
        </button>

        <a
          href={course.course_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
        >
          <span>Open on {course.platform}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
