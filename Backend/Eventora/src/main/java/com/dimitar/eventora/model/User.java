package com.dimitar.eventora.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    private Long id;
    private String username;
    private String email;
    private String passwordHash;
    private UserRole role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean verified;
    private LocalDateTime verifiedAt;

    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }

    public boolean isOrganizer() {
        return role == UserRole.ORGANIZER || role == UserRole.ADMIN;
    }

    public boolean isUser() {
        return role == UserRole.USER;
    }

    public boolean canOrganizeEvents() {
        return isOrganizer();
    }
}
