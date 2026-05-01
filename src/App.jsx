import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Layout from './Layout.jsx';
import ErrorBoundary from './Components/ErrorBoundary.jsx';
import { Loader2 } from 'lucide-react';

// Lazy-load all pages for better initial load performance
const AdminDashboard = lazy(() => import('./Pages/AdminDashboard.jsx'));
const Analytics = lazy(() => import('./Pages/Analytics.jsx'));
const Home = lazy(() => import('./Pages/Home.jsx'));
const RequestStaffAccess = lazy(() => import('./Pages/RequestStaffAccess.jsx'));
const RoleSelection = lazy(() => import('./Pages/RoleSelection.jsx'));
const StaffDashboard = lazy(() => import('./Pages/StaffDashboard.jsx'));
const StaffLogin = lazy(() => import('./Pages/StaffLogin.jsx'));
const Login = lazy(() => import('./Pages/Login.jsx'));
const StudentDashboard = lazy(() => import('./Pages/StudentDashboard.jsx'));
const StudentTakeTicket = lazy(() => import('./Pages/StudentTakeTicket.jsx'));
const StudentTicketView = lazy(() => import('./Pages/StudentTicketView.jsx'));
const TakeTicket = lazy(() => import('./Pages/TakeTicket.jsx'));

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
