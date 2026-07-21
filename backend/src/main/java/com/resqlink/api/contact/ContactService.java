package com.resqlink.api.contact;

import com.resqlink.api.common.exception.ApiException;
import com.resqlink.api.contact.dto.ContactRequest;
import com.resqlink.api.contact.dto.ContactResponse;
import com.resqlink.api.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContactService {

    public static final int MAX_CONTACTS = 5;

    private final EmergencyContactRepository contactRepository;

    @Transactional(readOnly = true)
    public List<ContactResponse> getContacts(User user) {
        return contactRepository.findByUserIdOrderByPriorityAscCreatedAtAsc(user.getId())
                .stream()
                .map(ContactResponse::from)
                .toList();
    }

    @Transactional
    public ContactResponse addContact(User user, ContactRequest request) {
        if (contactRepository.countByUserId(user.getId()) >= MAX_CONTACTS) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "You can add up to " + MAX_CONTACTS + " emergency contacts");
        }

        EmergencyContact contact = EmergencyContact.builder()
                .user(user)
                .name(request.name().trim())
                .phone(request.phone().trim())
                .relationship(request.relationship())
                .priority(request.priority() == null ? 1 : request.priority())
                .build();

        return ContactResponse.from(contactRepository.save(contact));
    }

    @Transactional
    public ContactResponse updateContact(User user, UUID contactId, ContactRequest request) {
        EmergencyContact contact = findOwned(user, contactId);
        contact.setName(request.name().trim());
        contact.setPhone(request.phone().trim());
        contact.setRelationship(request.relationship());
        if (request.priority() != null) {
            contact.setPriority(request.priority());
        }
        return ContactResponse.from(contactRepository.save(contact));
    }

    @Transactional
    public void deleteContact(User user, UUID contactId) {
        contactRepository.delete(findOwned(user, contactId));
    }

    private EmergencyContact findOwned(User user, UUID contactId) {
        return contactRepository.findByIdAndUserId(contactId, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Contact not found"));
    }
}
