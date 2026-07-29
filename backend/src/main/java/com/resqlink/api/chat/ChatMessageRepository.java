package com.resqlink.api.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    List<ChatMessage> findByRoomIdOrderByCreatedAtAsc(UUID roomId);

    List<ChatMessage> findTop50ByRoomIdOrderByCreatedAtDesc(UUID roomId);
}
