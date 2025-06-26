// src/components/common/StyledInput.tsx
import styled from "styled-components";

const StyledInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  font-size: 16px;
  box-sizing: border-box;
  height: 50px;

  border: 1px solid #bdbdbd;
  border-radius: 5px;
  background: #f4f4f4;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
  }
`;

export default StyledInput;
