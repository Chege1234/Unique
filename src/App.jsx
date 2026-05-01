import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Layout from './Layout.jsx';
import ErrorBoundary from './Components/ErrorBoundary.jsx';
import { Loader2 } from 'lucide-react';

// Helper function to retry lazy imports.
// This catches "Failed to fetch dynamically imported module" errors which happen 
// when the app is updated but the user's browser has an old index.html cached pointing to old chunks.
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        return window.location.reload();
      }
      throw error;
    }
  });

// Lazy-load all pages for better initial load performance
const AdminDashboard = lazyWithRetry(() => import('./Pages/AdminDashboard.jsx'));
const Analytics = lazyWithRetry(() => import('./Pages/Analytics.jsx'));
const Home = lazyWithRetry(() => import('./Pages/Home.jsx'));
const RequestStaffAccess = lazyWithRetry(() => import('./Pages/RequestStaffAccess.jsx'));
const RoleSelection = lazyWithRetry(() => import('./Pages/RoleSelection.jsx'));
const StaffDashboard = lazyWithRetry(() => import('./Pages/StaffDashboard.jsx'));
const StaffLogin = lazyWithRetry(() => import('./Pages/StaffLogin.jsx'));
const Login = lazyWithRetry(() => import('./Pages/Login.jsx'));
const StudentDashboard = lazyWithRetry(() => import('./Pages/StudentDashboard.jsx'));
const StudentTakeTicket = lazyWithRetry(() => import('./Pages/StudentTakeTicket.jsx'));
const StudentTicketView = lazyWithRetry(() => import('./Pages/StudentTicketView.jsx'));
const TakeTicket = lazyWithRetry(() => import('./Pages/TakeTicket.jsx'));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,       // 5 minutes
            gcTime: 10 * 60 * 1000,          // 10 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
            refetchOnMount: false,
        },
    },
});

function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <Toaster position="top-right" richColors />
                <BrowserRouter>
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
                            <Route path="/admin" element={<Layout currentPageName="AdminDashboard"><AdminDashboard /></Layout>} />
                            <Route path="/admin-dashboard" element={<Layout currentPageName="AdminDashboard"><AdminDashboard /></Layout>} />
                            <Route path="/analytics" element={<Layout currentPageName="Analytics"><Analytics /></Layout>} />
                            <Route path="/request-staff-access" element={<Layout currentPageName="RequestStaffAccess"><RequestStaffAccess /></Layout>} />
                            <Route path="/role-selection" element={<Layout currentPageName="RoleSelection"><RoleSelection /></Layout>} />
                            <Route path="/login" element={<Layout currentPageName="Login"><Login /></Layout>} />
                            <Route path="/staff-dashboard" element={<Layout currentPageName="StaffDashboard"><StaffDashboard /></Layout>} />
                            <Route path="/staff-login" element={<Layout currentPageName="StaffLogin"><StaffLogin /></Layout>} />
                            <Route path="/student-dashboard" element={<Layout currentPageName="StudentDashboard"><StudentDashboard /></Layout>} />
                            <Route path="/student-take-ticket" element={<Layout currentPageName="StudentTakeTicket"><StudentTakeTicket /></Layout>} />
                            <Route path="/student-ticket-view" element={<Layout currentPageName="StudentTicketView"><StudentTicketView /></Layout>} />
                            <Route path="/take-ticket" element={<Layout currentPageName="TakeTicket"><TakeTicket /></Layout>} />
                        </Routes>
                    </Suspense>
                </BrowserRouter>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
