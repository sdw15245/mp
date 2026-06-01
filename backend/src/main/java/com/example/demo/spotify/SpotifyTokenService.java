package com.example.demo.spotify;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.Base64;
import java.util.Map;

/**
 * Spotify access token 관리.
 * - 만료 안 됐으면 그대로 반환
 * - 만료됐으면 refresh token으로 새 access token 발급 후 DB 갱신
 */
@Service
public class SpotifyTokenService {

    private static final String TOKEN_URL = "https://accounts.spotify.com/api/token";

    private final SpotifyTokenRepository repository;
    private final RestClient restClient;
    private final String clientId;
    private final String clientSecret;

    public SpotifyTokenService(
            SpotifyTokenRepository repository,
            @Value("${spring.security.oauth2.client.registration.spotify.client-id}") String clientId,
            @Value("${spring.security.oauth2.client.registration.spotify.client-secret}") String clientSecret
    ) {
        this.repository = repository;
        this.restClient = RestClient.create();
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    @Transactional
    public String getValidAccessToken(Long userId) {
        SpotifyToken token = repository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Spotify token not found for user " + userId));

        if (!token.isExpired()) {
            return token.getAccessToken();
        }

        if (token.getRefreshToken() == null) {
            throw new IllegalStateException("Spotify refresh token missing for user " + userId);
        }

        return refresh(token);
    }

    @SuppressWarnings("unchecked")
    private String refresh(SpotifyToken token) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "refresh_token");
        form.add("refresh_token", token.getRefreshToken());

        String basic = Base64.getEncoder().encodeToString((clientId + ":" + clientSecret).getBytes());

        Map<String, Object> response = restClient.post()
                .uri(TOKEN_URL)
                .header("Authorization", "Basic " + basic)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(Map.class);

        if (response == null) {
            throw new IllegalStateException("Spotify token refresh failed: empty response");
        }

        String newAccess = (String) response.get("access_token");
        Integer expiresIn = (Integer) response.get("expires_in");
        String newRefresh = (String) response.get("refresh_token"); // null일 수도 있음

        token.update(newAccess, newRefresh, Instant.now().plusSeconds(expiresIn));
        return newAccess;
    }
}
