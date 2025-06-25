import styled from "styled-components";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  return (
    <LoginPageWrapper>
      <div>
        <h1>로그인</h1>

        <h3>아이디</h3>
        <input />
        <h3>비밀번호</h3>
        <input />
      </div>

      <button
        onClick={() => {
          navigate("/home");
        }}
      >
        로그인
      </button>
    </LoginPageWrapper>
  );
}

const LoginPageWrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;

  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  justify-content: space-between;
`;
