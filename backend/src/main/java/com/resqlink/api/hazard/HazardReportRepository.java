package com.resqlink.api.hazard;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HazardReportRepository extends JpaRepository<HazardReport, UUID> {

    List<HazardReport> findByStatusOrderByCreatedAtDesc(HazardReport.Status status);

    List<HazardReport> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<HazardReport> findAllByOrderByCreatedAtDesc();
}
