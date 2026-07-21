package com.resqlink.api.profile;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicalProfileRepository extends JpaRepository<MedicalProfile, UUID> {

    Optional<MedicalProfile> findByUserId(UUID userId);

    Optional<MedicalProfile> findByPublicToken(String publicToken);
}
