# Frontend

## 역할

이 폴더는 Music Pets의 프론트엔드 애플리케이션을 담는다. 현재는 React + Vite + TypeScript 기반의 구조 골격과 플레이스홀더가 먼저 잡혀 있고, 이후 실제 인증/분석/결과 흐름이 이 위에 구현된다.

## 현재 상태

- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4 사용
- 공통 폴더 구조는 존재하지만 실제 기능 구현은 아직 얇다.

## 구조 원칙

- 공통 UI는 `components`
- 화면 진입점은 `pages`
- 범용 API 클라이언트는 `api`
- 범용 훅은 `hooks`
- 최소 전역 상태는 `stores`
- 공용 타입은 `types`

이 기본 구조를 유지하되, 실제 기능이 커지면 `features` 중심 구조를 점진 도입한다.

## 권장 방향

- 공통 UI와 기능별 코드를 분리한다.
- 상태는 React Query 우선, Zustand는 최소 사용 원칙을 지킨다.
- 결과 화면은 분석 도구보다 캐릭터 경험 중심으로 설계한다.
