# SCRUM-51 – Implement Distance Calculation Logic

## Overview

This task implements the backend logic required to calculate the geographical distance between an applicant's residence and Visakha Vidyalaya, Colombo 04.
The calculation is performed using the **Haversine Formula**, which determines the great-circle distance between two points on the Earth's surface using latitude and longitude coordinates.

## Implementation

A new service class `DistanceService.java` was created in the Spring Boot backend.

Responsibilities of this service:

* Store the fixed coordinates of Visakha Vidyalaya
* Accept applicant coordinates as input
* Apply the Haversine formula
* Return the calculated distance in kilometres

## Key Logic

Input:

Applicant Latitude
Applicant Longitude

School Coordinates:

Latitude: 6.9069
Longitude: 79.8607

Output:

Distance between the two points in kilometres.

## Technical Stack

Backend Framework: Spring Boot
Language: Java
Architecture: RESTful service layer

## Outcome

The system can now automatically calculate the distance between the applicant's residence and the school, which supports the distance-based evaluation process for Grade 1 admissions.
