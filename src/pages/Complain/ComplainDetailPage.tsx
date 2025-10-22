import styled from "styled-components";
import Header from "../../components/common/Header/Header.tsx";
import StepFlow from "../../components/complain/StepFlow.tsx";
import ComplainCard from "../../components/complain/ComplainCard.tsx";
import ComplainAnswerCard from "../../components/complain/ComplainAnswerCard.tsx";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteComplaint, getComplaintDetail } from "../../apis/complain.ts";
import { ComplaintDetail } from "../../types/complain.ts";
import {
  assignComplaintOfficer,
  getAdminComplaintDetail,
  updateComplaintStatus,
} from "../../apis/complainAdmin.ts";
import RoundSquareWhiteButton from "../../components/button/RoundSquareWhiteButton.tsx";
import RoundSquareButton from "../../components/button/RoundSquareButton.tsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import EmptyMessage from "../../constants/EmptyMessage.tsx";
import { useIsAdminRole } from "../../hooks/useIsAdminRole.ts";
import { TipImage } from "../../types/tips.ts";

const ComplainDetailPage = () => {
  const { isAdmin } = useIsAdminRole();

  const { complainId } = useParams<{ complainId: string }>();
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [selectedManager, setSelectedManager] = useState("");
  const [isNeedUpdate, setIsNeedUpdate] = useState(false);
  const navigate = useNavigate();
  const [complainImages, setComplainImages] = useState<TipImage[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!complainId) return;

      setIsLoading(true);
      try {
        let response;
        if (isAdmin) {
          response = await getAdminComplaintDetail(Number(complainId));
          console.log("관리자용 민원 상세 가져오기 성공:", response);
        } else {
          response = await getComplaintDetail(Number(complainId));
          console.log("일반 유저용 민원 상세 가져오기 성공:", response);
        }
        setComplainImages(
          response.data.images.map(
            (url: string, index): TipImage => ({
              contentType: "",
              imageUrl: url,
              fileSize: 0,
              imageName: `이미지 ${index + 1}`,
            }),
          ),
        );
        console.log(response);
        setComplaint(response.data);
      } catch (error) {
        console.error("민원 상세 불러오기 실패:", error);
        setComplaint(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaint();
  }, [complainId, isNeedUpdate]);

  const handleStatus = async (status: string) => {
    try {
      if (!isAdmin || !complainId) {
        return;
      }
      if (status === "처리완료") {
        alert("반려/처리완료는 담당자 배정 후, 답변 작성에서 가능합니다.");
        return;
      }
      if (!window.confirm(`처리 상태를 ${status}(으)로 바꿀까요?`)) {
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
    if (!complainId) return;

    try {
      await updateComplaintStatus(Number(complainId), "담당자 배정");
      await assignComplaintOfficer(Number(complainId), selectedManager);

      setShowModal(false);
      setIsNeedUpdate((prev) => !prev);
    } catch (err) {
      console.error("담당자 배정 실패:", err);
    }
  };

  const handleDelete = async () => {
    try {
      if (!window.confirm("정말 삭제할까요?")) return;

      if (!complaint?.id) {
        console.error("삭제 중 오류가 발생했습니다.");
        return;
      }

      await deleteComplaint(complaint?.id);

      alert("삭제하였습니다.");
    } catch (err) {
      console.log(err);
    }
  };

  const menuItems = [
    {
      label: "수정하기",
      onClick: () => {
        navigate("/complain/write", {
          state: { complain: complaint, complainImages: complainImages },
        });
      },
    },
    {
      label: "삭제하기",
      onClick: handleDelete,
    },
  ];

  return (
    <ComplainListPageWrapper>
      <Header
        title={"민원 상세"}
        hasBack={true}
        menuItems={complaint?.status === "대기중" ? menuItems : undefined}
      />
      {isLoading ? (
        <LoadingSpinner message="민원 상세 정보를 불러오는 중..." />
      ) : complaint ? (
        <>
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
                      : complaint.status === "반려"
                        ? 4
                        : 0
            }
            assignee={complaint.officer}
            handleStatus={isAdmin ? handleStatus : undefined}
          />
          <ComplainCardsContainer>
            <ComplainCard
              date={complaint.createdDate}
              type={complaint.type}
              dorm={complaint.dormType}
              location={`${complaint.building} ${complaint.floor} ${complaint.roomNumber} / ${complaint.bedNumber} 침대`}
              title={complaint.title}
              content={complaint.content}
              images={complaint.images}
              incidentDate={complaint.incidentDate}
              incidentTime={complaint.incidentTime}
              specificLocation={complaint.specificLocation}
            />
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
        <EmptyMessage message="민원 정보를 불러올 수 없습니다." />
      )}

      {showModal && (
        <ModalBackGround>
          <Modal>
            <ModalContentWrapper>
              <ModalHeader>
                <h2>담당자 배정</h2>
                <span>해당 민원에 대한 담당자를 설정해주세요.</span>
              </ModalHeader>

              <ModalScrollArea>
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
                onClick={() => setShowModal(false)}
              />
              <RoundSquareButton btnName={"확인"} onClick={handleAssign} />
            </ButtonGroupWrapper>
          </Modal>
        </ModalBackGround>
      )}

      {complaint && complaint?.status !== "대기중" && isAdmin && (
        <WriteButton
          onClick={() =>
            navigate(`/admin/complain/answer/${complainId}`, {
              state: {
                complain: complaint.reply ? complaint : undefined,
                manager: complaint.officer,
                Images: complaint?.reply?.attachmentUrl,
              },
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

    & > div {
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

  .title {
    width: 100%;
    flex: 1;
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
  overflow: hidden;
`;

const ModalHeader = styled.div`
  flex-shrink: 0;
  margin-bottom: 12px;
  justify-content: space-between;
  overflow-wrap: break-word;
  word-break: keep-all;
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
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    display: block;
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  scrollbar-width: thin;
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
