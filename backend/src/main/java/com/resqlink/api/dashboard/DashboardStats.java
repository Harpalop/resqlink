package com.resqlink.api.dashboard;

import java.util.List;

public record DashboardStats(
        // Personal
        int profileCompletionPercent,
        int emergencyContacts,
        long myEmergencies,
        long myActiveEmergencies,
        boolean isDonor,
        int myDonations,
        // Network
        long networkUsers,
        long availableDonors,
        long openBloodRequests,
        // Charts
        List<DayCount> emergenciesLast7Days,
        List<GroupCount> donorsByBloodGroup
) {
    public record DayCount(String day, long count) {
    }

    public record GroupCount(String group, long count) {
    }
}
