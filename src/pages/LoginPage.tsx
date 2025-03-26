import styled from "styled-components";

export default function LoginPage() {
  return (
    <LoginPageWrapper>
로그인 페이지입니다.
    </LoginPageWrapper>
  );
}

const LoginPageWrapper = styled.div`
  padding: 0 32px;
  height: calc(1024px - 100px);
  padding-bottom: 100px;
  display: flex;
`;
