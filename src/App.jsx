import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './Layout.jsx';

// Import all pages
import AdminDashboard from './Pages/AdminDashboard.jsx';
import Analytics from './Pages/Analytics.jsx';
import Home from './Pages/Home.jsx';
import RequestStaffAccess from './Pages/RequestStaffAccess.jsx';
import RoleSelection from './Pages/RoleSelection.jsx';
import StaffDashboard from './Pages/StaffDashboard.jsx';
import StaffLogin from './Pages/StaffLogin.jsx';
import StudentDashboard from './Pages/StudentDashboard.jsx';
import StudentEntry from './Pages/StudentEntry.jsx';
import StudentTakeTicket from './Pages/StudentTakeTicket.jsx';
import StudentTicketView from './Pages/StudentTicketView.jsx';
import TakeTicket from './Pages/TakeTicket.jsx';

const queryClient = new QueryClient();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    {/* Routes without Layout or with specific Layout logic handled inside Layout.jsx */}
                    <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
                    <Route path="/admin" element={<Layout currentPageName="AdminDashboard"><AdminDashboard /></Layout>} />
                    <Route path="/analytics" element={<Layout currentPageName="Analytics"><Analytics /></Layout>} />
                    <Route path="/request-staff-access" element={<Layout currentPageName="RequestStaffAccess"><RequestStaffAccess /></Layout>} />
                    <Route path="/role-selection" element={<Layout currentPageName="RoleSelection"><RoleSelection /></Layout>} />
                    <Route path="/staff-dashboard" element={<Layout currentPageName="StaffDashboard"><StaffDashboard /></Layout>} />
                    <Route path="/staff-login" element={<Layout currentPageName="StaffLogin"><StaffLogin /></Layout>} />
                    <Route path="/student-dashboard" element={<Layout currentPageName="StudentDashboard"><StudentDashboard /></Layout>} />
                    <Route path="/student-entry" element={<Layout currentPageName="StudentEntry"><StudentEntry /></Layout>} />
                    <Route path="/student-take-ticket" element={<Layout currentPageName="StudentTakeTicket"><StudentTakeTicket /></Layout>} />
                    <Route path="/student-ticket-view" element={<Layout currentPageName="StudentTicketView"><StudentTicketView /></Layout>} />
                    <Route path="/take-ticket" element={<Layout currentPageName="TakeTicket"><TakeTicket /></Layout>} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}
