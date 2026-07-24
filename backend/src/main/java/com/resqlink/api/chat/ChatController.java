package com.resqlink.api.chat;

import com.resqlink.api.common.exception.ApiException;
import com.resqlink.api.user.User;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatRoomRepository roomRepository;
    private final ChatMessageRepository messageRepository;
    private final WebSocketPushService webSocketPushService;

    public record CreateRoomRequest(
            @NotBlank @Size(max = 120) String name,
            @Size(max = 200) String description
    ) {}

    public record SendMessageRequest(
            @NotBlank @Size(max = 500) String content
    ) {}

    public record RoomDTO(UUID id, String name, String description, UUID createdBy, String createdAt) {
        static RoomDTO from(ChatRoom r) {
            return new RoomDTO(r.getId(), r.getName(), r.getDescription(), r.getCreatedBy(), r.getCreatedAt().toString());
        }
    }

    public record MessageDTO(UUID id, UUID roomId, UUID senderId, String senderName, String content, String createdAt) {
        static MessageDTO from(ChatMessage m) {
            return new MessageDTO(m.getId(), m.getRoomId(), m.getSenderId(), m.getSenderName(), m.getContent(), m.getCreatedAt().toString());
        }
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
        ChatMessage message = messageRepository.save(ChatMessage.builder()
                .roomId(roomId)
                .senderId(user.getId())
                .senderName(user.getFullName())
                .content(request.content().trim())
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
}
