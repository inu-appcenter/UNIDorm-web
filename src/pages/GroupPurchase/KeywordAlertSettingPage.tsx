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
import { CATEGORY_LIST } from "../../constants/groupPurchase.ts";

const KeywordAlertSettingPage = () => {
  const [keyword, setKeyword] = useState("");
  const handleAddKeyword = async () => {
    if (!keyword) return;

    const rawTerm = keyword;
    const trimmedTerm = keyword.trim();

    if (rawTerm.trim() === "") return;

    const updatedSearches = [
      trimmedTerm,
      ...recentSearches.filter((item) => item !== trimmedTerm),
    ].slice(0, 10);

    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));

    setKeyword("");
  };

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [categoryIndices, setCategoryIndices] = useState<number[]>([]);

  const [isOpen, setIsOpen] = useState(true);

  // 최근 검색어 불러오기
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleDeleteRecent = (term: string) => {
    const updatedSearches = recentSearches.filter((item) => item !== term);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
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
          // onBlur={() => setIsSearchFocused(false)}
        />

        <TextButton disabled={!keyword} onClick={handleAddKeyword}>
          등록
        </TextButton>
      </InputWrapper>
      {isSearchFocused && recentSearches.length > 0 && (
        <RecentSearchWrapper>
          <TagList>
            {recentSearches.map((term) => (
              <Tag key={term}>
                {term}
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

      <EmptyMessage>
        아직 등록된 키워드가 없어요.
        <br />
        <span className="add">키워드를 추가해주세요!</span>
      </EmptyMessage>

      <CategorySetting
        selectedIndices={categoryIndices}
        setSelectedIndices={setCategoryIndices}
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
