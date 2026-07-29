package com.resqlink.api.chat;

import com.resqlink.api.common.exception.ApiException;
import com.resqlink.api.user.Role;
import com.resqlink.api.user.User;
import com.resqlink.api.user.UserRepository;
import com.resqlink.api.websocket.WebSocketPushService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatRoomRepository roomRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final WebSocketPushService webSocketPushService;

    public record CreateRoomRequest(
            @NotBlank @Size(max = 120) String name,
            @Size(max = 200) String description
    ) {}

    public record SendMessageRequest(
            @Size(max = 500) String content,
            String fileUrl,
            String fileName,
            String fileType,
            Double latitude,
            Double longitude,
            String messageType
    ) {}

    public record RoomDTO(UUID id, String name, String description, String type, UUID createdBy, String createdAt) {
        static RoomDTO from(ChatRoom r) {
            Instant created = r.getCreatedAt() != null ? r.getCreatedAt() : Instant.now();
            return new RoomDTO(r.getId(), r.getName(), r.getDescription(), r.getType() != null ? r.getType().name() : "GROUP", r.getCreatedBy(), created.toString());
        }
    }

    public record MessageDTO(
            String eventType,
            UUID id,
            UUID roomId,
            UUID senderId,
            String senderName,
            String content,
            String fileUrl,
            String fileName,
            String fileType,
            Double latitude,
            Double longitude,
            String messageType,
            String status,
            String createdAt) {
        static MessageDTO from(ChatMessage m) {
            Instant created = m.getCreatedAt() != null ? m.getCreatedAt() : Instant.now();
            return new MessageDTO(
                    "MESSAGE",
                    m.getId(),
                    m.getRoomId(),
                    m.getSenderId(),
                    m.getSenderName(),
                    m.getContent(),
                    m.getFileUrl(),
                    m.getFileName(),
                    m.getFileType(),
                    m.getLatitude(),
                    m.getLongitude(),
                    m.getType() != null ? m.getType().name() : MessageType.TEXT.name(),
                    m.getStatus() != null ? m.getStatus().name() : MessageStatus.SENT.name(),
                    created.toString());
        }
    }

    public record UserSummaryDTO(UUID id, String fullName, String email, Role role, String profilePictureUrl) {
        static UserSummaryDTO from(User u) {
            return new UserSummaryDTO(u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.getProfilePictureUrl());
        }
    }

    @GetMapping("/users")
    @Transactional(readOnly = true)
    public List<UserSummaryDTO> listUsers(@AuthenticationPrincipal User currentUser) {
        return userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(currentUser.getId()))
                .map(UserSummaryDTO::from)
                .toList();
    }

    @PostMapping("/rooms")
    @Transactional
    public ResponseEntity<RoomDTO> createRoom(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateRoomRequest request) {
        ChatRoom room = roomRepository.save(ChatRoom.builder()
                .name(request.name().trim())
                .description(request.description())
                .createdBy(user.getId())
                .type(ChatRoom.Type.GROUP)
                .build());
        return ResponseEntity.status(HttpStatus.CREATED).body(RoomDTO.from(room));
    }

    @PostMapping("/direct/{targetUserId}")
    @Transactional
    public ResponseEntity<RoomDTO> getOrCreateDirectRoom(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID targetUserId) {
        if (currentUser.getId().equals(targetUserId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot start direct chat with yourself");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        // Generate consistent room name for 1-on-1 chat
        String roomName = "Direct: " + currentUser.getFullName() + " & " + targetUser.getFullName();

        // Check if direct room already exists
        ChatRoom existing = roomRepository.findAll().stream()
                .filter(r -> r.getType() == ChatRoom.Type.DIRECT && r.getName().equals(roomName))
                .findFirst()
                .orElse(null);

        if (existing != null) {
            return ResponseEntity.ok(RoomDTO.from(existing));
        }

        ChatRoom room = roomRepository.save(ChatRoom.builder()
                .name(roomName)
                .description("1-on-1 direct conversation")
                .createdBy(currentUser.getId())
                .type(ChatRoom.Type.DIRECT)
                .build());

        return ResponseEntity.status(HttpStatus.CREATED).body(RoomDTO.from(room));
    }

    @GetMapping("/rooms")
    @Transactional(readOnly = true)
    public List<RoomDTO> listRooms(@AuthenticationPrincipal User user) {
        return roomRepository.findAll().stream()
                .map(RoomDTO::from)
                .toList();
    }

    @GetMapping("/rooms/{roomId}/messages")
    @Transactional(readOnly = true)
    public List<MessageDTO> listMessages(@PathVariable UUID roomId) {
        return messageRepository.findByRoomIdOrderByCreatedAtAsc(roomId).stream()
                .map(MessageDTO::from)
                .toList();
    }

    @PostMapping("/rooms/{roomId}/messages")
    @Transactional
    public ResponseEntity<MessageDTO> sendMessage(
            @AuthenticationPrincipal User user,
            @PathVariable UUID roomId,
            @Valid @RequestBody SendMessageRequest request) {
        if (!roomRepository.existsById(roomId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Chat room not found");
        }
        
        MessageType resolvedType = MessageType.TEXT;
        if (request.messageType() != null) {
            try { resolvedType = MessageType.valueOf(request.messageType()); } catch (Exception e) {}
        } else if (request.fileUrl() != null) {
            resolvedType = MessageType.FILE;
        } else if (request.latitude() != null && request.longitude() != null) {
            resolvedType = MessageType.LOCATION;
        }

        ChatMessage message = messageRepository.saveAndFlush(ChatMessage.builder()
                .roomId(roomId)
                .senderId(user.getId())
                .senderName(user.getFullName())
                .content(request.content() != null ? request.content().trim() : "")
                .fileUrl(request.fileUrl())
                .fileName(request.fileName())
                .fileType(request.fileType())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .type(resolvedType)
                .status(MessageStatus.SENT)
                .build());
        MessageDTO dto = MessageDTO.from(message);
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        webSocketPushService.pushChatMessage(roomId, dto);
                    }
                });
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PostMapping("/rooms/{roomId}/typing")
    public ResponseEntity<Void> sendTyping(
            @AuthenticationPrincipal User user,
            @PathVariable UUID roomId) {
        webSocketPushService.pushTypingIndicator(roomId, user);
        return ResponseEntity.ok().build();
    }
}
