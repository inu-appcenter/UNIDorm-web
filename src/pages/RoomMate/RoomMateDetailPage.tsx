import styled from "styled-components";

import profileimg from "../../assets/profileimg.svg";
import RoomMateBottomBar from "../../components/roommate/RoomMateBottomBar.tsx";
import Header from "../../components/common/Header.tsx";

export default function RoomMateDetailPage() {
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
        <div className="title">21학번 2긱</div>
        <div className="content">
          기숙사 상주기간: 월, 화, 수<br />
          단과대: 법학부
          <br />
          MBTI: ENTJ
          <br />
          흡연여부: 안피워요
          <br />
          코골이 유무: 안골아요
          <br />
          이갈이 유무: 갈아요
          <br />
          잠귀: 어두워요
          <br />
          샤워시기: 아침
          <br />
          샤워시간: 10분 이내
          <br />
          취침시기: 일찍 자요
          <br />
          정리정돈: 깔끔해요
          <br />
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
