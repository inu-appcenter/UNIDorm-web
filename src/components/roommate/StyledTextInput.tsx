import styled from "styled-components";

const StyledTextInput = styled.input`
  width: 100%;
  //min-height: 100px;
  padding: 10px 14px;
  border: 1px solid #a4c8f0;
  border-radius: 8px;
  background-color: #fff;
  color: #555;
  font-size: 14px;
  line-height: 1.5;
  resize: none; /* 사용자가 수동으로 크기 조절 못하게 함 */
  overflow-y: auto; /* 내용이 넘치면 스크롤 표시 */
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: #888;
  }

  &:focus {
    border-color: #7aa8e3;
    box-shadow: 0 0 0 2px rgba(122, 168, 227, 0.3);
  }
`;

export default StyledTextInput;
