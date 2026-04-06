# Financial Dashboard

A full-stack financial management application with user authentication, role-based access control, and comprehensive audit logging.

## 🚀 Features

### User Management
- **Role-Based Access Control**: Admin, Analyst, Viewer roles
- **User CRUD Operations**: Create, Read, Update, Delete users
- **Status Management**: Active/Inactive user status
- **Password Reset**: Admin password reset functionality
- **Audit Logging**: Complete audit trail for all admin operations

### Financial Records
- **Income & Expense Tracking**: Add, edit, delete financial records
- **Category Management**: Organize transactions by categories
- **Date Range Filtering**: Filter records by date periods
- **Search & Filter**: Advanced search capabilities
- **Dashboard Analytics**: Real-time financial insights

### Security
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Permissions**: Granular access control
- **CORS Configuration**: Cross-origin resource sharing
- **Input Validation**: Comprehensive data validation

## 🛠 Tech Stack

### Backend
- **Spring Boot 3.1.5**: Java framework
- **Spring Security**: Authentication & authorization
- **Spring Data JPA**: Database operations
- **PostgreSQL**: Primary database (Supabase)
- **Hibernate**: ORM framework
- **JWT**: JSON Web Tokens
- **Maven**: Build tool

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool & dev server
- **TailwindCSS**: Utility-first CSS
- **Framer Motion**: Animations
- **React Query**: Data fetching & caching
- **Lucide React**: Icon library

### Database
- **Supabase**: Hosted PostgreSQL
- **Row Level Security**: Data access control
- **Automatic Timestamps**: Created/updated tracking

## 📁 Project Structure

```
financial/
├── backend/
│   ├── src/main/java/com/finance/
│   │   ├── config/          # Security & web configuration
│   │   ├── controller/      # REST API endpoints
│   │   ├── dto/           # Data transfer objects
│   │   ├── entity/         # Database entities
│   │   ├── exception/      # Custom exceptions
│   │   ├── repository/     # Data access layer
│   │   ├── security/       # Security components
│   │   └── service/       # Business logic
│   ├── src/main/resources/
│   │   └── application.properties
│   └── sql/              # Database schema
├── frontend/
│   ├── src/
│   │   ├── api/           # API service functions
│   │   ├── components/     # Reusable UI components
│   │   ├── context/       # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utility functions
│   └── public/           # Static assets
└── docs/                 # Documentation
```

## 🚀 Quick Start

### Prerequisites
- **Java 21+**: Backend runtime
- **Node.js 18+**: Frontend runtime
- **Maven 3.9+**: Java build tool
- **Supabase Account**: Database hosting

### Backend Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd financial/backend
   ```

2. **Configure Database**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Update with your Supabase credentials
   DATABASE_URL=postgresql://postgres:password@your-project.supabase.co:5432/postgres
   ```

3. **Run Application**
   ```bash
   mvn spring-boot:run
   ```

   Backend runs on: `http://localhost:8080`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd financial/frontend
   npm install
   ```

2. **Configure API URL**
   ```bash
   # Update .env file
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

   Frontend runs on: `http://localhost:5173`

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://postgres:password@project.supabase.co:5432/postgres

# Server
SERVER_PORT=8080
SERVER_CONTEXT_PATH=/

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Frontend (.env)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api
```

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Users (Admin Only)
- `GET /api/v1/users` - List users (paginated)
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/{id}` - Get user by ID
- `PUT /api/v1/users/{id}` - Update user
- `PATCH /api/v1/users/{id}/role` - Update user role
- `PATCH /api/v1/users/{id}/status` - Update user status
- `PATCH /api/v1/users/{id}/password` - Reset user password
- `DELETE /api/v1/users/{id}` - Soft delete user

### Financial Records
- `GET /api/v1/records` - List records (filtered)
- `POST /api/v1/records` - Create record
- `PUT /api/v1/records/{id}` - Update record
- `DELETE /api/v1/records/{id}` - Delete record

### Dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics

## 🛡️ Security

### Authentication Flow
1. User logs in with email/password
2. Server validates credentials
3. JWT token returned to client
4. Token stored in localStorage
5. Subsequent requests include `Authorization: Bearer <token>`

### Role-Based Access
- **ADMIN**: Full access to all features
- **ANALYST**: Can view and create financial records
- **VIEWER**: Read-only access to financial records

### Audit Logging
All admin operations are logged with:
- **Timestamp**: When operation occurred
- **User**: Who performed the operation
- **Action**: What was performed
- **Target**: Which user/record was affected

## 📝 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'VIEWER',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Financial Records Table
```sql
CREATE TABLE financial_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    category VARCHAR(100) NOT NULL,
    description TEXT,
    record_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE
);
```

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
mvn test

# Frontend tests
cd frontend
npm test
```

### API Testing
Use the provided test endpoints:
- `GET /api/v1/users/health` - Health check (public)
- `GET /api/v1/test` - Test endpoint (public)

## 🚀 Deployment

### Production Considerations
- **Environment Variables**: Use production database URLs
- **HTTPS**: Configure SSL certificates
- **Database Security**: Enable Row Level Security in Supabase
- **Password Hashing**: Implement BCrypt password hashing
- **CORS**: Update allowed origins for production domains

### Docker Deployment
```bash
# Build images
docker-compose build

# Run containers
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Issues
- **Check**: DATABASE_URL environment variable
- **Verify**: Supabase credentials are correct
- **Test**: Direct database connection with psql

#### CORS Errors
- **Check**: Frontend API_BASE_URL matches backend
- **Verify**: CORS configuration in SecurityConfig
- **Test**: Network requests in browser dev tools

#### Authentication Issues
- **Check**: JWT token in localStorage
- **Verify**: Authorization header in requests
- **Test**: Token expiration handling

#### Build Issues
- **Backend**: `mvn clean install`
- **Frontend**: `npm install` and `npm run build`

## 📞 Support

For issues and questions:
1. Check this README
2. Review the troubleshooting section
3. Check existing GitHub issues
4. Create new issue with detailed description

---

**Built with ❤️ using Spring Boot and React**
