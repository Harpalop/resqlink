package com.resqlink.api.telemedicine;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 80)
    private String speciality;

    @Column(nullable = false, length = 80)
    private String city;

    @Column(nullable = false)
    private int experienceYears;

    @Column(nullable = false)
    private int consultationFee;

    @Builder.Default
    @Column(nullable = false)
    private double rating = 0.0;

    @Builder.Default
    @Column(nullable = false)
    private boolean availableForEmergency = false;
}
