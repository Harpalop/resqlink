package com.resqlink.api.dashboard;

import com.resqlink.api.emergency.EmergencyRepository;
import com.resqlink.api.emergency.EmergencyStatus;
import com.resqlink.api.emergency.EmergencyType;
import com.resqlink.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final EmergencyRepository emergencyRepository;

    public record TrendPoint(String date, long count) {}
    public record HourlyPoint(int hour, long count) {}
    public record TypePoint(String type, long count) {}
    public record RegionPoint(String city, long count) {}
    public record Summary(long users, long emergencies, long active, long resolved, long cancelled) {}

    public record AnalyticsData(
            List<TrendPoint> trend,
            List<HourlyPoint> hourly,
            List<TypePoint> typeBreakdown,
            Summary summary
    ) {}

    @Transactional(readOnly = true)
    public AnalyticsData getAnalytics() {
        LocalDate now = LocalDate.now();
        LocalDate thirtyDaysAgo = now.minusDays(30);

        // Trend: emergency count per day for last 30 days
        List<TrendPoint> trend = new ArrayList<>();
        for (LocalDate date = thirtyDaysAgo; !date.isAfter(now); date = date.plusDays(1)) {
            Instant dayStart = date.atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant dayEnd = date.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
            long count = emergencyRepository.countByCreatedAtBetween(dayStart, dayEnd);
            trend.add(new TrendPoint(date.toString(), count));
        }

        // Hourly: count of emergencies by hour of day
        List<HourlyPoint> hourly = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            long count = emergencyRepository.countByCreatedAtBetween(
                    LocalDate.now().atTime(LocalTime.of(h, 0)).atZone(ZoneId.systemDefault()).toInstant(),
                    LocalDate.now().atTime(LocalTime.of(h, 59, 59)).atZone(ZoneId.systemDefault()).toInstant()
            );
            hourly.add(new HourlyPoint(h, count));
        }

        // Type breakdown
        List<TypePoint> typeBreakdown = new ArrayList<>();
        for (EmergencyType type : EmergencyType.values()) {
            long count = emergencyRepository.countByTypeAndCreatedAtBetween(
                    type,
                    thirtyDaysAgo.atStartOfDay(ZoneId.systemDefault()).toInstant(),
                    now.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant()
            );
            typeBreakdown.add(new TypePoint(type.name().replace('_', ' '), count));
        }

        // Summary
        long total = emergencyRepository.count();
        long active = emergencyRepository.countByStatus(EmergencyStatus.ACTIVE);
        long resolved = emergencyRepository.countByStatus(EmergencyStatus.RESOLVED);
        long cancelled = emergencyRepository.countByStatus(EmergencyStatus.CANCELLED);

        return new AnalyticsData(trend, hourly, typeBreakdown,
                new Summary(userRepository.count(), total, active, resolved, cancelled));
    }
}
