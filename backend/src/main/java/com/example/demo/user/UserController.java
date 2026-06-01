package com.example.demo.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** 현재 로그인 사용자 정보 반환 (/api/me). JWT 필터가 인증된 요청만 통과시킴. */
@RestController
@RequestMapping("/api")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal Long userId) {
        return userRepository.findById(userId)
                .map(u -> ResponseEntity.ok(Map.<String, Object>of(
                        "id", u.getId(),
                        "spotifyId", u.getSpotifyId(),
                        "email", u.getEmail() == null ? "" : u.getEmail(),
                        "displayName", u.getDisplayName() == null ? "" : u.getDisplayName()
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}
