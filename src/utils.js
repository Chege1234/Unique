import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function createPageUrl(name) {
    const mapping = {
        Home: "/",
        AdminDashboard: "/admin",
        Analytics: "/analytics",
        RequestStaffAccess: "/request-staff-access",
        RoleSelection: "/role-selection",
        StaffDashboard: "/staff-dashboard",
        StaffLogin: "/staff-login",
        StudentDashboard: "/student-dashboard",
        StudentEntry: "/student-entry",
        StudentTakeTicket: "/student-take-ticket",
        StudentTicketView: "/student-ticket-view",
        TakeTicket: "/take-ticket",
    };
    return mapping[name] || `/${name.toLowerCase()}`;
}
