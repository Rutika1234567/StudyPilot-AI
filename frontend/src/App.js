import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

import LoginPage              from './pages/LoginPage';
import RegisterPage           from './pages/RegisterPage';
import DashboardPage          from './pages/DashboardPage';
import UploadPage             from './pages/UploadPage';
import DocumentPage           from './pages/DocumentPage';
import YoutubePage            from './pages/YoutubePage';
import VideoPage              from './pages/VideoPage';
import ChatPage               from './pages/ChatPage';
import HistoryPage            from './pages/HistoryPage';
import ProfilePage            from './pages/ProfilePage';
import AdminPage              from './pages/AdminPage';

// New pages
import FavoritesPage          from './pages/FavoritesPage';
import StudyPlannerPage       from './pages/StudyPlannerPage';
import QuizPage               from './pages/QuizPage';
import QuizHistoryPage        from './pages/QuizHistoryPage';
import QuizResultPage         from './pages/QuizResultPage';
import ImportantQuestionsPage from './pages/ImportantQuestionsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route path="/dashboard"          element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/upload"             element={<PrivateRoute><UploadPage /></PrivateRoute>} />
          <Route path="/documents/:id"      element={<PrivateRoute><DocumentPage /></PrivateRoute>} />
          <Route path="/youtube"            element={<PrivateRoute><YoutubePage /></PrivateRoute>} />
          <Route path="/youtube/:id"        element={<PrivateRoute><VideoPage /></PrivateRoute>} />
          <Route path="/chat"               element={<PrivateRoute><ChatPage /></PrivateRoute>} />
          <Route path="/history"            element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
          <Route path="/profile"            element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          {/* Phase 1: New feature routes */}
          <Route path="/favorites"          element={<PrivateRoute><FavoritesPage /></PrivateRoute>} />
          <Route path="/important-questions" element={<PrivateRoute><ImportantQuestionsPage /></PrivateRoute>} />

          {/* Phase 2: Quiz routes */}
          <Route path="/quiz/:mcqId"        element={<PrivateRoute><QuizPage /></PrivateRoute>} />
          <Route path="/quiz-history"       element={<PrivateRoute><QuizHistoryPage /></PrivateRoute>} />
          <Route path="/quiz-result/:id"    element={<PrivateRoute><QuizResultPage /></PrivateRoute>} />

          {/* Phase 3: Study Planner */}
          <Route path="/study-planner"      element={<PrivateRoute><StudyPlannerPage /></PrivateRoute>} />

          {/* Admin-only route */}
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;