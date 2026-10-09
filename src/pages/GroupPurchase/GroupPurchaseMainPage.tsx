import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import GroupPurchaseList from "../../components/GroupPurchase/GroupPurchaseList";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { GetGroupPurchaseListParams, GroupOrder } from "@/types/grouporder";
import { getGroupPurchaseList } from "@/apis/groupPurchase";
import useUserStore from "../../stores/useUserStore.ts";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import EmptyMessage from "../../constants/EmptyMessage.tsx";
import { FiX } from "react-icons/fi";
import { CATEGORY_LIST, SORT_OPTIONS } from "@/constants/groupPurchase";
import { getMobilePlatform } from "@/utils/getMobilePlatform";
import TopPopupNotification from "../../components/common/TopPopupNotification.tsx";
import { CategoryItem, CategoryWrapper } from "@/styles/header";
import {
  FilterWrapper,
  Label,
  RecentSearchWrapper,
  SearchArea,
  SearchBar,
  Tag,
  TagList,
} from "@/styles/common";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";

/**
 * 로컬 스토리지에 저장될 알림 상태
 */
interface DailyNotificationState {
  date: string; // 'YYYY-MM-DD'
  count: number; // 랜덤 인원
  dismissed: boolean; // 사용자가 닫았는지 여부
}

/**
 * 오늘 날짜를 기준으로 로컬 스토리지에서 알림 상태를 가져옵니다.
 * 데이터가 없거나 날짜가 다르면 새로 생성합니다.
 * @returns {DailyNotificationState} 오늘 날짜의 알림 상태
 */
const getDailyNotificationState = (): DailyNotificationState => {
  const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD' 형식
  const storageKey = "dailyNotificationInfo";

  const initialMinCount = 73; // 규칙 1: 최초 최소값
  const initialMaxCount = 99; // 규칙 1: 최초 최대값
  const absMaxCount = 300; // 규칙 3: 절대 최대값

  let dynamicMinCount = initialMinCount; // 오늘의 최소값
  let dynamicMaxCount = initialMaxCount; // 오늘의 최대값
  let yesterdayCount = 0; // 어제 카운트 (초기값 0)

  try {
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      const parsedData = JSON.parse(storedData) as DailyNotificationState;

      // 1. 저장된 날짜가 오늘과 같으면, 저장된 상태(닫힘 여부 포함) 반환
      if (parsedData.date === today) {
        return parsedData;
      }

      // 2. 저장된 날짜가 오늘과 다름 (새로운 날)
      // 어제 카운트 저장
      yesterdayCount = parsedData.count;
    }
  } catch (error) {
    console.error("로컬 스토리지 읽기 실패:", error);
    // 에러 발생 시에도 기본값(73~99)으로 계속 진행
  }

  // 3. 오늘 날짜의 min/max 값 설정 (규칙 1, 2 적용)
  if (yesterdayCount > 0) {
    // [규칙 2] dailyNotificationInfo가 있음 (어제 카운트 기반)
    if (yesterdayCount < absMaxCount) {
      // 어제가 200 미만 (예: 80 또는 198)
      // 최소: (어제 + 1)
      dynamicMinCount = yesterdayCount + 1;
      // 최대: Min(어제 + 5, 200)
      dynamicMaxCount = Math.min(yesterdayCount + 5, absMaxCount);
    } else {
      // 어제가 200 이상 -> 리셋 (73 ~ 99)
      // dynamicMinCount, dynamicMaxCount는 맨 위에서 설정된 초기값 유지
      dynamicMinCount = initialMinCount;
      dynamicMaxCount = initialMaxCount;
    }
  } else {
    // [규칙 1] dailyNotificationInfo가 없음 (최초 실행)
    // dynamicMinCount, dynamicMaxCount는 맨 위에서 설정된 초기값 유지
    dynamicMinCount = initialMinCount;
    dynamicMaxCount = initialMaxCount;
  }

  // 4. 오늘 날짜의 새 카운트 생성
  const newCount =
    Math.floor(Math.random() * (dynamicMaxCount - dynamicMinCount + 1)) +
    dynamicMinCount;

  const newState: DailyNotificationState = {
    date: today,
    count: newCount,
    dismissed: false,
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(newState));
  } catch (error) {
    console.error("로컬 스토리지 저장 실패:", error);
  }

  return newState;
};
// --- 🔼 [수정] ---

// 알림에 표시할 데이터의 타입 (예시)
interface NotificationData {
  title: string;
  message: string;
}

export default function GroupPurchaseMainPage() {
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const [selectedCategory, setSelectedCategory] =
    useState<GetGroupPurchaseListParams["type"]>("전체");
  const [search, setSearch] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedSortOptionIndex, setSelectedSortOptionIndex] = useState(0);
  // 게시글 상태
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleCategoryClick = (category: (typeof CATEGORY_LIST)[number]) => {
    setSelectedCategory(category);
  };

  const fetchGroupOrders = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const params: GetGroupPurchaseListParams = {
        sort: SORT_OPTIONS[selectedSortOptionIndex],
        type: selectedCategory,
        search: searchTerm || undefined,
      };
      const data = await getGroupPurchaseList(params);
      console.log("공동구매 게시글 불러오기 성공 : ", data);
      setGroupOrders(data);
    } catch (error) {
      console.error("게시글 목록 불러오기 실패:", error);
      setGroupOrders([]); // 에러 발생 시 목록을 비웁니다.
    } finally {
      setLoading(false);
    }
  };

  // 최근 검색어 불러오기
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleSearchSubmit = () => {
    const rawTerm = search;
    const trimmedTerm = search.trim();

    fetchGroupOrders(trimmedTerm);

    if (rawTerm.trim() === "") return;

    const updatedSearches = [
      trimmedTerm,
      ...recentSearches.filter((item) => item !== trimmedTerm),
    ].slice(0, 10);

    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));

    setSearch("");
  };

  const handleDeleteRecent = (term: string) => {
    const updatedSearches = recentSearches.filter((item) => item !== term);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  // 게시글 목록 불러오기
  useEffect(() => {
    fetchGroupOrders();
  }, [selectedCategory, selectedSortOptionIndex]);

  const handleKeywordSettingButton = () => {
    const platform = getMobilePlatform();
    if (platform === "android_browser" || platform === "ios_browser") {
      alert("앱 설치 후 사용할 수 있습니다.");
      return;
    }

    if (!isLoggedIn) {
      alert("로그인 후 사용 가능해요");
      return;
    }

    navigate("/groupPurchase/keywordSetting");
  };

  // 1. 알림 데이터를 관리할 state.
  const [notification, setNotification] = useState<NotificationData | null>(
    () => {
      const dailyState = getDailyNotificationState();

      // 오늘 날짜의 알림 상태를 가져오고, 'dismissed'가 false일 때만 알림을 생성
      if (!dailyState.dismissed) {
        return {
          title: "원하는 게시글 알림을 설정해보세요!",
          message: `벌써 ${dailyState.count}명의 UNI들이 새 글 알림을 설정했어요.\n지금 바로 공동구매 글을 작성해보세요!`,
        };
      }

      // 이미 닫은 경우 null 반환 (알림 안 보임)
      return null;
    },
  );

  // 3. 알림이 닫힐 때 호출될 함수 (onClose prop으로 전달)
  const handleCloseNotification = () => {
    // 1. UI에서 즉시 숨김
    setNotification(null);

    // 2. 로컬 스토리지에 '오늘' 알림을 '닫음'으로 표시
    try {
      const storageKey = "dailyNotificationInfo";
      const dailyState = getDailyNotificationState(); // 현재 상태(오늘 날짜, 카운트) 가져오기

      // 오늘 날짜의 상태에 'dismissed: true'를 설정하여 다시 저장
      localStorage.setItem(
        storageKey,
        JSON.stringify({ ...dailyState, dismissed: true }),
      );
    } catch (error) {
      console.error("로컬 스토리지 업데이트 실패 (알림 닫기):", error);
    }
  };

  const headerConfig = useMemo(
    () => ({
      title: "공동구매",
      // menuItems: [
      //   {
      //     label: "알림 수신 설정",
      //     onClick: () => navigate("/notification-setting"),
      //   },
      // ],
      secondHeader: (
        <CategoryWrapper>
          {CATEGORY_LIST.map((category) => (
            <CategoryItem
              key={category}
              className={selectedCategory === category ? "active" : ""}
              onClick={() => handleCategoryClick(category)} // 클릭 핸들러
            >
              {category}
            </CategoryItem>
          ))}
        </CategoryWrapper>
      ),
      settingOnClick: handleKeywordSettingButton,
      showAlarm: true,
    }),
    [selectedCategory, navigate],
  ); // selectedCategory 필수 포함

  /* 안정된 config 전달 */
  useSetHeader(headerConfig);

  return (
    <PageWrapper>
      {/* 4. state에 notification 데이터가 있을 때만 렌더링 */}
      {notification && (
        <TopPopupNotification
          title={notification.title}
          message={notification.message}
          onClose={handleCloseNotification}
          // (선택 사항) 앱 아이콘이나 이름을 바꿀 수 있습니다.
          // appName="내 앱"
          // appIcon="🚀"
        />
      )}

      <FilterWrapper>
        <SelectableChipGroup
          Groups={SORT_OPTIONS.map((option) => option)}
          selectedIndex={selectedSortOptionIndex}
          onSelect={setSelectedSortOptionIndex}
          unselectable
          rowScrollable={true} //가로 한줄로 스크롤
        />
      </FilterWrapper>
      <SearchArea>
        <SearchBar>
          <FaSearch size={16} color="#999" />
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchSubmit();
            }}
            onFocus={() => setIsSearchFocused(true)}
            // onBlur={() => setIsSearchFocused(false)}
          />
        </SearchBar>

        {isSearchFocused && recentSearches.length > 0 && (
          <RecentSearchWrapper>
            <Label>최근 검색어</Label>
            <TagList>
              {recentSearches.map((term) => (
                <Tag key={term}>
                  {term}{" "}
                  <FiX
                    size="14"
                    color="#1C1C1E"
                    onClick={() => handleDeleteRecent(term)}
                  />
                </Tag>
              ))}
            </TagList>
          </RecentSearchWrapper>
        )}
      </SearchArea>
      {/* 🔽 로딩 상태에 따라 스피너, 목록, 빈 메시지를 조건부 렌더링합니다. */}
      {loading ? (
        <LoadingSpinner message="공동구매 목록을 불러오는 중..." />
      ) : groupOrders.length > 0 ? (
        <GroupPurchaseList groupOrders={groupOrders} />
      ) : (
        <EmptyMessage message="해당 조건의 공동구매가 없습니다." />
      )}
      <WriteButton
        onClick={() => {
          if (!isLoggedIn) {
            alert("로그인 후 사용 가능해요.");
            navigate("/login");
            return;
          }
          navigate("/groupPurchase/write");
        }}
      >
        ✏️ 글쓰기
      </WriteButton>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  padding: 40px 16px 140px;
  box-sizing: border-box;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  width: 100%;

  @media (min-width: 1024px) {
    max-width: 1200px;
    margin: 0 auto;
  }
`;

const WriteButton = styled.button`
  position: fixed;
  bottom: calc(90px + var(--safe-area-bottom, 0px));
  right: 20px;
  background-color: #007bff;
  color: white;
  border-radius: 24px;
  padding: 12px 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 100;
`;
