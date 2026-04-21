package com.visakha.admission.controller;

import com.visakha.admission.entity.HouseVisitComment;
import com.visakha.admission.repository.HouseVisitRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/housevisit")
public class HouseVisitController {

    @Autowired
    private HouseVisitRepository repository;

    @PostMapping
    public String saveComment(@RequestBody HouseVisitComment comment) {

        repository.save(comment);

        return "House visit comment saved successfully!";
    }

    @GetMapping("/{applicationId}")
    public List<HouseVisitComment> getComments(@PathVariable Long applicationId) {

        return repository.findByApplicationId(applicationId);
    }
}