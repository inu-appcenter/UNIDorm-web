import styled from "styled-components";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import TipCard from "../../components/tip/TipCard";
import { useNavigate } from "react-router-dom";
import { useTips } from "@/queries/tips";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import EmptyMessage from "../../constants/EmptyMessage.tsx";
import { useUserRole } from "@/hooks/useUserRole";
import { useSetHeader } from "@/hooks/useSetHeader";
import { mixpanelTrack } from "@/utils/mixpanel";

export default function TipListPage() {
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();

  const { data: tips = [], isLoading } = useTips();

  useSetHeader({ title: "기숙사 꿀팁" });

  return (
    <TipPageWrapper>
      <TitleContentArea
        description={"다양한 기숙사 꿀팁을 알아보세요!"}
        margin={"16px"}
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
                  onClick={() => {
                    mixpanelTrack.itemClicked(
                      "꿀팁",
                      tip.boardId,
                      tip.title,
                      "꿀팁_리스트",
                    );
                    navigate(`/tips/${tip.boardId}`);
                  }}
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
            mixpanelTrack.postCreated("꿀팁_시작", "꿀팁리스트");
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
  padding: 0 16px 100px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;

  overflow-y: auto;

`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const WriteButton = styled.button`
  position: fixed;
  bottom: calc(40px + var(--safe-area-bottom, 0px));
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
