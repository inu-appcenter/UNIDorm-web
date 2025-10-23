import styled from "styled-components";

export const DropdownContainer = styled.div`
  display: flex;
  gap: 8px;
`;

export const Dropdown = styled.select<{ hasValue: boolean }>`
  flex: 1;
  padding: 10px 16px;
  padding-right: 32px;
  border: none;
  border-radius: 8px;
  background: #f8f8f8;
  color: ${(props) => (props.hasValue ? "#1c1c1e" : "#aeaeae")};
  font-size: 14px;
  font-weight: 500;

  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%238E8E93' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #eee;
  background: #f8f8f8;
  color: #1c1c1e;
  font-size: 15px;
  font-weight: 500;
  box-sizing: border-box;

  &::placeholder {
    color: #aeaeae;
  }
`;
