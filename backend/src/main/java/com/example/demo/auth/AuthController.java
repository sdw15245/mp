package com.example.demo.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** 인증 관련 HTTP 엔드포인트: access 토큰 재발급(/refresh), 로그아웃(/logout). */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(@RequestBody Map<String, String> body) {
        try {
            String refreshToken = body.get("refresh");
            String access = authService.refresh(refreshToken);
            return ResponseEntity.ok(Map.of("access", access));
        } catch (Exception e) {
            // refresh 실패 = 재로그인 필요. 500 대신 401 반환.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "refresh_failed", "message", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public Map<String, String> logout(@AuthenticationPrincipal Long userId) {
        authService.logout(userId);
        return Map.of("status", "ok");
    }
}
