// Interface labels used by label-based Focus rules. All lower-case; matched exactly against short text nodes.
// Translations are best effort and were not verified against every site, region or A/B variant.
// Supported: English, Spanish, Portuguese, French, German, Italian, Russian, Japanese, Korean, Chinese (Simplified), Turkish.
export type LabelKey = 'suggestedForYou' | 'suggestedPosts' | 'forYou' | 'following' | 'reelsShort' | 'sponsored' | 'ad';

export const LABELS: Record<LabelKey, string[]> = {
  suggestedForYou: [
    'suggested for you', 'sugerencias para ti', 'sugerido para ti', 'sugestões para você', 'sugerido para você',
    'suggestions pour vous', 'suggéré pour vous', 'vorschläge für dich', 'vorgeschlagen für dich',
    'suggeriti per te', 'suggerito per te', 'рекомендации для вас', 'рекомендуем вам', 'おすすめ', 'あなたへのおすすめ',
    '회원님을 위한 추천', '为你推荐', '为您推荐', 'senin için öneriler', 'senin için önerilen',
  ],
  suggestedPosts: ['suggested posts', 'publicaciones sugeridas', 'publicações sugeridas', 'publications suggérées', 'vorgeschlagene beiträge', 'post suggeriti', 'おすすめの投稿', '추천 게시물', '推荐帖子', 'önerilen gönderiler'],
  forYou: ['for you', 'para ti', 'para você', 'pour vous', 'für dich', 'per te', 'для вас', 'おすすめ', '추천', '为你推荐', 'sana özel'],
  following: ['following', 'siguiendo', 'seguindo', 'abonnements', 'folge ich', 'seguiti', 'читаемые', 'フォロー中', '팔로잉', '正在关注', 'takip edilenler'],
  reelsShort: [
    'reels and short videos', 'reels y videos cortos', 'reels e vídeos curtos', 'reels et vidéos courtes',
    'reels und kurze videos', 'reel e video brevi', 'reels и короткие видео', 'リールと短い動画', '릴스 및 짧은 동영상',
    'reels 和短视频', 'reels ve kısa videolar',
  ],
  sponsored: [
    'sponsored', 'publicidad', 'patrocinado', 'publicidade', 'sponsorisé', 'gesponsert', 'sponsorizzato',
    'реклама', '広告', 'スポンサー', '광고', '스폰서', '广告', '赞助内容', 'sponsorlu', 'reklam',
  ],
  ad: ['ad', 'promoted', 'anuncio', 'anúncio', 'annonce', 'anzeige', 'annuncio', 'promocionado', 'promovido', 'реклама', '広告', '광고', '广告', 'reklam'],
};
