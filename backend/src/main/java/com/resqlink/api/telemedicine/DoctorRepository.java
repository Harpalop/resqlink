package com.resqlink.api.telemedicine;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {

    List<Doctor> findTop50ByNameContainingIgnoreCaseOrSpecialityContainingIgnoreCaseOrCityContainingIgnoreCaseOrderByRatingDesc(
            String name, String speciality, String city);

    List<Doctor> findTop50ByOrderByRatingDesc();
}
