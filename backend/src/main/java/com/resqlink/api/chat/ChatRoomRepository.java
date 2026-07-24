package com.resqlink.api.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, UUID> {

    @Query("SELECT cr FROM ChatRoom cr WHERE cr.id IN " +
            "(SELECT DISTINCT cm.roomId FROM ChatMessage cm WHERE cm.senderId = :userId)")
    List<ChatRoom> findRoomsByParticipant(@Param("userId") UUID userId);
}
