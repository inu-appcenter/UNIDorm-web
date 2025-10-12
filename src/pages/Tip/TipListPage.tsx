import styled from "styled-components";
import Header from "../../components/common/Header";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import TipCard from "../../components/tip/TipCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Tip } from "../../types/tips.ts";
import { fetchTips } from "../../apis/tips.ts";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import EmptyMessage from "../../constants/EmptyMessage.tsx";
import { useIsAdminRole } from "../../hooks/useIsAdminRole.ts";

export default function TipListPage() {
  const navigate = useNavigate();
  const { isAdmin } = useIsAdminRole();

  const [tips, setTips] = useState<Tip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadTips = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTips();
      setTips(data);
    } catch (error) {
      console.error("팁 리스트 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTips();
  }, []);

  return (
    <TipPageWrapper>
      <Header title="기숙사 꿀팁" hasBack={true} />

      <TitleContentArea
        title="기숙사 꿀팁"
        description={"다양한 기숙사 꿀팁을 알아보세요!"}
      >
        {isLoading ? (
          <LoadingSpinner message="꿀팁 목록을 불러오는 중..." />
        ) : tips.length > 0 ? (
          <CardList>
            {tips.map((tip) => {
              const createDate = new Date(tip.createDate);
              const today = new Date();
              const isToday =
                createDate.getFullYear() === today.getFullYear() &&
                createDate.getMonth() === today.getMonth() &&
                createDate.getDate() === today.getDate();

              const time = isToday
                ? createDate.toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : createDate.toLocaleDateString("ko-KR", {
                    month: "2-digit",
                    day: "2-digit",
                  });

              return (
                <TipCard
                  key={tip.boardId}
                  tip={{
                    boardId: tip.boardId,
                    title: tip.title,
                    content: tip.content,
                    time: time,
                    like: tip.tipLikeCount,
                    comment: tip.tipCommentCount,
                  }}
                  onClick={() => navigate(`/tips/${tip.boardId}`)}
                />
              );
            })}
          </CardList>
        ) : (
          <EmptyMessage message="등록된 꿀팁이 없습니다." />
        )}
      </TitleContentArea>

      {isAdmin && (
        <WriteButton
          onClick={() => {
            navigate("/tips/write");
          }}
        >
          ✏️ 글쓰기
        </WriteButton>
      )}
    </TipPageWrapper>
  );
}

const TipPageWrapper = styled.div`
  padding: 90px 16px 40px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;

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
