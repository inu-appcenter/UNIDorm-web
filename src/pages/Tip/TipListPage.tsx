// src/pages/Tip/TipListPage.tsx

import styled from "styled-components";
import Header from "../../components/common/Header";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import TipCard from "../../components/tip/TipCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchTips } from "../../apis/tips";
import { Tip } from "../../types/tips.ts";

export default function TipListPage() {
  const navigate = useNavigate();
  const [tips, setTips] = useState<Tip[]>([]);

  useEffect(() => {
    const loadTips = async () => {
      try {
        const data = await fetchTips();
        setTips(data);
      } catch (error) {
        console.error("팁 리스트 불러오기 실패:", error);
      }
    };

    loadTips();
  }, []);

  return (
    <TipPageWrapper>
      <Header title="기숙사 꿀팁" hasBack={true} showAlarm={true} />

      <TitleContentArea title="🍯꿀팁모음">
        <CardList>
          {tips.map((tip) => (
            <TipCard
              key={tip.id}
              tip={{
                id: tip.id,
                title: tip.title,
                content: tip.content,
                time: new Date(tip.createDate).toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                }), // ✅ 시간 표시 포맷
                scrap: tip.tipLikeCount,
                comment: tip.tipCommentCount,
              }}
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
