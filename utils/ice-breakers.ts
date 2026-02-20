export const ICE_BREAKER_QUESTIONS = [
    "최근에 가장 맛있게 먹은 음식은 무엇인가요? 🍔",
    "요즘 넷플릭스/유튜브에서 뭐 보세요? 추천해주세요! 📺",
    "죽기 전에 꼭 가보고 싶은 여행지가 있다면? ✈️",
    "직장 생활 중 가장 기억에 남는 '소확행'은? 💼",
    "로또 1등 당첨되면 가장 먼저 뭘 하고 싶으세요? 💰",
    "가장 좋아하는 카페나 맛집 공유해주세요! ☕️",
    "최근에 산 물건 중에 가장 잘 샀다고 생각하는 건? 🛍️",
    "나만의 스트레스 해소법이 있다면? 🧘",
    "어릴 적 꿈은 무엇이었나요? 🎈",
    "주말에 보통 뭐 하면서 보내세요? 🗓️",
    "인생 영화나 드라마가 있다면? 🎬",
    "가장 좋아하는 계절과 그 이유는? 🍂",
    "최근에 꽂힌 노래가 있나요? 🎵",
    "만약 초능력을 하나 가질 수 있다면? ⚡️",
    "가장 좋아하는 야식 메뉴는? 🍗",
];

export function getRandomIceBreaker() {
    const randomIndex = Math.floor(Math.random() * ICE_BREAKER_QUESTIONS.length);
    return ICE_BREAKER_QUESTIONS[randomIndex];
}
