package com.visakha.admission.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.visakha.admission.service.DistanceService;

@RestController
@RequestMapping("/distance")
public class DistanceController {

    @Autowired
    private DistanceService distanceService;

    @GetMapping
    public double getDistance(
            @RequestParam double latitude,
            @RequestParam double longitude) {

        return distanceService.calculateDistance(latitude, longitude);
    }
}