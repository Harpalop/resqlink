package com.resqlink.api.telemedicine;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findByPatientIdOrderByScheduledAtDesc(UUID patientId);

    Optional<Appointment> findByIdAndPatientId(UUID id, UUID patientId);
}
