import styled from "styled-components";
import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import CommonBottomSheet from "src/components/modal/CommonBottomSheet.tsx";
import modalContent from "../../components/GroupPurchase/keywordSetting/ModalContent.tsx";
import CategorySetting from "../../components/GroupPurchase/keywordSetting/CategorySetting.tsx";

import { CategoryType } from "@/constants/groupPurchase";
import RegisteredKeywordItem from "../../components/GroupPurchase/keywordSetting/RegisteredKeywordItem.tsx";
import {
  addGroupOrderCategoryNotification,
  addGroupOrderKeywordNotification,
  deleteGroupOrderCategoryNotification,
  deleteGroupOrderKeywordNotification,
  getGroupOrderCategoryNotifications,
  getGroupOrderKeywordNotifications,
} from "@/apis/groupPurchaseKeywordSetting";
import { RecentSearchWrapper, Tag, TagList } from "@/styles/common";

// --- ✅ 상수 정의 ---
// ✅ API와 통신할 실제 카테고리 목록
const API_CATEGORY_LIST: CategoryType[] = [
  "배달",
  "식자재",
  "생활용품",
  "기타",
];
// ✅ "전체"가 포함된, UI에 표시될 카테고리 목록
const DISPLAY_CATEGORY_LIST = ["전체", ...API_CATEGORY_LIST];
// --------------------

const KeywordAlertSettingPage = () => {
  const [keyword, setKeyword] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isneedReload, setIsneedReload] = useState(false);

  // ✅ UI에서 선택된 인덱스 상태 (DISPLAY_CATEGORY_LIST 기준)
  const [categoryIndices, setCategoryIndices] = useState<number[]>([]);
  // ✅ 서버에 마지막으로 저장된 인덱스 상태 (DISPLAY_CATEGORY_LIST 기준)
  const [savedCategoryIndices, setSavedCategoryIndices] = useState<number[]>(
    [],
  );

  // 최초 데이터 로드 및 상태 새로고침
  useEffect(() => {
    const getKeywordData = async () => {
      const res = await getGroupOrderKeywordNotifications();
      console.log("키워드 알림 목록 불러오기 성공", res);
      setKeywords(res);
    };

    const getCategoryData = async () => {
      try {
        const res = await getGroupOrderCategoryNotifications(); // ["배달", "식자재"]
        console.log("카테고리 알림 설정 목록 불러오기 성공", res);

        // ✅ API_CATEGORY_LIST 기준으로 인덱스 찾기
        const apiIndices = res
          .map((category) =>
            API_CATEGORY_LIST.indexOf(category as CategoryType),
          )
          .filter((index) => index !== -1);

        // ✅ DISPLAY_CATEGORY_LIST 기준으로 인덱스 변환 (1씩 더함)
        const displayIndices = apiIndices.map((index) => index + 1);

        let finalIndices = displayIndices;

        // ✅ 만약 모든 API 카테고리가 선택되었다면 "전체" (인덱스 0)도 추가
        if (displayIndices.length === API_CATEGORY_LIST.length) {
          finalIndices = [0, ...displayIndices];
        }

        setCategoryIndices(finalIndices);
        setSavedCategoryIndices(finalIndices);
      } catch (error) {
        console.error("카테고리 알림 설정 목록 불러오기 실패:", error);
      }
    };

    getKeywordData();
    getCategoryData();
  }, [isneedReload]);

  // 최근 검색어 불러오기
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // ✅ "전체" 선택/해제 시 모두 동기화되는 로직 핸들러
  const handleCategoryChange = async (newIndices: number[]) => {
    // --- UI 상태 계산 ---
    const allCategoryIndex = 0; // "전체"
    // "전체"를 제외한 나머지 인덱스들 [1, 2, 3, 4]
    const allApiDisplayIndices = Array.from(
      { length: API_CATEGORY_LIST.length },
      (_, i) => i + 1,
    );
    // "전체" 포함 모든 인덱스들 [0, 1, 2, 3, 4]
    const allDisplayIndices = [allCategoryIndex, ...allApiDisplayIndices];
    const numOtherCategories = API_CATEGORY_LIST.length; // 4

    let modifiedIndices = [...newIndices];

    const wasAllCategoryPreviouslySelected =
      categoryIndices.includes(allCategoryIndex);
    const allCategoryIsNowSelected = newIndices.includes(allCategoryIndex);

    // 1. "전체"가 방금 선택된 경우 -> 모든 아이템 선택
    if (!wasAllCategoryPreviouslySelected && allCategoryIsNowSelected) {
      modifiedIndices = allDisplayIndices;
    }
    // 2. "전체"가 방금 해제된 경우 -> 모든 아이템 해제
    else if (wasAllCategoryPreviouslySelected && !allCategoryIsNowSelected) {
      modifiedIndices = [];
    }
    // 3. "전체"가 선택된 상태에서, 다른 개별 아이템이 해제된 경우 -> "전체"도 함께 해제
    else if (
      allCategoryIsNowSelected &&
      newIndices.length < allDisplayIndices.length
    ) {
      modifiedIndices = newIndices.filter(
        (index) => index !== allCategoryIndex,
      );
    }
    // 4. "전체"가 선택되지 않은 상태에서, 마지막 개별 아이템이 선택되어 모든 아이템이 채워진 경우 -> "전체"도 함께 선택
    else if (!allCategoryIsNowSelected) {
      const otherIndicesInNew = newIndices.filter(
        (index) => index !== allCategoryIndex,
      );
      if (otherIndicesInNew.length === numOtherCategories) {
        modifiedIndices = allDisplayIndices;
      }
    }

    // UI는 수정된 인덱스로 즉시 업데이트
    setCategoryIndices(modifiedIndices);

    // --- API 호출 로직 ---

    // 헬퍼 함수: displayIndices에서 "전체"를 제외하고 실제 API 카테고리 이름 배열 반환
    const getApiCategories = (indices: number[]): string[] => {
      return indices
        .filter((index) => index !== allCategoryIndex) // "전체" 인덱스(0) 제외
        .map((index) => API_CATEGORY_LIST[index - 1]); // display 인덱스(1,2) -> api 인덱스(0,1)
    };

    // "전체"가 제외된, API로 보낼 실제 카테고리 목록 비교
    const oldCategories = getApiCategories(savedCategoryIndices);
    const newCategories = getApiCategories(modifiedIndices);

    const addedCategories = newCategories.filter(
      (cat) => !oldCategories.includes(cat),
    );
    const removedCategories = oldCategories.filter(
      (cat) => !newCategories.includes(cat),
    );

    let hasError = false;

    // 삭제 API 호출
    for (const category of removedCategories) {
      try {
        await deleteGroupOrderCategoryNotification(category);
        console.log("카테고리 삭제 성공:", category);
      } catch (error) {
        console.error(`'${category}' 카테고리 삭제 실패:`, error);
        hasError = true;
      }
    }

    // 추가 API 호출
    for (const category of addedCategories) {
      try {
        await addGroupOrderCategoryNotification(category);
        console.log("카테고리 추가 성공:", category);
      } catch (error) {
        console.error(`'${category}' 카테고리 추가 실패:`, error);
        hasError = true;
      }
    }

    // 모든 API 호출이 끝난 후, 에러가 없었다면 저장된 상태를 업데이트
    if (!hasError) {
      setSavedCategoryIndices(modifiedIndices); // UI 상태(modifiedIndices)로 동기화
      console.log("모든 카테고리 변경사항이 성공적으로 반영되었습니다.");
    } else {
      // 에러 발생 시, UI를 다시 서버 상태(savedCategoryIndices)로 되돌림
      alert("카테고리 변경 중 오류가 발생했습니다. 다시 시도해주세요.");
      setCategoryIndices(savedCategoryIndices); // UI를 이전 상태로 롤백
    }
  };

  const handleAddKeyword = async () => {
    if (!keyword) return;
    const trimmedTerm = keyword.trim();
    if (trimmedTerm === "") return;

    try {
      await addGroupOrderKeywordNotification(trimmedTerm);

      // 성공 로직
      const updatedSearches = [
        trimmedTerm,
        ...recentSearches.filter((item) => item !== trimmedTerm),
      ].slice(0, 10);
      setRecentSearches(updatedSearches);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
      setIsneedReload((prev) => !prev);
    } catch (error) {
      const err = error as any;

      if (err.response && err.response.status === 406) {
        alert("이미 등록된 키워드입니다.");
      } else {
        alert("키워드 등록 중 오류가 발생했습니다.");
        console.error(error);
      }
    }
    setKeyword("");
  };

  const handleDeleteRecent = (term: string) => {
    const updatedSearches = recentSearches.filter((item) => item !== term);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const handleDeleteKeyword = async (keywordToDelete: string | null) => {
    if (!keywordToDelete) {
      alert("키워드 삭제 중 오류가 발생했습니다.");
      return;
    }
    if (!window.confirm("키워드를 삭제할까요?")) return;

    try {
      await deleteGroupOrderKeywordNotification(keywordToDelete);
      setIsneedReload((prev) => !prev);
      alert("삭제되었습니다.");
    } catch (error) {
      console.error("키워드 삭제 실패:", error);
    }
  };

  return (
    <Wrapper>
      <InputWrapper>
        <StyledInput
          placeholder="알림 받을 키워드를 입력해주세요."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddKeyword();
          }}
          onFocus={() => setIsSearchFocused(true)}
          // onBlur={() => setIsSearchFocused(false)} // 필요에 따라 주석 해제
        />
        <TextButton disabled={!keyword} onClick={handleAddKeyword}>
          등록
        </TextButton>
      </InputWrapper>

      {isSearchFocused && recentSearches.length > 0 && (
        <RecentSearchWrapper>
          <TagList>
            {recentSearches.map((term) => (
              <Tag
                key={term}
                onClick={() => {
                  setKeyword(term);
                }}
              >
                {term}
                <FiX
                  size="14"
                  color="#1C1C1E"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRecent(term);
                  }}
                />
              </Tag>
            ))}
          </TagList>
        </RecentSearchWrapper>
      )}

      {keywords.length > 0 ? (
        <ListWrapper>
          {keywords.map((item, index) => (
            <RegisteredKeywordItem
              key={index}
              keyword={item}
              onDelete={() => handleDeleteKeyword(item)}
            />
          ))}
        </ListWrapper>
      ) : (
        <EmptyMessage>
          아직 등록된 키워드가 없어요.
          <br />
          <span className="add">키워드를 추가해주세요!</span>
        </EmptyMessage>
      )}

      {/* ✅ Groups에 "전체"가 포함된 DISPLAY_CATEGORY_LIST 전달 */}
      <CategorySetting
        selectedIndices={categoryIndices}
        setSelectedIndices={handleCategoryChange}
        Groups={DISPLAY_CATEGORY_LIST}
      />

      <CommonBottomSheet
        id={"키워드 알림 설정 안내"}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title={"키워드 알림 설정"}
        headerImageId={1}
        children={modalContent()}
      />
    </Wrapper>
  );
};

export default KeywordAlertSettingPage;

// --- Styled Components (변경 없음) ---
const Wrapper = styled.div`
  padding: 90px 16px 40px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;

  overflow-y: auto;
  background-color: #f4f4f4;
  flex: 1;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  border-radius: 5px;
  border: 1px solid #888;
  padding: 16px;
  padding-right: 50px;
  box-sizing: border-box;

  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;

  &::placeholder {
    color: #8e8e93;
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;
  }
`;

const TextButton = styled.button<{ disabled?: boolean }>`
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);

  border: none;
  background: none;
  cursor: pointer;

  font-size: 16px;
  font-weight: 600;
  color: ${(props) => (props.disabled ? "#ccc" : "#0a84ff")};

  &:disabled {
    cursor: not-allowed;
  }
`;

const EmptyMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: #8e8e93;
  font-size: 16px;
  line-height: 1.6;

  .add {
    text-decoration: underline;
  }
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// ✅ 이 파일 하단에 있던 CATEGORY_LIST 정의는 제거했습니다.
// (constants/groupPurchase.ts 파일에서 CategoryType을 가져와 사용)
