# Finance Backend - Quick Setup Guide

## Prerequisites

- **Java 17+**: Download from [oracle.com](https://www.oracle.com/java/technologies/downloads/)
- **PostgreSQL 12+**: Download from [postgresql.org](https://www.postgresql.org/download/)
- **Maven 3.6+**: Download from [maven.apache.org](https://maven.apache.org/)

Verify installations:
```bash
java -version
psql --version
mvn --version
```

## Step 1: Set Up PostgreSQL Database

### Windows
1. Start PostgreSQL service from Services panel or:
   ```bash
   # If installed via installer, it should start automatically
   ```

2. Open PostgreSQL command line:
   ```bash
   psql -U postgres
   ```

3. Create database:
   ```sql
   CREATE DATABASE finance_db;
   \q
   ```

### Linux/Mac
```bash
brew services start postgresql
psql -U postgres
```

Then run the SQL commands from step 2 above.

## Step 2: Configure Database Connection

Open `src/main/resources/application.properties` and update:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/finance_db
spring.datasource.username=postgres
spring.datasource.password=your_postgres_password
```

## Step 3: Build the Application

Navigate to project directory:
```bash
cd "Financial backend"
```

Build with Maven:
```bash
mvn clean install
```

This will:
- Download all dependencies
- Compile the code
- Run any tests
- Create the JAR file in `target/` folder

## Step 4: Run the Application

Option A - Using Maven:
```bash
mvn spring-boot:run
```

Option B - Using the JAR file:
```bash
java -jar target/finance-backend-1.0.0.jar
```

The application should start and display:
```
Started FinanceApplication in X.XXX seconds
```

## Step 5: Verify Installation

### Check if server is running:
```bash
curl http://localhost:8080/api/v1/auth/login
```

You should get a response (might be an error, but that's expected without credentials).

### Database tables created:
Open PostgreSQL:
```bash
psql -U postgres -d finance_db
\dt
```

You should see:
- `users` table
- `financial_records` table

## Step 6 (Optional): Load Sample Data

Open PostgreSQL:
```bash
psql -U postgres -d finance_db
```

Run the SQL file:
```bash
\i sql/sample-data.sql
```

Or copy-paste the contents of `sql/sample-data.sql` into the PostgreSQL prompt.

## Step 7: Test the API

### 1. Login to get user ID:
```bash
curl -X POST "http://localhost:8080/api/v1/auth/login?email=admin@example.com&password=admin123"
```

Note the returned `id` (should be 1 for admin user).

### 2. Create a financial record:
```bash
curl -X POST http://localhost:8080/api/v1/records \
  -H "Content-Type: application/json" \
  -H "X-User-ID: 1" \
  -d '{
    "amount": 1500,
    "type": "INCOME",
    "category": "Salary",
    "recordDate": "2024-01-15",
    "description": "Test income"
  }'
```

### 3. Get dashboard summary:
```bash
curl http://localhost:8080/api/v1/dashboard/summary \
  -H "X-User-ID: 1"
```

## Troubleshooting

### PostgreSQL Connection Error
**Problem**: `org.postgresql.util.PSQLException: Connection refused`
**Solution**:
1. Ensure PostgreSQL is running
2. Check connection string in `application.properties`
3. Verify database exists: `psql -U postgres -l`

### Port 8080 Already in Use
**Solution**: Change port in `application.properties`:
```properties
server.port=8081
```

### Maven Build Fails
**Problem**: `mvn: command not found`
**Solution**:
1. Ensure Maven is installed: `mvn --version`
2. Add Maven to PATH environment variable
3. Restart terminal/IDE after PATH change

### Tables Not Created
**Problem**: No tables in PostgreSQL
**Solution**:
1. Check application logs for errors
2. Manually create tables using:
   ```bash
   psql -U postgres -d finance_db -f sql/schema.sql
   ```

## Development

### IDE Setup (IntelliJ IDEA)
1. Open project: File > Open > Select project folder
2. Maven should auto-import
3. Mark `src/main/java` as Sources Root
4. Run: Right-click `FinanceApplication.java` > Run

### IDE Setup (VS Code)
1. Install "Extension Pack for Java" extension
2. Open project folder
3. Maven should detect the project
4. Debug using VS Code debugger

## API Testing Tools

### Using Postman
1. Download [Postman](https://www.postman.com/downloads/)
2. Import the API collection (import JSON from project docs)
3. Set environment variables for base URL and user ID
4. Start testing

### Using cURL (Command Line)
All API examples in README use cURL format.

## Next Steps

1. Read the **README.md** for complete API documentation
2. Review the code structure in `src/main/java/com/finance/`
3. Examine the DTOs and entities to understand data model
4. Test all endpoints with provided examples
5. Explore the service layer to understand business logic

## Documentation

- **API Documentation**: See full endpoints and examples in README.md
- **Architecture** Design decisions documented in README.md
- **Code Comments**: Each class has detailed Javadoc comments
- **Entity Relationships**: Review `entity/` folder for JPA models

## Support

For issues:
1. Check error messages carefully
2. Review logs in console/IDE
3. Ensure all prerequisites are installed
4. Verify database connection settings
5. Check the troubleshooting section above

---

**Happy coding!** 🚀
