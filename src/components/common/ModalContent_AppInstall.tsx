import styled from "styled-components";

const ModalContent_AppInstall = () => {
  return (
    <ModalContentWrapper>
      <span className="strong">
        <span className="blue">유니돔 앱</span>
      </span>
      을 설치하시면
      <br />
      유니돔의 모든 기능을 사용할 수 있어요.
      <br />
      <span className="secondLine">
        공지사항, 공동구매 등 푸시알림을 사용해 보세요.
      </span>
    </ModalContentWrapper>
  );
};

export default ModalContent_AppInstall;

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

  button {
    border: 1px solid #0a84ff;
    border-radius: 20px;
    padding: 4px 8px;
    box-sizing: border-box;
    background: #0a84ff;
    color: #fff;
    font-weight: 600;
    font-size: 12px;
  }
`;
