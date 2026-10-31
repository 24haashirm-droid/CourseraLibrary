import React from 'react';
import { Search, Filter, RotateCcw, Clock, CheckCircle2, Award, FolderKanban } from 'lucide-react';

export default function CourseFilters({
  filters,
  setFilters,
  platforms = [],
  categories = [],
  totalResults = 0,
  isLoggedIn = false
}) {
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      durationFilter: 'all',
      project: 'all',
      platform: 'all',
      category: 'all',
      status: 'all',
      sortBy: 'duration_desc',
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.durationFilter !== 'all' ||
    filters.project !== 'all' ||
    filters.platform !== 'all' ||
    filters.category !== 'all' ||
    filters.status !== 'all';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs mb-8">
      {/* Top Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search courses by title, keywords, or topics (e.g. Python, Full Stack, Data Science)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Sort by:</label>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="duration_desc">Duration: High to Low</option>
            <option value="duration_asc">Duration: Low to High</option>
            <option value="name_asc">Course Name: A-Z</option>
            <option value="newest">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Primary Requirement Filters: Duration & Project */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-4 border-t border-slate-100">
        {/* Core Requirement 1: Duration Filter (20+ / 30+) */}
        <div className="lg:col-span-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            Duration Requirement
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateFilter('durationFilter', 'all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                filters.durationFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              All Durations
            </button>
            <button
              onClick={() => updateFilter('durationFilter', '20+')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1 ${
                filters.durationFilter === '20+'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              20+ Hours
            </button>
            <button
              onClick={() => updateFilter('durationFilter', '30+')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1 ${
                filters.durationFilter === '30+'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-200'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              30+ Hours
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            * Courses with 35+ hours qualify for both 20+ and 30+ hour academic categories.
          </p>
        </div>

        {/* Core Requirement 2: Binary Project Filter */}
        <div className="lg:col-span-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <FolderKanban className="w-3.5 h-3.5 text-amber-600" />
            Project Availability
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateFilter('project', 'all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                filters.project === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              All Courses
            </button>
            <button
              onClick={() => updateFilter('project', 'yes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1 ${
                filters.project === 'yes'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span>★</span>
              Project: Yes
            </button>
            <button
              onClick={() => updateFilter('project', 'no')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                filters.project === 'no'
                  ? 'bg-slate-600 text-white border-slate-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              Project: No
            </button>
          </div>
        </div>

        {/* Secondary: Platform & Personal Status */}
        <div className="lg:col-span-3 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Platform
              </label>
              <select
                value={filters.platform}
                onChange={(e) => updateFilter('platform', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none"
              >
                <option value="all">All Platforms</option>
                {platforms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {isLoggedIn && (
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  My Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="NOT_COMPLETED">Not Completed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Already Completed</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2">
            <span className="text-xs font-medium text-slate-500">
              Showing <strong className="text-slate-800">{totalResults}</strong> suitable courses
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
