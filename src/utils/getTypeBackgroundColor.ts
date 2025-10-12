// 헬퍼 함수: 공지사항 타입에 따른 배경색 반환
const getTypeBackgroundColor = (type: string) => {
  switch (type) {
    case "서포터즈":
      return "rgba(255, 214, 10, 0.2)"; // 현재 색상
    case "생활원":
      return "#F9717133"; // 생활원 색상
    case "유니돔":
      return "rgba(10, 132, 255, 0.2)"; // 0A84FF의 투명도 20%
    default:
      return "rgba(200, 200, 200, 0.2)"; // 기본값
  }
};

export default getTypeBackgroundColor;
