import styled from "styled-components";
import { useEffect, useState } from "react";

import Header from "../../components/common/Header";
import GrayDivider from "../../components/common/GrayDivider.tsx";
import IconTextButton from "../../components/button/IconTextButton.tsx";
import StyledTextArea from "../../components/roommate/StyledTextArea.tsx";
import RoomMateInfoArea from "../../components/roommate/RoomMateInfoArea.tsx";
import {
  deleteMyRoommateRules,
  getMyRoommateInfo,
  getMyRoommateRules,
  updateMyRoommateRules,
} from "../../apis/roommate.ts";
import RoundSquareButton from "../../components/button/RoundSquareButton.tsx";
import QuickMessageModal from "../../components/roommate/QuickMessageModal.tsx";
import { MyRoommateInfoResponse } from "../../types/roommates.ts";

export default function MyRoomMatePage() {
  const [roommateInfo, setRoommateInfo] =
    useState<MyRoommateInfoResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [showQuickModal, setShowQuickModal] = useState(false);

  // 룸메이트 없으면 빈 배열로 처리
  const menuItems = notFound
    ? []
    : [
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
    const fetchRoommateInfo = async () => {
      try {
        const res = await getMyRoommateInfo();
        setRoommateInfo(res.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          alert(
            "등록된 내 룸메이트가 없어요!\n룸메이트 탭에서 룸메이트를 찾아보거나, 이미 같이 하기로 한 친구가 있다면 등록해주세요.",
          );
          setNotFound(true);
        } else {
          alert("룸메이트 정보를 불러오는 데 실패했습니다." + err);
        }
      }
    };

    const fetchRules = async () => {
      try {
        const res = await getMyRoommateRules();
        const initialRules = res.data.rules ?? [];
        setText(initialRules.join("\n"));
      } catch (error: any) {
        console.log("방 규칙을 불러오는 데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
    fetchRoommateInfo();
  }, []);

  // 룸메이트 없을 때 overlay 표시 및 클릭 막기
  const isDisabled = notFound;

  return (
    <MyRoomMatePageWrapper>
      <Header
        title={"내 룸메이트"}
        hasBack={true}
        showAlarm={false}
        menuItems={menuItems}
      />

      <RoomMateInfoArea roommateInfo={roommateInfo} notFound={notFound} />
      <GrayDivider />

      <DisabledWrapper disabled={isDisabled}>
        <IconTextButton
          type="addtimetable"
          onClick={() => {
            if (isDisabled) return;
            console.log("시간표 추가 클릭");
          }}
        />
        {/* 규칙 편집 관련 버튼 기능 제거 */}
        <IconTextButton
          type="createrules"
          onClick={() => {
            if (isDisabled) return;
          }}
        />

        <StyledTextArea
          value={text}
          onChange={(e) => {
            if (isDisabled) return;
            setText(e.target.value);
          }}
          readOnly={!isEditing || isDisabled}
          placeholder={
            loading
              ? "로딩 중..."
              : "현재 우리방의 규칙이 없어요!\n우측 상단 메뉴에서 규칙 추가를 눌러 작성해보세요!"
          }
        />
        {isEditing && !isDisabled && (
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
                  setIsEditing(false);
                } catch (error) {
                  alert("규칙 저장에 실패했습니다." + error);
                }
              }}
            />
          </div>
        )}
      </DisabledWrapper>

      <GrayDivider />

      <DisabledWrapper disabled={isDisabled}>
        <IconTextButton
          type="quickmessage"
          onClick={() => {
            if (isDisabled) return;
            setShowQuickModal(true);
          }}
        />
      </DisabledWrapper>

      {showQuickModal && (
        <QuickMessageModal
          onClose={() => setShowQuickModal(false)}
          onSelect={(message) => {
            console.log("선택된 메시지:", message);
            // 메시지 전송 API 연동 가능
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

// 클릭 막고, 회색 반투명 오버레이 씌우는 래퍼
const DisabledWrapper = styled.div<{ disabled: boolean }>`
  position: relative;

  display: flex;
  flex-direction: column;
  gap: 16px;

  ${({ disabled }) =>
    disabled
      ? `
    pointer-events: none;
    opacity: 0.5;
  `
      : `
    pointer-events: auto;
    opacity: 1;
  `}
`;
