import styled from "styled-components";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import RoomMateCard from "../../components/roommate/RoomMateCard.tsx";
import { useEffect, useMemo } from "react";
import { RoommatePost } from "@/types/roommates"; // 타입 임포트
import { useLocation, useNavigate } from "react-router-dom";
import FilterButton from "../../components/button/FilterButton.tsx";
import { getRoomMateScrollList } from "@/apis/roommate";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";

function FilterTags({ filters }: { filters: Record<string, any> }) {
  const filteredTags = Object.values(filters).filter((value) => {
    if (value == null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim() !== "";
    return true;
  });

  if (filteredTags.length === 0) return null;

  return (
    <TagsWrapper>
      <div className="filtertitle">적용된 필터</div>
      {filteredTags.map((value, idx) => {
        const displayValue = Array.isArray(value) ? value.join(", ") : value;
        return <Tag key={idx}>#{displayValue}</Tag>;
      })}
    </TagsWrapper>
  );
}

const TagsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  .filtertitle {
    font-size: 14px;
    font-weight: 600;
  }
`;

const Tag = styled.div`
  background-color: #e0e0e0;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 13px;
  color: #333;
`;

export default function RoomMateListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ref, inView } = useInView();

  const filters = useMemo(
    () => location.state?.filters || {},
    [location.state?.filters],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["roommates", "scroll"],
    // queryFn 결과값이 RoommatePost[] 배열임
    queryFn: ({ pageParam }) => getRoomMateScrollList(pageParam, 10),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      // lastPage가 배열이므로 length 접근 가능
      if (lastPage.length < 10) return undefined;
      // 마지막 요소의 boardId 추출
      return lastPage[lastPage.length - 1].boardId;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 1. useMemo 반환 타입에 RoommatePost[] 명시
  const allRoommates = useMemo<RoommatePost[]>(() => {
    const combined = data?.pages.flat() || [];

    return combined.filter((post: RoommatePost) => {
      if (filters.dormType && post.dormType !== filters.dormType) return false;
      if (filters.college && post.college !== filters.college) return false;
      if (filters.dormPeriod && filters.dormPeriod.length > 0) {
        const matchAllDays = filters.dormPeriod.every((day: string) =>
          post.dormPeriod.includes(day),
        );
        if (!matchAllDays) return false;
      }
      if (filters.mbti) {
        const filterLetters = filters.mbti.split("");
        const matchesAll = filterLetters.every((letter: string) =>
          post.mbti.includes(letter),
        );
        if (!matchesAll) return false;
      }
      if (filters.smoking && post.smoking !== filters.smoking) return false;
      if (filters.snoring && post.snoring !== filters.snoring) return false;
      if (filters.toothGrind && post.toothGrind !== filters.toothGrind)
        return false;
      if (filters.sleeper && post.sleeper !== filters.sleeper) return false;
      if (filters.showerHour && post.showerHour !== filters.showerHour)
        return false;
      if (filters.showerTime && post.showerTime !== filters.showerTime)
        return false;
      if (filters.bedTime && post.bedTime !== filters.bedTime) return false;
      if (filters.arrangement && post.arrangement !== filters.arrangement)
        return false;
      if (filters.religion && post.religion !== filters.religion) return false;
      return true;
    });
  }, [data, filters]);

  useSetHeader({ title: "2026년 1학기 룸메이트" });

  return (
    <RoomMateListPageWrapper>
      <TitleContentArea
        title={"최신순"}
        description={"룸메이트를 구하고 있는 다양한 UNI들을 찾아보세요!"}
      >
        <>
          <FilterArea>
            <FilterButton
              onClick={() => {
                navigate("/roommate/filter", {
                  state: { filters: filters },
                });
              }}
            />
            <FilterTags filters={filters} />
          </FilterArea>

          {isLoading && <LoadingSpinner message="목록 로딩 중..." />}
          {isError && <EmptyMessage>데이터 로딩 오류 발생</EmptyMessage>}

          {!isLoading && allRoommates.length > 0
            ? // 2. map 콜백 매개변수에 RoommatePost 타입 명시
              allRoommates.map((post: RoommatePost) => (
                <RoomMateCard
                  key={post.boardId}
                  title={post.title}
                  boardId={post.boardId}
                  dormType={post.dormType}
                  mbti={post.mbti}
                  college={post.college}
                  isSmoker={post.smoking === "피워요"}
                  isClean={post.arrangement === "깔끔해요"}
                  stayDays={post.dormPeriod}
                  description={post.comment}
                  roommateBoardLike={post.roommateBoardLike}
                  matched={post.matched}
                />
              ))
            : !isLoading && <EmptyMessage>게시글이 없습니다.</EmptyMessage>}

          <div ref={ref} style={{ height: "20px" }}>
            {isFetchingNextPage && (
              <LoadingSpinner message="추가 데이터 로딩 중..." />
            )}
          </div>
        </>
      </TitleContentArea>
    </RoomMateListPageWrapper>
  );
}

const RoomMateListPageWrapper = styled.div`
  padding: 0 16px 100px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #fafafa;
`;

const EmptyMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: #aaa;
  font-size: 14px;
`;

const FilterArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
