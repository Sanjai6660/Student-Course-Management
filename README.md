# Student Course Management System

A full-stack architecture for a Student Course Management System. 

## 🏗️ Architecture

- **Frontend**: React 19 + Vite + TailwindCSS v4. It features a modern, responsive Glassmorphic interface with interactive cursor tracking and deep SVG animations.
- **Backend**: Java 21 + Spring Boot 3.4. Highly robust backend utilizing Spring Security, JWT (JSON Web Tokens) for authentication, and standard Spring Data JPA configuration mapping to MySQL.
- **Database**: MySQL 8.0.

---

## 🚀 Getting Started

To get the application running properly after pulling from Github, follow the steps below.

### 1. Database Setup
Ensure you have MySQL installed and running locally on port `3306`.
Create the required database instance via the following SQL command:
```sql
CREATE DATABASE IF NOT EXISTS student_course_management;
```

**Note**: The database credentials default `username/password` are configured as `root / 123456`. You can update these local credentials in your Spring Boot application properties: `backend/src/main/resources/application.properties`

### 2. Backend (Spring Boot Server)
You must start the backend sever before attempting to login or register on the frontend app to prevent CORS/authentication failure errors.
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```
The backend server will successfully start listening on `http://localhost:8080`. Hibernate's `ddl-auto=update` is already configured and will automatically generate all necessary tables and properties if they do not exist.

### 3. Frontend (React Vite Server)
Ensure you have Node.js (v18+) installed.
```bash
cd frontend
npm install
npm run dev
```
The frontend UI will start listening on `http://localhost:5173`. 

---

## 🔐 Accounts & Permissions

**Registering Students**:
The system introduces academic "Registration Numbers" (e.g. `CSE000001` or `ME123456`) rather than standard emails. Simply visit `http://localhost:5173/register` to auto-compose a valid Student registration tag and sign up seamlessly. 

**Registering Admins**:
The initial application Admin can be registered using standard API triggers (using the `role` payload). Afterwards, only an Administrator can authorize another Administrator level account to prevent malicious API elevation.
