import React, { useState } from 'react';
import { Puzzle, Play, CheckCircle2, Clock, FolderKanban, ExternalLink, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateUserStatus } from '../services/api';

export default function ExtensionTester({ courses = [], onStatusChange }) {
  const { user } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || 1);
  const [simulatedStatus, setSimulatedStatus] = useState('NOT_COMPLETED');
  const [simulatedWidgetMinimized, setSimulatedWidgetMinimized] = useState(false);

  const selectedCourse = courses.find((c) => c.id === parseInt(selectedCourseId)) || courses[0];

  const handleUpdateStatusSim = async (newStatus) => {
    setSimulatedStatus(newStatus);
    if (selectedCourse && user) {
      await onStatusChange(selectedCourse.id, newStatus);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white rounded-2xl p-6 shadow-md mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Puzzle className="w-6 h-6 text-emerald-200" />
            <h1 className="text-xl font-extrabold tracking-tight">
              CourseFinder Browser Extension (Manifest V3)
            </h1>
          </div>
          <p className="text-emerald-100 text-xs max-w-2xl leading-relaxed">
            The browser extension inspects supported online learning platforms (Coursera, edX, Udemy), checks the
            20+/30+ hour requirements and capstone project status, and instantly tells you if you already completed it!
          </p>
        </div>

        <a
          href="/extension/test-page.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition shrink-0"
        >
          <span>Open Simulated Coursera Tab ↗</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Chrome Extension Installation Guide */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              How to Install Extension in Chrome / Edge
            </div>

            <ol className="space-y-4 text-xs text-slate-600">
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-slate-800">Open Chrome Extensions:</strong>
                  <p className="mt-0.5">
                    Navigate to <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">chrome://extensions</code> in your Chrome or Chromium browser.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-slate-800">Toggle Developer Mode:</strong>
                  <p className="mt-0.5">
                    Enable the <span className="font-semibold text-slate-800">"Developer mode"</span> toggle switch in the top-right corner.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-slate-800">Click "Load Unpacked":</strong>
                  <p className="mt-0.5">
                    Click the <strong>"Load unpacked"</strong> button and select the project's extension folder:
                  </p>
                  <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[11px] mt-1.5 break-all select-all">
                    C:\Users\areeb\.gemini\antigravity\scratch\coursefinder\extension
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                  4
                </span>
                <div>
                  <strong className="text-slate-800">Test on Learning Platforms:</strong>
                  <p className="mt-0.5">
                    Browse any course on Coursera, edX, or click our simulated partner page! The floating CourseFinder badge will immediately detect duration and your completion status.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Extension Architecture Note */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs text-slate-600">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Manifest V3 Architecture
            </h4>
            <ul className="space-y-1.5 list-disc pl-4">
              <li><strong>content.js:</strong> Detects course titles &amp; URLs from DOM without page disruption.</li>
              <li><strong>background.js:</strong> Service worker managing token authentication &amp; API requests.</li>
              <li><strong>popup.html:</strong> Extension toolbar popup for quick search &amp; account sync.</li>
              <li><strong>Zero CORS Friction:</strong> Backed by CourseFinder REST API on port 5000.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Live In-Browser Extension Simulator */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            {/* Browser chrome header simulation */}
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-1 text-[11px] text-slate-500 font-mono truncate">
                {selectedCourse ? selectedCourse.course_link : 'https://www.coursera.org/learn/...'}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                <Puzzle className="w-3 h-3 text-indigo-600" />
                Extension Active
              </div>
            </div>

            {/* Simulated Course Controls */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600">Test Course:</label>
                <select
                  value={selectedCourse?.id || 1}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    const found = courses.find((c) => c.id === parseInt(e.target.value));
                    if (found) {
                      setSimulatedStatus(found.personal_status || 'NOT_COMPLETED');
                    }
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.course_name} ({c.duration}h)
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-slate-500">
                Logged in as: <strong>{user?.name || 'Alex Rivera (Student)'}</strong>
              </div>
            </div>

            {/* Simulated Page Content with Injected Floating Widget */}
            <div className="relative p-6 min-h-[380px] bg-slate-50/50">
              {/* Web Page Content (Simulated Coursera Course) */}
              <div className="max-w-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {selectedCourse?.platform} Official Course Page
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-2 mb-2">
                  {selectedCourse?.course_name}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {selectedCourse?.description}
                </p>

                <div className="flex gap-4 text-xs font-semibold text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Duration</span>
                    <span>{selectedCourse?.duration} Hours</span>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Project Included</span>
                    <span>{selectedCourse?.has_project ? 'Yes (Capstone)' : 'No Project'}</span>
                  </div>
                </div>
              </div>

              {/* INJECTED EXTENSION FLOATING WIDGET (Exact replica of content.js) */}
              <div
                className="absolute top-6 right-6 w-72 bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden transition-all duration-200"
                style={{ zIndex: 10 }}
              >
                {/* Widget Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2.5 text-white flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span>🎯</span>
                    <span>CourseFinder Detector</span>
                  </div>
                  <button
                    onClick={() => setSimulatedWidgetMinimized(!simulatedWidgetMinimized)}
                    className="w-5 h-5 bg-white/20 hover:bg-white/30 rounded flex items-center justify-center text-xs font-bold transition"
                  >
                    {simulatedWidgetMinimized ? '+' : '−'}
                  </button>
                </div>

                {!simulatedWidgetMinimized && (
                  <div className="p-3.5">
                    <div className="font-bold text-xs text-slate-900 line-clamp-1 mb-1">
                      {selectedCourse?.course_name}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                      <span className="font-medium bg-slate-100 px-1.5 py-0.2 rounded">
                        {selectedCourse?.platform}
                      </span>
                      <span className="font-bold text-slate-800">
                        ⏱ {selectedCourse?.duration} Hours Total
                      </span>
                    </div>

                    {/* Requirement pills */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {selectedCourse?.duration >= 20 && (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ 20+ Hours
                        </span>
                      )}
                      {selectedCourse?.duration >= 30 && (
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                          ✓ 30+ Hours
                        </span>
                      )}
                      {selectedCourse?.has_project ? (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                          ★ Project Included
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          No Project
                        </span>
                      )}
                    </div>

                    {/* Status display */}
                    <div
                      className={`p-2.5 rounded-xl border text-center mb-3 ${
                        simulatedStatus === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : simulatedStatus === 'IN_PROGRESS'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}
                    >
                      <div className="text-[9px] uppercase tracking-wider font-extrabold opacity-75">
                        Your Academic Status
                      </div>
                      <div className="text-xs font-bold mt-0.5">
                        {simulatedStatus === 'COMPLETED'
                          ? 'Already Completed'
                          : simulatedStatus === 'IN_PROGRESS'
                          ? 'Currently In Progress'
                          : 'You can do this — Not Completed'}
                      </div>
                    </div>

                    {/* Quick status updater buttons */}
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      1-Click Status Update:
                    </div>
                    <div className="grid grid-cols-3 gap-1 mb-2">
                      <button
                        onClick={() => handleUpdateStatusSim('NOT_COMPLETED')}
                        className={`py-1 text-[10px] font-bold rounded border transition ${
                          simulatedStatus === 'NOT_COMPLETED'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        To-Do
                      </button>
                      <button
                        onClick={() => handleUpdateStatusSim('IN_PROGRESS')}
                        className={`py-1 text-[10px] font-bold rounded border transition ${
                          simulatedStatus === 'IN_PROGRESS'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleUpdateStatusSim('COMPLETED')}
                        className={`py-1 text-[10px] font-bold rounded border transition ${
                          simulatedStatus === 'COMPLETED'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Done ✓
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer">
                        View in CourseFinder Dashboard →
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
