package com.resqlink.api.blood;

import java.util.List;
import java.util.Map;

/**
 * Blood compatibility rules: which donor groups can give to a recipient group.
 * Used so a search for "A+" also surfaces O+, O-, A- donors.
 */
public final class BloodCompatibility {

    private static final Map<String, List<String>> CAN_RECEIVE_FROM = Map.of(
            "O-", List.of("O-"),
            "O+", List.of("O-", "O+"),
            "A-", List.of("O-", "A-"),
            "A+", List.of("O-", "O+", "A-", "A+"),
            "B-", List.of("O-", "B-"),
            "B+", List.of("O-", "O+", "B-", "B+"),
            "AB-", List.of("O-", "A-", "B-", "AB-"),
            "AB+", List.of("O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+")
    );

    private BloodCompatibility() {
    }

    public static List<String> donorsFor(String recipientGroup) {
        return CAN_RECEIVE_FROM.getOrDefault(recipientGroup, List.of(recipientGroup));
    }

    public static boolean isValidGroup(String group) {
        return CAN_RECEIVE_FROM.containsKey(group);
    }
}
