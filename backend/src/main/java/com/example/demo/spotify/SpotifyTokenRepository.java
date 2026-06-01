package com.example.demo.spotify;

import org.springframework.data.jpa.repository.JpaRepository;

/** SpotifyToken CRUD. PK가 userId라 findById/save만으로 충분. */
public interface SpotifyTokenRepository extends JpaRepository<SpotifyToken, Long> {
}
