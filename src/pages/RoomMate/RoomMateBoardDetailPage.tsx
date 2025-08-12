import styled from "styled-components";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import profileimg from "../../assets/profileimg.svg";
import RoomMateBottomBar from "../../components/roommate/RoomMateBottomBar";
import Header from "../../components/common/Header";
import { getOpponentChecklist, getRoomMateDetail } from "../../apis/roommate";
import { RoommatePost } from "../../types/roommates.ts";
import UseUserStore from "../../stores/useUserStore.ts";

const InfoCard = ({
  color,
  icon,
  title,
  description,
  matched = false,
}: {
  color: string;
  icon: string;
  title: string;
  description: string;
  matched?: boolean;
}) => {
  return (
    <CardItem
      style={{
        backgroundColor: color,
      }}
    >
      <div className="icon-title">
        <div className="icon">{icon}</div>
        <div className="title">{title}</div>
      </div>
      <div className="description">{description}</div>
      {matched && <div className="match-icon">✅</div>}
    </CardItem>
  );
};

const religionEmojiMap: Record<string, string> = {
  기독교: "✝️",
  천주교: "✝️",
  불교: "🪷",
  이슬람교: "☪️",
  힌두교: "🕉️",
  유대교: "✡️",
  무교: "🙏",
  기타: "🙏",
};

export default function RoomMateBoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [boardData, setBoardData] = useState<RoommatePost | null>(null);
  const [myData, setMyData] = useState<RoommatePost | null>(null);

  const location = useLocation();
  const partnerName = location.state?.partnerName;
  const roomId = location.state?.roomId;
  const { userInfo, tokenInfo } = UseUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  useEffect(() => {
    if (!boardId || boardId === "opponent") return;
    const fetchBoardData = async () => {
      try {
        const response = await getRoomMateDetail(Number(boardId));
        console.log(response);
        setBoardData(response.data);
      } catch (error) {
        console.error("게시글 데이터를 불러오지 못했습니다:", error);
      }
    };
    const fetchMyData = async () => {
      return;
      try {
        const response = await getRoomMateDetail(Number(boardId));
        console.log(response);
        setMyData(response.data);
      } catch (error) {
        console.error("내 체크리스트를 불러오지 못했습니다:", error);
      }
    };

    fetchBoardData();
    fetchMyData();
  }, [boardId]);

  useEffect(() => {
    console.log(roomId);
    if (!roomId) return;

    const fetchOpponentChecklist = async () => {
      try {
        const response = await getOpponentChecklist(roomId);
        setBoardData(response.data);
        console.log(response);
      } catch (error) {
        console.error("상대방 체크리스트 불러오기 실패", error);
      }
    };

    fetchOpponentChecklist();
  }, [roomId]);

  if (!boardData) return <div>로딩 중...</div>;

  return (
    <RoomMateDetailPageWrapper>
      <Header title={"게시글"} hasBack={true} />

      <TitleArea>
        <UserArea>
          <img
            src={boardData.userProfileImageUrl || profileimg}
            className="profile-img"
          />
          <div className="description">
            <div className="name">{partnerName || boardData.userName}</div>
            <div className="date">
              {new Date(boardData.createDate).toLocaleTimeString("ko-KR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </UserArea>
        <TopRightBadge dormType={boardData.dormType}>
          {boardData.dormType}
        </TopRightBadge>
      </TitleArea>

      <ContentArea>
        <div className="title">{boardData.title}</div>
        <div className="content">{boardData.comment}</div>

        <CardGrid>
          <InfoCard
            color="#EAF4FF"
            icon="🏠"
            title="상주요일"
            description={boardData.dormPeriod.join(", ")}
            matched={
              myData?.dormPeriod?.join(",") === boardData.dormPeriod?.join(",")
            }
          />
          <InfoCard
            color="#FCEEF3"
            icon="🎓"
            title="단과대"
            description={boardData.college}
            matched={myData?.college === boardData.college}
          />
          <InfoCard
            color="#E4F6ED"
            icon="🧬"
            title="MBTI"
            description={boardData.mbti}
            matched={myData?.mbti === boardData.mbti}
          />
          <InfoCard
            color="#E8F0FE"
            icon="🚭"
            title="흡연여부"
            description={boardData.smoking}
            matched={myData?.smoking === boardData.smoking}
          />
          <InfoCard
            color="#F3F4F6"
            icon="😴"
            title="코골이 유무"
            description={boardData.snoring}
            matched={myData?.snoring === boardData.snoring}
          />
          <InfoCard
            color="#FFF6E9"
            icon="😬"
            title="이갈이 유무"
            description={boardData.toothGrind}
            matched={myData?.toothGrind === boardData.toothGrind}
          />
          <InfoCard
            color="#EAF4FF"
            icon="🛏️"
            title="잠귀"
            description={boardData.sleeper}
            matched={myData?.sleeper === boardData.sleeper}
          />
          <InfoCard
            color="#FCEEF3"
            icon="🚿"
            title="샤워 시기"
            description={boardData.showerHour}
            matched={myData?.showerHour === boardData.showerHour}
          />
          <InfoCard
            color="#E4F6ED"
            icon="⏰"
            title="샤워 시간"
            description={boardData.showerTime}
            matched={myData?.showerTime === boardData.showerTime}
          />
          <InfoCard
            color="#E8F0FE"
            icon="🛌"
            title="취침 시기"
            description={boardData.bedTime}
            matched={myData?.bedTime === boardData.bedTime}
          />
          <InfoCard
            color="#F3F4F6"
            icon="🧼"
            title="정리정돈"
            description={boardData.arrangement}
            matched={myData?.arrangement === boardData.arrangement}
          />
          <InfoCard
            color="#F3F4F6"
            icon={religionEmojiMap[boardData.religion] || "🙏"}
            title="종교"
            description={boardData.religion}
            matched={myData?.religion === boardData.religion}
          />
        </CardGrid>
      </ContentArea>
      {((!roomId && userInfo.dormType === boardData.dormType) ||
        !isLoggedIn) && (
        <RoomMateBottomBar
          partnerName={boardData.userName}
          userProfileImageUrl={boardData.userProfileImageUrl}
        />
      )}
    </RoomMateDetailPageWrapper>
  );
}

const RoomMateDetailPageWrapper = styled.div`
  padding: 90px 20px;

  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;

  width: 100%;
  height: 100%;

  overflow-y: auto;

  background: #fafafa;
`;

const UserArea = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  min-width: fit-content;
  height: fit-content;
  gap: 4px;
  .profile-img {
    width: 44px;
    min-width: 44px;
    height: 44px;
    min-height: 44px;
    border-radius: 50%;
    object-fit: cover;
  }

  .description {
    display: flex;
    flex-direction: column;
    width: 100%;
    font-style: normal;
    font-size: 16px;
    line-height: 24px;
    align-items: start;
    justify-content: center;
    letter-spacing: 0.38px;
    color: #1c1c1e;

    .name {
      font-weight: 700;
      font-size: 14px;
    }

    .date {
      font-weight: 400;
      font-size: 10px;
    }
  }
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: fit-content;
  .title {
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
    /* 상자 높이와 동일 또는 150% */
    display: flex;
    align-items: center;
    letter-spacing: 0.38px;

    color: #1c1c1e;

    margin-bottom: 10px;
  }
  .content {
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 24px;
    /* 또는 200% */
    display: flex;
    align-items: center;
    letter-spacing: 0.38px;

    color: #1c1c1e;
    margin-bottom: 16px;
    white-space: pre-line;
  }
`;

const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const CardItem = styled.div`
  flex: 1 1 calc(50% - 12px);
  border-radius: 16px;
  padding: 16px;
  box-sizing: border-box;
  min-width: 140px;

  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;

  .icon-title {
    display: flex;
    //align-items: center; /* 상하 중앙 정렬 */
    gap: 6px;
  }

  .icon {
    font-size: 20px;
    line-height: 1; /* 아이콘 높이 조절 가능 */
  }

  .title {
    font-size: 13px;
    font-weight: 600;
    color: #1c1c1e;
  }

  .description {
    font-size: 12px;
    color: #3a3a3c;
  }

  .match-icon {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 16px;
  }
`;

const TitleArea = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;
const TopRightBadge = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "dormType",
})<{ dormType: string }>`
  font-size: 12px;
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 600;
  z-index: 1;
  height: fit-content;

  background: ${({ dormType }) => {
    switch (dormType) {
      case "2기숙사":
        return "#0a84ff";
      case "3기숙사":
        return "#ff6b6b";
      default:
        return "#0a84ff";
    }
  }};
`;
