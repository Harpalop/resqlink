package com.resqlink.api.disaster;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DisasterAlertRepository extends JpaRepository<DisasterAlert, UUID> {

    List<DisasterAlert> findByActiveTrueOrderByCreatedAtDesc();
}
