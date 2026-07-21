package com.resqlink.api.contact;

import com.resqlink.api.contact.dto.ContactRequest;
import com.resqlink.api.contact.dto.ContactResponse;
import com.resqlink.api.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @GetMapping
    public List<ContactResponse> getContacts(@AuthenticationPrincipal User user) {
        return contactService.getContacts(user);
    }

    @PostMapping
    public ResponseEntity<ContactResponse> addContact(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ContactRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contactService.addContact(user, request));
    }

    @PutMapping("/{contactId}")
    public ContactResponse updateContact(
            @AuthenticationPrincipal User user,
            @PathVariable UUID contactId,
            @Valid @RequestBody ContactRequest request
    ) {
        return contactService.updateContact(user, contactId, request);
    }

    @DeleteMapping("/{contactId}")
    public ResponseEntity<Void> deleteContact(
            @AuthenticationPrincipal User user,
            @PathVariable UUID contactId
    ) {
        contactService.deleteContact(user, contactId);
        return ResponseEntity.noContent().build();
    }
}
