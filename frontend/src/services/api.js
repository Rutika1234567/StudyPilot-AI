import axios from 'axios';

// All API calls go through this instance.
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================
// AUTH
// ============================================================
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
 login: async (data) => {
   console.log("Sending login request...");
   try {
     const res = await api.post("/api/auth/login", data);
     console.log("Login success:", res);
     return res;
   } catch (e) {
     console.log("Login failed");
     console.log(e);
     console.log(e.response);
     throw e;
   }
 },
};

// ============================================================
// USER PROFILE
// ============================================================
export const userAPI = {
  getProfile:    ()     => api.get('/api/user/profile'),
  updateProfile: (data) => api.put('/api/user/profile', data),
};

// ============================================================
// DOCUMENTS
// ============================================================
export const documentAPI = {
  upload:    (formData) => api.post('/api/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll:    ()   => api.get('/api/documents'),
  getById:   (id) => api.get(`/api/documents/${id}`),
  deleteById:(id) => api.delete(`/api/documents/${id}`),
};

// ============================================================
// YOUTUBE
// ============================================================
export const youtubeAPI = {
  addVideo:  (data) => api.post('/api/youtube/add', data),
  getAll:    ()     => api.get('/api/youtube'),
  getById:   (id)   => api.get(`/api/youtube/${id}`),
  deleteById:(id)   => api.delete(`/api/youtube/${id}`),
};

// ============================================================
// AI GENERATION
// ============================================================
export const aiAPI = {
  generateSummary:            (data) => api.post('/api/ai/summary', data),
  generateNotes:              (data) => api.post('/api/ai/notes', data),
  generateMcqs:               (data) => api.post('/api/ai/mcqs', data),
  generateFlashcards:         (data) => api.post('/api/ai/flashcards', data),
  generateInterview:          (data) => api.post('/api/ai/interview-questions', data),
  generateImportantQuestions: (data) => api.post('/api/ai/important-questions/generate', data),
  getNotes:                   ()     => api.get('/api/ai/notes'),
  getSummaries:               ()     => api.get('/api/ai/summaries'),
  getMcqs:                    ()     => api.get('/api/ai/mcqs'),
  getFlashcards:              ()     => api.get('/api/ai/flashcards'),
  getInterviewQs:             ()     => api.get('/api/ai/interview-questions'),
  getImportantQuestions:      ()     => api.get('/api/ai/important-questions'),
};

// ============================================================
// CHAT
// ============================================================
export const chatAPI = {
  ask:             (data)       => api.post('/api/chat/ask', data),
  getAllHistory:    ()           => api.get('/api/chat/history'),
  getDocumentChat: (documentId) => api.get(`/api/chat/history/document/${documentId}`),
  getVideoChat:    (videoId)    => api.get(`/api/chat/history/video/${videoId}`),
};

// ============================================================
// DASHBOARD
// ============================================================
export const dashboardAPI = {
  get: () => api.get('/api/dashboard'),
};

// ============================================================
// FAVORITES
// ============================================================
export const favoriteAPI = {
  add:      (data)        => api.post('/api/favorites', data),
  getAll:   ()            => api.get('/api/favorites'),
  getByType:(contentType) => api.get(`/api/favorites/type/${contentType}`),
  remove:   (id)          => api.delete(`/api/favorites/${id}`),
  check:    (contentType, contentId) =>
    api.get('/api/favorites/check', { params: { contentType, contentId } }),
};

// ============================================================
// EXPORT PDF  (returns blob — use with responseType: 'blob')
// ============================================================
export const exportAPI = {
  exportSummary:            (id) => api.get(`/api/export/summary/${id}`,            { responseType: 'blob' }),
  exportNotes:              (id) => api.get(`/api/export/notes/${id}`,              { responseType: 'blob' }),
  exportMcqs:               (id) => api.get(`/api/export/mcqs/${id}`,              { responseType: 'blob' }),
  exportFlashcards:         (id) => api.get(`/api/export/flashcards/${id}`,        { responseType: 'blob' }),
  exportInterviewQuestions: (id) => api.get(`/api/export/interview-questions/${id}`,{ responseType: 'blob' }),
  exportImportantQuestions: (id) => api.get(`/api/export/important-questions/${id}`,{ responseType: 'blob' }),
};

// ============================================================
// STUDY PLANNER
// ============================================================
export const studyPlanAPI = {
  create:       (data)           => api.post('/api/study-plans', data),
  getAll:       ()               => api.get('/api/study-plans'),
  getById:      (id)             => api.get(`/api/study-plans/${id}`),
  update:       (id, data)       => api.put(`/api/study-plans/${id}`, data),
  updateStatus: (id, status)     => api.patch(`/api/study-plans/${id}/status`, { status }),
  delete:       (id)             => api.delete(`/api/study-plans/${id}`),
};

// ============================================================
// QUIZ
// ============================================================
export const quizAPI = {
  submit:     (data) => api.post('/api/quiz/submit', data),
  getHistory: ()     => api.get('/api/quiz/history'),
  getAttempt: (id)   => api.get(`/api/quiz/history/${id}`),
};

// ============================================================
// ADMIN
// ============================================================
export const adminAPI = {
  getAllUsers:    ()   => api.get('/api/admin/users'),
  deleteUser:    (id) => api.delete(`/api/admin/users/${id}`),
  getAllDocuments:()   => api.get('/api/admin/documents'),
};

// ---- utility: trigger browser download from blob response ----
export function downloadBlob(response, filename) {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default api;