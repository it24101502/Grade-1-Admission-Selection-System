package com.admission.grade1.model;

import jakarta.persistence.*;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String applicantNameEnglish;
    private String contactNumber;
    private String addressLine1;
    private String district;

    private String childNameEnglish;
    private String dateOfBirth;

    private String motherFullName;
    private String fatherFullName;

    @Enumerated(EnumType.STRING)
    private Category category;

    // GETTERS & SETTERS

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public Long getId() { return id; }

    public String getApplicantNameEnglish() { return applicantNameEnglish; }
    public void setApplicantNameEnglish(String applicantNameEnglish) { this.applicantNameEnglish = applicantNameEnglish; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getChildNameEnglish() { return childNameEnglish; }
    public void setChildNameEnglish(String childNameEnglish) { this.childNameEnglish = childNameEnglish; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getMotherFullName() { return motherFullName; }
    public void setMotherFullName(String motherFullName) { this.motherFullName = motherFullName; }

    public String getFatherFullName() { return fatherFullName; }
    public void setFatherFullName(String fatherFullName) { this.fatherFullName = fatherFullName; }
}