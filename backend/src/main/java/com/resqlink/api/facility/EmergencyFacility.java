package com.resqlink.api.facility;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "emergency_facilities")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyFacility {

    public enum Type {
        HOSPITAL, POLICE_STATION, FIRE_STATION, AMBULANCE_SERVICE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private Type type;

    @Column(nullable = false, length = 140)
    private String name;

    @Column(nullable = false, length = 240)
    private String address;

    @Column(nullable = false, length = 80)
    private String city;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    @Builder.Default
    private double rating = 0.0;

    @Column(length = 300)
    private String description;

    @Column(length = 200)
    private String services;

    private boolean emergencyDept;
    private boolean bloodBank;
    private boolean open24x7;

    @Column(length = 200)
    private String website;
}
