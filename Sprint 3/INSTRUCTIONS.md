# Grade 1 Admission System — Setup Instructions
## For someone with limited development knowledge

---

## WHAT YOU NEED TO INSTALL FIRST (do this once)

### 1. Java 17
- Go to: https://adoptium.net/
- Download **JDK 17** → Install it
- To check: open Command Prompt → type `java -version`

### 2. Maven (builds the Java project)
- Go to: https://maven.apache.org/download.cgi
- Download the zip → extract it → add to PATH
- To check: `mvn -version`

### 3. MySQL 8.0
- Go to: https://dev.mysql.com/downloads/installer/
- Install MySQL Community Server
- Remember your root password

### 4. Node.js (runs React)
- Go to: https://nodejs.org/
- Download LTS version → Install it
- To check: `node -v` and `npm -v`

### 5. IntelliJ IDEA (optional but recommended for Java)
- Go to: https://www.jetbrains.com/idea/download/
- Download Community Edition (free)

---

## FOLDER STRUCTURE TO CREATE

```
C:\grade1-admission\          ← your project root
├── backend\                  ← Spring Boot Java project
│   ├── pom.xml
│   └── src\main\
│       ├── java\lk\school\admission\
│       │   ├── Grade1AdmissionApplication.java
│       │   ├── config\
│       │   │   ├── SecurityConfig.java
│       │   │   └── DataSeeder.java
│       │   ├── entity\
│       │   │   ├── Role.java
│       │   │   ├── ApplicationCategory.java
│       │   │   ├── ApplicationStatus.java
│       │   │   ├── Applicant.java
│       │   │   ├── Application.java
│       │   │   ├── Judge.java
│       │   │   └── SystemUser.java
│       │   ├── repository\
│       │   │   ├── ApplicantRepository.java
│       │   │   ├── ApplicationRepository.java
│       │   │   ├── JudgeRepository.java
│       │   │   └── SystemUserRepository.java
│       │   ├── security\
│       │   │   ├── JwtUtils.java
│       │   │   ├── JwtAuthFilter.java
│       │   │   └── CustomUserDetailsService.java
│       │   ├── service\
│       │   │   ├── AuthService.java
│       │   │   ├── DocumentControllerService.java
│       │   │   └── ApplicationService.java
│       │   └── controller\
│       │       ├── AuthController.java
│       │       ├── DocumentControllerController.java
│       │       └── ApplicantController.java
│       └── resources\
│           └── application.properties
│
└── frontend\                 ← React project
    ├── package.json
    ├── public\
    │   └── index.html
    └── src\
        ├── index.js
        ├── index.css
        ├── App.jsx
        ├── context\
        │   └── AuthContext.js
        ├── services\
        │   └── api.js
        ├── components\shared\
        │   └── UI.jsx
        └── pages\
            ├── LandingPage.jsx
            ├── LoginPage.jsx
            ├── ApplicantDashboard.jsx
            ├── ApplicationFormPage.jsx
            └── DocControllerDashboard.jsx
```

---

## STEP-BY-STEP SETUP

### Step 1: Create the MySQL Database

1. Open **MySQL Workbench** or Command Prompt
2. Connect to MySQL as root
3. Run this command:
   ```sql
   CREATE DATABASE grade1_admission;
   ```
4. The tables will be created **automatically** when the backend starts.

---

### Step 2: Configure the Backend

1. Open `backend/src/main/resources/application.properties`
2. Change this line to your MySQL root password:
   ```
   spring.datasource.password=your_password
   ```
3. Also update the school GPS coordinates if needed:
   ```
   school.latitude=6.9271
   school.longitude=79.8612
   ```

---

### Step 3: Start the Backend

Open Command Prompt in the `backend/` folder:

```bash
cd C:\grade1-admission\backend
mvn spring-boot:run
```

Wait until you see:
```
Grade 1 Admission System STARTED
Backend running at: http://localhost:8080
```

You will also see the default accounts printed:
```
ADMIN:  admin@school.lk / Admin@2025
DC:     dc@school.lk   / DocCtrl@2025
JUDGES: judge_co / Judge_CO@2025  etc.
```

---

### Step 4: Start the Frontend

Open a **new** Command Prompt in the `frontend/` folder:

```bash
cd C:\grade1-admission\frontend
npm install
npm start
```

Wait until the browser opens automatically at: **http://localhost:3000**

---

## TESTING THE SYSTEM (Steps 1–4 of the process)

### Test Step 2 — Document Controller creates a login:
1. Go to `http://localhost:3000`
2. Click **Document Controller**
3. Login: `dc@school.lk` / `DocCtrl@2025`
4. Click **Create Login**
5. Enter a parent's name, email, and NIC → Click Create

### Test Step 3 — Parent fills the form:
1. Open a new browser tab
2. Go to `http://localhost:3000/login?role=applicant`
3. Login with the email and NIC you just created
4. Click **Start Application Form**
5. Fill all 4 steps and submit

### Test Step 4 — Check the data was saved and distributed:
After the parent submits:
- The application is saved in MySQL
- It gets an application number like `CO-001`
- It is assigned to the judge for that category

You can verify in MySQL Workbench:
```sql
USE grade1_admission;
SELECT id, application_number, category, status, assigned_judge_id
FROM applications;
```

---

## DEFAULT LOGIN CREDENTIALS SUMMARY

| User                | Username              | Password        |
|---------------------|-----------------------|-----------------|
| Admin               | admin@school.lk       | Admin@2025      |
| Document Controller | dc@school.lk          | DocCtrl@2025    |
| Judge CO            | judge_co              | Judge_CO@2025   |
| Judge SIS           | judge_sis             | Judge_SIS@2025  |
| Judge OG            | judge_og              | Judge_OG@2025   |
| Judge ED            | judge_ed              | Judge_ED@2025   |
| Judge TR            | judge_tr              | Judge_TR@2025   |
| Judge AB            | judge_ab              | Judge_AB@2025   |
| Parent (example)    | (email you set)       | (NIC you set)   |

---

## TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| "Port 8080 already in use" | Change `server.port=8080` to `8081` in application.properties |
| "Cannot connect to MySQL" | Make sure MySQL is running; check username/password |
| "npm not found" | Re-install Node.js and restart Command Prompt |
| CORS error in browser | Make sure backend is running on port 8080 |
| Blank white page | Check browser console (F12) for errors |

---

## WHAT COMES NEXT (future steps)

- **Step 5** onwards: Judge dashboard, mark entry, reports
- Admin dashboard: publish results, manage all users
- Auto-profile creation for selected students
- Distance calculation refinement with Google Maps API

---
*System developed with Spring Boot 3.2 + React 18 + MySQL 8*