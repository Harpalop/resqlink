package com.resqlink.api.family;

import com.resqlink.api.common.exception.ApiException;
import com.resqlink.api.family.dto.FamilyDtos.CheckInRequest;
import com.resqlink.api.family.dto.FamilyDtos.CreateGroupRequest;
import com.resqlink.api.family.dto.FamilyDtos.GroupResponse;
import com.resqlink.api.family.dto.FamilyDtos.JoinRequest;
import com.resqlink.api.family.dto.FamilyDtos.MemberResponse;
import com.resqlink.api.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FamilyService {

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final FamilyGroupRepository groupRepository;
    private final FamilyMemberRepository memberRepository;

    @Transactional(readOnly = true)
    public List<GroupResponse> getMyGroups(User user) {
        return memberRepository.findByUserId(user.getId()).stream()
                .map(membership -> toGroupResponse(membership.getGroup(), user))
                .toList();
    }

    @Transactional
    public GroupResponse createGroup(User user, CreateGroupRequest request) {
        FamilyGroup group = groupRepository.save(FamilyGroup.builder()
                .name(request.name().trim())
                .inviteCode(nextInviteCode())
                .owner(user)
                .build());
        memberRepository.save(FamilyMember.builder().group(group).user(user).build());
        return toGroupResponse(group, user);
    }

    @Transactional
    public GroupResponse joinGroup(User user, JoinRequest request) {
        FamilyGroup group = groupRepository
                .findByInviteCode(request.inviteCode().trim().toUpperCase())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "No family group found for that invite code"));

        if (memberRepository.findByGroupIdAndUserId(group.getId(), user.getId()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "You are already in this group");
        }
        if (memberRepository.countByGroupId(group.getId()) >= 12) {
            throw new ApiException(HttpStatus.CONFLICT, "This group is full (12 members max)");
        }

        memberRepository.save(FamilyMember.builder().group(group).user(user).build());
        return toGroupResponse(group, user);
    }

    @Transactional
    public GroupResponse checkIn(User user, UUID groupId, CheckInRequest request) {
        FamilyMember membership = memberRepository.findByGroupIdAndUserId(groupId, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "You are not in this group"));
        membership.setLastCheckInAt(Instant.now());
        membership.setLastCheckInNote(request.note());
        memberRepository.save(membership);
        return toGroupResponse(membership.getGroup(), user);
    }

    @Transactional
    public void leaveGroup(User user, UUID groupId) {
        FamilyMember membership = memberRepository.findByGroupIdAndUserId(groupId, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "You are not in this group"));
        FamilyGroup group = membership.getGroup();
        memberRepository.delete(membership);
        // Last member out deletes the group entirely.
        if (memberRepository.countByGroupId(group.getId()) == 0) {
            groupRepository.delete(group);
        }
    }

    private GroupResponse toGroupResponse(FamilyGroup group, User currentUser) {
        List<MemberResponse> members = memberRepository
                .findByGroupIdOrderByJoinedAtAsc(group.getId())
                .stream()
                .map(member -> new MemberResponse(
                        member.getUser().getId(),
                        member.getUser().getFullName(),
                        member.getUser().getId().equals(group.getOwner().getId()),
                        member.getUser().getId().equals(currentUser.getId()),
                        member.getLastCheckInAt(),
                        member.getLastCheckInNote()))
                .toList();
        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getInviteCode(),
                group.getOwner().getId().equals(currentUser.getId()),
                members,
                group.getCreatedAt());
    }

    private String nextInviteCode() {
        String code;
        do {
            StringBuilder builder = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                builder.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
            }
            code = builder.toString();
        } while (groupRepository.existsByInviteCode(code));
        return code;
    }
}
