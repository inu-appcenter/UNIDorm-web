import styled from "styled-components";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import RoomMateCard from "../../components/roommate/RoomMateCard.tsx";
import Header from "../../components/common/Header.tsx";
import { getRoomMateList } from "../../apis/roommate.ts";
import { useEffect, useState } from "react";
import { RoommatePost } from "../../types/roommates.ts";
import { useLocation, useNavigate } from "react-router-dom";
import FilterButton from "../../components/button/FilterButton.tsx";
import useUserStore from "../../stores/useUserStore.ts";

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
        if (idx < 0) {
          return null;
        }
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
  const { userInfo } = useUserStore();
  const [roommates, setRoommates] = useState<RoommatePost[]>([]);
  const [filteredRoommates, setFilteredRoommates] = useState<RoommatePost[]>(
    [],
  );
  const location = useLocation();
  const navigate = useNavigate();

  // filters를 상태로 관리
  const [filters, setFilters] = useState<Record<string, any>>({
    ...(location.state?.filters || {}),
    dormType: userInfo.dormType,
  });

  // location.state.filters가 바뀌면 filters 업데이트
  useEffect(() => {
    if (location.state?.filters) {
      setFilters({
        ...location.state.filters,
        dormType: userInfo.dormType, // 항상 고정
      });
    }
  }, [location.state?.filters, userInfo.dormType]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getRoomMateList();
        setRoommates(response.data); // API에서 받은 데이터 저장
        console.log(response.data);
      } catch (error) {
        console.error("룸메이트 목록 가져오기 실패:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // roommates가 있고 필터 조건이 있을 때 필터 적용
    if (roommates.length === 0) return;

    const filtered = roommates.filter((post) => {
      // dormType 필터
      if (filters.dormType && post.dormType !== filters.dormType) return false;

      // college 필터
      if (filters.college && post.college !== filters.college) return false;

      // dormPeriod 필터 (배열 포함여부 체크)
      if (filters.dormPeriod && filters.dormPeriod.length > 0) {
        // 필터 중 적어도 한 요일이 post.dormPeriod에 있어야 함
        const matchDay = filters.dormPeriod.some((day: string) =>
          post.dormPeriod.includes(day),
        );
        if (!matchDay) return false;
      }

      // mbti 필터 (문자열 일치)
      if (filters.mbti && post.mbti !== filters.mbti) return false;

      // smoking 필터 (문자열 일치)
      if (filters.smoking && post.smoking !== filters.smoking) return false;

      // snoring 필터
      if (filters.snoring && post.snoring !== filters.snoring) return false;

      // toothGrind 필터
      if (filters.toothGrind && post.toothGrind !== filters.toothGrind)
        return false;

      // sleeper 필터
      if (filters.sleeper && post.sleeper !== filters.sleeper) return false;

      // showerHour 필터
      if (filters.showerHour && post.showerHour !== filters.showerHour)
        return false;

      // showerTime 필터
      if (filters.showerTime && post.showerTime !== filters.showerTime)
        return false;

      // bedTime 필터
      if (filters.bedTime && post.bedTime !== filters.bedTime) return false;

      // arrangement 필터
      if (filters.arrangement && post.arrangement !== filters.arrangement)
        return false;

      return true;
    });

    setFilteredRoommates(filtered);
  }, [roommates, filters]);

  return (
    <RoomMateListPageWrapper>
      <Header
        title={"룸메이트 둘러보기"}
        hasBack={true}
        backPath={"/roommate"}
      />
      <TitleContentArea
        title={"최신순"}
        description={"룸메이트를 구하고 있는 다양한 UNI들을 찾아보세요!"}
        children={
          <>
            <FilterArea>
              <FilterButton
                onClick={() => {
                  navigate("/roommatelist/filter", {
                    state: { filters: filters },
                  });
                }}
              />
              <FilterTags filters={filters} />
            </FilterArea>
            {(filteredRoommates.length > 0 ? filteredRoommates : roommates)
              .length > 0 ? (
              (filteredRoommates.length > 0
                ? filteredRoommates
                : roommates
              ).map((post) => (
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
                  commentCount={12}
                  likeCount={8}
                />
              ))
            ) : (
              <EmptyMessage>게시글이 없습니다.</EmptyMessage>
            )}
          </>
        }
      />
    </RoomMateListPageWrapper>
  );
}

const RoomMateListPageWrapper = styled.div`
  padding: 90px 16px;

  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;

  width: 100%;
  height: 100%;

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
