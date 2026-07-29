package com.resqlink.api.dashboard;

import com.resqlink.api.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final AnalyticsService analyticsService;

    @GetMapping("/stats")
    public DashboardStats getStats(@AuthenticationPrincipal User user) {
        return dashboardService.getStats(user);
    }

    @GetMapping("/analytics")
    @Transactional(readOnly = true)
    public AnalyticsService.AnalyticsData getAnalytics() {
        return analyticsService.getAnalytics();
    }
}
