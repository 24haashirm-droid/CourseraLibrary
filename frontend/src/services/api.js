const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')}/api`
  : '/api';

export const getAuthToken = () => localStorage.getItem('coursefinder_token');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('coursefinder_token', token);
  else localStorage.removeItem('coursefinder_token');
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

// Auth API
export const login = (email, password) =>
  apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const register = (name, email, password) =>
  apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

export const getMe = () => apiRequest('/auth/me');

export const getUsers = () => apiRequest('/auth/users');

// Courses API
export const getCourses = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '' && val !== 'all') {
      query.append(key, val);
    }
  });
  return apiRequest(`/courses?${query.toString()}`);
};

export const getCourse = (id) => apiRequest(`/courses/${id}`);

export const createCourse = (courseData) =>
  apiRequest('/courses', {
    method: 'POST',
    body: JSON.stringify(courseData),
  });

export const updateCourse = (id, courseData) =>
  apiRequest(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(courseData),
  });

export const deleteCourse = (id) =>
  apiRequest(`/courses/${id}`, {
    method: 'DELETE',
  });

// Submissions API
export const submitCourse = (submissionData) =>
  apiRequest('/submissions', {
    method: 'POST',
    body: JSON.stringify(submissionData),
  });

export const getMySubmissions = () => apiRequest('/submissions/my');

export const getAllSubmissions = (status = 'all') =>
  apiRequest(`/submissions?status=${status}`);

export const reviewSubmission = (id, reviewData) =>
  apiRequest(`/submissions/${id}/review`, {
    method: 'PUT',
    body: JSON.stringify(reviewData),
  });

// Personal Course Status API
export const getUserStatuses = () => apiRequest('/user-status/all');

export const updateUserStatus = (course_id, status, notes = '') =>
  apiRequest('/user-status', {
    method: 'POST',
    body: JSON.stringify({ course_id, status, notes }),
  });

export const resetUserStatus = (course_id) =>
  apiRequest(`/user-status/${course_id}`, {
    method: 'DELETE',
  });
