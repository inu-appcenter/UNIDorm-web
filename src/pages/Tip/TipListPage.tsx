// src/pages/Tip/TipListPage.tsx

import styled from "styled-components";
import Header from "../../components/common/Header";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import TipCard from "../../components/tip/TipCard";
import { useNavigate } from "react-router-dom";

const mockTips = Array(8).fill({
  id: 1,
  title: "기숙비 내세요",
  content: "기숙사비 내는 거 내일 모레까지인데 안내면 자동 탈락 돼...",
  time: "오후 6:20",
  scrap: 121,
  comment: 5,
});

export default function TipListPage() {
  const navigate = useNavigate();

  return (
    <TipPageWrapper>
      <Header title="기숙사 꿀팁" hasBack={true} showAlarm={true} />

      <TitleContentArea type="🍯꿀팁모음">
        <CardList>
          {mockTips.map((tip, idx) => (
            <TipCard
              key={idx}
              tip={tip}
              onClick={() => navigate(`/tips/${tip.id}`)}
            />
          ))}
        </CardList>
      </TitleContentArea>

      <WriteButton onClick={() => navigate("/tips/write")}>
        ✏️ 글쓰기
      </WriteButton>
    </TipPageWrapper>
  );
}

const TipPageWrapper = styled.div`
  padding: 90px 16px 40px 16px;
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
`;

const WriteButton = styled.button`
  position: fixed;
  bottom: 40px;
  right: 20px;
  background-color: #007bff;
  color: white;
  border-radius: 24px;
  padding: 12px 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 100;
`;
