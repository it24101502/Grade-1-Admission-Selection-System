package com.visakha.admission.entity;

import jakarta.persistence.*;

@Entity
public class HouseVisitComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long applicationId;

    private String houseCondition;

    private String neighbourhood;

    private String remarks;

    public HouseVisitComment() {}

    public Long getId() {
        return id;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public String getHouseCondition() {
        return houseCondition;
    }

    public void setHouseCondition(String houseCondition) {
        this.houseCondition = houseCondition;
    }

    public String getNeighbourhood() {
        return neighbourhood;
    }

    public void setNeighbourhood(String neighbourhood) {
        this.neighbourhood = neighbourhood;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}