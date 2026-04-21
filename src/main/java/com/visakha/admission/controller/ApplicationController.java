package com.visakha.admission.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.visakha.admission.entity.Application;
import com.visakha.admission.repository.ApplicationRepository;

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
