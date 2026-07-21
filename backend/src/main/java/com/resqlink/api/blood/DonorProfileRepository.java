package com.resqlink.api.blood;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DonorProfileRepository extends JpaRepository<DonorProfile, UUID> {

    Optional<DonorProfile> findByUserId(UUID userId);

    List<DonorProfile> findTop50ByAvailableTrueAndBloodGroupInOrderByUpdatedAtDesc(List<String> bloodGroups);

    List<DonorProfile> findTop50ByAvailableTrueAndBloodGroupInAndCityIgnoreCaseOrderByUpdatedAtDesc(
            List<String> bloodGroups, String city);

    long countByAvailableTrue();
}
