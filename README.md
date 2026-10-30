# MEC Academy — Learning Management System (LMS)

A complete, production-ready, web-based Learning Management System for **MEC Academy**, engineered with role-separated portals for Students, Instructors, Mentors, Operations Staff, and an Academic Supervisor.

---

## 1. Technology Stack

- **Runtime & Backend**: Node.js v24 + Express 5 REST API
- **Frontend Architecture**: React 19 + Vite + Tailwind CSS 4
- **Interactive QR Code Ecosystem**:
  - Generation: `qrcode` (high-resolution PNG & SVG data URLs with error correction level H)
  - Scanning: `html5-qrcode` (webcam environment camera + snapshot file decoder + manual token fallback)
- **Reporting & Data Export**: `xlsx` (SheetJS) generating authentic 4-sheet Microsoft Excel workbooks (`.xlsx`)
- **Data Persistence**: Atomic, file-backed relational data store (`server/data/database.json`), seeded with realistic academy data and reset capabilities

---

## 2. Access Architecture & Segregated Gateways

### A. Learner & Faculty Portal (`/login` or `/`)
Divided into **three clearly labeled, role-specific sections**:
1. **🎓 Student Section**: Authenticates enrolled learners into their private dashboard.
2. **👨‍🏫 Instructor Section**: Authenticates teaching faculty into course delivery & grading.
3. **🧭 Mentor Section**: Authenticates student success mentors to track at-risk learners.

*Each section strictly validates the account role: an instructor cannot log in under the student card, and vice versa.*

### B. Segregated Staff & Governance Gateway (`/admin`)
- Operations staff and the academy supervisor access the platform via a **dedicated, segregated access path**.
- Enforces strict role authorization (learner accounts are blocked with `403 Forbidden`).
- Serves the **Operations Management Portal** and **Supervisor Institutional Oversight**.

---

## 3. Data Model

```
                    ┌───────────────────────────┐
                    │          Course           │
                    │───────────────────────────│
                    │ id, code, title           │
                    │ price (visible in list)   │
                    │ totalPlannedSessions      │
                    │ hasQuizzes                │
                    └─────────────┬─────────────┘
                                  │ 1
                                  │
                                  │ *
┌──────────────────────┐    ┌─────┴─────────────────────┐    ┌──────────────────────┐
│      Instructor      │1  *│           Group           │*  1│        Mentor        │
│──────────────────────│────│───────────────────────────│────│──────────────────────│
│ id, name, email      │    │ id, name, schedule        │    │ id, name, email      │
│ specialization       │    │ status (active/completed) │    │ expertise            │
└──────────────────────┘    └─────┬─────────────────────┘    └──────────────────────┘
                                  │ *
                                  │
                                  ├───────────────────────────────┐
                                  │ *                             │ *
                    ┌─────────────┴─────────────┐   ┌─────────────┴─────────────┐
                    │          Student          │   │          Session          │
                    │───────────────────────────│   │───────────────────────────│
                    │ id, name, email, phone    │   │ id, sessionNumber, title  │
                    │ enrolledAt                │   │ status ('held'/'scheduled')│
                    └─────────────┬─────────────┘   │ qrCodeToken               │
                                  │                 │ recordedSession           │
                                  │                 │ assignments[]             │
                                  │                 │ instructorMaterials[]     │
                                  │                 │ presentations[]           │
                                  │                 └─────────────┬─────────────┘
                                  │ *                             │ 1
                                  └───────────────┬───────────────┘
                                                  │
                                    ┌─────────────┴─────────────┐
                                    │     AttendanceRecord      │
                                    │───────────────────────────│
                                    │ id, checkInTime           │
                                    │ checkInMethod ('qr_scan') │
                                    │ status ('attended')       │
                                    └───────────────────────────┘
```

---

## 4. Main Screens & Core Logic

### 1. Student Portal
- **Dynamic Attendance Counter**:
  - Derived strictly from the group's session records:
    $$\text{Sessions Held} = \sum [\text{session.status} = \text{'held'}]$$
    $$\text{Sessions Attended} = \sum [\text{attendance.studentId} = \text{studentId} \land \text{session.status} = \text{'held'}]$$
  - Displays: `"12 of 15 sessions attended"` along with the exact percentage ($80\%$) and color-coded standing progress bar.
- **QR Code Check-In Scanner**:
  - Live webcam scan using `html5-qrcode`
  - File upload decoder for QR images
  - Manual passcode input fallback (`MEC-QR-ALPHA-15-ACTIVE-9921`)
  - Instant attendance validation and counter update.
- **Grouped Session Curriculum**:
  - For each session, four structured sections:
    1. **Recorded sessions**: Video stream player, duration, topics, and recap.
    2. **Assignments**: Due date, max points, submission modal (GitHub/Drive links), grade & feedback.
    3. **Instructor materials**: Lecture notes, starter code repositories, PDFs.
    4. **Presentations**: Keynote slide decks and slide counters.

### 2. Instructor Portal
- **Live QR Code Generation**:
  - Generates real-time, high-contrast QR codes for any session with single-click projector full-screen mode and downloadable PNGs.
  - Live session roster with verified QR check-in badges and manual override toggle.
- **Excel Export (`.xlsx`)**:
  - Generates authentic 4-sheet Microsoft Excel workbooks containing:
    1. `Registered Students`: Full roster, attendance rates, assignments completed.
    2. `Attendance Per Session`: Matrix of Session 1 to Session $N$ (`PRESENT` / `ABSENT` / `UPCOMING`).
    3. `Assignment Submissions`: Assignment titles, submission URLs, dates, points, and instructor feedback.
    4. `Quiz Submissions`: (included when course uses quizzes) Scores, max scores, pass/fail status.

### 3. Mentor Portal
- Cohort tracking and mentee roster.
- **At-Risk Radar**: Flags learners with $<75\%$ attendance or lagging deliverables.
- Advisory note dispatch system to record office hours and tutoring interventions.

### 4. Operations Portal
- **Course Catalog Management**:
  - Add, list, and edit courses.
  - **Each course's price is prominently visible in the list** (e.g. `$1,250 USD`).
- **Staff & Student Management**:
  - Add and update Instructors, Mentors, and Students.
- **Group Linking**:
  - Links a Course, an Instructor, a Mentor, and enrolled Students.

### 5. Supervisor Oversight View
- Read-focused institutional oversight dashboard:
  - High-level KPIs: Active Cohorts, Total Learners, Academy-wide Attendance Average, Sessions Delivered vs Planned.
  - **Cross-Group Oversight Matrix**: Course, Instructor, Mentor, Student Count, Progress (Held/Total), Cohort Attendance Rate, Health Standing.
  - **Faculty Delivery Fidelity**: Sessions taught and average class attendance.
  - **Mentor Support Caseloads**: Mentee ratios and flagged at-risk learners.
  - **Student Risk Radar**: Institutional supervisory advisory dispatch.

---

## 5. Seed Accounts (1-Click Demo Login)

| Role | Name | Email | Password | Notable Data |
|---|---|---|---|---|
| **Student** | Omar Tarek | `omar.tarek@student.mec.edu` | *(Any)* | **12 of 15 sessions attended** |
| **Student** | Sarah Mansour | `sarah.mansour@student.mec.edu` | *(Any)* | 14 of 15 sessions attended |
| **Instructor** | Dr. Tarek Ezzat | `tarek.ezzat@mec.edu` | *(Any)* | Lead Faculty (Cohort Alpha) |
| **Mentor** | Ahmed Fathy | `ahmed.fathy@mec.edu` | *(Any)* | Lead Mentor (Cohort Alpha) |
| **Operations** | Mariam Samir | `mariam.samir@mec.edu` | *(Any)* | Operations Lead (`/admin`) |
| **Supervisor** | Dr. Khaled Al-Masry | `khaled.masry@mec.edu` | *(Any)* | Academic Director (`/admin`) |

---

## 6. Running the Application

### Option A: Unified Full-Stack Server
```bash
# From the project root
npm start
```
The server starts on `http://localhost:5000`, serving the Express REST API and the built production client.

### Option B: Development Mode with Hot Reload
```bash
# Terminal 1: Backend API
node server/index.js

# Terminal 2: Vite React Frontend
cd client
npm run dev
```
Open `http://localhost:3000` in your browser.
