package com.resqlink.api.facility;

import com.resqlink.api.common.exception.ApiException;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/facilities")
@RequiredArgsConstructor
public class EmergencyFacilityController {

    private final EmergencyFacilityRepository facilityRepository;

    public record FacilityDTO(
            UUID id, String type, String name, String city, String address,
            String phone, double latitude, double longitude,
            double rating, boolean emergencyDept, boolean bloodBank,
            boolean open24x7, String services, String website) {
        static FacilityDTO from(EmergencyFacility f) {
            return new FacilityDTO(f.getId(), f.getType().name(), f.getName(),
                    f.getCity(), f.getAddress(), f.getPhone(),
                    f.getLatitude(), f.getLongitude(), f.getRating(),
                    f.isEmergencyDept(), f.isBloodBank(), f.isOpen24x7(),
                    f.getServices(), f.getWebsite());
        }
    }

    public record FacilityRequest(
            @NotBlank @Size(max = 140) String name,
            @NotBlank @Size(max = 240) String address,
            @NotBlank @Size(max = 80) String city,
            @Size(max = 20) String phone,
            @NotBlank String type,
            double latitude, double longitude,
            boolean emergencyDept, boolean bloodBank, boolean open24x7,
            @Size(max = 500) String services,
            @Size(max = 200) String website) {
    }

    @GetMapping
    public List<FacilityDTO> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String types) {

        List<EmergencyFacility.Type> typeList = parseTypes(types);
        List<EmergencyFacility> results;

        if ((q == null || q.isBlank()) && (typeList == null || typeList.isEmpty())) {
            results = facilityRepository.findTop50ByOrderByRatingDesc();
        } else if (q != null && !q.isBlank() && (typeList != null && !typeList.isEmpty())) {
            results = facilityRepository
                    .findByTypeInAndNameContainingIgnoreCaseOrTypeInAndCityContainingIgnoreCaseOrderByRatingDesc(
                            typeList, q.trim(), typeList, q.trim());
        } else if (q != null && !q.isBlank()) {
            results = facilityRepository
                    .findByNameContainingIgnoreCaseOrCityContainingIgnoreCaseOrderByRatingDesc(
                            q.trim(), q.trim());
        } else {
            results = facilityRepository.findByTypeInOrderByRatingDesc(typeList);
        }

        return results.stream().map(FacilityDTO::from).toList();
    }

    @GetMapping("/{id}")
    public FacilityDTO getById(@PathVariable UUID id) {
        return facilityRepository.findById(id)
                .map(FacilityDTO::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Facility not found"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FacilityDTO> create(@RequestBody FacilityRequest request) {
        EmergencyFacility facility = EmergencyFacility.builder()
                .type(EmergencyFacility.Type.valueOf(request.type()))
                .name(request.name().trim())
                .address(request.address().trim())
                .city(request.city().trim())
                .phone(request.phone())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .emergencyDept(request.emergencyDept())
                .bloodBank(request.bloodBank())
                .open24x7(request.open24x7())
                .services(request.services())
                .website(request.website())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(FacilityDTO.from(facilityRepository.save(facility)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public FacilityDTO update(@PathVariable UUID id, @RequestBody FacilityRequest request) {
        EmergencyFacility facility = findOrThrow(id);
        facility.setType(EmergencyFacility.Type.valueOf(request.type()));
        facility.setName(request.name().trim());
        facility.setAddress(request.address().trim());
        facility.setCity(request.city().trim());
        facility.setPhone(request.phone());
        facility.setLatitude(request.latitude());
        facility.setLongitude(request.longitude());
        facility.setEmergencyDept(request.emergencyDept());
        facility.setBloodBank(request.bloodBank());
        facility.setOpen24x7(request.open24x7());
        facility.setServices(request.services());
        facility.setWebsite(request.website());
        return FacilityDTO.from(facilityRepository.save(facility));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        facilityRepository.delete(findOrThrow(id));
        return ResponseEntity.noContent().build();
    }

    private EmergencyFacility findOrThrow(UUID id) {
        return facilityRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Facility not found"));
    }

    private List<EmergencyFacility.Type> parseTypes(String types) {
        if (types == null || types.isBlank()) return Collections.emptyList();
        return Arrays.stream(types.split(","))
                .map(String::trim)
                .map(s -> {
                    try {
                        return EmergencyFacility.Type.valueOf(s.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        return null; // silently skip invalid types
                    }
                })
                .filter(t -> t != null)
                .collect(Collectors.toList());
    }
}
