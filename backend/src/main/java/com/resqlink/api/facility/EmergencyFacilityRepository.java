package com.resqlink.api.facility;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmergencyFacilityRepository extends JpaRepository<EmergencyFacility, UUID> {

    List<EmergencyFacility> findTop50ByOrderByRatingDesc();

    List<EmergencyFacility> findByNameContainingIgnoreCaseOrCityContainingIgnoreCaseOrderByRatingDesc(
            String name, String city);

    List<EmergencyFacility> findByTypeInOrderByRatingDesc(List<EmergencyFacility.Type> types);

    List<EmergencyFacility> findByTypeInAndNameContainingIgnoreCaseOrTypeInAndCityContainingIgnoreCaseOrderByRatingDesc(
            List<EmergencyFacility.Type> types1, String name,
            List<EmergencyFacility.Type> types2, String city);
}
