Gemini Agent Configuration: Medication & Prescription Tracker
This file instructs the Gemini agent on the rules, technologies, and architecture for the "Medication & Prescription Tracker" project.

1. Core Project Files
All development must follow the specifications defined in the following files located in the project's root directory. These files are the single source of truth.

Development Plan: Dev-flow.txt

This 6-step file dictates the entire build order and feature set.

All code generation must strictly adhere to the user's current step in this plan.

Database Schema: DatabaseSchema.sql

This file defines all table structures, relationships, and constraints.

2. Core Technologies
Always generate code and provide explanations for this specific stack, as specified in Dev-flow.txt.

Frontend: React (functional components, hooks), react-router-dom, and pure CSS (no frameworks).

Backend: Node.js with Express.

Database: MySQL.

Authentication: JWT (JSON Web Tokens) and bcryptjs for password hashing.

File Uploads: multer for handling lab reports (PDFs, images).

Calendar: react-calendar (or a similar lightweight library).

Charts: chart.js with react-chartjs-2 for progress visualization.

3. Database & Schema
Source of Truth: The database schema is defined only by DatabaseSchema.sql.

Key Principle: The schema uses Surrogate Keys (e.g., id, user_id, patient_id).

Rule: All SQL queries must use these surrogate keys (like user_id) for JOIN and WHERE clauses. Do not use non-key fields like email for relationships.

4. Backend API (Node.js/Express)
Style: Use modern JavaScript (ESM - import/export) and async/await.

Database Connection: Use the mysql2/promise library for promise-based queries.

Error Handling: All API routes must include try...catch blocks and send meaningful JSON error responses.

Security:

All queries must be parameterized (using ? placeholders) to prevent SQL injection.

Always use bcrypt.compare for password validation.

Role-Based Access Control (RBAC): This is critical.

A custom JWT middleware must be created.

This middleware must not only verify the token but also check the role ('doctor' or 'patient') in the token's payload.

All API routes must be protected by this middleware to enforce role permissions (e.g., only 'doctor' can POST /api/doctor/medications, only 'patient' can POST /api/patient/calendar/tick).

File Handling: Use the multer middleware for securely handling multipart/form-data uploads (lab reports).

Logic: All business logic (e.g., adherence progress calculation) must be performed on the backend, as specified in Dev-flow.txt.

5. Frontend (React)
Style: Use functional components and hooks (useState, useEffect, useContext). Do not use class components.

Data Fetching: Use the fetch API or axios.

State Management: Use built-in React hooks (Context, useState) for managing global state, especially the JWT, user details, and the user's role.

Routing: Use react-router-dom for all page navigation. Create protected routes that check for a valid JWT.

Conditional Rendering: The UI must heavily rely on the user's role (stored in state) to show or hide elements (e.g., "Add Patient" button for Doctors, "Tick Calendar" for Patients).

6. Development Workflow
Strict Adherence: The project must be built following the 6 steps in Dev-flow.txt in order.

No Skipping: Do not introduce concepts or code from future steps (e.g., do not suggest "File Uploads" if the user is on "Step 1: Authentication").