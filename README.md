# Smart Queue

A smart digital queue management system for universities, built with **React + Vite** on the frontend and **Supabase** as the backend. Students join queues and track their ticket status in real time, while staff manage their service windows from a dedicated dashboard.

---

## ✨ Features

- 🎟️ **Digital Ticketing** — Students take a numbered ticket and see their live position in the queue
- 📣 **Real-time Updates** — Queue positions and ticket statuses update instantly via Supabase Realtime
- 🏢 **Multi-Department Support** — Staff can switch between departments from the dashboard
- 👩‍💼 **Staff Dashboard** — Call next ticket, mark as served, and view serving history
- 📊 **Analytics** — Admins can view queue metrics and activity reports
- 🔐 **Role-Based Access** — Separate flows for Students, Staff, and Admins
- 🛡️ **Rate Limiting & Validation** — Client-side request throttling and form input validation
- 🔔 **Browser Notifications** — Students receive an audio + browser notification when their ticket is called

---

## 📂 Project Structure

```
smart-queue/
├── index.html               # Single HTML entry point
├── vite.config.js           # Vite build configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── package.json             # Dependencies and npm scripts
├── database_schema.sql      # SQL schema for Supabase tables
└── src/
    ├── main.jsx             # React app entry point
    ├── App.jsx              # Root component with routing
    ├── Layout.jsx           # Global layout (navbar, sidebar)
    ├── index.css            # Global styles
    ├── Pages/               # Full-page views
    │   ├── Home.jsx                  # Landing / home page
    │   ├── RoleSelection.jsx         # Choose between Student / Staff
    │   ├── Login.jsx                 # Staff login page (Supabase Auth)
    │   ├── StaffLogin.jsx            # Alternative staff login entry
    │   ├── RequestStaffAccess.jsx    # New staff onboarding / access request
    │   ├── StudentEntry.jsx          # Student name/ID entry
    │   ├── TakeTicket.jsx            # Department selection for ticket
    │   ├── StudentTakeTicket.jsx     # Ticket issuance screen
    │   ├── StudentDashboard.jsx      # Student's live queue view
    │   ├── StudentTicketView.jsx     # Detailed ticket status + auto-cancel overlay
    │   ├── StaffDashboard.jsx        # Staff queue management panel
    │   ├── AdminDashboard.jsx        # Admin management panel
    │   └── Analytics.jsx            # Admin analytics & reporting
    ├── Components/          # Reusable UI components
    │   ├── ErrorBoundary.jsx         # Global error boundary
    │   ├── ui/                       # Base UI primitives
    │   │   ├── select.jsx            # Fully-implemented dropdown (used for dept switching)
    │   │   ├── button.jsx, card.jsx, dialog.jsx, tabs.jsx, badge.jsx, ...
    │   ├── admin/                    # Admin-specific components
    │   ├── staff/                    # Staff-specific components
    │   ├── student/                  # Student-specific components
    │   ├── departments/              # Department-related components
    │   └── common/                   # Shared cross-role components
    ├── api/
    │   ├── supabaseClient.js        # Supabase client initialisation
    │   └── apiClient.js             # Data access helpers (CRUD wrappers)
    ├── constants/
    │   └── index.js                 # App-wide constants (departments, statuses, etc.)
    ├── hooks/
    │   └── useAuth.js               # Custom hook for Supabase Auth state
    ├── utils/
    │   ├── rateLimit.js             # Client-side rate limiting utility
    │   └── validation.js            # Form validation helpers
    └── entities/                    # Data shape definitions (JSON)
```

---

## 🗄️ Backend (Supabase)

The project uses **Supabase** as a serverless Backend-as-a-Service — no separate server required.

| Resource | Purpose |
|---|---|
| `database_schema.sql` | SQL blueprint for all database tables (`departments`, `users`, `queue_tickets`, `staff_requests`) |
| `.env.local` | Secret keys: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| Supabase Realtime | Powers live queue position and status updates |
| Supabase Auth | Handles staff authentication (email/password) |
| Row-Level Security (RLS) | Enforces access rules directly in the database |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- A Supabase project (free tier works)

### 1. Clone and install
```bash
git clone https://github.com/your-org/smart-queue.git
cd smart-queue
npm install
```

### 2. Configure environment variables
Create a `.env.local` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up the database
Run the SQL in `database_schema.sql` inside your Supabase SQL Editor to create all required tables.

### 4. Run locally
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## 👥 User Roles

| Role | How to Access | Capabilities |
|---|---|---|
| **Student** | Open the app → Select "Student" | Take a ticket, track queue position, receive call notifications |
| **Staff** | Login with Supabase Auth | Call next ticket, mark served, switch departments |
| **Admin** | Admin dashboard login | Manage departments, users, view analytics |

---

## 🔧 Key Technical Decisions

- **Supabase Realtime** subscriptions are used in `StudentTicketView.jsx` and `StaffDashboard.jsx` to push database changes to the browser instantly.
- **Browser notifications + audio** are triggered when a ticket reaches `in_progress` status, alerting the student to proceed to the counter.
- **Department switching** in `StaffDashboard.jsx` uses a fully implemented custom `Select` component (`src/Components/ui/select.jsx`).
- **Rate limiting** (`src/utils/rateLimit.js`) prevents abuse of ticket creation and other actions.
