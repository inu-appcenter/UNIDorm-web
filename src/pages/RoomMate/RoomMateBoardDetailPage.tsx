import styled from "styled-components";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import profileimg from "../../assets/profileimg.svg";
import RoomMateBottomBar from "../../components/roommate/RoomMateBottomBar";
import Header from "../../components/common/Header";
import { getRoomMateDetail } from "../../apis/roommate";
import { RoommatePost } from "../../types/roommates.ts";

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
        <div className="content">
          기숙사 상주기간: {data.dormPeriod.join(", ")} <br />
          단과대: {data.college} <br />
          MBTI: {data.mbti} <br />
          흡연여부: {data.smoking} <br />
          코골이 유무: {data.snoring} <br />
          이갈이 유무: {data.toothGrind} <br />
          잠귀: {data.sleeper} <br />
          샤워시기: {data.showerHour} <br />
          샤워시간: {data.showerTime} <br />
          취침시기: {data.bedTime} <br />
          정리정돈: {data.arrangement} <br />
          <br />
          기타사항: {data.comment}
        </div>
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
  }
`;
