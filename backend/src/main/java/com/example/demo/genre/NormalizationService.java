package com.example.demo.genre;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 태그 정규화 오케스트레이션.
 * 1) 메모리 사전 → 즉시
 * 2) DB 캐시 → 이전에 LLM 분류한 결과
 * 3) LLM 호출 → 결과 DB 저장 (null도 저장해서 재호출 방지)
 *
 * 단건(normalize)과 배치(normalizeAll) 둘 다 지원. 배치는 dedupe + 1번의 LLM 호출로 성능 최적화.
 */
@Service
public class NormalizationService {

    private final GenreDictionary dictionary;
    private final TagNormalizationRepository repository;
    private final LlmGenreClassifier llmClassifier;

    public NormalizationService(GenreDictionary dictionary,
                                TagNormalizationRepository repository,
                                LlmGenreClassifier llmClassifier) {
        this.dictionary = dictionary;
        this.repository = repository;
        this.llmClassifier = llmClassifier;
    }

    @Transactional
    public Optional<String> normalize(String rawTag) {
        return normalizeAll(List.of(rawTag)).getOrDefault(rawTag, Optional.empty());
    }

    /**
     * 여러 태그를 한 번에 정규화.
     * 사전/DB로 다 처리 가능하면 LLM 호출 0번. 모르는 것만 모아서 1번에 LLM 호출.
     */
    @Transactional
    public Map<String, Optional<String>> normalizeAll(List<String> rawTags) {
        Map<String, Optional<String>> result = new LinkedHashMap<>();
        Map<String, String> pending = new LinkedHashMap<>(); // raw → 정규화 키 (사전 미해결인 것만)

        // 1) 사전 먼저. 빈 값/사전 히트는 즉시 확정, 나머지는 pending에 모은다.
        for (String raw : rawTags) {
            if (raw == null || raw.isBlank()) {
                result.put(raw, Optional.empty());
                continue;
            }
            String tag = raw.toLowerCase().trim();
            String fromDict = dictionary.lookup(tag);
            if (fromDict != null) {
                result.put(raw, Optional.of(fromDict));
            } else {
                pending.put(raw, tag);
            }
        }

        if (pending.isEmpty()) return result;

        // 2) DB 캐시 일괄 조회. (N+1 방지: findById 반복 → findAllById 한 번)
        List<String> lookupTags = pending.values().stream().distinct().toList();
        Map<String, Optional<String>> dbByTag = new HashMap<>();
        repository.findAllById(lookupTags)
                .forEach(tn -> dbByTag.put(tn.getTag(), Optional.ofNullable(tn.getMainGenre())));

        // 3) DB에 없는 것만 LLM 후보로.
        List<String> needsLlm = new ArrayList<>();
        for (String tag : lookupTags) {
            if (!dbByTag.containsKey(tag)) needsLlm.add(tag);
        }

        // 4) LLM 일괄 호출 + 결과 저장. (null도 저장해서 재호출 방지)
        Map<String, Optional<String>> llmByTag = new HashMap<>();
        if (!needsLlm.isEmpty()) {
            llmByTag = llmClassifier.classifyBatch(needsLlm);
            for (String tag : needsLlm) {
                Optional<String> genre = llmByTag.getOrDefault(tag, Optional.empty());
                repository.save(new TagNormalization(tag, genre.orElse(null)));
            }
        }

        // 5) pending 각 raw에 결과 반영 (DB 우선, 없으면 LLM).
        for (Map.Entry<String, String> e : pending.entrySet()) {
            String tag = e.getValue();
            Optional<String> genre = dbByTag.containsKey(tag)
                    ? dbByTag.get(tag)
                    : llmByTag.getOrDefault(tag, Optional.empty());
            result.put(e.getKey(), genre);
        }

        return result;
    }
}
