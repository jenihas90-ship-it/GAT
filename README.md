# Galo Travel Agency: International Recruitment Portal
> **Project:** Cross-Border Agency Management System  
> **Target Flow:** Ethiopia, Jordan, Saudi Arabia ➔ Dubai & Gulf Region Employers  
> **Stack:** React (Vite), Node.js, Express, MongoDB, Vercel, Cloudinary, Nodemailer

---

## 🌟 Architecture Overview

This platform replaces manual WhatsApp-based recruitment operations with an automated pipeline:
- **Frontend Portal:** React (Vite) interface implementing `react-i18next` for 4 languages:
  - Afaan Oromo (`om`)
  - Amharic (`am`)
  - English (`en`)
  - Arabic (`ar`) with automatic RTL (`dir="rtl"`) layout switching.
- **Backend API:** Node.js / Express server with JWT authentication, role-based access, and error handling.
- **Database:** MongoDB schema with strict enums for `pipelineStatus` (`Pending`, `Screened`, `Approved`, `Visa Processing`, `Placed`) and language arrays (`Afaan Oromo`, `Amharic`, `English`, `Arabic`).
- **Document Vault:** Cloudinary secure storage for applicant passports and medical records.
- **Notification Engine:** Asynchronous SMTP Nodemailer status updates upon candidate approval.
- **Serverless & Limits Safeguards:** Multer memory storage restricted to 5MB (`5 * 1024 * 1024`) to eliminate serverless function timeouts.

---

## 📁 Repository Structure

```text
Galo Travel Agency/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection logic
│   │   └── cloudinary.js         # Cloudinary configuration & buffer streaming
│   ├── controllers/
│   │   ├── authController.js     # Admin login & JWT generation
│   │   └── candidateController.js# Apply, query with filters, approve & email
│   ├── middleware/
│   │   ├── auth.js               # JWT verification middleware
│   │   └── upload.js             # Multer memory storage (5MB file limit)
│   ├── models/
│   │   ├── Candidate.js          # MongoDB Candidate schema
│   │   └── User.js               # Admin credentials schema
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/login
│   │   └── candidateRoutes.js    # /api/candidates
│   ├── services/
│   │   └── emailService.js       # Asynchronous Nodemailer SMTP dispatcher
│   ├── .env.example              # Template for environment configuration
│   ├── package.json
│   ├── server.js                 # Express server & CORS configuration
│   └── vercel.json               # Vercel serverless deployment config
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CandidateForm.jsx # Public multi-lingual application form
│   │   │   ├── AdminDashboard.jsx# Candidate filter table & approval actions
│   │   │   ├── AdminLogin.jsx    # Admin login modal
│   │   │   └── LanguageSwitcher.jsx
│   │   ├── locales/
│   │   │   ├── en.json           # English dictionary
│   │   │   ├── am.json           # Amharic dictionary (አማርኛ)
│   │   │   ├── om.json           # Afaan Oromo dictionary
│   │   │   └── ar.json           # Arabic dictionary (العربية)
│   │   ├── services/
│   │   │   └── api.js            # Axios client with JWT interceptor
│   │   ├── App.jsx               # Main layout + dynamic RTL hook
│   │   ├── i18n.js               # react-i18next setup
│   │   ├── index.css             # Responsive styling with RTL support
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** (Local instance or MongoDB Atlas cluster)

### 2. Environment Variables Configuration
In `backend/`, copy `.env.example` to `.env`:

```bash
cd backend
cp .env.example .env
```

Update your `.env` parameters:
```env
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/galo_recruitment
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_URL=cloudinary://<key>:<secret>@<cloud_name>
GMAIL_USER=recruitment@galotravel.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

*(Note: In development, if Cloudinary or Gmail SMTP keys are omitted, safe simulation fallbacks are executed so you can test immediately.)*

### 3. Starting the Servers

#### Start Backend:
```bash
cd backend
npm.cmd run dev
# Server runs on http://localhost:5000
```

#### Start Frontend:
```bash
cd frontend
npm.cmd run dev
# Frontend runs on http://localhost:5173
```

---

## 🔒 API Endpoints & Access

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/candidates/apply` | **Public** | Multipart form data with text fields and `passportFile` (max 5MB). Buffers file, streams to Cloudinary, stores Candidate in MongoDB. |
| `GET` | `/api/candidates` | **Admin (JWT)** | Retrieves candidate records. Supports query parameters `?status=Pending&country=Ethiopia`. |
| `PUT` | `/api/candidates/:id/approve` | **Admin (JWT)** | Updates candidate status to `'Approved'` and asynchronously sends approval email via Nodemailer. |
| `PUT` | `/api/candidates/:id/status` | **Admin (JWT)** | Updates candidate pipeline status (`Screened`, `Visa Processing`, `Placed`). |
| `POST` | `/api/auth/login` | **Public** | Authenticates admin user and returns signed JWT token. Default dev admin: `admin` / `admin123`. |

---

## 🌐 Localization & Dynamic RTL

When users choose Arabic (`ar`), the dynamic hook flips the layout:
```javascript
useEffect(() => {
  document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
}, [i18n.language]);
```
Supported locales:
- `en`: English
- `am`: Amharic (አማርኛ)
- `om`: Afaan Oromo
- `ar`: Arabic (العربية - RTL)

---

## ☁️ Unified Full-Stack Vercel Deployment (Frontend & Backend on One)

Both the **React Frontend** and the **Express REST API** are configured to deploy together as a **single unified project** in Vercel using the root `vercel.json` and `api/` serverless gateway:

1. In the **Vercel Dashboard**, click **Add New... ➔ Project** and import:
   👉 `https://github.com/jenihas90-ship-it/GAT.git`
2. **Root Directory:** Leave as `./` (default). **Do NOT select `frontend` or `backend`**.
3. **Build & Output Settings:** Vercel automatically detects the root `vercel.json`:
   - Frontend builds to `frontend/dist` and handles client routes.
   - All `/api/*` endpoints are handled by the serverless Express backend (`api/index.js`).
4. **Environment Variables** (Add in Vercel Project Settings):
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: Secret key for admin authentication.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary credentials for passport document uploads.
   - `SMTP_USER`, `SMTP_PASS`: Email credentials for candidate approval notifications.

---

## 💻 Standalone / Single-Server Deployment (Render, Railway, or VPS)
You can also run both frontend and backend on a single port using Node.js:
```bash
# 1. Install all dependencies
npm run install:all

# 2. Build the production React frontend
npm run build

# 3. Launch the unified full-stack server
npm start
# App is live on http://localhost:5000 (serving both API & Frontend)
```
