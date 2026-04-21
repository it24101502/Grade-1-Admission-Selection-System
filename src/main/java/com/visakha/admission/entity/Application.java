package com.visakha.admission.entity;

import jakarta.persistence.*;

@Entity
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String applicantName;
    private String streetAddress;
    private String city;
    private String postalCode;

    public Application() {}

    public Application(String applicantName, String streetAddress, String city, String postalCode) {
        this.applicantName = applicantName;
        this.streetAddress = streetAddress;
        this.city = city;
        this.postalCode = postalCode;
    }

    public Long getId() { return id; }
    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }

    public String getStreetAddress() { return streetAddress; }
    public void setStreetAddress(String streetAddress) { this.streetAddress = streetAddress; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
}