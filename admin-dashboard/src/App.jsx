import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import ErrorBoundary from './components/ErrorBoundary';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FurniturePage from './pages/FurniturePage';
import FurnitureFormPage from './pages/FurnitureFormPage';
import CategoriesPage from './pages/CategoriesPage';
import UsersPage from './pages/UsersPage';
import ReviewsPage from './pages/ReviewsPage';
import SavedDesignsPage from './pages/SavedDesignsPage';
import NotificationsPage from './pages/NotificationsPage';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster position="top-right" />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} handle={{ title: 'Dashboard' }} />
                <Route path="/furniture" element={<FurniturePage />} handle={{ title: 'Furniture' }} />
                <Route path="/furniture/new" element={<FurnitureFormPage />} handle={{ title: 'Add Furniture' }} />
                <Route path="/furniture/:id/edit" element={<FurnitureFormPage />} handle={{ title: 'Edit Furniture' }} />
                <Route path="/categories" element={<CategoriesPage />} handle={{ title: 'Categories' }} />
                <Route path="/users" element={<UsersPage />} handle={{ title: 'Users' }} />
                <Route path="/reviews" element={<ReviewsPage />} handle={{ title: 'Reviews' }} />
                <Route path="/saved-designs" element={<SavedDesignsPage />} handle={{ title: 'Saved Designs' }} />
                <Route path="/notifications" element={<NotificationsPage />} handle={{ title: 'Notifications' }} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
