import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import CourseFilters from './components/CourseFilters';
import CourseCard from './components/CourseCard';
import CourseDetailsModal from './components/CourseDetailsModal';
import SubmitCourseModal from './components/SubmitCourseModal';
import AdminDashboard from './components/AdminDashboard';
import MyLearningDashboard from './components/MyLearningDashboard';
import ExtensionTester from './components/ExtensionTester';
import AuthModal from './components/AuthModal';
import { getCourses, updateUserStatus, getAllSubmissions } from './services/api';
import {
  BookOpen,
  Award,
  CheckCircle2,
  FolderKanban,
  Sparkles,
  ArrowRight,
  PlusCircle,
  ExternalLink,
  Puzzle
} from 'lucide-react';

function MainApp() {
  const { user, isAdmin, stats, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('library'); // 'library', 'my-learning', 'admin', 'extension'

  // Courses state
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [platforms, setPlatforms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    durationFilter: 'all', // '20+', '30+', 'all'
    project: 'all', // 'yes', 'no', 'all'
    platform: 'all',
    category: 'all',
    status: 'all',
    sortBy: 'duration_desc',
  });

  // Modals state
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch courses
  const fetchCoursesList = async () => {
    setLoading(true);
    try {
      const data = await getCourses(filters);
      setCourses(data.courses || []);
      if (data.filterMeta) {
        setPlatforms(data.filterMeta.platforms || []);
        setCategories(data.filterMeta.categories || []);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending submissions count for admin badge
  const checkPendingCount = async () => {
    if (isAdmin) {
      try {
        const data = await getAllSubmissions('Pending');
        setPendingCount(data.submissions?.length || 0);
      } catch {
        // silent fail
      }
    }
  };

  useEffect(() => {
    fetchCoursesList();
  }, [filters, user]);

  useEffect(() => {
    checkPendingCount();
  }, [isAdmin, user]);

  // Handle status update
  const handleStatusChange = async (courseId, newStatus, notes = '') => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await updateUserStatus(courseId, newStatus, notes);
      showToast(
        newStatus === 'COMPLETED'
          ? 'Course marked as Already Completed!'
          : newStatus === 'IN_PROGRESS'
          ? 'Course marked as In Progress!'
          : 'Course marked as Not Completed!'
      );
      await fetchCoursesList();
      await refreshUser();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSubmitModal={() => (user ? setIsSubmitModalOpen(true) : setIsAuthModalOpen(true))}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        pendingCount={pendingCount}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : 'bg-rose-900 text-white border-rose-700'
            }`}
          >
            <span>✓</span>
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1">
        {activeTab === 'library' && (
          <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
              
              <div className="max-w-7xl mx-auto relative z-10 text-center">
                <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1 rounded-full text-indigo-300 text-xs font-semibold mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Academic Course Discovery Engine</span>
                  <span className="text-indigo-400/60">•</span>
                  <span className="text-indigo-200">Created by <strong className="text-white font-bold">Areeb</strong></span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight mb-4">
                  Find long courses for your credits in{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">
                    seconds, not hours.
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                  Filter verified online courses by <strong>20+ Hours</strong>, <strong>30+ Hours</strong>, and
                  <strong> Project availability</strong>. With our browser extension, know instantly whether you
                  already completed a course while browsing Coursera and edX.
                </p>

                {/* Quick Academic Filter Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    onClick={() => setFilters({ ...filters, durationFilter: '20+', project: 'all' })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      filters.durationFilter === '20+'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-300'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>20+ Hours Courses</span>
                  </button>

                  <button
                    onClick={() => setFilters({ ...filters, durationFilter: '30+', project: 'all' })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      filters.durationFilter === '30+'
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-300'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                    }`}
                  >
                    <Award className="w-4 h-4 text-indigo-300" />
                    <span>30+ Hours Courses</span>
                  </button>

                  <button
                    onClick={() => setFilters({ ...filters, project: 'yes' })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      filters.project === 'yes'
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 ring-2 ring-amber-300'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                    }`}
                  >
                    <FolderKanban className="w-4 h-4 text-amber-300" />
                    <span>Includes Practical Project</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Catalog Grid Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Filter controls */}
              <CourseFilters
                filters={filters}
                setFilters={setFilters}
                platforms={platforms}
                categories={categories}
                totalResults={courses.length}
                isLoggedIn={Boolean(user)}
              />

              {/* Course Card Grid */}
              {loading ? (
                <div className="py-20 text-center">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs font-semibold text-slate-500">Loading catalog courses...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800 mb-1">No courses match your active filters</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                    Try adjusting your duration requirement, clearing the search query, or contributing a new course.
                  </p>
                  <button
                    onClick={() =>
                      setFilters({
                        search: '',
                        durationFilter: 'all',
                        project: 'all',
                        platform: 'all',
                        category: 'all',
                        status: 'all',
                        sortBy: 'duration_desc',
                      })
                    }
                    className="text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-xs"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onStatusChange={handleStatusChange}
                      onOpenDetails={(c) => setSelectedCourse(c)}
                      onOpenAuth={() => setIsAuthModalOpen(true)}
                      isLoggedIn={Boolean(user)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'my-learning' && (
          <MyLearningDashboard
            onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
            onOpenCourseDetails={(c) => setSelectedCourse(c)}
          />
        )}

        {activeTab === 'admin' && <AdminDashboard />}

        {activeTab === 'extension' && (
          <ExtensionTester
            courses={courses}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>

      {/* Modals */}
      {selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onStatusChange={handleStatusChange}
          isLoggedIn={Boolean(user)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      )}

      <SubmitCourseModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmitted={() => {
          showToast('Submitted! Administrator will review your course.');
          checkPendingCount();
        }}
        isLoggedIn={Boolean(user)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">CourseFinder</span>
            <span>— Smart Global Library for Long-Duration Online Courses</span>
          </div>

          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3.5 py-1 rounded-full border border-indigo-200 text-xs font-semibold shadow-xs">
              <span>Created by</span>
              <strong className="font-bold text-indigo-950">Areeb</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <span>20+ &amp; 30+ Hours Verification</span>
            <span>•</span>
            <span>Project Availability Tracking</span>
            <span>•</span>
            <span>Chrome Extension MV3</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
