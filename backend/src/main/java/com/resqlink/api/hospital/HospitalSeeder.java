package com.resqlink.api.hospital;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds a starter hospital directory on first boot. If the directory already
 * exists (from an earlier version without coordinates), it back-fills the
 * latitude/longitude onto matching rows so the live map works without a wipe.
 */
@Component
@RequiredArgsConstructor
public class HospitalSeeder implements CommandLineRunner {

    private final HospitalRepository hospitalRepository;

    private static final List<Hospital> SEED = List.of(
            hospital("City Care Hospital", "Pune", "FC Road, Shivajinagar", "+91 20 2553 0000", true, true, true, 4.6, 18.5308, 73.8512),
            hospital("Ruby Hall Clinic", "Pune", "Sassoon Road", "+91 20 6645 5100", true, true, true, 4.5, 18.5314, 73.8745),
            hospital("Sahyadri Super Speciality", "Pune", "Deccan Gymkhana", "+91 20 6721 3000", true, false, true, 4.3, 18.5165, 73.8400),
            hospital("Jehangir Hospital", "Pune", "Sassoon Road", "+91 20 6633 3333", true, true, true, 4.4, 18.5293, 73.8743),
            hospital("Noble Hospital", "Pune", "Hadapsar", "+91 20 6628 5000", true, false, true, 4.1, 18.5031, 73.9260),
            hospital("Lilavati Hospital", "Mumbai", "Bandra West", "+91 22 2675 1000", true, true, true, 4.5, 19.0509, 72.8301),
            hospital("KEM Hospital", "Mumbai", "Parel", "+91 22 2410 7000", true, true, true, 4.2, 19.0022, 72.8424),
            hospital("Fortis Hospital", "Mumbai", "Mulund West", "+91 22 6799 4444", true, true, true, 4.3, 19.1725, 72.9425),
            hospital("AIIMS", "Delhi", "Ansari Nagar", "+91 11 2658 8500", true, true, true, 4.7, 28.5672, 77.2100),
            hospital("Max Super Speciality", "Delhi", "Saket", "+91 11 2651 5050", true, true, true, 4.4, 28.5280, 77.2140),
            hospital("Apollo Hospital", "Chennai", "Greams Road", "+91 44 2829 3333", true, true, true, 4.6, 13.0623, 80.2519),
            hospital("Manipal Hospital", "Bengaluru", "Old Airport Road", "+91 80 2502 4444", true, true, true, 4.4, 12.9583, 77.6493),
            hospital("Narayana Health City", "Bengaluru", "Bommasandra", "+91 80 7122 2222", true, true, true, 4.5, 12.8030, 77.6870),
            hospital("Care Hospitals", "Hyderabad", "Banjara Hills", "+91 40 6810 6529", true, false, true, 4.2, 17.4126, 78.4482),
            hospital("AMRI Hospital", "Kolkata", "Salt Lake", "+91 33 6606 3800", true, true, true, 4.1, 22.5770, 88.4100),

            /* ── Gujarat ───────────────────────────── */
            // Vadodara
            hospital("SSG Hospital", "Vadodara", "Near Kala Ghoda, Jail Road", "+91 265 279 0001", true, true, true, 4.2, 22.3072, 73.1812),
            hospital("Baroda Heart Institute", "Vadodara", "R.C. Dutt Road, Alkapuri", "+91 265 234 1234", true, false, false, 4.4, 22.3105, 73.1740),
            hospital("Synergy Hospital", "Vadodara", "Waghodia Road, Manjalpur", "+91 265 298 2000", true, true, true, 4.1, 22.2914, 73.1944),
            hospital("Bhailal Amin General Hospital", "Vadodara", "Shivaji Path, Anandpura", "+91 265 240 0022", true, false, true, 3.9, 22.2967, 73.2105),

            // Ahmedabad
            hospital("Civil Hospital Ahmedabad", "Ahmedabad", "Asarwa", "+91 79 2268 1000", true, true, true, 4.3, 23.0510, 72.5928),
            hospital("Apollo Hospital Ahmedabad", "Ahmedabad", "Plot No 1A, Bhat Gandhinagar Road", "+91 79 6670 1800", true, true, true, 4.6, 23.1580, 72.6598),
            hospital("KD Hospital", "Ahmedabad", "Sarkhej - Gandhinagar Highway", "+91 79 2980 1000", true, true, true, 4.2, 23.0438, 72.5812),
            hospital("Zydus Hospital", "Ahmedabad", "Thaltej, SG Highway", "+91 79 6666 0700", true, true, true, 4.5, 23.0345, 72.5185),

            // Surat
            hospital("SMIMER Hospital", "Surat", "Udhna Magdalla Road, Katargam", "+91 261 224 1000", true, true, true, 4.1, 21.1975, 72.8142),
            hospital("Kiran Hospital", "Surat", "Bhatar, Adajan", "+91 261 712 2222", true, true, true, 4.4, 21.1735, 72.7956),
            hospital("Unity Hospital", "Surat", "Dumas Road, Piplod", "+91 261 235 2300", true, true, true, 4.0, 21.1575, 72.7712),

            // Rajkot
            hospital("PDU Medical College & Hospital", "Rajkot", "Civil Hospital Road, Jail Road", "+91 281 247 8800", true, true, true, 4.0, 22.2876, 70.7960),
            hospital("Sterling Hospital Rajkot", "Rajkot", "150 Feet Ring Road, Raiya", "+91 281 248 8000", true, true, true, 4.3, 22.3094, 70.8122)
    );

    @Override
    public void run(String... args) {
        if (hospitalRepository.count() == 0) {
            hospitalRepository.saveAll(SEED);
            return;
        }

        // Back-fill coordinates onto existing rows that predate the map feature.
        List<Hospital> existing = hospitalRepository.findAll();
        List<Hospital> patched = existing.stream()
                .filter(h -> h.getLatitude() == null || h.getLongitude() == null)
                .map(h -> SEED.stream()
                        .filter(seed -> seed.getName().equalsIgnoreCase(h.getName())
                                && seed.getCity().equalsIgnoreCase(h.getCity()))
                        .findFirst()
                        .map(seed -> {
                            h.setLatitude(seed.getLatitude());
                            h.setLongitude(seed.getLongitude());
                            return h;
                        })
                        .orElse(null))
                .filter(h -> h != null)
                .toList();

        if (!patched.isEmpty()) {
            hospitalRepository.saveAll(patched);
        }
    }

    private static Hospital hospital(String name, String city, String address, String phone,
                                     boolean emergency, boolean bloodBank, boolean open24x7, double rating,
                                     double latitude, double longitude) {
        return Hospital.builder()
                .name(name)
                .city(city)
                .address(address)
                .phone(phone)
                .emergencyDept(emergency)
                .bloodBank(bloodBank)
                .open24x7(open24x7)
                .rating(rating)
                .latitude(latitude)
                .longitude(longitude)
                .build();
    }
}
