# Finlyo - Financial Analytics Platform

A comprehensive, enterprise-grade financial management system built with modern technologies and best practices. This platform demonstrates advanced software engineering concepts including role-based access control, JWT authentication, data visualization, and comprehensive CRUD operations.

## 🚀 **Key Features & Implementations**

### 🔐 **Advanced Security & Authentication**
- **JWT Token-Based Authentication** with automatic token refresh and validation
- **Role-Based Access Control (RBAC)** with three hierarchical roles:
  - **VIEWER**: Read-only access to dashboard and analytics
  - **ANALYST**: Full record management (create, edit own records)
  - **ADMIN**: Complete system control including user management
- **BCrypt Password Hashing** for secure credential storage
- **Spring Security Integration** with method-level security annotations
- **Automatic Token Injection** via Axios interceptors
- **Session Management** with automatic logout on token expiry

### 📊 **Advanced Data Visualization & Analytics**
- **Interactive Dashboard** with real-time financial metrics
- **Multi-Chart Analytics** using Recharts library:
  - Income vs Expense trend analysis
  - Category-wise spending distribution
  - Monthly financial performance charts
  - Net worth tracking with animated counters
- **Financial Health Score** calculation based on spending patterns
- **Spending Insights** with AI-powered recommendations
- **Responsive Charts** with mobile-optimized display
- **Date Range Filtering** for custom analysis periods

### 💾 **Data Management Features**
- **Advanced CSV Import/Export System**:
  - Bulk data import with validation (up to 500 records)
  - Real-time import progress tracking
  - Error reporting with detailed validation messages
  - CSV format validation and data sanitization
  - Export filtered data with custom date ranges
- **Comprehensive CRUD Operations**:
  - Create, Read, Update, Delete financial records
  - Soft delete implementation for data integrity
  - Audit logging for all administrative actions
  - Pagination and advanced filtering
- **Smart Search & Filtering**:
  - Multi-parameter filtering (date, category, type, amount)
  - Real-time search across descriptions
  - Sortable columns with visual indicators
  - Filter persistence across sessions

### 🎨 **Modern UI/UX Design**
- **Dark/Light Theme Support** with system preference detection
- **Glass-morphism Design** with modern aesthetics
- **Framer Motion Animations**:
  - Smooth page transitions
  - Interactive hover states
  - Loading skeletons and micro-interactions
  - Animated counters and progress indicators
- **Responsive Design** optimized for all device sizes
- **Custom Component Library** using ShadCN/UI
- **Accessibility Features** including ARIA labels and keyboard navigation

### 👥 **User Management System**
- **Complete User Lifecycle Management**:
  - User creation with role assignment
  - Profile management and editing
  - Status management (Active/Inactive)
  - Password reset functionality
- **Advanced Permission System**:
  - Frontend route protection
  - Backend API security layers
  - Component-level permission checks
  - Real-time permission validation
- **Audit Trail** for all administrative actions

### 🏗️ **Technical Architecture**

#### **Backend (Spring Boot)**
- **Layered Architecture**: Controller → Service → Repository pattern
- **JPA/Hibernate ORM** with optimized entity relationships
- **Database Indexing** for performance optimization
- **DTO Pattern** for secure data transfer
- **Custom Exception Handling** with global error responses
- **Validation Framework** using Jakarta Bean Validation
- **RESTful API Design** with proper HTTP status codes

#### **Frontend (React + TypeScript)**
- **Component-Based Architecture** with reusable UI components
- **State Management** using React Query for server state
- **TypeScript Implementation** for type safety
- **Custom Hooks** for business logic abstraction
- **Route Protection** with role-based navigation guards
- **Optimistic Updates** for enhanced user experience

#### **Database Design**
- **Normalized Schema** with foreign key constraints
- **Audit Fields** (created_at, updated_at) with automatic triggers
- **Soft Delete Implementation** for data recovery
- **Comprehensive Indexing Strategy** for query optimization
- **Enum Types** for data consistency

### 🔧 **Advanced Features**

#### **Toggle Switch Implementation**
- **Animated Status Toggles** for user activation/deactivation
- **Smooth Transitions** with visual feedback
- **Permission-Based Controls** (users can't modify own status)
- **Real-time Updates** without page refresh

#### **Smart Action Buttons**
- **Always-Visible Controls** with subtle grey state
- **Hover-Activated Colors** for better UX
- **Permission-Based Rendering** (edit/delete based on roles)
- **Confirmation Dialogs** for destructive actions

#### **Import/Export System**
- **CSV Parser** with flexible column mapping
- **Data Validation** with comprehensive error reporting
- **Progress Tracking** with visual indicators
- **Batch Processing** for performance optimization

## 🛠️ **Technology Stack**

### **Backend Technologies**
- **Java 17** with Spring Boot 3.x
- **Spring Security 6.x** for authentication
- **Spring Data JPA** for database operations
- **PostgreSQL** as primary database
- **JWT (JSON Web Tokens)** for stateless authentication
- **Maven** for dependency management
- **Jakarta Bean Validation** for input validation

### **Frontend Technologies**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **React Query** for server state management
- **React Router** for navigation
- **Axios** for HTTP client
- **ShadCN/UI** component library

### **Development Tools**
- **ESLint** for code quality
- **PostCSS** for CSS processing
- **Git** for version control
- **Docker** support for containerization

## 📋 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User authentication
- `POST /api/auth/generate-hash` - Password hash generation

### **Dashboard & Analytics**
- `GET /api/v1/dashboard/summary` - Overall financial summary
- `GET /api/v1/dashboard/category` - Category-wise breakdown
- `GET /api/v1/dashboard/trends` - Trend analysis data

### **Financial Records**
- `GET /api/v1/records` - Paginated records with filtering
- `POST /api/v1/records` - Create new record
- `PUT /api/v1/records/{id}` - Update existing record
- `DELETE /api/v1/records/{id}` - Delete record (soft delete)

### **User Management**
- `GET /api/v1/users` - List all users (Admin only)
- `POST /api/v1/users` - Create new user (Admin only)
- `PUT /api/v1/users/{id}` - Update user details
- `PATCH /api/v1/users/{id}/role` - Change user role
- `PATCH /api/v1/users/{id}/status` - Update user status
- `DELETE /api/v1/users/{id}` - Soft delete user

## 🎯 **Assignment Highlights**

### **Advanced Concepts Demonstrated**
1. **Enterprise Security Architecture** with multi-layer authentication
2. **Role-Based Authorization** with granular permissions
3. **Advanced Data Visualization** with interactive charts
4. **Modern Frontend Architecture** with TypeScript and hooks
5. **RESTful API Design** with proper HTTP semantics
6. **Database Optimization** with indexing and relationships
7. **User Experience Design** with animations and micro-interactions
8. **Data Import/Export** with validation and error handling
9. **Responsive Design** for cross-device compatibility
10. **Code Quality** with TypeScript and linting

### **Technical Excellence**
- **Clean Code Principles** with separation of concerns
- **Error Handling** with global exception management
- **Performance Optimization** with lazy loading and caching
- **Security Best Practices** with input validation and sanitization
- **Testing-Ready Architecture** with modular design
- **Scalable Design** with microservice-ready structure

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+
- Java 17+
- PostgreSQL 12+
- Maven 3.8+

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd Finlyo

# Frontend Setup
cd frontend
npm install
npm run dev

# Backend Setup
cd backend
mvn clean install
mvn spring-boot:run
```

### **Database Setup**
```bash
# Create database
createdb finlyo

# Run schema migration
psql -d finlyo -f backend/sql/supabase-schema.sql
```

### **Environment Configuration**
```bash
# Frontend (.env)
VITE_API_BASE_URL=http://localhost:8080/api

# Backend (application.properties)
spring.datasource.url=jdbc:postgresql://localhost:5432/finlyo
JWT_SECRET=your-secret-key
```

## 📊 **Default Users**
- **Admin**: `admin@finance.com` / `admin123`
- **Analyst**: `analyst@finance.com` / `admin123`
- **Viewer**: `viewer@finance.com` / `admin123`

## 🎨 **Screenshots & Demos**
*(Include screenshots of key features here)*

## 🤝 **Contributing**
This project demonstrates enterprise software development best practices and serves as a comprehensive example of modern full-stack development.

---

**Finlyo** - Where Financial Data Meets Modern Technology 🚀
