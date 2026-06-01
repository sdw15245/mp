package com.example.demo.spotify;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Spotify Web API 호출.
 * 토큰 자체는 SpotifyTokenService가 관리. 여기서는 API 호출만.
 */
@Service
public class SpotifyService {

    private static final String API_BASE = "https://api.spotify.com/v1";

    private final SpotifyTokenService tokenService;
    private final RestClient restClient;

    public SpotifyService(SpotifyTokenService tokenService) {
        this.tokenService = tokenService;
        this.restClient = RestClient.create();
    }

    /** 사용자의 top tracks. (트랙명, 아티스트명) 리스트. 기본 10곡. */
    public List<TopTrack> getTopTracks(Long userId, int limit) {
        String accessToken = tokenService.getValidAccessToken(userId);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restClient.get()
                .uri(API_BASE + "/me/top/tracks?limit=" + limit + "&time_range=medium_term")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(Map.class);

        if (response == null) {
            throw new IllegalStateException("Spotify top tracks: empty response");
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
        if (items == null || items.isEmpty()) {
            return List.of();
        }

        // 2026-02 Web API 변경으로 track.popularity 필드가 제거됨 → Spotify는 곡명/아티스트만.
        // 대중성(마이너함)은 Last.fm listeners로 따로 계산한다(LastfmService).
        return items.stream()
                .map(item -> {
                    String trackName = (String) item.get("name");
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> artists = (List<Map<String, Object>>) item.get("artists");
                    String artistName = (artists == null || artists.isEmpty())
                            ? "" : (String) artists.get(0).get("name");
                    return new TopTrack(trackName, artistName);
                })
                .toList();
    }

    /** Spotify 검색으로 곡 1개 찾기. 추천곡(곡명+가수)을 저장 가능한 URI로 변환. 없으면 null. */
    @SuppressWarnings("unchecked")
    public TrackHit searchTrack(Long userId, String query) {
        String accessToken = tokenService.getValidAccessToken(userId);
        String q = URLEncoder.encode(query, StandardCharsets.UTF_8);

        Map<String, Object> response = restClient.get()
                .uri(API_BASE + "/search?type=track&limit=1&q=" + q)
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(Map.class);

        if (response == null) return null;
        if (!(response.get("tracks") instanceof Map<?, ?> tracks)) return null;
        if (!(((Map<String, Object>) tracks).get("items") instanceof List<?> items) || items.isEmpty()) return null;

        Map<String, Object> t = (Map<String, Object>) items.get(0);
        String uri = (String) t.get("uri");
        String name = (String) t.get("name");

        List<Map<String, Object>> artists = (List<Map<String, Object>>) t.get("artists");
        String artist = (artists == null || artists.isEmpty()) ? "" : (String) artists.get(0).get("name");

        String imageUrl = "";
        if (t.get("album") instanceof Map<?, ?> album
                && ((Map<String, Object>) album).get("images") instanceof List<?> images && !images.isEmpty()
                && images.get(0) instanceof Map<?, ?> img) {
            Object url = ((Map<String, Object>) img).get("url");
            imageUrl = url == null ? "" : url.toString();
        }

        return uri == null ? null : new TrackHit(uri, name, artist, imageUrl);
    }

    /** 새 플레이리스트 생성. 생성된 id + 웹 URL 반환. (playlist-modify 권한 필요) */
    @SuppressWarnings("unchecked")
    public PlaylistRef createPlaylist(Long userId, String name, String description) {
        String accessToken = tokenService.getValidAccessToken(userId);

        Map<String, Object> response = restClient.post()
                .uri(API_BASE + "/me/playlists")
                .header("Authorization", "Bearer " + accessToken)
                .body(Map.of("name", name, "description", description, "public", true))
                .retrieve()
                .body(Map.class);

        if (response == null) {
            throw new IllegalStateException("Spotify create playlist: empty response");
        }
        String id = (String) response.get("id");
        String url = "";
        if (response.get("external_urls") instanceof Map<?, ?> ext) {
            Object spotify = ((Map<String, Object>) ext).get("spotify");
            url = spotify == null ? "" : spotify.toString();
        }
        return new PlaylistRef(id, url);
    }

    /** 플레이리스트에 트랙 URI들 추가. */
    public void addTracksToPlaylist(Long userId, String playlistId, List<String> uris) {
        if (uris == null || uris.isEmpty()) return;
        String accessToken = tokenService.getValidAccessToken(userId);

        restClient.post()
                .uri(API_BASE + "/playlists/" + playlistId + "/items")
                .header("Authorization", "Bearer " + accessToken)
                .body(Map.of("uris", uris))
                .retrieve()
                .toBodilessEntity();
    }

    public record TopTrack(String name, String artist) {}

    public record TrackHit(String uri, String name, String artist, String imageUrl) {}

    public record PlaylistRef(String id, String url) {}
}
