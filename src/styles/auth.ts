import styled from "styled-components";

export const AuthFormWrapper = styled.form`
  padding: 24px 16px 152px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
  width: 100%;
  flex: 1;
  overflow-y: auto;
`;

export const AuthDescription = styled.span`
  display: block;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #666;
`;

export const AuthInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;

  h3 {
    margin-bottom: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #1c1c1e;
  }
`;

export const AuthErrorMessage = styled.span`
  margin-top: 4px;
  color: #ff4d4f;
  font-size: 12px;
`;

export const AuthButtonWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  padding-bottom: 30px;
  box-sizing: border-box;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.92) 25%,
    #ffffff 60%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 10;
`;

export const AuthLinkRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 14px;
  color: #999;

  button {
    background: none;
    border: none;
    color: #333;
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
  }
`;
