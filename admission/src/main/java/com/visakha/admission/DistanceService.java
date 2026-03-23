package com.visakha.admission;

import org.springframework.stereotype.Service;

@Service
public class DistanceService {

    // Coordinates of Visakha Vidyalaya
    private static final double SCHOOL_LAT = 6.9069;
    private static final double SCHOOL_LON = 79.8607;

    public double calculateDistance(double applicantLat, double applicantLon) {

        final int EARTH_RADIUS = 6371; // Radius of earth in KM

        double latDistance = Math.toRadians(applicantLat - SCHOOL_LAT);
        double lonDistance = Math.toRadians(applicantLon - SCHOOL_LON);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(SCHOOL_LAT)) * Math.cos(Math.toRadians(applicantLat))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }
}