import styled from "styled-components";
import BookMark from "../../assets/bookmark.svg";

const EmergencyIcon = () => {
  return <EmergencyIconWrapper>긴급</EmergencyIconWrapper>;
};

const EmergencyIconWrapper = styled.div`
  /* Frame 10 */

  box-sizing: border-box;
  width: fit-content;
  height: fit-content;

  /* 오토레이아웃 */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
  gap: 10px;

  margin: 0 auto;

  border: 1px solid #0a84ff;
  border-radius: 16px;

  /* 내부 오토레이아웃 */
  flex: none;
  order: 1;
  flex-grow: 0;

  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 24px;
  letter-spacing: 0.38px;

  color: #0a84ff;
`;

interface HomeCardProps {
  title: string;
  content: string;
  isEmergency: boolean;
  scrapCount: number;
}

const HomeCard = ({
  title,
  content,
  isEmergency,
  scrapCount,
}: HomeCardProps) => {
  return (
    <HomeCardWrapper>
      <FirstLine>
        <div className="title">{title}</div>
        <div className="emergency">{isEmergency && <EmergencyIcon />}</div>
      </FirstLine>
      <SecondLine>{content}</SecondLine>
      <LastLine>
        <img src={BookMark} /> {scrapCount}
      </LastLine>
    </HomeCardWrapper>
  );
};

export default HomeCard;

const HomeCardWrapper = styled.div`
  box-sizing: border-box;

  /* 오토레이아웃 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 8px 16px;
  gap: 5px;

  width: 100%;
  height: fit-content;

  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const FirstLine = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: fit-content;

  align-items: center;

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
  }
`;

const SecondLine = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: fit-content;
  align-items: center;

  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 24px;
  letter-spacing: 0.38px;

  color: #1c1c1e;
`;

const LastLine = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  width: 100%;
  height: fit-content;
  align-items: center;

  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 24px;
  /* 상자 높이와 동일 또는 200% */
  display: flex;
  align-items: center;
  letter-spacing: 0.38px;

  color: #1c1c1e;
`;
