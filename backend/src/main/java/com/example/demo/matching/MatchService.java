package com.example.demo.matching;

import com.example.demo.character.Character;
import org.springframework.stereotype.Service;

import java.util.Map;

/** 사용자 장르 vector를 캐릭터 풀과 비교해 가장 유사한 1개를 고른다. */
@Service
public class MatchService {

    private final CosineSimilarity cosine;

    public MatchService(CosineSimilarity cosine) {
        this.cosine = cosine;
    }

    public record MatchResult(Character character, double score) {}

    public MatchResult findTop1(Map<String, Double> userVector) {
        Character best = null;
        double bestScore = -1;
        for (Character c : Character.POOL) {
            double s = cosine.compute(userVector, c.vector());
            if (s > bestScore) {
                bestScore = s;
                best = c;
            }
        }
        return new MatchResult(best, bestScore);
    }
}
