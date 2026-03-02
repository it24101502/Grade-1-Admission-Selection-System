# Grade-1-Admission-Selection-System

# Overview
The Grade 1 admission process is mostly manual and time-consuming. Schools conduct interviews and assign marks based on criteria like distance, siblings, and special conditions. This can cause delays and errors. The proposed system automates data collection, mark calculation, and student ranking, ensuring efficiency, fairness, and transparency.

This branch focuses specifically on implementing Role-Based Access Control (RBAC) to ensure secure and restricted access to system features based on user roles.

# Branch Objective: Role-Based Access Control
This branch implements access control for three main user roles:
- Admin
- Judge
- Parent

Each role has different permissions and system access levels.

# Features Implemented in This Branch
- User authentication (Sign Up & Login)
- Role-based authorization
- Protected routes based on user roles
- Secure password handling
- Backend API integration
- Role-based frontend rendering (if implemented)

## Technology Stack
Backend
- Java
- Spring Boot
- Spring Security
- JPA / Hibernate
- MySQL

Frontend (if integrated)
- React.js
- Axios
- Role-based route protection

## How to Run the Project
Backend
1. Navigate to backend folder
2. Configure application.properties
3. Run the Spring Boot application

Server runs on:  http://localhost:8081

Frontend (if available)
1. Navigate to frontend folder
2. Install dependencies:  npm install
3. Start the project:  npm start

Frontend runs on:   http://localhost:3000

# Testing Role-Based Access
| Role   | Sign Up  | Login   | Access Level          |
| ------ | -------  | -----   | --------------------- |
| Admin  |   ✅     | ✅     | Full Access           |
| Judge  |   ✅     | ✅     | Assigned Applications |
| Parent |   ❌     | ✅     | Limited Access        |

# Academic Context

This project is conducted as part of the Y2S2 Computer Science degree program for:

Software Engineering (SE2072)

Human-Computer Interaction (SE2082)
