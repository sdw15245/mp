package com.example.demo.genre;

import com.example.demo.llm.GeminiClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/** 태그를 Gemini로 13 메인 장르 중 하나로 분류. 단건 + 배치 지원. */
@Component
public class LlmGenreClassifier {

    private static final String BATCH_PROMPT_TEMPLATE = """
            You classify each music tag into one of these main genres:
            %s

            Tags:
            %s

            For EACH tag, decide the best matching genre from the list above.
            If a tag is not a genre (e.g., "favorites", "2020", "seen live", artist names) or unclear, use "none".

            Respond ONLY with a JSON object mapping each tag to its genre, no other text or markdown.
            Example: {"pop": "pop", "trap": "hip-hop", "favorites": "none"}
            """;

    private final GeminiClient gemini;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public LlmGenreClassifier(GeminiClient gemini) {
        this.gemini = gemini;
    }

    /** 단일 태그 분류 (내부적으로 batch 사용). */
    public Optional<String> classify(String tag) {
        return classifyBatch(List.of(tag)).getOrDefault(tag, Optional.empty());
    }

    /**
     * 여러 태그를 한 번의 LLM 호출로 분류.
     * 반환: tag → Optional<메인 장르>. empty면 "장르 아님/모름".
     */
    public Map<String, Optional<String>> classifyBatch(List<String> tags) {
        Map<String, Optional<String>> result = new LinkedHashMap<>();
        for (String t : tags) result.put(t, Optional.empty());

        if (tags.isEmpty()) return result;

        StringBuilder tagList = new StringBuilder();
        for (int i = 0; i < tags.size(); i++) {
            tagList.append(i + 1).append(". \"").append(tags.get(i)).append("\"\n");
        }

        String genreList = String.join(", ", GenreDictionary.MAIN_GENRES);
        String response = gemini.generate(BATCH_PROMPT_TEMPLATE.formatted(genreList, tagList.toString()));
        String json = stripCodeFences(response);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> parsed = objectMapper.readValue(json, Map.class);

            Map<String, String> normalized = new HashMap<>();
            parsed.forEach((k, v) -> normalized.put(k.toLowerCase().trim(),
                    v == null ? "" : v.toString().toLowerCase().trim()));

            for (String tag : tags) {
                String genre = normalized.get(tag.toLowerCase().trim());
                if (genre != null && GenreDictionary.MAIN_GENRES.contains(genre)) {
                    result.put(tag, Optional.of(genre));
                }
            }
        } catch (Exception e) {
            // 파싱 실패 시 전체 empty 유지
        }

        return result;
    }

    /** Gemini가 ```json ... ``` 블록으로 감싸는 경우 제거. */
    private String stripCodeFences(String s) {
        String trimmed = s.trim();
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            if (firstNewline > 0) trimmed = trimmed.substring(firstNewline + 1);
            if (trimmed.endsWith("```")) trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }
}
