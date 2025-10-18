import styled from "styled-components";

const ModalContent_EventWin = () => {
  return (
    <ModalContentWrapper>
      <span className="strong">
        <span className="blue">배민상품권 1만원</span>
      </span>{" "}
      교환권
      <br />
      <span className="secondLine">
        이 화면을 캡처해서 에브리타임 자유게시판에
        <br />
        제목에 '유니돔' 키워드를 담아 당첨 인증글을 올려주세요!
        <br />
        에브리타임 쪽지로 쿠폰 번호를 보내드립니다 😊
        <br />
        <span style={{ fontSize: "12px" }}>
          쪽지가 오지 않는다면, 마이페이지 {"->"} 1대1 문의를 남겨주세요.
        </span>
      </span>
    </ModalContentWrapper>
  );
};

export default ModalContent_EventWin;

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
