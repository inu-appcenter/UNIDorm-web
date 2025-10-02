import styled from "styled-components";
import Header from "../../components/common/Header.tsx";
import StepFlow from "../../components/complain/StepFlow.tsx";
import ComplainCard from "../../components/complain/ComplainCard.tsx";
import ComplainAnswerCard from "../../components/complain/ComplainAnswerCard.tsx";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getComplaintDetail } from "../../apis/complain.ts";
import { ComplaintDetail } from "../../types/complain.ts";
import useUserStore from "../../stores/useUserStore.ts";
import {
  assignComplaintOfficer,
  getAdminComplaintDetail,
  updateComplaintStatus,
} from "../../apis/complainAdmin.ts";
import RoundSquareWhiteButton from "../../components/button/RoundSquareWhiteButton.tsx";
import RoundSquareBlueButton from "../../components/button/RoundSquareBlueButton.tsx";

const ComplainDetailPage = () => {
  const { complainId } = useParams<{ complainId: string }>();
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [selectedManager, setSelectedManager] = useState(""); //드롭다운박스에서 선택된 매니저
  const [isNeedUpdate, setIsNeedUpdate] = useState(false);
  const navigate = useNavigate();

  const { userInfo } = useUserStore();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!complainId) return;

      try {
        let response;
        if (userInfo.isAdmin) {
          response = await getAdminComplaintDetail(Number(complainId));
        } else {
          response = await getComplaintDetail(Number(complainId));
        }

        console.log(response);
        setComplaint(response.data);
      } catch (error) {
        console.error("민원 상세 불러오기 실패:", error);
      }
    };

    fetchComplaint();
  }, [complainId, userInfo, isNeedUpdate]);

  const handleStatus = async (status: string) => {
    try {
      if (!userInfo.isAdmin) {
        return;
      }
      if (status === "담당자 배정") {
        setShowModal(true);
        return;
      } else {
        const response = await updateComplaintStatus(
          Number(complainId),
          status,
        );
        console.log(response);
      }
      setIsNeedUpdate((prev) => !prev);
    } catch (error) {
      console.error("민원 처리상태 변경 실패:", error);
    }
  };

  const handleAssign = async () => {
    if (!selectedManager) {
      alert("담당자를 선택해주세요.");
      return;
    }

    try {
      const response = await updateComplaintStatus(
        Number(complainId),
        "담당자 배정",
      );
      console.log(response);
      console.log("민원 처리상태 변경 성공", response);

      const res = await assignComplaintOfficer(
        Number(complainId),
        selectedManager,
      );
      console.log("담당자 배정 성공:", res);

      setShowModal(false);
      setIsNeedUpdate((prev) => !prev);
    } catch (err) {
      console.error("담당자 배정 실패:", err);
    }
  };

  return (
    <ComplainListPageWrapper>
      <Header title={"민원 상세"} hasBack={true} />
      {complaint ? (
        <>
          {/* 진행 단계 - status를 기반으로 activeIndex 계산 */}
          <StepFlow
            activeIndex={
              complaint.status === "대기중"
                ? 0
                : complaint.status === "담당자 배정"
                  ? 1
                  : complaint.status === "처리중"
                    ? 2
                    : complaint.status === "처리완료"
                      ? 3
                      : 0
            }
            assignee={complaint.officer}
            handleStatus={handleStatus}
          />
          <ComplainCardsContainer>
            {/* 민원 카드 */}
            <ComplainCard
              date={complaint.createdDate}
              type={complaint.type}
              dorm={complaint.dormType}
              studentNumber={complaint.caseNumber}
              phoneNumber={complaint.contact}
              title={complaint.title}
              content={complaint.content}
              images={complaint.images}
            />

            {/* 답변 카드 (reply 존재할 때만) */}
            {complaint.reply && (
              <ComplainAnswerCard
                date={complaint.reply.createdDate}
                type="답변"
                managerName={complaint.reply.responderName}
                title={complaint.reply.replyTitle}
                content={complaint.reply.replyContent}
                images={complaint.reply.attachmentUrl}
              />
            )}
          </ComplainCardsContainer>
        </>
      ) : (
        <p>민원 상세를 불러오는 중입니다...</p>
      )}
      {showModal && (
        <ModalBackGround>
          <Modal>
            <ModalContentWrapper>
              <ModalHeader>
                {/*<img src={궁금해하는횃불이} className="wonder-character" />*/}
                <h2>담당자 배정</h2>
                <span>해당 민원에 대한 담당자를 설정해주세요.</span>
              </ModalHeader>

              <ModalScrollArea>
                {/* 담당자 선택 드롭다운 */}
                <label
                  htmlFor="manager"
                  style={{
                    fontWeight: "bold",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  담당자명 입력
                </label>
                <input
                  type="text"
                  id="manager"
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  placeholder="담당자를 입력하세요"
                  style={{
                    width: "100%",
                    padding: "8px",
                    boxSizing: "border-box",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                  }}
                />
              </ModalScrollArea>
            </ModalContentWrapper>

            <ButtonGroupWrapper>
              <RoundSquareWhiteButton
                btnName={"닫기"}
                onClick={() => {
                  setShowModal(false);
                }}
              />

              <RoundSquareBlueButton
                btnName={"확인"}
                onClick={() => {
                  console.log("선택된 담당자:", selectedManager);
                  handleAssign();
                  setShowModal(false);
                }}
              />
            </ButtonGroupWrapper>
          </Modal>
        </ModalBackGround>
      )}
      {complaint && userInfo.isAdmin && (
        <WriteButton
          onClick={() =>
            navigate(`/admin/complain/answer/${complainId}`, {
              state: { complain: complaint, manager: complaint.officer },
            })
          }
        >
          ✏️ 답변 {complaint.reply ? "수정" : "작성"}
        </WriteButton>
      )}
    </ComplainListPageWrapper>
  );
};

export default ComplainDetailPage;

const ComplainListPageWrapper = styled.div`
  padding: 90px 16px 40px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;

  overflow-y: auto;
  background: #fafafa;
`;

const ComplainCardsContainer = styled.div`
  display: flex;
  flex-direction: column; /* 기본은 세로 배열 */
  gap: 16px;

  @media (min-width: 768px) {
    /* 화면 너비가 768px 이상일 때 가로 배열로 전환 */
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    //padding: 0 16px;

    & > div {
      /* ComplainCard와 ComplainAnswerCard의 부모 div */
      flex: 1; /* 각 카드가 동일한 너비를 갖도록 함 */
      min-width: 0;
    }
  }
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
  position: relative;

  .wonder-character {
    position: absolute;
    top: 10px;
    right: 0;
    width: 100px;
    height: 100px;
    z-index: 1000;
  }

  .content {
    width: 100%;
    flex: 1;
    //height: 100%;
    overflow-y: auto;
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

const ModalContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden; /* 내부에서만 스크롤 생기도록 */
`;

const ModalHeader = styled.div`
  flex-shrink: 0; /* 스크롤 시 줄어들지 않게 고정 */
  margin-bottom: 12px;
  justify-content: space-between;
  //padding-right: 50px;
  overflow-wrap: break-word; // 또는 wordWrap
  word-break: keep-all; // 단어 중간이 아니라 단어 단위로 줄바꿈
  text-align: center;

  h2 {
    margin: 0;
    box-sizing: border-box;
    font-size: 24px;
  }
  span {
    font-size: 14px;
    color: #6c6c74;
  }
`;

const ModalScrollArea = styled.div`
  flex: 1;
  overflow-y: auto; /* 항상 스크롤 가능하게 */
  padding-right: 8px;

  /* 크롬/사파리 */
  &::-webkit-scrollbar {
    display: block; /* 기본 표시 */
    width: 8px; /* 스크롤바 두께 */
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  /* 파이어폭스 */
  scrollbar-width: thin; /* 얇게 */
  scrollbar-color: #ccc transparent;
`;

const ButtonGroupWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
`;

const WriteButton = styled.button`
  position: fixed;
  bottom: 40px;
  right: 20px;
  background-color: #007bff;
  color: #f4f4f4;
  border-radius: 24px;
  padding: 12px 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 100;
`;
