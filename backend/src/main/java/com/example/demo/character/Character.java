package com.example.demo.character;

import java.util.List;
import java.util.Map;

/**
 * 매칭 대상 캐릭터.
 * vector = 13 메인 장르별 비율(직접 지정). 적지 않은 장르는 0으로 간주한다.
 * 1학기 MVP: 하드코딩 풀. 안정화되면 DB로 이전.
 */
public record Character(String slug, String name, String imageUrl, Map<String, Double> vector) {

    public static final List<Character> POOL = List.of(
            new Character(
                    "sulk-cat",
                    "삐냥",
                    "/characters/sulk-cat.png",
                    Map.of(
                            "pop", 0.30,
                            "hip-hop", 0.28,
                            "indie", 0.20,
                            "rock", 0.12,
                            "electronic", 0.06,
                            "j-pop", 0.04
                    )
            )
    );
}
