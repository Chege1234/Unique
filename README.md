# Smart Queue - Project Structure

This document explains how the files in this project are organized and what each part does.

Since we are using **Supabase** for the backend, we don't need a traditional "backend" server folder full of Node.js or Python code. Instead, the "backend" is managed directly by Supabase, and our frontend talks directly to the database securely.

## 📂 Frontend (React + Vite)
The frontend code is all located inside the `src/` directory.

- **`src/main.jsx` & `src/App.jsx`**: The starting points of the React application. They set up routing and global providers.
- **`src/Pages/`**: Contains the full screen views for different user roles.
  - `AdminDashboard.jsx`, `StaffDashboard.jsx`, `StudentDashboard.jsx`: The main control panels for each type of user.
  - `TakeTicket.jsx`, `StudentTakeTicket.jsx`: The screens where students join the queue.
  - `RequestStaffAccess.jsx`, `StaffLogin.jsx`: Authentication and staff onboarding screens.
- **`src/Components/`**: Smaller, reusable UI pieces like Buttons, Cards, or specific sections like the `StaffRequestManager`.
- **`src/api/`**: 
  - `supabaseClient.js`: Initializes the connection to our Supabase database.
  - `base44Client.js`: Contains the helper functions that the UI uses to fetch/update data from Supabase (e.g., creating a ticket).
- **`src/Entities/` (or `Entitites/`)**: Contains JSON files that describe the shape of our data (like what fields a `Department` or `QueueTicket` has).
- **`src/index.css` & `src/Layout.jsx`**: Global styles and the main structural layout (navbar, sidebar) of the app.

## 🗄️ Backend (Supabase Database)
Because we use a Serverless BaaS (Backend-as-a-Service), the backend configuration lives in your Supabase Dashboard, alongside these key files:

- **`database_schema.sql`**: The blueprint of the backend. It contains the exact SQL commands used to create the tables in the Supabase database (`departments`, `users`, `queue_tickets`, `staff_requests`). This is the reference for how the data is stored.
- **`.env.local`**: Contains the secret keys (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) that act as a bridge, allowing the frontend to talk to the backend.

## ⚙️ Configuration Files (Root Level)
These are standard tool configuration files that sit in the main folder:
- **`package.json`**: Lists all the external libraries the app uses (React, Tailwind, Supabase) and script commands (`npm run dev`).
- **`vite.config.js`**: Configuration for Vite, the build tool that runs the frontend.
- **`tailwind.config.js` & `postcss.config.js`**: Settings for Tailwind CSS, which handles the styling of the app.
- **`index.html`**: The single HTML page that loads the React application.
