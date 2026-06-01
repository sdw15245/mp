package com.example.demo.taste;

import com.example.demo.llm.GeminiClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 우리가 분석한 결과(장르 비중 순서 + 대중성 성향)를 근거로 LLM이 짧은 취향 평을 생성.
 * LLM은 분석을 하지 않는다. 주어진 정보를 자연어로 풀어주기만 한다(없는 사실 금지).
 * 퍼센트 숫자는 일부러 넘기지 않는다 → LLM이 숫자를 나열하지 못하게.
 */
@Service
public class TasteCommentService {

    private static final String PROMPT = """
            당신은 음악 취향 분석가입니다. 아래 정보를 바탕으로 사용자의 음악 취향을 2~3문장으로 자연스럽게 평해주세요.

            규칙:
            - 퍼센트 수치나 점수를 숫자로 쓰지 마세요. (예: "팝 23퍼센트", "대중성 51점" 같은 표현 금지)
            - 비중이 큰 장르를 중심으로 자연스럽게 묘사하세요.
            - 듣지 않는 장르를 굳이 언급하지 마세요.
            - "엄청난", "황금비율", "야무지게" 같은 과장·오글거리는 표현은 피하고, 담백하고 센스 있게.
            - 주어진 정보 외의 사실(특정 가수, 곡 제목 등)은 지어내지 마세요.
            - 친근한 존댓말로, 군더더기 없이 평가 문장만 출력하세요.

            비중이 큰 순서의 장르: %s
            대중성 성향: %s
            """;

    private final GeminiClient gemini;

    public TasteCommentService(GeminiClient gemini) {
        this.gemini = gemini;
    }

    public String comment(Map<String, Double> genreVector, double mainstream) {
        List<String> ranked = genreVector.entrySet().stream()
                .filter(e -> e.getValue() > 0)
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .toList();

        if (ranked.isEmpty()) {
            return "아직 취향을 평하기엔 데이터가 부족해요.";
        }

        try {
            String out = gemini.generate(PROMPT.formatted(String.join(", ", ranked), mainstreamLabel(mainstream)));
            return out == null ? "" : out.trim();
        } catch (Exception e) {
            // LLM 실패해도 페이지는 죽지 않게.
            return "지금은 취향 평을 불러올 수 없어요.";
        }
    }

    /** 대중성 점수(0~100)를 숫자 대신 말로. LLM이 점수를 그대로 읊지 않게. */
    private String mainstreamLabel(double mainstream) {
        if (mainstream >= 70) return "대중적인 곡 위주";
        if (mainstream >= 55) return "대체로 대중적인 편";
        if (mainstream > 45) return "대중적인 곡과 마이너한 곡이 비슷하게 섞임";
        if (mainstream > 30) return "다소 마이너한 편";
        return "마이너한 곡 위주";
    }
}
