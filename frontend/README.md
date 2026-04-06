# Finlyo - Financial Dashboard

A modern financial management dashboard built with React, TypeScript, and Spring Boot.

## Features

- Real-time financial data visualization
- Role-based access control
- Dark/Light theme support
- Responsive design
- Interactive charts and analytics

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Recharts

### Backend
- Spring Boot
- Java 17
- PostgreSQL
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js 18+
- Java 17+
- PostgreSQL

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   mvn clean install
   ```

4. Start the development servers:
   ```bash
   # Frontend
   cd frontend
   npm run dev

   # Backend
   cd backend
   mvn spring-boot:run
   ```

## Environment Variables

Create a `.env` file in the frontend directory:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

Create a `.env` file in the backend directory with your database configuration.
