// test 도메인 응답 검증 Zod 스키마.
import { z } from 'zod'

export const TopTrackSchema = z.object({
  trackName: z.string(),
  artistName: z.string(),
  tags: z.array(z.string()),
})

// 백엔드 /api/test/top-tracks 는 top 10 곡을 배열로 반환한다.
export const TopTracksSchema = z.array(TopTrackSchema)

export type TopTrack = z.infer<typeof TopTrackSchema>

// 백엔드 /api/test/user-vector: 13개 장르 비율(합 1.0) + 메타.
export const UserVectorSchema = z.object({
  vector: z.record(z.string(), z.number()),
  unmappedTags: z.array(z.string()),
  tagCount: z.number(),
  trackCount: z.number(),
})

export type UserVector = z.infer<typeof UserVectorSchema>

// 백엔드 /api/test/match: 가장 닮은 캐릭터 1개 + 매칭 점수(0~1).
export const MatchSchema = z.object({
  characterSlug: z.string(),
  characterName: z.string(),
  imageUrl: z.string(),
  score: z.number(),
  vector: z.record(z.string(), z.number()),
})

export type Match = z.infer<typeof MatchSchema>

// 백엔드 /api/test/profile: 대중성 점수 + LLM 취향 평.
export const ProfileSchema = z.object({
  mainstream: z.number(),
  obscurity: z.number(),
  comment: z.string(),
})

export type Profile = z.infer<typeof ProfileSchema>

// 백엔드 /api/test/recommendations: 취향 기반 추천곡 + 저장 응답.
export const RecommendedTrackSchema = z.object({
  name: z.string(),
  artist: z.string(),
  uri: z.string(),
  imageUrl: z.string(),
})

export const RecommendationsSchema = z.array(RecommendedTrackSchema)

export type RecommendedTrack = z.infer<typeof RecommendedTrackSchema>

export const SavePlaylistSchema = z.object({
  playlistUrl: z.string(),
})
