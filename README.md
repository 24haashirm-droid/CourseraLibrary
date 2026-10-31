# CourseFinder 🎯
### Smart Global Library for Long-Duration Online Courses

> **CourseFinder** simplifies the academic discovery of long-duration courses (20+ and 30+ hours) with projects, combined with a **Chrome Manifest V3 Browser Extension** that detects course details and displays your personal academic completion status (*Already Completed*, *In Progress*, or *You can do this — Not Completed*) right on learning platforms like Coursera and edX.

---

## 🚀 Key Features

1. **Global Course Library (Web Platform)**
   - Curated, centralized database of accredited online courses.
   - **Duration Filter**: Seamlessly filter by **20+ Hours** and **30+ Hours** (courses with 35+ hours qualify for both categories).
   - **Project Filter**: Binary toggle (`Yes, includes project` / `No project`) for academic capstone requirements.
   - **Search & Multi-Filters**: Instant search across titles, platforms, categories, and difficulty levels.

2. **Personal Academic Status Tracking**
   - **Core Principle**: *Course information is global, but course completion status is personal to each user.*
   - Dynamic status badges:
     - 🎯 **You can do this — Not Completed** (Available to enroll)
     - ⏳ **Currently In Progress**
     - ✅ **Already Completed**
   - Personal semester notes and credit hours tracker.

3. **Community Course Contribution & Review Queue**
   - Students can contribute new courses into a pending review queue.
   - Administrator dashboard with metrics, submission verification, in-place editing, and 1-click **Approve & Publish** or **Reject** actions.
   - Full catalog management (edit durations, project tags, remove duplicates).

4. **Chrome Manifest V3 Browser Extension**
   - Injects a sleek floating overlay badge directly when browsing supported platforms (Coursera, edX, Udemy).
   - Automatically compares detected course with CourseFinder database.
   - Displays duration eligibility (`✓ 20+ Hours`, `✓ 30+ Hours`), project availability, and your personal academic status.
   - Direct 1-click status update buttons right inside the webpage!
   - 1-click course contribution if the course is not yet in the library.
   - Extension toolbar popup with live quick search and account synchronization.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs password hashing
- **Database**: SQLite3 (`coursefinder.db`) with zero external daemon requirements (auto-migrated and seeded)
- **Browser Extension**: Chrome Extension Manifest V3 (Background Service Worker, Content Scripts, Popup)

---

## 📦 Project Structure

```
coursefinder/
├── backend/
│   ├── data/
│   │   └── coursefinder.db        # SQLite database
│   ├── src/
│   │   ├── db.js                  # Database connection & table initializers
│   │   ├── seed.js                # Initial courses and demo users seed
│   │   ├── server.js              # Express API server entry
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT auth & admin guard
│   │   └── routes/
│   │       ├── auth.js            # Register, Login, Me, Users
│   │       ├── courses.js         # Library courses (with 20+/30+ duration filters)
│   │       ├── submissions.js     # User submission & Admin review queue
│   │       ├── userStatus.js      # Personal course status CRUD
│   │       └── extension.js       # Extension URL/title matching & quick submit
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── CourseCard.jsx
│   │   │   ├── CourseFilters.jsx
│   │   │   ├── CourseDetailsModal.jsx
│   │   │   ├── SubmitCourseModal.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── MyLearningDashboard.jsx
│   │   │   ├── ExtensionTester.jsx
│   │   │   └── AuthModal.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
│
├── extension/                     # Chrome Manifest V3 Extension
│   ├── manifest.json              # MV3 configuration
│   ├── content.js                 # On-page course detector & floating badge
│   ├── content.css                # Floating badge styling
│   ├── background.js              # Service worker & API communication
│   ├── popup.html                 # Extension popup interface
│   ├── popup.js                   # Popup logic & quick search
│   ├── test-page.html             # Simulated Coursera course partner page
│   └── icons/                     # 16px, 48px, 128px PNG icons
│
├── start.bat                      # One-click Windows starter script
└── README.md
```

---

## ⚡ Quick Start

### Option A: One-Click Launch (Windows)
Double-click `start.bat` in the project root. It will automatically start both the backend server on port 5000 and the frontend on port 3000 in separate terminals.

### Option B: Manual Command Line Launch

**1. Start the Backend Server:**
```powershell
cd backend
npm start
```
*Server starts on `http://localhost:5000` and automatically initializes the database with demo courses.*

**2. Start the Frontend Application:**
```powershell
cd frontend
npm run dev
```
*Vite dev server starts on `http://localhost:3000`.*

---

## 👥 Demo Accounts (Pre-Seeded)

| Role | Email | Password | Features Accessible |
| :--- | :--- | :--- | :--- |
| **Normal User (Student)** | `student@university.edu` | `student123` | Browse catalog, filter 20+/30+ hours, track personal completion status, contribute courses |
| **Administrator** | `admin@coursefinder.edu` | `admin123` | Review pending queue, approve/reject submissions, edit course catalog, remove duplicates |

*Tip: The web application also contains a **"Demo Switcher"** button in the top navigation bar to switch between Student and Admin accounts in 1 click.*

---

## 🧩 Installing & Testing the Chrome Extension

1. Open Google Chrome (or Microsoft Edge / Brave).
2. In the URL bar, go to `chrome://extensions`.
3. Enable the **"Developer mode"** toggle in the top-right corner.
4. Click **"Load unpacked"** in the top-left toolbar.
5. Select the `extension` folder inside this project directory (`.../coursefinder/extension`).
6. You will see **CourseFinder - Smart Course Status Detector** installed!
7. **Test It Immediately**:
   - Open the web application and click the **"Browser Extension"** tab.
   - Click the **"Open Simulated Coursera Tab"** button (or open `extension/test-page.html`).
   - You will see the floating **CourseFinder widget** appear at the top-right corner of the learning page, detecting course hours, project requirement, and your personal academic completion status!
