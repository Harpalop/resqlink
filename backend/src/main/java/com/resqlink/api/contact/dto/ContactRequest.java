package com.resqlink.api.contact.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ContactRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 80, message = "Name must be between 2 and 80 characters")
        String name,

        @NotBlank(message = "Phone is required")
        @Pattern(regexp = "^[+0-9 ()-]{7,20}$", message = "Enter a valid phone number")
        String phone,

        @Size(max = 40, message = "Relationship is too long")
        String relationship,

        @Size(max = 160, message = "Email is too long")
        @jakarta.validation.constraints.Email(message = "Enter a valid email address")
        String email,

        @Min(value = 1, message = "Priority must be between 1 and 5")
        @Max(value = 5, message = "Priority must be between 1 and 5")
        Integer priority
) {
}
