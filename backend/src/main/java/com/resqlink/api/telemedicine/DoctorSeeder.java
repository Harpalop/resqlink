package com.resqlink.api.telemedicine;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/** Seeds the doctor directory on first boot. */
@Component
@RequiredArgsConstructor
public class DoctorSeeder implements CommandLineRunner {

    private final DoctorRepository doctorRepository;

    @Override
    public void run(String... args) {
        if (doctorRepository.count() > 0) {
            return;
        }
        doctorRepository.saveAll(List.of(
                doctor("Dr. Ananya Iyer", "Emergency Medicine", "Pune", 14, 800, 4.8, true),
                doctor("Dr. Rajesh Kulkarni", "Cardiology", "Pune", 18, 1200, 4.7, true),
                doctor("Dr. Sneha Patil", "General Physician", "Pune", 8, 500, 4.5, true),
                doctor("Dr. Vikram Mehta", "Orthopedics", "Mumbai", 15, 1000, 4.6, false),
                doctor("Dr. Priya Nair", "Pediatrics", "Mumbai", 11, 700, 4.8, true),
                doctor("Dr. Arjun Reddy", "Neurology", "Hyderabad", 16, 1500, 4.7, false),
                doctor("Dr. Kavita Sharma", "Dermatology", "Delhi", 9, 600, 4.4, false),
                doctor("Dr. Suresh Kumar", "Pulmonology", "Chennai", 20, 1100, 4.6, true),
                doctor("Dr. Meera Joshi", "Psychiatry", "Bengaluru", 12, 900, 4.5, false),
                doctor("Dr. Amit Verma", "General Surgery", "Delhi", 17, 1300, 4.6, true)
        ));
    }

    private Doctor doctor(String name, String speciality, String city, int years,
                          int fee, double rating, boolean emergency) {
        return Doctor.builder()
                .name(name)
                .speciality(speciality)
                .city(city)
                .experienceYears(years)
                .consultationFee(fee)
                .rating(rating)
                .availableForEmergency(emergency)
                .build();
    }
}
