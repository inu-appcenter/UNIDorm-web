import styled from "styled-components";
import Header from "../../components/common/Header.tsx";
import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import CommonBottomModal from "../../components/modal/CommonBottomModal.tsx";
import modalContent from "../../components/GroupPurchase/keywordSetting/ModalContent.tsx";
import CategorySetting from "../../components/GroupPurchase/keywordSetting/CategorySetting.tsx";
import {
  RecentSearchWrapper,
  TagList,
  Tag,
} from "../../styles/groupPurchase.ts";
import { CATEGORY_LIST, CategoryType } from "../../constants/groupPurchase.ts";
import RegisteredKeywordItem from "../../components/GroupPurchase/keywordSetting/RegisteredKeywordItem.tsx";
import {
  addGroupOrderCategoryNotification,
  deleteGroupOrderCategoryNotification, // 삭제 API 추가
  deleteGroupOrderKeywordNotification,
  getGroupOrderCategoryNotifications,
  getGroupOrderKeywordNotifications,
  addGroupOrderKeywordNotification,
} from "../../apis/groupPurchaseKeywordSetting.ts";

const KeywordAlertSettingPage = () => {
  const [keyword, setKeyword] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isneedReload, setIsneedReload] = useState(false);

  // ✅ 사용자가 UI에서 선택하는 현재 카테고리 상태
  const [categoryIndices, setCategoryIndices] = useState<number[]>([]);
  // ✅ 서버에 마지막으로 저장된 카테고리 상태 (비교 기준)
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

        const indices = res
          .map((category) => CATEGORY_LIST.indexOf(category as CategoryType))
          .filter((index) => index !== -1);

        // ✅ 두 state를 모두 초기화
        setCategoryIndices(indices);
        setSavedCategoryIndices(indices);
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

  // ✅ "전체" 선택 로직이 추가된 새로운 핸들러
  const handleCategoryChange = async (newIndices: number[]) => {
    let modifiedIndices = [...newIndices];

    // "전체" 카테고리의 인덱스는 0입니다.
    const allCategoryIndex = 0;

    // 현재 UI 상태에 "전체"가 선택되어 있었는지 확인
    const wasAllCategoryPreviouslySelected =
      categoryIndices.includes(allCategoryIndex);
    // 새로 전달된 인덱스에 "전체"가 포함되어 있는지 확인
    const allCategoryIsNowSelected = newIndices.includes(allCategoryIndex);

    // 1. "전체"가 방금 선택된 경우 (이전엔 없었고, 지금은 있음)
    if (!wasAllCategoryPreviouslySelected && allCategoryIsNowSelected) {
      modifiedIndices = [allCategoryIndex]; // "전체"만 선택하도록 변경
    }
    // 2. "전체"가 이미 선택된 상태에서 다른 항목이 추가된 경우
    else if (wasAllCategoryPreviouslySelected && newIndices.length > 1) {
      // "전체"를 해제하고 다른 항목만 선택하도록 변경
      modifiedIndices = newIndices.filter(
        (index) => index !== allCategoryIndex,
      );
    }
    // 3. 그 외의 경우 (예: "전체"가 아닌 항목들끼리 선택/해제, "전체"만 해제)
    // modifiedIndices는 newIndices 값을 그대로 사용

    // UI는 수정된 인덱스로 즉시 업데이트
    setCategoryIndices(modifiedIndices);

    // 추가된 아이템과 삭제된 아이템 찾기 (수정된 인덱스 기준)
    const addedIndices = modifiedIndices.filter(
      (index) => !savedCategoryIndices.includes(index),
    );
    const removedIndices = savedCategoryIndices.filter(
      (index) => !modifiedIndices.includes(index),
    );

    let hasError = false;

    // 삭제 API 호출
    for (const index of removedIndices) {
      const category = CATEGORY_LIST[index];
      if (!category) continue;
      try {
        await deleteGroupOrderCategoryNotification(category);
        console.log("카테고리 삭제 성공:", category);
      } catch (error) {
        console.error(`'${category}' 카테고리 삭제 실패:`, error);
        hasError = true;
      }
    }

    // 추가 API 호출
    for (const index of addedIndices) {
      const category = CATEGORY_LIST[index];
      if (!category) continue;
      try {
        await addGroupOrderCategoryNotification(category);
        console.log("카테고리 추가 성공:", category);
      } catch (error) {
        console.error(`'${category}' 카테고리 추가 실패:`, error);
        hasError = true;
      }
    }

    // 모든 API 호출이 끝난 후, 에러가 없었다면 저장된 상태를 업데이트 (수정된 인덱스 기준)
    if (!hasError) {
      setSavedCategoryIndices(modifiedIndices); // 👈 newIndices 대신 modifiedIndices
      console.log("모든 카테고리 변경사항이 성공적으로 반영되었습니다.");
    } else {
      // 에러 발생 시, UI를 다시 서버 상태로 되돌리거나 사용자에게 알림
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
      // TS18046 에러를 해결하기 위해 'error'를 'any'로 타입 단언하여 'response' 속성에 접근합니다.
      const err = error as any;

      if (err.response && err.response.status === 406) {
        alert("이미 등록된 키워드입니다.");
      } else {
        alert("키워드 등록 중 오류가 발생했습니다.");
        console.error(error); // 원래의 에러 객체를 콘솔에 출력
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
      <Header title={"키워드 알림 설정"} hasBack={true} />

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
                    e.stopPropagation(); // Tag의 onClick 이벤트 전파 방지
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

      {/* ✅ setSelectedIndices에 새로운 핸들러 연결 */}
      <CategorySetting
        selectedIndices={categoryIndices}
        setSelectedIndices={handleCategoryChange}
        Groups={CATEGORY_LIST}
      />

      <CommonBottomModal
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

// ... (styled-components 코드는 변경 없음)
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
