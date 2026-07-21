package com.resqlink.api.contact;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, UUID> {

    List<EmergencyContact> findByUserIdOrderByPriorityAscCreatedAtAsc(UUID userId);

    Optional<EmergencyContact> findByIdAndUserId(UUID id, UUID userId);

    long countByUserId(UUID userId);
}
