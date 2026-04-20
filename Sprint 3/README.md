# Grade-1-Admission-Selection-System
## Description 
This is a project on system to make the School admission process more efficient, by auto calculating and generting different reports on selected entities to make the applicant selection process run smoothly.

## How to Use / Run
1. Clone the repository
2. Open the folder in the terminal
3. Run the program using:

## Instructions
when committing to the git hub use;
git commit -m "TASK-42: Implement login API endpoint"

## Features
- Online application submission - the applicants are able to submit the applications online 
- Data storage - the data is stored in a MySQL database and are accessed by the judge panel and the admin.
- Application marking and automated calculations - The judge apnel are entering marks manually and the calcualtons are done by the system (Eg: total, ranking)
- report generaton - the judges are able to make any report usinggthe data in the database as a pdf and take printouts.
- Distance calculation - The system is able to calculate the distance form any place given tby the applicants to a default place given in the system. 
- Student profile creation - once the students are selected by the administration the system will automatically make a student profile for those students
- Backend Integration - Spring Boot backend for serving project data (and potentially more in the near future).
- .... more to come 

## Technologies Used
- Java
- HTML
- CSS
- JavaScript
- Git
- GitHub

## Project structure
```
grade1-admission/
├── backend/                  ← Spring Boot (Java)
│   ├── pom.xml
│   └── src/main/java/lk/school/admission/
│       ├── Grade1AdmissionApplication.java
│       ├── config/
│       │   ├── SecurityConfig.java
│       │   └── DataSeeder.java
│       ├── entity/
│       │   ├── Applicant.java
│       │   ├── Application.java
│       │   └── Judge.java
│       ├── repository/
│       ├── service/
│       └── controller/
└── frontend/                 ← React
    ├── package.json
    └── src/
        ├── index.css
        ├── App.jsx
        ├── pages/
        └── components/
```
