package com.admission.grade1.controller;

import com.admission.grade1.model.Application;
import com.admission.grade1.repository.ApplicationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    private final ApplicationRepository repo;

    public ApplicationController(ApplicationRepository repo) {
        this.repo = repo;
    }

    // SAVE DATA
    @PostMapping
    public Application createApplication(@RequestBody Application app) {
        return repo.save(app);
    }

    // GET ALL DATA
    @GetMapping
    public List<Application> getAllApplications() {
        return repo.findAll();
    }
}