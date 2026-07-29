package com.resqlink.api.chat;

import com.resqlink.api.user.Role;
import com.resqlink.api.user.User;
import com.resqlink.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatSeeder implements CommandLineRunner {

    private final ChatRoomRepository roomRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (roomRepository.count() > 0) {
            return;
        }

        User admin = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .findFirst()
                .orElse(null);

        if (admin == null) {
            return;
        }

        ChatRoom room1 = roomRepository.save(ChatRoom.builder()
                .name("General Emergency Dispatch")
                .description("Public emergency network coordination channel")
                .type(ChatRoom.Type.GROUP)
                .createdBy(admin.getId())
                .build());

        ChatRoom room2 = roomRepository.save(ChatRoom.builder()
                .name("Medical & Telemedicine")
                .description("Connect with doctors and emergency medical responders")
                .type(ChatRoom.Type.GROUP)
                .createdBy(admin.getId())
                .build());

        ChatRoom room3 = roomRepository.save(ChatRoom.builder()
                .name("Volunteer & Blood Donors")
                .description("Coordinate local blood donations and rescue tasks")
                .type(ChatRoom.Type.GROUP)
                .createdBy(admin.getId())
                .build());

        messageRepository.saveAll(List.of(
                ChatMessage.builder()
                        .roomId(room1.getId())
                        .senderId(admin.getId())
                        .senderName("ResQLink System")
                        .content("Welcome to the General Emergency Dispatch channel! Report active situations or coordinate here.")
                        .build(),
                ChatMessage.builder()
                        .roomId(room2.getId())
                        .senderId(admin.getId())
                        .senderName("ResQLink System")
                        .content("Medical consultation channel is active. Qualified doctors and nurses are on standby.")
                        .build()
        ));

        log.info("Seeded default chat rooms and welcome messages.");
    }
}
