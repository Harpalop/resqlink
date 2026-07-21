package com.resqlink.api.hospital;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, UUID> {

    List<Hospital> findTop50ByNameContainingIgnoreCaseOrCityContainingIgnoreCaseOrderByRatingDesc(
            String name, String city);

    List<Hospital> findTop50ByOrderByRatingDesc();
}
