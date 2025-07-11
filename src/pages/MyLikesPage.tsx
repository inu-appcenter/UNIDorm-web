// src/pages/Tip/TipListPage.tsx

import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header.tsx";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import MyPostCard from "../components/mypage/MyPostCard.tsx";

const mockTips = Array(8).fill({
  id: 1,
  title: "기숙비 내세요",
  content: "기숙사비 내는 거 내일 모레까지인데 안내면 자동 탈락 돼...",
  time: "오후 6:20",
  scrap: 121,
  comment: 5,
});

export default function MyLikesPage() {
  const navigate = useNavigate();

  return (
    <MyScrapPageWrapper>
      <Header title="좋아요한 글" hasBack={true} showAlarm={true} />

      <TitleContentArea type="">
        <CardList>
          {mockTips.map((tip, idx) => (
            <MyPostCard
              key={idx}
              tip={tip}
              onClick={() => navigate(`/tips/${tip.id}`)}
            />
          ))}
        </CardList>
      </TitleContentArea>
    </MyScrapPageWrapper>
  );
}

const MyScrapPageWrapper = styled.div`
  padding: 90px 20px 90px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #fafafa;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  height: 100%;
`;
