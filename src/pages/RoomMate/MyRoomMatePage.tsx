import styled from "styled-components";
import Header from "../../components/common/Header";
import MyInfoArea from "../../components/mypage/MyInfoArea.tsx";
import GrayDivider from "../../components/common/GrayDivider.tsx";
import IconTextButton from "../../components/button/IconTextButton.tsx";
import StyledTextArea from "../../components/roommate/StyledTextArea.tsx";

export default function MyRoomMatePage() {
  const menuItems = [
    { label: "시간표 삭제", onClick: () => alert("공유 켜기") },
    { label: "규칙 편집하기", onClick: () => alert("설정으로 이동") },
  ];

  return (
    <MyRoomMatePageWrapper>
      <Header
        title={"내 룸메이트"}
        hasBack={true}
        showAlarm={false}
        menuItems={menuItems}
      />
      <MyInfoArea />
      <GrayDivider />
      <IconTextButton
        type="addtimetable"
        onClick={() => console.log("시간표 추가 클릭")}
      />
      <IconTextButton
        type="createrules"
        onClick={() => console.log("규칙 추가 클릭")}
      />
      <StyledTextArea placeholder="현재 우리방의 규칙이 없어요!" />

      <GrayDivider />

      <IconTextButton
        type="quickmessage"
        onClick={() => console.log("퀵 메시지 클릭")}
      />
    </MyRoomMatePageWrapper>
  );
}

const MyRoomMatePageWrapper = styled.div`
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
