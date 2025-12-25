# FlooringIntel Frontend

FlooringIntel is a product-change intelligence dashboard for flooring, carpet, rug, and home product businesses. It helps users monitor supplier websites, track new and removed products, review product updates, export product data, and receive daily or weekly reports.

This repository contains the frontend application for the FlooringIntel platform.

## Features

* User authentication and protected dashboard routes
* Product dashboard with search, filters, and pagination
* Website tracking and subscription-based access
* Product change monitoring views
* New products, removed products, and availability/status badges
* CSV/XLSX export workflows
* User subscription and billing pages
* Daily and weekly report views
* Slack integration settings for report notifications
* Admin dashboard pages
* Admin CRM page for lead management and marketing automation
* Responsive UI for desktop and mobile

## Tech Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios or API client layer
* Component-based dashboard UI

## Project Structure

```bash
src/
components/        # Reusable UI components
pages/             # Route-level pages
layouts/           # Dashboard and public layouts
hooks/             # Custom React hooks
services/          # API service functions
utils/             # Helpers and formatters
types/             # TypeScript types/interfaces
assets/            # Static frontend assets
```

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd flooringintel-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create a `.env` file in the project root.

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=FlooringIntel
VITE_APP_URL=http://localhost:5173
```

Update the values based on your local backend and production environment.

### 4. Run the development server

```bash
npm run dev
```

The frontend should run at:

```bash
http://localhost:5173
```

## Available Scripts

```bash
npm run dev
```

Runs the app in development mode.

```bash
npm run build
```
# FlooringIntel Frontend

FlooringIntel is a product-change intelligence dashboard for flooring, carpet, rug, and home product businesses. It helps users monitor supplier websites, track new and removed products, review product updates, export product data, and receive daily or weekly reports.

This repository contains the frontend application for the FlooringIntel platform.

## Features

* User authentication and protected dashboard routes
* Product dashboard with search, filters, and pagination
* Website tracking and subscription-based access
* Product change monitoring views
* New products, removed products, and availability/status badges
* CSV/XLSX export workflows
* User subscription and billing pages
* Daily and weekly report views
* Slack integration settings for report notifications
* Admin dashboard pages
* Admin CRM page for lead management and marketing automation
* Responsive UI for desktop and mobile

## Tech Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios or API client layer
* Component-based dashboard UI

## Project Structure

```bash
src/
components/        # Reusable UI components
pages/             # Route-level pages
layouts/           # Dashboard and public layouts
hooks/             # Custom React hooks
services/          # API service functions
utils/             # Helpers and formatters
types/             # TypeScript types/interfaces
assets/            # Static frontend assets
```

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd flooringintel-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create a `.env` file in the project root.

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=FlooringIntel
VITE_APP_URL=http://localhost:5173
```

Update the values based on your local backend and production environment.

### 4. Run the development server

```bash
npm run dev
```

The frontend should run at:

```bash
http://localhost:5173
```

## Available Scripts

```bash
npm run dev
```

Runs the app in development mode.

```bash
npm run build
```

Builds the app for production.

```bash
# FlooringIntel Frontend

FlooringIntel is a product-change intelligence dashboard for flooring, carpet, rug, and home product businesses. It helps users monitor supplier websites, track new and removed products, review product updates, export product data, and receive daily or weekly reports.

This repository contains the frontend application for the FlooringIntel platform.

## Features

* User authentication and protected dashboard routes
* Product dashboard with search, filters, and pagination
* Website tracking and subscription-based access
* Product change monitoring views
* New products, removed products, and availability/status badges
* CSV/XLSX export workflows
* User subscription and billing pages
* Daily and weekly report views
* Slack integration settings for report notifications
* Admin dashboard pages
* Admin CRM page for lead management and marketing automation
* Responsive UI for desktop and mobile

## Tech Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios or API client layer
* Component-based dashboard UI

## Project Structure

```bash
src/
components/        # Reusable UI components
pages/             # Route-level pages
layouts/           # Dashboard and public layouts
hooks/             # Custom React hooks
services/          # API service functions
utils/             # Helpers and formatters
types/             # TypeScript types/interfaces
assets/            # Static frontend assets
```

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd flooringintel-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create a `.env` file in the project root.

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=FlooringIntel
VITE_APP_URL=http://localhost:5173
```

Update the values based on your local backend and production environment.

### 4. Run the development server

```bash
npm run dev
```

The frontend should run at:

```bash
http://localhost:5173
```

## Available Scripts

```bash
npm run dev
```

Runs the app in development mode.

```bash
npm run build
```

Builds the app for production.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm run lint
```

Runs linting if configured.

## Environment Variables

| Variable            | Description          |
| ------------------- | -------------------- |
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_APP_NAME`     | Application name     |
| `VITE_APP_URL`      | Frontend app URL     |

Example production values:

```env
VITE_API_BASE_URL=https://api.flooringintel.com/api
VITE_APP_NAME=FlooringIntel
VITE_APP_URL=https://app.flooringintel.com
```

## Backend Requirement

This frontend requires the FlooringIntel backend API to be running.

The backend handles:

* Authentication
* User roles and permissions
* Product data
* Website tracking
* Scraping requests
* Billing and subscriptions
* Email reports
* Slack integration
* CRM and marketing automation
* Admin APIs

Make sure the backend API URL is correctly set in `VITE_API_BASE_URL`.

## User Roles

The frontend supports role-based access.

### User

Can access subscribed websites, products, reports, exports, and account settings.

### Partner

Can access all product and website data but cannot access admin pages.

### Admin

Can access all dashboard features, admin pages, scraping controls, CRM, user management, and platform settings.

## Admin CRM

The Admin CRM page is available at:

```bash
/dashboard/admin/crm
```

CRM features include:

* CSV lead import
* Lead scoring and segmentation
* Lead approval workflow
* Marketing enable/disable toggle
* Email tracking status
* Lead registration matching
* Marketing status management

Only Admin users should be able to access this page.

## Slack Integration

Users can connect Slack from the dashboard settings page to receive FlooringIntel notifications and daily/weekly reports in a selected Slack channel.

Slack integration is handled by the backend. The frontend only manages:

* Connect Slack button
* Integration status
* Channel selection
* Notification preferences
* Test message action

## Build for Production

```bash
npm run build
```

The production-ready files will be generated in:

```bash
dist/
```

Deploy the `dist` folder to your preferred hosting provider, such as Vercel, Netlify, or static hosting behind Nginx.

## Deployment Notes

Recommended frontend deployment:

```bash
Vercel
```

Recommended domains:

```bash
https://app.flooringintel.com
https://flooringintel.com
```

Make sure production environment variables are configured in the hosting dashboard.

## Git Workflow

Create a new branch for each feature or fix:

```bash
git checkout -b feature/admin-crm
```

Commit changes:

```bash
git add .
git commit -m "Add admin CRM frontend"
```

Push branch:

```bash
git push origin feature/admin-crm
```

Open a pull request into `main`.
