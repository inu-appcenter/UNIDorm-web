import styled from "styled-components";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import HomeCard from "../components/home/HomeCard.tsx";
import GroupPurchaseList from "../components/GroupPurchase/GroupPurchaseList.tsx";
import ThreeWeekCalendar from "../components/home/ThreeWeekCalendar.tsx";
import Header from "../components/common/Header.tsx";
import 배너1 from "../assets/banner/포스터1.svg";
import HomeTipsCard from "../components/home/HomeTipsCard.tsx";

const mockBoard = [
  {
    type: "공지사항",
    title: "기숙사 공지사항입니다",
    content: "기숙사 전쟁나썽요!!!!!",
    isEmergency: true,
    scrapCount: 121,
  },
  {
    type: "기숙사 꿀팁",
    title: "기숙사 생활 꿀팁 공유합니다",
    content: "세탁기는 이른 아침에 쓰는 게 제일 한가합니다!",
    isEmergency: false,
    scrapCount: 45,
  },
];
export default function HomePage() {
  return (
    <HomePageWrapper>
      <Header title="아이돔" hasBack={false} showAlarm={true} />
      <img
        src={배너1}
        style={{
          width: "100%",
          height: "250px",
          objectFit: "cover", // 넘치는 부분 잘라냄
        }}
      />
      <TitleContentArea
        title={mockBoard[0].type}
        link={"/notification"}
        children={
          <NotiWrapper>
            <HomeCard
              title={mockBoard[0].title}
              content={mockBoard[0].content}
              isEmergency={mockBoard[0].isEmergency}
              scrapCount={mockBoard[0].scrapCount}
            />
            <HomeCard
              title={mockBoard[0].title}
              content={mockBoard[0].content}
              isEmergency={mockBoard[0].isEmergency}
              scrapCount={mockBoard[0].scrapCount}
            />
          </NotiWrapper>
        }
      />
      <TitleContentArea
        title="오늘의 Best 꿀팁"
        link={"/tips"}
        children={
          <>
            <HomeTipsCard index={1} content={"재활용 시간 꿀팁"} />
            <HomeTipsCard index={2} content={"통금시간 정보"} />
            <HomeTipsCard index={3} content={"천원의 아침밥 먹는 법"} />
          </>
        }
      />
      <TitleContentArea
        title={"캘린더 이벤트"}
        children={<ThreeWeekCalendar />}
      />
      <TitleContentArea
        title={"임박한 공구"}
        link={"/groupPurchase"}
        children={<GroupPurchaseList />}
      />
    </HomePageWrapper>
  );
}

const HomePageWrapper = styled.div`
  padding: 90px 16px;
  padding-top: 30px;

  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;

  width: 100%;
  height: 100%;

  overflow-y: auto;

  background: #fafafa;
`;

const NotiWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  width: 100%;
`;
