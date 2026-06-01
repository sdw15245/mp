package com.example.demo.test;

import com.example.demo.genre.UserVectorService;
import com.example.demo.lastfm.LastfmService;
import com.example.demo.lastfm.LastfmTag;
import com.example.demo.matching.MatchService;
import com.example.demo.recommendation.RecommendationService;
import com.example.demo.spotify.SpotifyService;
import com.example.demo.taste.TasteCommentService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/** 검증용 테스트 엔드포인트. 안정화되면 삭제. */
@RestController
@RequestMapping("/api/test")
public class TestController {

    private static final int TOP_TRACKS_LIMIT = 10;

    private final SpotifyService spotifyService;
    private final LastfmService lastfmService;
    private final UserVectorService userVectorService;
    private final MatchService matchService;
    private final TasteCommentService tasteCommentService;
    private final RecommendationService recommendationService;

    public TestController(SpotifyService spotifyService,
                          LastfmService lastfmService,
                          UserVectorService userVectorService,
                          MatchService matchService,
                          TasteCommentService tasteCommentService,
                          RecommendationService recommendationService) {
        this.spotifyService = spotifyService;
        this.lastfmService = lastfmService;
        this.userVectorService = userVectorService;
        this.matchService = matchService;
        this.tasteCommentService = tasteCommentService;
        this.recommendationService = recommendationService;
    }

    /** 사용자의 top 10 tracks + 각 곡의 Last.fm 태그 (이름만). */
    @GetMapping("/top-tracks")
    public List<Map<String, Object>> topTracks(@AuthenticationPrincipal Long userId) {
        return spotifyService.getTopTracks(userId, TOP_TRACKS_LIMIT).parallelStream()
                .map(t -> {
                    List<String> tagNames = lastfmService.getTrackTags(t.artist(), t.name()).stream()
                            .map(LastfmTag::name)
                            .toList();
                    return Map.<String, Object>of(
                            "trackName", t.name(),
                            "artistName", t.artist(),
                            "tags", tagNames
                    );
                })
                .toList();
    }

    /** top tracks 태그 → 정규화 → 가중치 적용 사용자 vector. */
    @GetMapping("/user-vector")
    public Map<String, Object> userVector(@AuthenticationPrincipal Long userId) {
        List<List<LastfmTag>> tagsPerTrack = spotifyService.getTopTracks(userId, TOP_TRACKS_LIMIT).parallelStream()
                .map(t -> lastfmService.getTrackTags(t.artist(), t.name()))
                .toList();

        UserVectorService.Result result = userVectorService.build(tagsPerTrack);
        int totalTags = tagsPerTrack.stream().mapToInt(List::size).sum();

        return Map.of(
                "vector", result.vector(),
                "unmappedTags", result.unmappedTags(),
                "tagCount", totalTags,
                "trackCount", tagsPerTrack.size()
        );
    }

    /** 사용자 vector → 캐릭터 풀과 매칭 → 가장 닮은 캐릭터 1개 + 점수. */
    @GetMapping("/match")
    public Map<String, Object> match(@AuthenticationPrincipal Long userId) {
        List<List<LastfmTag>> tagsPerTrack = spotifyService.getTopTracks(userId, TOP_TRACKS_LIMIT).parallelStream()
                .map(t -> lastfmService.getTrackTags(t.artist(), t.name()))
                .toList();

        UserVectorService.Result result = userVectorService.build(tagsPerTrack);
        MatchService.MatchResult match = matchService.findTop1(result.vector());

        return Map.of(
                "characterSlug", match.character().slug(),
                "characterName", match.character().name(),
                "imageUrl", match.character().imageUrl(),
                "score", match.score(),
                "vector", result.vector()
        );
    }

    /** 대중성(곡 인기도 평균) + 장르 분포 → LLM이 쓴 취향 평. */
    @GetMapping("/profile")
    public Map<String, Object> profile(@AuthenticationPrincipal Long userId) {
        List<SpotifyService.TopTrack> tracks = spotifyService.getTopTracks(userId, TOP_TRACKS_LIMIT);

        // 대중성: Last.fm listeners(청취자 수)를 로그 스케일로 0~100 환산해 평균.
        // listeners 10^2(마이너)~10^7(메가히트) → 0~100. 곡을 못 찾으면(0) 평균에서 제외.
        double sumNorm = 0.0;
        int counted = 0;
        for (SpotifyService.TopTrack t : tracks) {
            long listeners = lastfmService.getTrackListeners(t.artist(), t.name());
            if (listeners <= 0) continue;
            double norm = Math.max(0.0, Math.min(1.0, (Math.log10(listeners) - 2.0) / 5.0)) * 100.0;
            sumNorm += norm;
            counted++;
        }
        double mainstream = counted == 0 ? 0.0 : sumNorm / counted;
        double obscurity = 100.0 - mainstream;

        List<List<LastfmTag>> tagsPerTrack = tracks.parallelStream()
                .map(t -> lastfmService.getTrackTags(t.artist(), t.name()))
                .toList();
        UserVectorService.Result result = userVectorService.build(tagsPerTrack);

        String comment = tasteCommentService.comment(result.vector(), mainstream);

        return Map.of(
                "mainstream", mainstream,
                "obscurity", obscurity,
                "comment", comment
        );
    }

    /** 취향 기반 추천곡. 내 top곡과 비슷한 곡들(Last.fm) → Spotify URI로 변환. */
    @GetMapping("/recommendations")
    public List<RecommendationService.RecommendedTrack> recommendations(@AuthenticationPrincipal Long userId) {
        return recommendationService.recommend(userId);
    }

    /** 추천곡 URI들을 새 Spotify 플레이리스트로 저장. (playlist-modify 권한 필요) */
    @PostMapping("/recommendations/save")
    public Map<String, String> saveRecommendations(@AuthenticationPrincipal Long userId,
                                                    @RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<String> uris = body.get("uris") instanceof List<?> l
                ? l.stream().map(String::valueOf).toList()
                : List.of();
        String name = body.get("name") == null ? "음악 캐릭터 추천" : body.get("name").toString();

        String url = recommendationService.saveAsPlaylist(userId, name, uris);
        return Map.of("playlistUrl", url);
    }
}
