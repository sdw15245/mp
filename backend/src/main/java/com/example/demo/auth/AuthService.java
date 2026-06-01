package com.example.demo.auth;

import com.example.demo.jwt.JwtTokenProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** refresh 토큰 검증 후 새 access 토큰 발급, 로그아웃 시 DB의 refresh 토큰 삭제. */
@Service
public class AuthService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider tokenProvider;

    public AuthService(RefreshTokenRepository refreshTokenRepository, JwtTokenProvider tokenProvider) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenProvider = tokenProvider;
    }

    @Transactional(readOnly = true)
    public String refresh(String refreshToken) {
        if (!tokenProvider.validate(refreshToken) || !tokenProvider.isRefreshToken(refreshToken)) {
            throw new IllegalArgumentException("invalid refresh token");
        }

        RefreshToken stored = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("refresh token not found"));

        if (stored.isExpired()) {
            throw new IllegalArgumentException("refresh token expired");
        }

        return tokenProvider.createAccessToken(stored.getUserId());
    }

    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }
}
