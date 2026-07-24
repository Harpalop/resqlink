package com.resqlink.api.facility;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class EmergencyFacilitySeeder implements CommandLineRunner {

    private final EmergencyFacilityRepository repository;

    @Override
    public void run(String... args) {
        if (repository.count() > 0) return;
        repository.saveAll(SEED);
    }

    private static final List<EmergencyFacility> SEED = List.of(

        /* ════════════════════════════════ HOSPITALS ════════════════════════════ */

        // ── Gujarat ──
        facility(EmergencyFacility.Type.HOSPITAL, "SSG Hospital", "Near Kala Ghoda, Jail Road",
                "Vadodara", "+91 265 279 0001", 22.3072, 73.1812, 4.2, true, true, true),
        facility(EmergencyFacility.Type.HOSPITAL, "Baroda Heart Institute", "R.C. Dutt Road, Alkapuri",
                "Vadodara", "+91 265 234 1234", 22.3105, 73.1740, 4.4, false, false, false),
        facility(EmergencyFacility.Type.HOSPITAL, "Synergy Hospital", "Waghodia Road, Manjalpur",
                "Vadodara", "+91 265 298 2000", 22.2914, 73.1944, 4.1, true, true, true),
        facility(EmergencyFacility.Type.HOSPITAL, "Civil Hospital Ahmedabad", "Asarwa",
                "Ahmedabad", "+91 79 2268 1000", 23.0510, 72.5928, 4.3, true, true, true),
        facility(EmergencyFacility.Type.HOSPITAL, "Apollo Hospital Ahmedabad", "Bhat Gandhinagar Road",
                "Ahmedabad", "+91 79 6670 1800", 23.1580, 72.6598, 4.6, true, true, true),
        facility(EmergencyFacility.Type.HOSPITAL, "Zydus Hospital", "Thaltej, SG Highway",
                "Ahmedabad", "+91 79 6666 0700", 23.0345, 72.5185, 4.5, true, true, true),
        facility(EmergencyFacility.Type.HOSPITAL, "SMIMER Hospital", "Katargam",
                "Surat", "+91 261 224 1000", 21.1975, 72.8142, 4.1, true, true, true),
        facility(EmergencyFacility.Type.HOSPITAL, "Kiran Hospital", "Bhatar, Adajan",
                "Surat", "+91 261 712 2222", 21.1735, 72.7956, 4.4, true, true, true),
        facility(EmergencyFacility.Type.HOSPITAL, "PDU Medical College & Hospital", "Civil Hospital Road",
                "Rajkot", "+91 281 247 8800", 22.2876, 70.7960, 4.0, true, true, true),

        // ── Maharashtra ──
        facility(EmergencyFacility.Type.HOSPITAL, "Ruby Hall Clinic", "Sassoon Road",
                "Pune", "+91 20 6645 5100", 18.5314, 73.8745, 4.5, true, true, true),
        facility(EmergencyFacility.Type.HOSPITAL, "Jehangir Hospital", "Sassoon Road",
                "Pune", "+91 20 6633 3333", 18.5293, 73.8743, 4.4, true, true, true),
        facility(EmergencyFacility.Type.HOSPITAL, "KEM Hospital", "Parel",
                "Mumbai", "+91 22 2410 7000", 19.0022, 72.8424, 4.2, true, true, true),
        facility(EmergencyFacility.Type.HOSPITAL, "Lilavati Hospital", "Bandra West",
                "Mumbai", "+91 22 2675 1000", 19.0509, 72.8301, 4.5, true, true, true),

        // ── Delhi ──
        facility(EmergencyFacility.Type.HOSPITAL, "AIIMS", "Ansari Nagar",
                "Delhi", "+91 11 2658 8500", 28.5672, 77.2100, 4.7, true, true, true),
        facility(EmergencyFacility.Type.HOSPITAL, "Max Super Speciality", "Saket",
                "Delhi", "+91 11 2651 5050", 28.5280, 77.2140, 4.4, true, true, true),
        facility(EmergencyFacility.Type.HOSPITAL, "Apollo Hospital", "Greams Road",
                "Chennai", "+91 44 2829 3333", 13.0623, 80.2519, 4.6, true, true, true),
        facility(EmergencyFacility.Type.HOSPITAL, "Manipal Hospital", "Old Airport Road",
                "Bengaluru", "+91 80 2502 4444", 12.9583, 77.6493, 4.4, true, true, true),
        facility(EmergencyFacility.Type.HOSPITAL, "Narayana Health City", "Bommasandra",
                "Bengaluru", "+91 80 7122 2222", 12.8030, 77.6870, 4.5, true, true, true),
        facility(EmergencyFacility.Type.HOSPITAL, "Care Hospitals", "Banjara Hills",
                "Hyderabad", "+91 40 6810 6529", 17.4126, 78.4482, 4.2, true, false, true),
        facility(EmergencyFacility.Type.HOSPITAL, "Fortis Hospital", "Mulund West",
                "Mumbai", "+91 22 6799 4444", 19.1725, 72.9425, 4.3, true, true, true),
        facility(EmergencyFacility.Type.HOSPITAL, "AMRI Hospital", "Salt Lake",
                "Kolkata", "+91 33 6606 3800", 22.5770, 88.4100, 4.1, true, true, true),

        // ── Additional cities ──
        facility(EmergencyFacility.Type.HOSPITAL, "SMS Medical College", "J.L.N. Marg",
                "Jaipur", "+91 141 251 0222", 26.8924, 75.8055, 4.0, true, true, true),
        facility(EmergencyFacility.Type.HOSPITAL, "SGPGI", "Rae Bareli Road",
                "Lucknow", "+91 522 249 5000", 26.8578, 80.9441, 4.4, true, true, true),
        facility(EmergencyFacility.Type.HOSPITAL, "PGIMER", "Sector 12",
                "Chandigarh", "+91 172 274 6018", 30.7595, 76.7649, 4.5, true, true, true),

        /* ═══════════════════════════ POLICE STATIONS ═══════════════════════════ */

        facility(EmergencyFacility.Type.POLICE_STATION, "Vadodara Police HQ", "Kothi Compound, Mandvi",
                "Vadodara", "+91 265 256 1400", 22.3012, 73.2085, 4.0, false, false, true),
        facility(EmergencyFacility.Type.POLICE_STATION, "Navrangpura Police Station", "Navrangpura",
                "Ahmedabad", "+91 79 2646 2222", 23.0342, 72.5584, 4.1, false, false, true),
        facility(EmergencyFacility.Type.POLICE_STATION, "Surat City Police HQ", "Athwa Lines",
                "Surat", "+91 261 247 2700", 21.1952, 72.8113, 3.9, false, false, true),
        facility(EmergencyFacility.Type.POLICE_STATION, "Deccan Gymkhana Police", "Deccan Gymkhana",
                "Pune", "+91 20 2558 8888", 18.5171, 73.8428, 4.0, false, false, true),
        facility(EmergencyFacility.Type.POLICE_STATION, "Marine Drive Police", "Marine Drive",
                "Mumbai", "+91 22 2362 4400", 18.9430, 72.8224, 4.2, false, false, true),
        facility(EmergencyFacility.Type.POLICE_STATION, "Connaught Place Police", "CP, Baba Kharak Singh Marg",
                "Delhi", "+91 11 2341 1234", 28.6330, 77.2182, 4.1, false, false, true),
        facility(EmergencyFacility.Type.POLICE_STATION, "T Nagar Police Station", "T. Nagar",
                "Chennai", "+91 44 2433 3300", 13.0418, 80.2341, 4.0, false, false, true),
        facility(EmergencyFacility.Type.POLICE_STATION, "M G Road Police Station", "MG Road",
                "Bengaluru", "+91 80 2294 3000", 12.9698, 77.6109, 3.9, false, false, true),
        facility(EmergencyFacility.Type.POLICE_STATION, "Panjagutta Police Station", "Panjagutta",
                "Hyderabad", "+91 40 2339 4400", 17.4126, 78.4372, 4.0, false, false, true),
        facility(EmergencyFacility.Type.POLICE_STATION, "Lalbazar Police HQ", "Lalbazar",
                "Kolkata", "+91 33 2215 0001", 22.5697, 88.3528, 4.1, false, false, true),
        facility(EmergencyFacility.Type.POLICE_STATION, "Rajkot City Police", "Jawahar Road",
                "Rajkot", "+91 281 223 3200", 22.3025, 70.7998, 3.9, false, false, true),
        facility(EmergencyFacility.Type.POLICE_STATION, "Jaipur City Police HQ", "Lal Kothi, JLN Marg",
                "Jaipur", "+91 141 256 0222", 26.8883, 75.7933, 4.0, false, false, true),
        facility(EmergencyFacility.Type.POLICE_STATION, "Hazratganj Police Station", "Hazratganj",
                "Lucknow", "+91 522 262 2222", 26.8564, 80.9462, 4.0, false, false, true),

        /* ═══════════════════════════ FIRE STATIONS ════════════════════════════ */

        facility(EmergencyFacility.Type.FIRE_STATION, "Vadodara Fire Brigade HQ", "Navapura, Jail Road",
                "Vadodara", "+91 265 256 2400", 22.3047, 73.1882, 4.2, false, false, true),
        facility(EmergencyFacility.Type.FIRE_STATION, "Ahmedabad Fire Station", "Shahibag, Drive-in Road",
                "Ahmedabad", "+91 79 2286 2200", 23.0620, 72.5721, 4.1, false, false, true),
        facility(EmergencyFacility.Type.FIRE_STATION, "Surat Fire Station", "Athwa Gate",
                "Surat", "+91 261 247 5000", 21.1978, 72.8089, 4.0, false, false, true),
        facility(EmergencyFacility.Type.FIRE_STATION, "Pune Fire Brigade HQ", "Shivajinagar",
                "Pune", "+91 20 2553 0100", 18.5302, 73.8447, 4.1, false, false, true),
        facility(EmergencyFacility.Type.FIRE_STATION, "Mumbai Fire Brigade HQ", "Byculla",
                "Mumbai", "+91 22 2370 1111", 18.9807, 72.8360, 4.3, false, false, true),
        facility(EmergencyFacility.Type.FIRE_STATION, "Delhi Fire Service HQ", "Barakhamba Road",
                "Delhi", "+91 11 2331 0111", 28.6348, 77.2289, 4.2, false, false, true),
        facility(EmergencyFacility.Type.FIRE_STATION, "Chennai Fire Brigade HQ", "Periamet",
                "Chennai", "+91 44 2670 0101", 13.0895, 80.2382, 4.0, false, false, true),
        facility(EmergencyFacility.Type.FIRE_STATION, "Bengaluru Fire Brigade HQ", "JC Road",
                "Bengaluru", "+91 80 2860 0100", 12.9603, 77.5760, 4.1, false, false, true),
        facility(EmergencyFacility.Type.FIRE_STATION, "Hyderabad Fire Services HQ", "Narayanguda",
                "Hyderabad", "+91 40 2755 2100", 17.4016, 78.4894, 4.0, false, false, true),
        facility(EmergencyFacility.Type.FIRE_STATION, "Kolkata Fire Brigade HQ", "Kolkata Main",
                "Kolkata", "+91 33 2253 0122", 22.5700, 88.3610, 4.0, false, false, true),
        facility(EmergencyFacility.Type.FIRE_STATION, "Rajkot Fire Station", "3.6A Super Corridor",
                "Rajkot", "+91 281 222 2100", 22.2960, 70.7930, 3.9, false, false, true),
        facility(EmergencyFacility.Type.FIRE_STATION, "Jaipur Fire Station", "Sawai Jai Singh Highway",
                "Jaipur", "+91 141 251 1100", 26.9082, 75.7892, 4.0, false, false, true),
        facility(EmergencyFacility.Type.FIRE_STATION, "Lucknow Fire Station HQ", "Hazratganj",
                "Lucknow", "+91 522 261 1000", 26.8512, 80.9457, 4.0, false, false, true),

        /* ═══════════════════════════ AMBULANCE SERVICES ══════════════════════ */

        facility(EmergencyFacility.Type.AMBULANCE_SERVICE, "GVK EMRI 108 — Ahmedabad", "S.G. Highway, Thaltej",
                "Ahmedabad", "+91 79 2685 1000", 23.0350, 72.5170, 4.3, false, false, true),
        facility(EmergencyFacility.Type.AMBULANCE_SERVICE, "GVK EMRI 108 — Vadodara", "Gorwa Road",
                "Vadodara", "+91 265 228 1000", 22.3180, 73.1650, 4.2, false, false, true),
        facility(EmergencyFacility.Type.AMBULANCE_SERVICE, "Red Cross Ambulance — Mumbai", "Bandra Kurla Complex",
                "Mumbai", "+91 22 6657 1000", 19.0759, 72.8777, 4.1, false, false, true),
        facility(EmergencyFacility.Type.AMBULANCE_SERVICE, "STAR Ambulance — Delhi", "Karol Bagh",
                "Delhi", "+91 11 4500 4500", 28.6542, 77.1891, 4.2, false, false, true),
        facility(EmergencyFacility.Type.AMBULANCE_SERVICE, "LifeCare Ambulance — Bengaluru", "Koramangala",
                "Bengaluru", "+91 80 6900 6900", 12.9279, 77.6249, 4.1, false, false, true),
        facility(EmergencyFacility.Type.AMBULANCE_SERVICE, "Ziqitza Healthcare — Hyderabad", "Somajiguda",
                "Hyderabad", "+91 40 6696 9696", 17.4126, 78.4472, 4.0, false, false, true),
        facility(EmergencyFacility.Type.AMBULANCE_SERVICE, "108 Emergency Services — Pune", "Shivajinagar",
                "Pune", "+91 20 2553 0108", 18.5312, 73.8445, 4.2, false, false, true),
        facility(EmergencyFacility.Type.AMBULANCE_SERVICE, "Medical Rescue — Chennai", "Nungambakkam",
                "Chennai", "+91 44 4040 0404", 13.0520, 80.2410, 4.0, false, false, true),
        facility(EmergencyFacility.Type.AMBULANCE_SERVICE, "Surat Emergency 108", "Athwa Gate",
                "Surat", "+91 261 247 0108", 21.1968, 72.8095, 4.1, false, false, true),
        facility(EmergencyFacility.Type.AMBULANCE_SERVICE, "Apollo Ambulance — Kolkata", "Alipore",
                "Kolkata", "+91 33 2440 4444", 22.5355, 88.3315, 4.0, false, false, true),
        facility(EmergencyFacility.Type.AMBULANCE_SERVICE, "108 Emergency — Rajkot", "Jawahar Road",
                "Rajkot", "+91 281 223 0108", 22.3038, 70.8005, 4.0, false, false, true),
        facility(EmergencyFacility.Type.AMBULANCE_SERVICE, "Rapid Response — Jaipur", "MI Road",
                "Jaipur", "+91 141 405 0108", 26.9140, 75.7822, 4.0, false, false, true),
        facility(EmergencyFacility.Type.AMBULANCE_SERVICE, "108 Services — Lucknow", "Gomti Nagar",
                "Lucknow", "+91 522 230 0108", 26.8465, 80.9947, 4.0, false, false, true)
    );

    private static EmergencyFacility facility(EmergencyFacility.Type type, String name,
            String address, String city, String phone,
            double lat, double lng, double rating,
            boolean emergency, boolean blood, boolean allHours) {
        return EmergencyFacility.builder()
                .type(type).name(name).address(address).city(city).phone(phone)
                .latitude(lat).longitude(lng).rating(rating)
                .emergencyDept(emergency).bloodBank(blood).open24x7(allHours)
                .build();
    }
}
