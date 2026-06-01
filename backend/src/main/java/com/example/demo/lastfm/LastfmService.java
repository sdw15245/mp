package com.example.demo.lastfm;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

/**
 * Last.fm 태그 조회.
 * 곡 태그가 부족(<3)하면 아티스트 태그로 자동 fallback.
 * 응답의 count(0~100)를 같이 가져와 가중치로 활용.
 */
@Service
public class LastfmService {

    private static final int MIN_TRACK_TAGS = 3;

    private final LastfmProperties props;
    private final RestClient restClient;

    public LastfmService(LastfmProperties props) {
        this.props = props;
        this.restClient = RestClient.builder().baseUrl(props.getBaseUrl()).build();
    }

    /**
     * 곡의 태그 (이름 + count). 3개 미만이면 아티스트 태그로 fallback.
     */
    public List<LastfmTag> getTrackTags(String artist, String track) {
        List<LastfmTag> trackTags = fetchTags(q -> q
                .queryParam("method", "track.gettoptags")
                .queryParam("artist", artist)
                .queryParam("track", track));

        if (trackTags.size() >= MIN_TRACK_TAGS) {
            return trackTags;
        }

        return fetchTags(q -> q
                .queryParam("method", "artist.gettoptags")
                .queryParam("artist", artist));
    }

    /**
     * 곡의 전세계 청취자 수(listeners). 대중성(마이너함) 계산용.
     * 곡을 못 찾으면 0. (Spotify popularity 제거 대체 신호)
     */
    @SuppressWarnings("unchecked")
    public long getTrackListeners(String artist, String track) {
        Map<String, Object> response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("method", "track.getInfo")
                        .queryParam("artist", artist)
                        .queryParam("track", track)
                        .queryParam("api_key", props.getApiKey())
                        .queryParam("format", "json")
                        .build())
                .retrieve()
                .body(Map.class);

        if (response == null) return 0;
        Object trackObj = response.get("track");
        if (!(trackObj instanceof Map)) return 0;

        Object listeners = ((Map<String, Object>) trackObj).get("listeners");
        if (listeners == null) return 0;
        try {
            return Long.parseLong(listeners.toString().trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    /** 곡과 비슷한 곡들. 추천용. match(0~1)는 유사도. */
    @SuppressWarnings("unchecked")
    public List<SimilarTrack> getSimilarTracks(String artist, String track, int limit) {
        Map<String, Object> response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("method", "track.getsimilar")
                        .queryParam("artist", artist)
                        .queryParam("track", track)
                        .queryParam("limit", limit)
                        .queryParam("api_key", props.getApiKey())
                        .queryParam("format", "json")
                        .build())
                .retrieve()
                .body(Map.class);

        if (response == null || !(response.get("similartracks") instanceof Map<?, ?> similar)) {
            return List.of();
        }
        if (!(((Map<String, Object>) similar).get("track") instanceof List<?> trackList)) {
            return List.of();
        }

        List<SimilarTrack> out = new ArrayList<>();
        for (Object obj : trackList) {
            if (!(obj instanceof Map<?, ?> t)) continue;
            Map<String, Object> tm = (Map<String, Object>) t;
            String name = (String) tm.get("name");
            String artistName = tm.get("artist") instanceof Map<?, ?> a
                    ? String.valueOf(((Map<String, Object>) a).get("name")) : "";
            double match = 0;
            Object m = tm.get("match");
            if (m != null) {
                try { match = Double.parseDouble(m.toString()); } catch (NumberFormatException ignored) {}
            }
            if (name != null && !name.isBlank() && artistName != null && !artistName.isBlank()) {
                out.add(new SimilarTrack(artistName, name, match));
            }
        }
        return out;
    }

    public record SimilarTrack(String artist, String name, double match) {}

    @SuppressWarnings("unchecked")
    private List<LastfmTag> fetchTags(Consumer<org.springframework.web.util.UriBuilder> queryCustomizer) {
        Map<String, Object> response = restClient.get()
                .uri(uriBuilder -> {
                    queryCustomizer.accept(uriBuilder);
                    uriBuilder.queryParam("api_key", props.getApiKey())
                              .queryParam("format", "json");
                    return uriBuilder.build();
                })
                .retrieve()
                .body(Map.class);

        if (response == null) return Collections.emptyList();

        Object toptagsObj = response.get("toptags");
        if (!(toptagsObj instanceof Map)) return Collections.emptyList();

        Object tagObj = ((Map<String, Object>) toptagsObj).get("tag");
        if (!(tagObj instanceof List)) return Collections.emptyList();

        return ((List<Map<String, Object>>) tagObj).stream()
                .map(t -> {
                    String name = (String) t.get("name");
                    Object countRaw = t.get("count");
                    int count = countRaw instanceof Number n ? n.intValue() : 0;
                    return name == null || name.isBlank() ? null : new LastfmTag(name, count);
                })
                .filter(t -> t != null)
                .toList();
    }
}
