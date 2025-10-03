import styled from "styled-components";
import Header from "../../components/common/Header.tsx";
import { useState } from "react";
import CommonBottomModal from "../../components/modal/CommonBottomModal.tsx";

const modalContent = () => {
  return (
    <ModalContentWrapper>
      알림을{" "}
      <span className={"strong"}>
        <span className={"blue"}>키워드</span>로
      </span>{" "}
      설정해보세요
      <br />
      <span className={"secondLine"}>
        해당 단어가 들어간 게시글이 올라오면 알려드려요!
      </span>
    </ModalContentWrapper>
  );
};
const ModalContentWrapper = styled.div`
  color: #6c6c74;
  text-align: center;
  font-size: 19px;
  font-style: normal;
  font-weight: 500;

  .strong {
    font-weight: 600;
  }
  .blue {
    color: #0a84ff;
  }
  .secondLine {
    font-size: 14px;
  }
`;

const KeywordAlertSettingPage = () => {
  const [keyword, setKeyword] = useState("");
  const handleAddKeyword = async () => {
    if (!keyword) return;
  };

  const [isOpen, setIsOpen] = useState(true);

  return (
    <Wrapper>
      <Header title={"키워드 알림 설정"} hasBack={true} />
      <InputWrapper>
        <StyledInput
          placeholder="알림 받을 키워드를 입력해주세요."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <TextButton disabled={!keyword} onClick={handleAddKeyword}>
          등록
        </TextButton>
      </InputWrapper>

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
  gap: 32px;
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
  padding: 12px;
  padding-right: 50px;
  box-sizing: border-box;

  color: #444;
  font-size: 16px;
  font-weight: 700;

  &::placeholder {
    color: #c0c0c0;
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
  color: ${(props) => (props.disabled ? "#ccc" : "#5e92f0")};

  &:disabled {
    cursor: not-allowed;
  }
`;
