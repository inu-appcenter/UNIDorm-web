import styled from "styled-components";
import { useEffect, useState } from "react";

import Header from "../../components/common/Header";
import GrayDivider from "../../components/common/GrayDivider.tsx";
import IconTextButton from "../../components/button/IconTextButton.tsx";
import StyledTextArea from "../../components/roommate/StyledTextArea.tsx";
import RoomMateInfoArea from "../../components/roommate/RoomMateInfoArea.tsx";
import {
  deleteMyRoommateRules,
  getMyRoommateRules,
  updateMyRoommateRules,
} from "../../apis/roommate.ts";
import RoundSquareButton from "../../components/button/RoundSquareButton.tsx";
import QuickMessageModal from "../../components/roommate/QuickMessageModal.tsx";

export default function MyRoomMatePage() {
  // const [rules, setRules] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [showQuickModal, setShowQuickModal] = useState(false);

  const menuItems = [
    {
      label: "규칙 추가/편집하기",
      onClick: () => {
        setIsEditing(true);
      },
    },
    {
      label: "규칙 삭제하기",
      onClick: () => {
        if (window.confirm("정말 방 규칙을 삭제하시겠습니까?")) {
          deleteMyRoommateRules()
            .then(() => {
              alert("방 규칙이 삭제되었습니다.");
              // 삭제 후 처리 (예: 상태 초기화 또는 새로고침)
              // setRules([]); // rules 상태가 있다면 빈 배열로 초기화
              setIsEditing(false);
            })
            .catch((error) => {
              alert("규칙 삭제에 실패했습니다.");
              console.error(error);
            });
        }
      },
    },
  ];

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await getMyRoommateRules();
        const initialRules = res.data.rules ?? [];
        // setRules(initialRules);
        setText(initialRules.join("\n"));
      } catch (error) {
        alert("방 규칙을 불러오는 데 실패했습니다." + error);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  return (
    <MyRoomMatePageWrapper>
      <Header
        title={"내 룸메이트"}
        hasBack={true}
        showAlarm={false}
        menuItems={menuItems}
      />

      <RoomMateInfoArea />
      <GrayDivider />

      <IconTextButton
        type="addtimetable"
        onClick={() => console.log("시간표 추가 클릭")}
      />
      {/* 규칙 편집 관련 버튼 기능 제거 */}
      <IconTextButton type="createrules" onClick={() => {}} />

      <StyledTextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        readOnly={!isEditing}
        placeholder={
          loading
            ? "로딩 중..."
            : "현재 우리방의 규칙이 없어요!\n우측 상단 메뉴에서 규칙 추가를 눌러 작성해보세요!"
        }
      />
      {isEditing && (
        <div>
          <RoundSquareButton
            btnName={"저장하기"}
            onClick={async () => {
              try {
                const newRules = text
                  .split("\n")
                  .map((line) => line.trim())
                  .filter((line) => line !== "");

                await updateMyRoommateRules({ rules: newRules });
                alert("규칙이 저장되었습니다.");
                // setRules(newRules);
                setIsEditing(false);
              } catch (error) {
                alert("규칙 저장에 실패했습니다." + error);
              }
            }}
          />
        </div>
      )}

      <GrayDivider />

      <IconTextButton
        type="quickmessage"
        onClick={() => setShowQuickModal(true)}
      />

      {showQuickModal && (
        <QuickMessageModal
          onClose={() => setShowQuickModal(false)}
          onSelect={(message) => {
            console.log("선택된 메시지:", message);
            // 여기에 메시지 전송 API 연동 가능
            setShowQuickModal(false);
          }}
        />
      )}
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
