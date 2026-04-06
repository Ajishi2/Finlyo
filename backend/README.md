# Finance Dashboard Backend

A comprehensive Java-based backend system for managing financial records with role-based access control. This system supports multiple user roles (Viewer, Analyst, Admin) with different permission levels and provides dashboard analytics capabilities.

## Overview

This backend implements a complete finance management system with:
- **User Management**: Create, read, update, and manage users with different roles
- **Financial Records Management**: Full CRUD operations for income/expense entries
- **Dashboard Analytics**: Summary-level data including totals, category-wise breakdowns, and monthly trends
- **Role-Based Access Control**: Enforce permissions based on user roles
- **Pagination & Filtering**: Support for paginated results and multiple filter options
- **Comprehensive Error Handling**: Proper validation and error responses

## Technology Stack

- **Framework**: Spring Boot 3.1.5
- **Language**: Java 17
- **Database**: PostgreSQL
- **Build Tool**: Maven
- **ORM**: JPA/Hibernate
- **Validation**: Jakarta Validation API
- **Additional**: Lombok for boilerplate reduction

## Project Structure

```
src/main/java/com/finance/
├── controller/          # REST API endpoints
│   ├── UserController
│   ├── FinancialRecordController
│   ├── DashboardController
│   └── AuthController
├── service/             # Business logic layer
│   ├── UserService
│   ├── FinancialRecordService
│   └── DashboardService
├── repository/          # Data access layer
│   ├── UserRepository
│   └── FinancialRecordRepository
├── entity/              # JPA entities
│   ├── User
│   ├── FinancialRecord
│   ├── Role (enum)
│   ├── UserStatus (enum)
│   └── TransactionType (enum)
├── dto/                 # Data Transfer Objects
│   ├── UserCreateRequest
│   ├── UserResponse
│   ├── FinancialRecordRequest
│   ├── FinancialRecordResponse
│   ├── DashboardSummaryResponse
│   ├── CategoryWiseSummaryResponse
│   ├── MonthlySummaryResponse
│   └── ApiResponse
├── security/            # Security and access control
│   ├── SecurityContext
│   ├── AccessControlUtils
│   └── SecurityContextHolder
├── exception/           # Custom exceptions
│   ├── ResourceNotFoundException
│   ├── AccessDeniedException
│   ├── DuplicateResourceException
│   └── GlobalExceptionHandler
├── config/              # Configuration classes
│   ├── AuthenticationFilter
│   └── WebConfig
└── FinanceApplication   # Main application class
```

## Role-Based Access Control

The system implements three distinct roles with different permission levels:

### 1. **VIEWER**
- Can view dashboard data and summaries
- **Cannot**:
  - Create, update, or delete financial records
  - Access detailed analytics
  - Manage users

### 2. **ANALYST**
- Can view dashboard data and summaries
- Can create financial records
- Can view and update their own records
- Can delete their own records
- **Cannot**:
  - Manage other users' records
  - Manage user accounts
  - Update/delete records created by others

### 3. **ADMIN**
- Full access to all features
- Can create and manage users
- Can view, update, and delete any financial record
- Can access all analytics
- Can change user roles and statuses

### Access Control Implementation

Access control is enforced through:
1. **Service Layer Guards**: `AccessControlUtils` class validates permissions before operations
2. **Security Context**: Injected into requests via `AuthenticationFilter`
3. **Comprehensive Checks**: Separate methods for viewing, creating, updating, and deleting resources

## Setting Up the Project

### Prerequisites

- Java 17 or higher
- PostgreSQL 12 or higher
- Maven 3.6+
- Git (optional)

### Installation Steps

#### 1. **Database Setup**

Start PostgreSQL and create the database:

```sql
CREATE DATABASE finance_db;
```

#### 2. **Configure Database Connection**

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/finance_db
spring.datasource.username=postgres
spring.datasource.password=your_password
```

#### 3. **Build the Project**

```bash
cd "Financial backend"
mvn clean install
```

#### 4. **Run the Application**

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

#### 5. **Database Migration**

Tables are automatically created by Hibernate (configured with `spring.jpa.hibernate.ddl-auto=update`).

## API Documentation

### Base URL
```
http://localhost:8080/api/v1
```

### Authentication

All endpoints (except `/auth/login`) require the following headers:

```
X-User-ID: <user_id>
X-User-Role: <user_role>
```

### Authentication Endpoints

#### Login
```
POST /auth/login
Query Parameters:
  - email: string (required)
  - password: string (required)

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "ADMIN"
  }
}
```

---

## User Management Endpoints

### Create User (ADMIN only)
```
POST /users
Content-Type: application/json

Request Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "ANALYST"
}

Response: 201 Created
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "ANALYST",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
}
```

### Get User Profile
```
GET /users/profile/{userId}

Response: 200 OK
{
  "success": true,
  "message": "User retrieved successfully",
  "data": { ... }
}
```

### Get All Users (ADMIN only)
```
GET /users

Response: 200 OK
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [ ... ]
}
```

### Update User (ADMIN only)
```
PUT /users/{userId}
Content-Type: application/json

Request Body:
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com"
}

Response: 200 OK
```

### Update User Role (ADMIN only)
```
PATCH /users/{userId}/role?role=ANALYST

Response: 200 OK
```

### Update User Status (ADMIN only)
```
PATCH /users/{userId}/status?status=INACTIVE

Response: 200 OK
```

### Delete User (ADMIN only)
```
DELETE /users/{userId}

Response: 200 OK
```

---

## Financial Records Endpoints

### Create Record (ANALYST, ADMIN)
```
POST /records
Content-Type: application/json

Request Body:
{
  "amount": 1500.50,
  "type": "INCOME",
  "category": "Salary",
  "recordDate": "2024-01-15",
  "description": "Monthly salary"
}

Response: 201 Created
{
  "success": true,
  "message": "Financial record created successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "amount": 1500.50,
    "type": "INCOME",
    "category": "Salary",
    "recordDate": "2024-01-15",
    "description": "Monthly salary",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
}
```

### Get All Records
```
GET /records?page=0&size=10

Query Parameters:
  - page: integer (default: 0)
  - size: integer (default: 10)

Response: 200 OK
{
  "success": true,
  "message": "Records retrieved successfully",
  "data": {
    "content": [...],
    "totalElements": 25,
    "totalPages": 3,
    "currentPage": 0,
    "hasNext": true
  }
}
```

### Get Records by Date Range
```
GET /records/date-range?startDate=2024-01-01&endDate=2024-12-31&page=0&size=10

Query Parameters:
  - startDate: date (YYYY-MM-DD)
  - endDate: date (YYYY-MM-DD)
  - page: integer (default: 0)
  - size: integer (default: 10)

Response: 200 OK
```

### Get Records by Category
```
GET /records/category/{category}?page=0&size=10

Response: 200 OK
```

### Get Records by Type
```
GET /records/type/{type}?page=0&size=10

Path Parameters:
  - type: INCOME or EXPENSE

Response: 200 OK
```

### Get Single Record
```
GET /records/{recordId}

Response: 200 OK
```

### Get Recent Transactions
```
GET /records/recent?limit=10

Query Parameters:
  - limit: integer (default: 10)

Response: 200 OK
```

### Update Record (ANALYST - own only, ADMIN - any)
```
PUT /records/{recordId}
Content-Type: application/json

Request Body:
{
  "amount": 1600.00,
  "type": "INCOME",
  "category": "Salary",
  "recordDate": "2024-01-15",
  "description": "Updated salary"
}

Response: 200 OK
```

### Delete Record (ANALYST - own only, ADMIN - any)
```
DELETE /records/{recordId}

Response: 200 OK
```

---

## Dashboard Analytics Endpoints

### Get Dashboard Summary
```
GET /dashboard/summary

Response: 200 OK
{
  "success": true,
  "message": "Dashboard summary retrieved successfully",
  "data": {
    "totalIncome": 5000.00,
    "totalExpense": 2000.00,
    "netBalance": 3000.00,
    "totalTransactions": 25,
    "totalIncomeCount": 15,
    "totalExpenseCount": 10
  }
}
```

### Get Category-wise Summary
```
GET /dashboard/category-summary

Response: 200 OK
{
  "success": true,
  "message": "Category summary retrieved successfully",
  "data": {
    "categoryTotals": {
      "Salary": 5000.00,
      "Groceries": 800.00,
      "Utilities": 200.00,
      "Entertainment": 500.00
    },
    "categoryTransactionCount": {
      "Salary": 1,
      "Groceries": 4,
      "Utilities": 2,
      "Entertainment": 3
    }
  }
}
```

### Get Monthly Summary
```
GET /dashboard/monthly-summary

Response: 200 OK
{
  "success": true,
  "message": "Monthly summary retrieved successfully",
  "data": {
    "monthlyIncome": {
      "2024-01": 5000.00,
      "2024-02": 5500.00,
      "2024-03": 5000.00
    },
    "monthlyExpense": {
      "2024-01": 2000.00,
      "2024-02": 2200.00,
      "2024-03": 1800.00
    },
    "monthlyNetBalance": {
      "2024-01": 3000.00,
      "2024-02": 3300.00,
      "2024-03": 3200.00
    }
  }
}
```

---

## Error Handling

### Standard Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Descriptive error message"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| RESOURCE_NOT_FOUND | 404 | Requested resource does not exist |
| ACCESS_DENIED | 403 | User does not have permission to perform action |
| DUPLICATE_RESOURCE | 409 | Resource already exists (e.g., duplicate email) |
| VALIDATION_ERROR | 400 | Input validation failed |
| AUTHENTICATION_FAILED | 401 | Authentication failed |
| INTERNAL_ERROR | 500 | Unexpected server error |

---

## Data Validation

### User Validation
- **firstName**: Required, non-blank
- **lastName**: Required, non-blank
- **email**: Required, valid email format, unique
- **password**: Required, non-blank
- **role**: Optional, defaults to VIEWER

### Financial Record Validation
- **amount**: Required, must be positive
- **type**: Required (INCOME or EXPENSE)
- **category**: Required, non-blank
- **recordDate**: Required, valid date
- **description**: Optional

---

## Design Decisions & Architecture

### 1. **Layered Architecture**
The application uses a clean layered architecture:
- **Controller Layer**: Handles HTTP requests/responses
- **Service Layer**: Contains business logic and access control
- **Repository Layer**: Data access and queries
- **Entity Layer**: Domain models

**Rationale**: Separation of concerns ensures maintainability and testability.

### 2. **DTO Pattern**
Separate DTOs (Data Transfer Objects) for requests and responses.

**Rationale**: Prevents exposing internal entity structure and allows flexible API evolution.

### 3. **Access Control in Service Layer**
Access control checks happen in the service layer before operations.

**Rationale**: Centralized security logic makes it easier to maintain and audit permissions.

### 4. **Soft Delete Strategy**
Financial records use soft deletion (marked as deleted, not physically removed).

**Rationale**: Maintains data integrity and audit trails.

### 5. **Query Optimization**
Custom JPA queries for aggregation operations instead of loading all records.

**Rationale**: Improves performance with large datasets.

### 6. **Request-Scoped Security Context**
Security context stored in request scope.

**Rationale**: Each request has isolated user context, thread-safe approach.

---

## Testing the API

### Sample Workflow

#### 1. Create an Admin User
```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -H "X-User-ID: 1" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "password": "adminpass123",
    "role": "ADMIN"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -d "email=admin@example.com&password=adminpass123"
```

#### 3. Create Financial Record
```bash
curl -X POST http://localhost:8080/api/v1/records \
  -H "Content-Type: application/json" \
  -H "X-User-ID: 1" \
  -d '{
    "amount": 1500.50,
    "type": "INCOME",
    "category": "Salary",
    "recordDate": "2024-01-15",
    "description": "Monthly salary"
  }'
```

#### 4. Get Dashboard Summary
```bash
curl http://localhost:8080/api/v1/dashboard/summary \
  -H "X-User-ID: 1"
```

---

## Application Assumptions & Limitations

### Assumptions
1. **Simplified Authentication**: Uses header-based user identification instead of JWT tokens for simplicity
2. **No Encryption**: Passwords stored in plain text (in production, use bcrypt or similar)
3. **Single User Per Request**: Each request authenticated for a single user
4. **Local Database**: PostgreSQL runs locally (production would use remote database)
5. **In-Memory Security Context**: Security context stored in request scope

### Limitations & Future Enhancements
1. **No Role-Based Endpoint Security**: Admin endpoints are protected in service layer, not framework level
2. **No Pagination in Analytics**: Category and monthly summaries load all records
3. **No Search Functionality**: Filtering limited to category, type, and date range
4. **No File Upload**: Cannot attach documents to records
5. **No Audit Logs**: No logging of who made changes and when
6. **No Rate Limiting**: No protection against brute force attacks

### Production Considerations
1. Use JWT/OAuth2 for authentication
2. Hash passwords using bcrypt
3. Implement SSL/TLS for all connections
4. Use environment variables for sensitive configuration
5. Add comprehensive logging and monitoring
6. Implement database connection pooling
7. Add request validation and sanitization
8. Implement API rate limiting
9. Add comprehensive API documentation (Swagger/OpenAPI)
10. Add unit and integration tests

---

## Running Tests

```bash
mvn test
```

---

## Building for Production

```bash
mvn clean package -DskipTests
java -jar target/finance-backend-1.0.0.jar
```

---

## Configuration Management

### Environment-Specific Profiles

Create `application-prod.properties` for production with:
- Secure database credentials
- Appropriate logging levels
- Production database URL

Run with:
```bash
java -jar app.jar --spring.profiles.active=prod
```

---

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `application.properties`
- Check if database `finance_db` exists

### Port Already in Use
```bash
# Change port in application.properties
server.port=8081
```

### Hibernate Table Creation Issues
If tables don't auto-create:
```sql
-- Run manually or check Hibernate logs for errors
```

---

## Contact & Support

For issues or questions, refer to the API documentation above or review the code comments in the source files.

---

## License

This project is provided for evaluation purposes.
