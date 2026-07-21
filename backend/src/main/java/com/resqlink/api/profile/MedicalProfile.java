package com.resqlink.api.profile;

import com.resqlink.api.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "medical_profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 3)
    private String bloodGroup;

    private LocalDate dateOfBirth;

    @Column(length = 30)
    private String gender;

    private Integer heightCm;

    private Integer weightKg;

    @Column(columnDefinition = "TEXT")
    private String allergies;

    @Column(columnDefinition = "TEXT")
    private String medicalConditions;

    @Column(columnDefinition = "TEXT")
    private String medications;

    @Column(length = 120)
    private String insuranceProvider;

    @Column(length = 60)
    private String insurancePolicyNumber;

    @Builder.Default
    @Column(nullable = false)
    private boolean organDonor = false;

    @Column(columnDefinition = "TEXT")
    private String emergencyNotes;

    /** Token embedded in the QR code; grants access to the public emergency view. */
    @Column(nullable = false, unique = true, length = 40)
    private String publicToken;

    @Builder.Default
    @Column(nullable = false)
    private boolean medicalIdEnabled = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    public static String newPublicToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}
