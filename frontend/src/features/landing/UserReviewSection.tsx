// 랜딩의 사용자 후기 섹션. 더미 리뷰 카드 노출 (실제 데이터 들어오면 교체).
const reviews = [
  {
    name: '김지현',
    pet: '멜로디고양이',
    text: '인디 음악 좋아하는데 진짜 딱 맞아서 소름 돋았어요. 친구들한테 공유했더니 다들 해보고 싶다고 난리!',
    avatar: 'JH',
  },
  {
    name: '박서준',
    pet: '비트곰',
    text: '힙합 많이 듣는데 비트곰이라니 ㅋㅋ 너무 귀엽다. 분석 결과가 꽤 정확해서 놀랐습니다.',
    avatar: 'SJ',
  },
  {
    name: '이하늘',
    pet: '노이즈늑대',
    text: '록 덕후인 제 취향을 정확히 잡아냈어요. 캐릭터 디자인도 마음에 들고, 결과 카드 공유하기 좋아요.',
    avatar: 'HN',
  },
]

function UserReviewSection() {
  return (
    <section className="relative py-32 bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-sm font-semibold tracking-[0.2em] uppercase text-violet-600 mb-4">
          User Reviews
        </p>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-16">
          사람들이 말하는
          <br />
          Music Pets
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-violet-200 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(124,58,237,0.06)]"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {review.avatar}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{review.name}</p>
                  <p className="text-sm text-violet-500">{review.pet}</p>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed">"{review.text}"</p>

              <div className="flex gap-1 mt-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#7C3AED">
                    <path d="M8 1.3l2 4.1 4.5.6-3.3 3.2.8 4.5L8 11.3l-4 2.4.8-4.5L1.5 6l4.5-.6L8 1.3z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default UserReviewSection
