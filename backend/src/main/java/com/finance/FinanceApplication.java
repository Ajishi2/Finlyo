package com.finance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Finance Dashboard Backend Application
 * 
 * A comprehensive backend system for managing financial records with role-based access control.
 * 
 * Features:
 * - User and role management (VIEWER, ANALYST, ADMIN)
 * - Financial record management (CRUD operations)
 * - Dashboard analytics and summaries
 * - Role-based access control
 * - Comprehensive error handling and validation
 * - Pagination and filtering support
 */
@SpringBootApplication
public class FinanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinanceApplication.class, args);
    }

}
