import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import StudentDashboardPage from './pages/StudentDashboardPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import StudentProfilePage from './pages/StudentProfilePage';

import AdminDashboardPage from './pages/AdminDashboardPage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import EventRegistrationsPage from './pages/EventRegistrationsPage';

import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <Navbar />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student Protected Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/registrations"
              element={
                <ProtectedRoute>
                  <MyRegistrationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute>
                  <StudentProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/events/new"
              element={
                <AdminRoute>
                  <CreateEventPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/events/:id/edit"
              element={
                <AdminRoute>
                  <EditEventPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/events/:eventId/registrations"
              element={
                <AdminRoute>
                  <EventRegistrationsPage />
                </AdminRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
