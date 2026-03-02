package com.visakha.admission;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    @Autowired
    private ApplicationRepository repository;

    @PostMapping
    public Application createApplication(@RequestBody Application application) {
        return repository.save(application);
    }

    @GetMapping
    public List<Application> getAllApplications() {
        return repository.findAll();
    }
}