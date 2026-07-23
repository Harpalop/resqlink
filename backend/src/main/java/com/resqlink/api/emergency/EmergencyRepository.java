package com.resqlink.api.emergency;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmergencyRepository extends JpaRepository<Emergency, UUID> {

    Optional<Emergency> findFirstByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, EmergencyStatus status);

    List<Emergency> findTop20ByUserIdOrderByCreatedAtDesc(UUID userId);

    List<Emergency> findByStatusOrderByCreatedAtDesc(EmergencyStatus status);

    List<Emergency> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, EmergencyStatus status);

    Optional<Emergency> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByReference(String reference);
}
