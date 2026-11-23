# CivicConnect – Smart Public Grievance Management System

CivicConnect is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application designed to bridge the communication gap between citizens and municipal authorities. It provides a centralized digital grievance portal where citizens report civic infrastructure issues (potholes, garbage accumulation, broken streetlights, water leaks, drainage failures), municipal field officers manage and resolve them, and administrators oversee citywide operations.

---

## 🏛️ Key Features by Role

### 1. Citizen Portal
- **User Registration & Login:** JWT-authenticated citizen accounts with session persistence.
- **Lodge Grievance:** Submit complaints with title, category, description, exact location, landmark, city, pincode, urgency priority, and photograph attachment.
- **Live Status Tracking:** Visual 5-step workflow tracker (`Submitted` → `Pending` → `Assigned` → `In Progress` → `Resolved`).
- **Interactive Feedback & Rating:** Rate municipal repair work from 1 to 5 stars with review comments upon resolution.
- **Filtering & Search:** Real-time search across ticket IDs, street names, categories, and status filters.

### 2. Municipal Officer Console
- **Role-Based Dashboard:** Tailored view for field engineers and sanitary inspectors.
- **Assigned Tasks:** View grievances assigned to the officer's department.
- **Workflow Transitions:** Update complaint lifecycle state (`In Progress`, `Resolved`, `Rejected`).
- **Resolution Remarks:** Record official on-site repair notes and completion timestamps.
- **Audit Trail:** View citizen contact details and complete grievance history.

### 3. Administrator Master Dashboard
- **Citywide Analytics:** Visual summary cards, category distributions, and resolution rate metrics.
- **Grievance Assignment:** Allocate pending complaints to specific municipal officers with instructions.
- **Officer Provisioning:** Create and onboard new municipal officers across departments.
- **Category Management:** Dynamically add or delete civic issue categories and managing wings.
- **Citizen Directory:** View registered citizens and manage account statuses.

---

## 💻 Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite, Bootstrap 5, Bootstrap Icons, HTML5 Semantic Elements, CSS3 (Light Civic Theme) |
| **Backend** | Node.js, Express.js, RESTful API architecture, Multer (file uploads), JWT, Bcrypt.js |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Authentication** | JSON Web Tokens (Bearer Token authentication) with Role-Based Access Control (RBAC) |
| **Deployment** | Vercel (Frontend SPA) & Render (Backend Node API) |

---

## 📁 Project Directory Structure

```text
CivicConnect/
├── client/                     # Frontend React.js application (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/         # Navbar, Footer, StatusBadge, Timeline, StarRating, ProtectedRoute
│   │   ├── context/            # AuthContext (JWT session management)
│   │   ├── pages/              # Home, Login, Register, CitizenDashboard, NewComplaint,
│   │   │                       # ComplaintDetail, OfficerDashboard, AdminDashboard
│   │   ├── services/           # api.js (Fetch API HTTP wrapper)
│   │   ├── App.jsx             # React Router routing configuration
│   │   ├── index.css           # Clean light theme stylesheet
│   │   └── main.jsx
│   ├── index.html              # Bootstrap 5 & Google Fonts CDN
│   ├── package.json
│   ├── vercel.json             # Vercel SPA client rewrite rules
│   └── vite.config.js
│
├── server/                     # Backend Express.js API
│   ├── config/
│   │   └── db.js               # MongoDB Mongoose connection
│   ├── controllers/            # auth, complaint, category, user, stats controllers
│   ├── middleware/             # JWT auth & Multer upload middleware
│   ├── models/                 # User, Category, Complaint Mongoose schemas
│   ├── routes/                 # Express API endpoints
│   ├── uploads/                # Local uploaded grievance photographs
│   ├── package.json
│   ├── seed.js                 # Database seeder with sample demo data
│   └── server.js               # Express application entrypoint
│
├── .gitignore
├── package.json                # Root package with helper scripts
└── README.md                   # Complete documentation & deployment guide
```

---

## 🔑 Pre-Configured Demo Accounts

For evaluation, testing, or viva demonstrations, you can log in immediately with the following pre-seeded credentials:

| Role | Email | Password | Department / Notes |
|---|---|---|---|
| **Administrator** | `admin@civicconnect.com` | `admin123` | City Administration & Assignment Control |
| **Officer (Roads)** | `officer.roads@civicconnect.com` | `officer123` | Roads & Infrastructure Wing |
| **Officer (Sanitation)** | `officer.sanitation@civicconnect.com` | `officer123` | Sanitation & Solid Waste Management |
| **Citizen** | `citizen@example.com` | `citizen123` | Registered Local Citizen |

*(Tip: The Sign In page also includes one-click demo autofill buttons!)*

---

## 🗄️ Step-by-Step MongoDB Atlas Setup Guide

1. **Create an Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database) and sign up for a free account.

2. **Build a Free Database (M0 Cluster):**
   - Click **Create Database** / **Build a Database**.
   - Select the **M0 Free** shared tier.
   - Choose your nearest cloud provider region (e.g., AWS / Mumbai `ap-south-1`).
   - Click **Create**.

3. **Configure Database Access (Username & Password):**
   - In the left sidebar under **Security**, navigate to **Database Access**.
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Set a username (e.g., `civicadmin`) and password (e.g., `CivicPass123!`).
   - Built-in Role: **Read and write to any database**.
   - Click **Add User**.

4. **Configure Network Access (IP Whitelist):**
   - In the left sidebar under **Security**, navigate to **Network Access**.
   - Click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`). *(This allows your local machine, Render, and Vercel to connect without blocking).*
   - Click **Confirm**.

5. **Obtain Connection String:**
   - Go to **Database** (or **Clusters**) in the left sidebar.
   - Click **Connect** next to your cluster.
   - Select **Drivers** (Node.js).
   - Copy the connection URI:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials.
   - Append `/civicconnect` before the `?` to set the database name:
     ```text
     mongodb+srv://civicadmin:CivicPass123!@cluster0.xxxxx.mongodb.net/civicconnect?retryWrites=true&w=majority
     ```

6. **Save in `server/.env`:**
   ```env
   PORT=5000
   MONGODB_URI=your_copied_mongodb_connection_string
   JWT_SECRET=civicconnect_super_secret_jwt_key_2026
   ```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Git](https://git-scm.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/omkumar-rajput/CivicConnect.git
cd CivicConnect
```

### 3. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env and enter your MONGODB_URI
npm run seed     # (Optional) Populates default categories & demo accounts
npm run dev      # Starts Express server on http://localhost:5000
```

### 4. Frontend Setup
In a new terminal window:
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Step-by-Step Backend Deployment on Render

1. Sign up / Log in to [Render](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository: `CivicConnect`.
4. Configure the Web Service settings:
   - **Name:** `civicconnect-api`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Add **Environment Variables** in Render:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` *(Render sets this automatically)* |
   | `MONGODB_URI` | *Your MongoDB Atlas connection URI string* |
   | `JWT_SECRET` | *Any strong random string (e.g. `civicconnect_secret_jwt_key`)* |
6. Click **Create Web Service**.
7. Once deployed, note down your Render backend URL (e.g., `https://civicconnect-api.onrender.com`).

---

## ⚡ Step-by-Step Frontend Deployment on Vercel

1. Sign up / Log in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository: `CivicConnect`.
4. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click Edit and select `client`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add **Environment Variable**:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://civicconnect-api.onrender.com/api` *(Your Render backend URL with `/api`)* |
6. Click **Deploy**.
7. Within 1 minute, your CivicConnect web app will be live with a permanent URL (e.g., `https://civicconnect.vercel.app`).

---

## 🔄 Complaint Status Workflow

Every reported grievance moves through a defined, auditable municipal lifecycle:

```mermaid
stateDiagram-v2
    [*] --> Submitted: Citizen logs issue with photos & location
    Submitted --> Pending: Verified into municipal queue
    Pending --> Assigned: Admin assigns to Department Officer
    Assigned --> In_Progress: Field officer dispatches repair crew
    In_Progress --> Resolved: Repair completed & remarks posted
    Resolved --> Feedback: Citizen submits 1-5 star rating & review
    Feedback --> [*]
```

---

## 🎓 Web Technology Practical Concepts Demonstrated

This project adheres to university and collegiate Web Technology practical curriculum guidelines:

1. **HTML5 Semantic Structure:** `<header>`, `<nav>`, `<main>`, `<section>`, `<table>`, `<form>`, `<figure>`.
2. **CSS3 Architecture:** CSS Flexbox, CSS Grid, custom color variables (`:root`), card elevation, and responsive media queries.
3. **Bootstrap 5:** Grid system, responsive navigation toggler, modal dialogs, badges, and icon typography.
4. **JavaScript & React.js:** Hooks (`useState`, `useEffect`, `useContext`, `useMemo`), functional components, and client-side routing with `react-router-dom`.
5. **Form Validation:** Dual-layer validation (client-side interactive feedback and server-side Mongoose schema validation).
6. **Asynchronous JS & Fetch API:** Modern `async/await`, Promises, error catching, and JSON payload serialization.
7. **Node.js & Express.js:** Modular routing, custom middleware for JWT validation, error handling, and file processing via Multer.
8. **Database & CRUD with Mongoose:** Document schemas with relationship references (`ref: 'User'`), subdocuments, pre-save hooks, and population queries.
9. **Deployment & DevOps:** Version-controlled with Git, multi-service deployment across Vercel and Render, and cloud database connectivity with MongoDB Atlas.

---

## 📄 License
This project is developed for educational and academic evaluation purposes.
