package com.resqlink.api.telemedicine;

import com.resqlink.api.common.exception.ApiException;
import com.resqlink.api.notification.Notification;
import com.resqlink.api.notification.NotificationService;
import com.resqlink.api.user.User;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/telemedicine")
@RequiredArgsConstructor
public class TelemedicineController {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    public record BookRequest(
            @NotNull(message = "Doctor is required") UUID doctorId,
            @NotNull(message = "Mode is required") Appointment.Mode mode,
            @NotNull(message = "Time is required") @Future(message = "Pick a future time") Instant scheduledAt,
            @Size(max = 500) String reason
    ) {
    }

    public record AppointmentRow(UUID id, String doctorName, String speciality,
                                 Appointment.Mode mode, Appointment.Status status,
                                 Instant scheduledAt, String reason) {
        static AppointmentRow from(Appointment appointment) {
            return new AppointmentRow(
                    appointment.getId(),
                    appointment.getDoctor().getName(),
                    appointment.getDoctor().getSpeciality(),
                    appointment.getMode(),
                    appointment.getStatus(),
                    appointment.getScheduledAt(),
                    appointment.getReason());
        }
    }

    @GetMapping("/doctors")
    public List<Doctor> searchDoctors(@RequestParam(required = false) String q) {
        if (q == null || q.isBlank()) {
            return doctorRepository.findTop50ByOrderByRatingDesc();
        }
        String query = q.trim();
        return doctorRepository
                .findTop50ByNameContainingIgnoreCaseOrSpecialityContainingIgnoreCaseOrCityContainingIgnoreCaseOrderByRatingDesc(
                        query, query, query);
    }

    @GetMapping("/appointments")
    @Transactional(readOnly = true)
    public List<AppointmentRow> myAppointments(@AuthenticationPrincipal User user) {
        return appointmentRepository.findByPatientIdOrderByScheduledAtDesc(user.getId())
                .stream()
                .map(AppointmentRow::from)
                .toList();
    }

    @PostMapping("/appointments")
    @Transactional
    public ResponseEntity<AppointmentRow> book(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BookRequest request
    ) {
        Doctor doctor = doctorRepository.findById(request.doctorId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Doctor not found"));

        Appointment appointment = appointmentRepository.save(Appointment.builder()
                .patient(user)
                .doctor(doctor)
                .mode(request.mode())
                .scheduledAt(request.scheduledAt())
                .reason(request.reason())
                .build());

        notificationService.notify(user, Notification.Type.APPOINTMENT,
                "Appointment booked with " + doctor.getName(),
                doctor.getSpeciality() + " consultation ("
                        + request.mode().name().toLowerCase() + ") confirmed.");

        return ResponseEntity.status(HttpStatus.CREATED).body(AppointmentRow.from(appointment));
    }

    @PostMapping("/appointments/{appointmentId}/cancel")
    @Transactional
    public AppointmentRow cancel(
            @AuthenticationPrincipal User user,
            @PathVariable UUID appointmentId
    ) {
        Appointment appointment = appointmentRepository
                .findByIdAndPatientId(appointmentId, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Appointment not found"));
        if (appointment.getStatus() != Appointment.Status.UPCOMING) {
            throw new ApiException(HttpStatus.CONFLICT, "Only upcoming appointments can be cancelled");
        }
        appointment.setStatus(Appointment.Status.CANCELLED);
        return AppointmentRow.from(appointmentRepository.save(appointment));
    }
}
