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
        쿠폰 번호 : EJWS UVTF PD <button>복사하기</button>
        <br />
        유효기간 : 2026년 10월 19일
        <br />
        배달의민족 APP {"[선물함]->[선물 코드 등록]"}에서
        <br />
        등록 후 사용할 수 있습니다.
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
