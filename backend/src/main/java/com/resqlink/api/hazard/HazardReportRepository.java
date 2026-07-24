package com.resqlink.api.hazard;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HazardReportRepository extends JpaRepository<HazardReport, UUID> {

    @Query("SELECT h FROM HazardReport h JOIN FETCH h.user WHERE h.status = :status ORDER BY h.createdAt DESC")
    List<HazardReport> findByStatusOrderByCreatedAtDesc(@Param("status") HazardReport.Status status);

    @Query("SELECT h FROM HazardReport h JOIN FETCH h.user WHERE h.user.id = :userId ORDER BY h.createdAt DESC")
    List<HazardReport> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);

    @Query("SELECT h FROM HazardReport h JOIN FETCH h.user ORDER BY h.createdAt DESC")
    List<HazardReport> findAllWithUserOrderByCreatedAtDesc();
}
