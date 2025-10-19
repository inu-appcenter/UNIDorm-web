import styled from "styled-components";

export default function TermOfUse() {
  return (
    <StyledDiv>
      유니돔은 IT동아리 '인천대학교 앱센터'에서 생활원과 협력하여 개발하는
      서비스입니다.
      {/*서비스 사용 시{" "}*/}
      {/*<a href="/terms-of-use.html" target="_blank" rel="noopener noreferrer">*/}
      {/*  이용약관*/}
      {/*</a>{" "}*/}
      {/*및{" "}*/}
      {/*<a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer">*/}
      {/*  <strong>개인정보 처리방침</strong>*/}
      {/*</a>*/}
      {/*에 동의한 것으로 간주됩니다.*/}
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  width: 100%;
  font-size: 14px;
`;
