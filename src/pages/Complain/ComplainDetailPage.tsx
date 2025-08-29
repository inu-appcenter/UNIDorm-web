import styled from "styled-components";
import Header from "../../components/common/Header.tsx";
import StepFlow from "../../components/complain/StepFlow.tsx";
import ComplainCard from "../../components/complain/ComplainCard.tsx";
import ComplainAnswerCard from "../../components/complain/ComplainAnswerCard.tsx";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getComplaintDetail } from "../../apis/complain.ts";
import { ComplaintDetail } from "../../types/complain.ts";
import useUserStore from "../../stores/useUserStore.ts";
import { getAdminComplaintDetail } from "../../apis/complainAdmin.ts";

const ComplainDetailPage = () => {
  const { complainId } = useParams<{ complainId: string }>();
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const { userInfo } = useUserStore();

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
  }, [complainId, userInfo]);

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
          />

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
            />
          )}
        </>
      ) : (
        <p>민원 상세를 불러오는 중입니다...</p>
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
