import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import {
  deleteRoommatePost,
  getOpponentChecklist,
  getRoomMateDetail,
} from "@/apis/roommate";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import RoomMateBottomBar from "@/components/roommate/RoomMateBottomBar";
import UserInfo from "@/components/common/UserInfo";
import { PATHS } from "@/constants/paths";
import { CATEGORY_LIST } from "@/constants/roommate";
import { useSetHeader } from "@/hooks/useSetHeader";
import useUserStore from "@/stores/useUserStore";
import { colors, typography } from "@/styles/tokens";
import type { RoommatePost } from "@/types/roommates";
import { getMemberInfo } from "@/apis/members";

interface DetailRow {
  label: string;
  value: string;
  fieldKey?: string | string[];
}

interface DetailSection {
  title: string;
  color: string;
  rows: DetailRow[];
}

const getDisplayValue = (value?: string | null) => {
  if (!value) return "정보 없음";
  if (value === "안골아요") return "안 골아요";
  if (value === "안갈아요") return "안 갈아요";
  if (value === "안피워요") return "안 피워요";
  return value;
};

export default function RoomMateBoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const queryClient = useQueryClient();
  const roomId = location.state?.roomId as number | undefined;

  const partnerName = location.state?.partnerName as string | undefined;
  const routeMatchedFilterFields = location.state?.matchedFilterFields as
    | string[]
    | undefined;
  const { userInfo, setUserInfo } = useUserStore();

  const [boardData, setBoardData] = useState<RoommatePost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isActive = true;

    const fetchBoardData = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = roomId
          ? await getOpponentChecklist(roomId)
          : boardId && boardId !== "opponent"
            ? await getRoomMateDetail(Number(boardId))
            : null;

        if (isActive && response) {
          setBoardData(response.data);
          queryClient.invalidateQueries({ queryKey: ["matchingRoommates"] });
          queryClient.invalidateQueries({ queryKey: ["roommates"] });
        }
      } catch (error) {
        console.error("게시글 데이터를 불러오지 못했습니다:", error);
        if (isActive) setIsError(true);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchBoardData();

    return () => {
      isActive = false;
    };
  }, [boardId, roomId]);

  const handleDelete = async () => {
    const targetBoardId = boardData?.boardId || Number(boardId);

    if (
      !targetBoardId ||
      Number.isNaN(targetBoardId) ||
      boardId === "opponent" ||
      !window.confirm("정말로 이 게시글을 삭제하시겠습니까?")
    ) {
      return;
    }

    try {
      await deleteRoommatePost(targetBoardId);

      try {
        const memberResponse = await getMemberInfo();
        setUserInfo(memberResponse.data);
      } catch (memberError) {
        console.error("체크리스트 삭제 후 사용자 정보 갱신 실패:", memberError);
      }

      queryClient.invalidateQueries({ queryKey: ["roommates"] });
      alert("게시글이 삭제되었습니다.");
      navigate(
        `${PATHS.ROOMMATE.ROOT}?tab=${encodeURIComponent(CATEGORY_LIST[0])}`,
        { replace: true },
      );
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleEdit = () => {
    navigate(PATHS.ROOMMATE.CHECKLIST, {
      state: { mode: "edit", boardId: boardData?.boardId },
    });
  };

  const isMyPost = Boolean(boardData && userInfo.id === boardData.userId);

  useSetHeader({
    title: "",
    menuItems: isMyPost
      ? [
          { label: "수정하기", onClick: handleEdit },
          { label: "삭제하기", onClick: handleDelete },
        ]
      : null,
  });

  const isMatchedRow = (row: DetailRow) => {
    const matchedFilterFields =
      boardData?.matchedFilterFields ?? routeMatchedFilterFields;

    if (
      !matchedFilterFields ||
      matchedFilterFields.length === 0 ||
      !row.fieldKey
    )
      return false;
    if (Array.isArray(row.fieldKey)) {
      return row.fieldKey.some((k) => matchedFilterFields.includes(k));
    }
    return matchedFilterFields.includes(row.fieldKey);
  };

  const sections = useMemo<DetailSection[]>(() => {
    if (!boardData) return [];

    return [
      {
        title: "기본 정보",
        color: colors.main.main1,
        rows: [
          ...(boardData.year && boardData.semester
            ? [
                {
                  label: "모집 학기",
                  value: `${boardData.year}년 ${boardData.semester}학기`,
                },
              ]
            : []),
          {
            label: "기숙사",
            value: getDisplayValue(boardData.dormType),
            fieldKey: "dormType",
          },
          {
            label: "상주 기간",
            value: boardData.dormPeriod?.join(", ") || "정보 없음",
            fieldKey: "dormPeriodDays",
          },
          {
            label: "단과대",
            value: getDisplayValue(boardData.college),
            fieldKey: "colleges",
          },
          {
            label: "MBTI",
            value: getDisplayValue(boardData.mbti),
            fieldKey: "mbti",
          },
        ],
      },
      {
        title: "생활패턴",
        color: colors.main.main4,
        rows: [
          {
            label: "취침",
            value: getDisplayValue(boardData.bedTime),
            fieldKey: "bedTime",
          },
          {
            label: "샤워",
            value:
              [boardData.showerHour, boardData.showerTime]
                .filter(Boolean)
                .join(" · ") || "정보 없음",
            fieldKey: ["showerHour", "showerTime"],
          },
          {
            label: "잠귀",
            value: getDisplayValue(boardData.sleeper),
            fieldKey: "sleeper",
          },
        ],
      },
      {
        title: "민감 포인트",
        color: "#f5222d",
        rows: [
          {
            label: "흡연",
            value: getDisplayValue(boardData.smoking),
            fieldKey: "smoking",
          },
          {
            label: "코골이",
            value: getDisplayValue(boardData.snoring),
            fieldKey: "snoring",
          },
          {
            label: "이갈이",
            value: getDisplayValue(boardData.toothGrind),
            fieldKey: "toothGrind",
          },
          {
            label: "정리정돈",
            value: getDisplayValue(boardData.arrangement),
            fieldKey: "arrangement",
          },
          {
            label: "종교",
            value: getDisplayValue(boardData.religion),
            fieldKey: "religions",
          },
        ],
      },
    ];
  }, [boardData]);

  if (isLoading) {
    return <LoadingSpinner message="게시글을 불러오는 중..." />;
  }

  if (isError || !boardData) {
    return <ErrorMessage>게시글을 불러오지 못했습니다.</ErrorMessage>;
  }

  const shouldShowBottomBar = !roomId && !isMyPost;

  const displayUserName =
    boardData.userName || (roomId && partnerName ? partnerName : "익명");

  return (
    <RoomMateDetailPageWrapper>
      <DetailContent>
        <UserSummaryRow>
          <UserInfo
            username={displayUserName}
            createDate={boardData.createDate}
            authorImagePath={boardData.userProfileImageUrl}
          />
          {typeof boardData.matchedFilterCount === "number" && (
            <MatchedFilterBadge>
              {boardData.matchedFilterCount}개 항목 일치
            </MatchedFilterBadge>
          )}
        </UserSummaryRow>

        {boardData.title && <PostTitle>{boardData.title}</PostTitle>}

        {boardData.comment && (
          <PostDescription>{boardData.comment}</PostDescription>
        )}

        <SectionList>
          {sections.map((section) => (
            <InfoSection key={section.title}>
              <SectionTitle>
                <SectionDot $color={section.color} />
                {section.title}
              </SectionTitle>

              <InfoRows>
                {section.rows.map((row) => (
                  <InfoRow key={row.label} $isMatched={isMatchedRow(row)}>
                    <span>{row.label}</span>
                    <strong>{row.value}</strong>
                  </InfoRow>
                ))}
              </InfoRows>
            </InfoSection>
          ))}
        </SectionList>
      </DetailContent>

      {shouldShowBottomBar && (
        <RoomMateBottomBar
          partnerName={boardData.userName}
          userProfileImageUrl={boardData.userProfileImageUrl}
          postDormType={boardData.dormType}
          postTitle={boardData.title}
        />
      )}
    </RoomMateDetailPageWrapper>
  );
}

const RoomMateDetailPageWrapper = styled.div`
  min-height: calc(100vh - 70px);
  padding-bottom: 104px;
  box-sizing: border-box;
  overflow-y: auto;
  background: ${colors.bg.bg2};
`;

const DetailContent = styled.div`
  padding: 16px 20px;
  box-sizing: border-box;
  display: flex;
  gap: 20px;
  flex-direction: column;
`;

const UserSummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MatchedFilterBadge = styled.span`
  ${typography.label1Normal}
  flex: 0 0 auto;
  padding: 8px 12px;

  border-radius: 20px;
  background: var(--Gray-Gray50, #f7f7f7);

  color: var(--Gray-Gray700, #555);
  text-align: center;

  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%;
`;

const PostTitle = styled.h1`
  ${typography.body1Normal}
  font-size: 16px;
  font-weight: 600;
  color: ${colors.gray.gray800};
  margin: 0;
`;

const PostDescription = styled.p`
  ${typography.label1Normal}
  margin: 0;
  color: ${colors.gray.gray800};
  white-space: pre-line;
`;

const SectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InfoSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SectionTitle = styled.h2`
  ${typography.body1Normal}
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: ${colors.gray.gray800};
`;

const SectionDot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex: 0 0 auto;
`;

const InfoRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const InfoRow = styled.div<{ $isMatched?: boolean }>`
  ${typography.label1Normal}
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: ${({ $isMatched }) =>
    $isMatched ? colors.main.main1 : colors.gray.gray500};
  font-weight: ${({ $isMatched }) => ($isMatched ? "600" : "400")};

  strong {
    color: ${({ $isMatched }) =>
      $isMatched ? colors.main.main1 : colors.gray.gray800};
    font: inherit;
    font-weight: ${({ $isMatched }) => ($isMatched ? "700" : "600")};
    text-align: right;
  }
`;

const ErrorMessage = styled.div`
  ${typography.label1Normal}
  padding: 48px 20px;
  color: ${colors.gray.gray500};
  text-align: center;
`;
