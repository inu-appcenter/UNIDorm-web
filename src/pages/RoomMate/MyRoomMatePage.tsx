import styled from "styled-components";
import { useEffect, useRef, useState } from "react";

import Header from "../../components/common/Header/Header.tsx";
import IconTextButton from "../../components/button/IconTextButton.tsx";
import StyledTextArea from "../../components/roommate/StyledTextArea.tsx";
import RoomMateInfoArea from "../../components/roommate/RoomMateInfoArea.tsx";
import {
  cancelRoommateMatching,
  deleteMyRoommateRules,
  getMyRoommateInfo,
  getMyRoommateRules,
  sendQuickMessage,
  updateMyRoommateRules,
} from "@/apis/roommate";
import RoundSquareButton from "../../components/button/RoundSquareButton.tsx";
import QuickMessageModal from "../../components/roommate/QuickMessageModal.tsx";
import { MyRoommateInfoResponse } from "@/types/roommates";
import {
  getMyRoommateTimeTableImage,
  getUserTimetableImage,
  putUserTimetableImage,
} from "@/apis/members";
import RoundSquareWhiteButton from "../../components/button/RoundSquareWhiteButton.tsx";
import { useNavigate } from "react-router-dom";
import BottomBar from "../../components/common/BottomBar/BottomBar.tsx";

export default function MyRoomMatePage() {
  const [roommateInfo, setRoommateInfo] =
    useState<MyRoommateInfoResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const [isNeedReload, setIsNeedReload] = useState(false);

  const [showQuickModal, setShowQuickModal] = useState(false);

  const [showImgConfirmModal, setShowImgConfirmModal] = useState(false); //모달창 열림 여부
  const [myTimetableImageUrl, setMyTimetableImageUrl] = useState<string>();
  const [roommateTimetableImageUrl, setRoommateTimetableImageUrl] =
    useState<string>();
  // 룸메이트 없을 때 overlay 표시 및 클릭 막기
  const isDisabled = notFound;

  const headerMenuItems = [
    {
      label: "룸메이트 끊기",
      onClick: () => {
        if (
          window.confirm(
            `정말 ${roommateInfo?.name}님과의 룸메이트 관계를 끊으시겠어요?`,
          )
        ) {
          const matchingId = roommateInfo?.matchingId;
          if (!matchingId) {
            alert("룸메이트 관계 끊기를 실패했습니다.");

            return;
          }
          cancelRoommateMatching(matchingId)
            .then(() => {
              alert(
                `${roommateInfo?.name}님과의 룸메이트 관계가 해제되었습니다.`,
              );
              navigate("/home");
            })
            .catch((error) => {
              alert("룸메이트 관계 끊기를 실패했습니다.");
              console.error(error);
            });
        }
      },
    },
  ];

  // 룸메이트 없으면 빈 배열로 처리
  const ruleMenuItems = notFound
    ? []
    : [
        {
          label: "규칙 추가/편집",
          onClick: () => {
            setIsEditing(true);
          },
        },
        {
          label: "규칙 삭제",
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

  const timetableMenuItems = [
    {
      label: "내 시간표 등록",
      onClick: () => {
        if (isDisabled) return;
        document.getElementById("timetable-upload")?.click();
      },
    },
  ];

  useEffect(() => {
    const fetchRoommateInfo = async () => {
      try {
        const res = await getMyRoommateInfo();
        console.log(res);
        setRoommateInfo(res.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          alert(
            "등록된 내 룸메이트가 없어요!\n룸메이트 탭에서 룸메이트를 찾아보거나, 이미 같이 하기로 한 친구가 있다면 등록해주세요.",
          );
          setNotFound(true);
        } else {
          console.log("룸메이트 정보를 불러오는 데 실패했습니다." + err);
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

    const fetchUserTimetable = async () => {
      try {
        const res = await getUserTimetableImage();
        setMyTimetableImageUrl(res.data.fileName);
      } catch (error: any) {
        console.log("내 시간표 이미지 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRoommateTimetable = async () => {
      try {
        const res = await getMyRoommateTimeTableImage();
        setRoommateTimetableImageUrl(res.data.fileName);
      } catch (error: any) {
        console.log("룸메이트 시간표 이미지 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
    fetchRoommateInfo();
    fetchRoommateTimetable();
    fetchUserTimetable();
  }, [isNeedReload]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleUploadImage = async () => {
    console.log("이미지 업로드 시도");

    if (!imageFile) return;

    try {
      console.log("이미지 업로드 시도");
      const response = await putUserTimetableImage(imageFile);
      console.log("이미지 업로드 완료");

      if (response.status === 200) {
        alert("시간표 이미지가 업로드되었습니다.");
        const newImageUrl = response.data.fileName;
        setMyTimetableImageUrl(newImageUrl);
        setShowImgConfirmModal(false);
        setIsNeedReload(!isNeedReload);
      } else {
        alert("이미지 업로드 실패");
      }
    } catch (error) {
      alert("이미지 업로드 오류 발생");
      console.error(error);
    }
  };

  // 이미지 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowImgConfirmModal(true);
      // if (window.confirm("이 이미지로 업로드하시겠어요?")) {
      //   handleUploadImage();
      // }
    }
  };

  const sliderRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const totalSlides = 2;

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const handleManualScroll = () => {
      if (!slider) return;
      const newIndex = Math.round(slider.scrollLeft / slider.clientWidth);
      indexRef.current = newIndex;
      setCurrentIndex(newIndex); // ← 상태 업데이트
    };

    slider.addEventListener("scroll", handleManualScroll);

    return () => {
      // clearInterval(autoSlideTimer);
      // clearTimeout(delayTimer);
      slider.removeEventListener("scroll", handleManualScroll);
    };
  }, []);

  return (
    <MyRoomMatePageWrapper>
      <Header
        title={"내 룸메이트"}
        showAlarm={false}
        menuItems={headerMenuItems}
      />
      {showImgConfirmModal && previewUrl && (
        <ModalBackGround>
          <Modal>
            이 이미지로 시간표를 업로드할까요?
            <img src={previewUrl} />
            <ButtonGroupWrapper>
              <RoundSquareWhiteButton
                btnName={"취소"}
                onClick={() => setShowImgConfirmModal(false)}
              />
              <RoundSquareButton
                btnName={"업로드"}
                onClick={handleUploadImage}
              />
            </ButtonGroupWrapper>
          </Modal>
        </ModalBackGround>
      )}

      <RoomMateInfoArea roommateInfo={roommateInfo} notFound={notFound} />

      <DisabledWrapper disabled={isDisabled}>
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
            onSelect={async (message) => {
              try {
                console.log("선택된 메시지:", message);
                if (
                  !window.confirm(
                    roommateInfo?.name + "님에게 메시지를 보낼까요?",
                  )
                )
                  return;

                await sendQuickMessage(message);
                alert("전송되었습니다.");
              } catch (error) {
                console.log(error);
                alert("전송에 실패했습니다.");
              }

              setShowQuickModal(false);
            }}
          />
        )}
        {/*<GrayDivider />*/}

        <input
          type="file"
          accept="image/*"
          id="timetable-upload"
          style={{ display: "none" }}
          onChange={(e) => {
            handleImageChange(e);
            e.target.value = ""; // 이거 추가해서 input 초기화
          }}
        />

        {/* 시간표 추가 버튼 (input 트리거) */}
        <IconTextButton type="addtimetable" menuItems={timetableMenuItems} />

        <div
          style={{ position: "relative", width: "100%", overflow: "hidden" }}
        >
          <FullWidthSlider ref={sliderRef}>
            <FullWidthSlide>
              <div className="timetableTitle">룸메이트 시간표</div>
              {roommateTimetableImageUrl ? (
                <img
                  src={roommateTimetableImageUrl}
                  alt="룸메이트 시간표"
                  style={{
                    width: "100%",
                    height: "250px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              ) : (
                <Placeholder>
                  룸메이트가 시간표를 등록하지 않았어요.
                  <br />
                  룸메이트에게 시간표 등록을 요청해보세요!
                </Placeholder>
              )}
            </FullWidthSlide>

            <FullWidthSlide>
              <div className="timetableTitle">내 시간표</div>
              {myTimetableImageUrl ? (
                <img
                  src={myTimetableImageUrl}
                  alt={`내 시간표`}
                  style={{
                    width: "100%",
                    height: "250px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              ) : (
                <Placeholder>
                  아직 내 시간표가 등록되지 않았어요.
                  <br />
                  지금 바로 내 시간표를 등록해 보세요!
                </Placeholder>
              )}
            </FullWidthSlide>
          </FullWidthSlider>

          {/* 인디케이터 */}
          <IndicatorWrapper>
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <Dot key={idx} active={idx === currentIndex} />
            ))}
          </IndicatorWrapper>
        </div>

        {/* 규칙 편집 관련 버튼 기능 제거 */}
        <IconTextButton
          type="createrules"
          onClick={() => {
            if (isDisabled) return;
          }}
          menuItems={ruleMenuItems}
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
              : "현재 우리방의 규칙이 없어요.\n우측 메뉴에서 규칙 추가를 눌러 작성해보세요!"
          }
        />
        {isEditing && !isDisabled && (
          <div>
            <RoundSquareButton
              btnName={"저장"}
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
      <BottomBar />
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

const FullWidthSlider = styled.div`
  display: flex;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  width: 100%;
  position: relative; /* ← 플로팅을 위한 설정 */
  -ms-overflow-style: none; /* IE */
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none; /* Chrome */
  }
`;

const FullWidthSlide = styled.div`
  flex: 0 0 100%;
  scroll-snap-align: start;
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  .timetableTitle {
    font-weight: 500;
    font-size: 14px;
  }
`;

const IndicatorWrapper = styled.div`
  width: 100%;
  display: flex;
  pointer-events: none;
`;

const Dot = styled.div<{ active: boolean }>`
  height: 4px;
  flex: 1;
  background-color: ${({ active }) => (active ? "#FFD600" : "#ccc")};
  transition: background-color 0.3s ease;
  border-radius: 2px;
  &:not(:last-child) {
    margin-right: 6px;
  }
`;

const Placeholder = styled.div`
  width: 100%;
  height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  color: #888;
  border-radius: 8px;
  font-size: 16px;
  text-align: center;
`;

const ModalBackGround = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  inset: 0 0 0 0;
  z-index: 9999;
`;

const Modal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  padding: 32px 20px;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  max-height: 80%;
  background: white;
  color: #333366;
  font-weight: 500;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-out;
  overflow: hidden;

  img {
    width: 100%;
    height: auto;
    max-height: 300px; // 버튼 영역 침범 방지
    object-fit: contain;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ButtonGroupWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
`;
