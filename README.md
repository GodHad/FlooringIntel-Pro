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
