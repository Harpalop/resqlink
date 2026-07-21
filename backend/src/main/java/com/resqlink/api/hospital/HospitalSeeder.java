package com.resqlink.api.hospital;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/** Seeds a starter hospital directory on first boot (skips if data exists). */
@Component
@RequiredArgsConstructor
public class HospitalSeeder implements CommandLineRunner {

    private final HospitalRepository hospitalRepository;

    @Override
    public void run(String... args) {
        if (hospitalRepository.count() > 0) {
            return;
        }
        hospitalRepository.saveAll(List.of(
                hospital("City Care Hospital", "Pune", "FC Road, Shivajinagar", "+91 20 2553 0000", true, true, true, 4.6),
                hospital("Ruby Hall Clinic", "Pune", "Sassoon Road", "+91 20 6645 5100", true, true, true, 4.5),
                hospital("Sahyadri Super Speciality", "Pune", "Deccan Gymkhana", "+91 20 6721 3000", true, false, true, 4.3),
                hospital("Jehangir Hospital", "Pune", "Sassoon Road", "+91 20 6633 3333", true, true, true, 4.4),
                hospital("Noble Hospital", "Pune", "Hadapsar", "+91 20 6628 5000", true, false, true, 4.1),
                hospital("Lilavati Hospital", "Mumbai", "Bandra West", "+91 22 2675 1000", true, true, true, 4.5),
                hospital("KEM Hospital", "Mumbai", "Parel", "+91 22 2410 7000", true, true, true, 4.2),
                hospital("Fortis Hospital", "Mumbai", "Mulund West", "+91 22 6799 4444", true, true, true, 4.3),
                hospital("AIIMS", "Delhi", "Ansari Nagar", "+91 11 2658 8500", true, true, true, 4.7),
                hospital("Max Super Speciality", "Delhi", "Saket", "+91 11 2651 5050", true, true, true, 4.4),
                hospital("Apollo Hospital", "Chennai", "Greams Road", "+91 44 2829 3333", true, true, true, 4.6),
                hospital("Manipal Hospital", "Bengaluru", "Old Airport Road", "+91 80 2502 4444", true, true, true, 4.4),
                hospital("Narayana Health City", "Bengaluru", "Bommasandra", "+91 80 7122 2222", true, true, true, 4.5),
                hospital("Care Hospitals", "Hyderabad", "Banjara Hills", "+91 40 6810 6529", true, false, true, 4.2),
                hospital("AMRI Hospital", "Kolkata", "Salt Lake", "+91 33 6606 3800", true, true, true, 4.1)
        ));
    }

    private Hospital hospital(String name, String city, String address, String phone,
                              boolean emergency, boolean bloodBank, boolean open24x7, double rating) {
        return Hospital.builder()
                .name(name)
                .city(city)
                .address(address)
                .phone(phone)
                .emergencyDept(emergency)
                .bloodBank(bloodBank)
                .open24x7(open24x7)
                .rating(rating)
                .build();
    }
}
