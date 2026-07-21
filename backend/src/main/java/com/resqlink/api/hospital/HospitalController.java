package com.resqlink.api.hospital;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalRepository hospitalRepository;

    @GetMapping
    public List<Hospital> search(@RequestParam(required = false) String q) {
        if (q == null || q.isBlank()) {
            return hospitalRepository.findTop50ByOrderByRatingDesc();
        }
        String query = q.trim();
        return hospitalRepository
                .findTop50ByNameContainingIgnoreCaseOrCityContainingIgnoreCaseOrderByRatingDesc(query, query);
    }
}
