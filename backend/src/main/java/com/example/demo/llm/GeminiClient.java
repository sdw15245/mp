package com.example.demo.llm;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/** Gemini generateContent API 호출. 텍스트 in/out 단순 래퍼. */
@Component
public class GeminiClient {

    private final GeminiProperties props;
    private final RestClient restClient;

    public GeminiClient(GeminiProperties props) {
        this.props = props;
        this.restClient = RestClient.builder().baseUrl(props.getBaseUrl()).build();
    }

    /** 프롬프트 → 응답 텍스트. 실패 시 빈 문자열. */
    @SuppressWarnings("unchecked")
    public String generate(String prompt) {
        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                ))
        );

        Map<String, Object> response = restClient.post()
                .uri("/models/{model}:generateContent?key={key}", props.getModel(), props.getApiKey())
                .body(body)
                .retrieve()
                .body(Map.class);

        if (response == null) return "";

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
        if (candidates == null || candidates.isEmpty()) return "";

        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        if (content == null) return "";

        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        if (parts == null || parts.isEmpty()) return "";

        Object text = parts.get(0).get("text");
        return text == null ? "" : text.toString();
    }
}
