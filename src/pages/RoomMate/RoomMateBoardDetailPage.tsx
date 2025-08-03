import styled from "styled-components";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import profileimg from "../../assets/profileimg.svg";
import RoomMateBottomBar from "../../components/roommate/RoomMateBottomBar";
import Header from "../../components/common/Header";
import { getRoomMateDetail } from "../../apis/roommate";
import { RoommatePost } from "../../types/roommates.ts";

const InfoCard = ({
  color,
  icon,
  title,
  description,
}: {
  color: string;
  icon: string;
  title: string;
  description: string;
}) => {
  return (
    <CardItem style={{ backgroundColor: color }}>
      <div className="icon-title">
        <div className="icon">{icon}</div>
        <div className="title">{title}</div>
      </div>
      <div className="description">{description}</div>
    </CardItem>
  );
};

export default function RoomMateBoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [data, setData] = useState<RoommatePost | null>(null);

  useEffect(() => {
    if (!boardId) return;
    const fetchData = async () => {
      try {
        const response = await getRoomMateDetail(Number(boardId));
        console.log(response);
        setData(response.data);
      } catch (error) {
        console.error("게시글 데이터를 불러오지 못했습니다:", error);
      }
    };
    fetchData();
  }, [boardId]);

  if (!data) return <div>로딩 중...</div>;

  return (
    <RoomMateDetailPageWrapper>
      <Header title={"게시글"} hasBack={true} />
      <UserArea>
        <img src={profileimg} />
        <div className="description">
          <div className="name">익명</div>
          <div className="date">03/01 18:07</div>
        </div>
      </UserArea>
      <ContentArea>
        <div className="title">{data.title}</div>
        <div className="content">{data.comment}</div>

        <CardGrid>
          <InfoCard
            color="#EAF4FF"
            icon="🏠"
            title="상주요일"
            description={data.dormPeriod.join(", ")}
          />
          <InfoCard
            color="#FCEEF3"
            icon="🎓"
            title="단과대"
            description={data.college}
          />
          <InfoCard
            color="#E4F6ED"
            icon="🧬"
            title="MBTI"
            description={data.mbti}
          />
          <InfoCard
            color="#E8F0FE"
            icon="🚭"
            title="흡연여부"
            description={data.smoking}
          />
          <InfoCard
            color="#F3F4F6"
            icon="😴"
            title="코골이 유무"
            description={data.snoring}
          />
          <InfoCard
            color="#FFF6E9"
            icon="😬"
            title="이갈이 유무"
            description={data.toothGrind}
          />
          <InfoCard
            color="#EAF4FF"
            icon="🛏️"
            title="잠귀"
            description={data.sleeper}
          />
          <InfoCard
            color="#FCEEF3"
            icon="🚿"
            title="샤워 시기"
            description={data.showerHour}
          />
          <InfoCard
            color="#E4F6ED"
            icon="⏰"
            title="샤워 시간"
            description={data.showerTime}
          />
          <InfoCard
            color="#E8F0FE"
            icon="🛌"
            title="취침 시기"
            description={data.bedTime}
          />
          <InfoCard
            color="#F3F4F6"
            icon="🧼"
            title="정리정돈"
            description={data.arrangement}
          />
        </CardGrid>
      </ContentArea>
      <RoomMateBottomBar />
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
  img {
    width: 40px;
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
`;
