<<<<<<< HEAD
# FMC Clinical Placement Management System — Frontend

React 19 + Vite + TypeScript single-page app for the **FMC Clinical Placement Management System (CIMS)**.
It is the web client for the FMC backend API and supports four roles: **admin**, **coordinator**,
**supervisor**, and **student**.

## Features (mirrors the FMC API)

- **Auth** — login, refresh, change/reset password, current user.
- **Registration & Payment** — self-service student registration with Credo checkout, payment verification,
  and coordinator review → enroll / reject / re-enroll.
- **Institutions** — admin CRUD + public listing (used in registration).
- **Batches** — CRUD, activate/archive, assign supervisor, link curriculum, assign quiz, stats & students.
- **Curriculum** — topics/subtopics CRUD; per-student "my curriculum".
- **Quizzes** — question CRUD; gated per-student quiz with submission and scoring.
- **Logbooks** — student create/submit; supervisor review.
- **Internships** — history, status transitions (`placed → active → completed`), set current.
- **Evaluations** — supervisor evaluation submission, per-student results, ranked composite results.
- **Certificates** — request, status, my-certificate (PDF), admin bulk approve/reject, public verification.
- **Notifications** — list, mark read/all-read, delete (REST polling).
- **System settings** — institution branding (name, contact, logo).

## Tech

- React 19, React Router 7, TanStack Query 5, Axios (with silent refresh-token retry).
- Vite 8, TypeScript. TipTap rich text, qrcode.react, html2pdf.js for certificates.

## Getting started

```bash
npm install
npm run dev      # start dev server
npm run build    # tsc -b && vite build
npm run lint
```

## Configuration (`.env`)

```
VITE_API_URL=http://localhost:5000/api   # FMC backend origin + /api
VITE_APP_NAME=FMC CIMS
VITE_APP_EMAIL=support@fmc.example.ng
VITE_ADDRESS=Federal Medical Centre, Nigeria
```

## Architecture

```
src/api/services/*   thin axios wrappers (return response.data)
src/api/types/*      request/response TypeScript types
src/hooks/*          TanStack Query hooks (queries + mutations, toast + cache invalidation)
src/pages/*          role-scoped pages (Admin / Students / Supervisors / Shared / public)
src/routes/*         per-role route trees + ProtectedRoute
src/config/*NavConfig sidebar navigation per role
src/components/ui/*   shared UI kit (tables, modals, filters, etc.)
```
=======
# cims CIMS - Clinical Internship Management System 
>>>>>>> 8906ab9b630adede411ea7da03916d1418902d4a
