export const CATEGORIES = [
    { id: "networking", label: "네트워킹/대화", icon: "☕", description: "가볍게 커피 한 잔하며 대화해요" },
    { id: "lunch", label: "점심/밥약", icon: "🍱", description: "직장인의 소중한 점심시간" },
    { id: "meal", label: "저녁/술자리", icon: "🍻", description: "맛있는 음식과 술 한 잔" },
    { id: "study", label: "스터디/자기계발", icon: "📚", description: "함께 성장하는 시간" },
    { id: "workout", label: "운동/액티비티", icon: "🏃", description: "함께 땀 흘리며 스트레스 해소" },
    { id: "culture", label: "문화/예술", icon: "🎨", description: "영화, 전시, 공연 관람" },
    { id: "hobby", label: "취미/공방", icon: "🧶", description: "원데이 클래스, 만들기" },
    { id: "travel", label: "여행/나들이", icon: "✈️", description: "가까운 교외나 핫플레이스로" },
    { id: "game", label: "게임/오락", icon: "🎮", description: "보드게임, 방탈출, PC방" },
    { id: "chat", label: "수다/고민", icon: "💬", description: "편하게 이야기 나누아요" },
] as const;

export function getCategoryLabel(id: string | null | undefined) {
    if (!id) return "";
    const category = CATEGORIES.find(c => c.id === id);
    return category ? `${category.icon} ${category.label}` : id;
}
