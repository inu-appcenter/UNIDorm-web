import styled from "styled-components";
import 버블친구 from "../../assets/groupPurchase/버블친구.webp";

const CheckBeforeContent = () => {
  return (
    <Wrapper>
      <Title>거래 전 확인하세요!</Title>
      <img src={버블친구} />
      <Text>
        <div className="text1">
          학생증 등으로 <span className="strong">신원을 확인</span>해 보세요.
        </div>
        <div className="text2">휴대폰 번호를 교환하면 좀 더 안전해요.</div>
      </Text>
    </Wrapper>
  );
};

export default CheckBeforeContent;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
`;

const Title = styled.h1`
  color: #1c408c;
  text-align: center;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`;

const Text = styled.div`
  text-align: center;
  .text1 {
    color: var(--5, #6c6c74);
    text-align: center;
    font-size: 19px;
    font-style: normal;
    font-weight: 500;
    line-height: 160.5%; /* 30.495px */
  }
  .strong {
    color: var(--5, #6c6c74);
    font-size: 19px;
    font-style: normal;
    font-weight: 700;
    line-height: 160.5%;
  }
  .text2 {
    color: var(--5, #6c6c74);
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 160.5%;
  }
`;
