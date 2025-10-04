import styled from "styled-components";

const ModalContent = () => {
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

export default ModalContent;

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
