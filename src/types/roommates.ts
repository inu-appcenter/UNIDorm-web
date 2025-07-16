export interface RoommatePost {
  boardId: number;
  title: string;
  dormPeriod: string[]; // 예: ["월요일", "화요일"]
  dormType: string; // 예: "2기숙사"
  college: string; // 예: "인문대학"
  mbti: string; // 예: "INFP"
  smoking: string; // 예: "피워요"
  snoring: string; // 예: "골아요"
  toothGrind: string; // 예: "갈아요"
  sleeper: string; // 예: "밝아요"
  showerHour: string; // 예: "아침"
  showerTime: string; // 예: "10분 이내"
  bedTime: string; // 예: "일찍 자요"
  arrangement: string; // 예: "깔끔해요"
  comment: string; // 추가 설명
}

export interface SimilarRoommatePost {
  boardId: number;
  title: string;
  dormType: string; // 예: "2기숙사"
  college: string; // 예: "인문대학"
  mbti: string; // 예: "INFP"
  smoking: string; // 예: "피워요"
  snoring: string; // 예: "골아요"
  toothGrind: string; // 예: "갈아요"
  sleeper: string; // 예: "밝아요"
  showerHour: string; // 예: "아침"
  showerTime: string; // 예: "10분 이내"
  bedTime: string; // 예: "일찍 자요"
  arrangement: string; // 예: "깔끔해요"
  comment: string; // 본문 요약 or 한줄 코멘트
  similarityPercentage: number; // 유사도 (예: 85)
}
