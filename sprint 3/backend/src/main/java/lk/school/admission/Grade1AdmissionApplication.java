package lk.school.admission;

// ================================================================
//  FILE: src/main/java/lk/school/admission/Grade1AdmissionApplication.java
//  This is the MAIN entry point of the backend application.
//  Running this file starts the entire Spring Boot server.
// ================================================================

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Grade1AdmissionApplication {

    public static void main(String[] args) {
        SpringApplication.run(Grade1AdmissionApplication.class, args);
        System.out.println("\n========================================");
        System.out.println("  Grade 1 Admission System STARTED");
        System.out.println("  Backend running at: http://localhost:8080");
        System.out.println("  API base: http://localhost:8080/api");
        System.out.println("========================================\n");
    }
}