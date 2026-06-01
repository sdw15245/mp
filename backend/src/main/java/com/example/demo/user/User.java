package com.example.demo.user;

import jakarta.persistence.*;

import java.time.Instant;

/** 우리 앱 사용자 본질 정보 (내부 PK + Spotify ID + 이메일/표시명). */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String spotifyId;

    private String email;

    private String displayName;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected User() {}

    public User(String spotifyId, String email, String displayName) {
        this.spotifyId = spotifyId;
        this.email = email;
        this.displayName = displayName;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getSpotifyId() { return spotifyId; }
    public String getEmail() { return email; }
    public String getDisplayName() { return displayName; }
    public Instant getCreatedAt() { return createdAt; }

    public void updateProfile(String email, String displayName) {
        this.email = email;
        this.displayName = displayName;
    }
}
