// 사용자가 매칭으로 "획득"한 캐릭터 목록(도감 해금). localStorage에 persist.
// 결과 페이지에서 매칭된 캐릭터를 unlock하면, 랜딩 미리보기에서 해당 캐릭터만 선명해진다.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UnlockedState {
  /** 해금된 캐릭터 이름(또는 slug) 목록 */
  unlocked: string[]
  unlock: (name: string) => void
  isUnlocked: (name: string) => boolean
  clear: () => void
}

export const useUnlockedCharacters = create<UnlockedState>()(
  persist(
    (set, get) => ({
      unlocked: [],
      unlock: (name) =>
        set((s) => (s.unlocked.includes(name) ? s : { unlocked: [...s.unlocked, name] })),
      isUnlocked: (name) => get().unlocked.includes(name),
      clear: () => set({ unlocked: [] }),
    }),
    { name: 'unlocked-characters' },
  ),
)
