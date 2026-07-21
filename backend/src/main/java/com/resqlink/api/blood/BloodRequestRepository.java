package com.resqlink.api.blood;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BloodRequestRepository extends JpaRepository<BloodRequest, UUID> {

    List<BloodRequest> findTop50ByStatusOrderByCreatedAtDesc(BloodRequest.Status status);

    List<BloodRequest> findByRequesterIdOrderByCreatedAtDesc(UUID requesterId);

    Optional<BloodRequest> findByIdAndRequesterId(UUID id, UUID requesterId);
}
