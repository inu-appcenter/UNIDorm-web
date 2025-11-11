import styled from "styled-components";

export const FilterWrapper = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const FilterButton = styled.button`
  background-color: transparent;
  border: 1px solid #007aff;
  border-radius: 999px;
  padding: 4px 16px;
  cursor: pointer;
  box-sizing: border-box;

  color: var(--m-1, #0a84ff);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0.38px;

  &.active {
    background-color: #007bff;
    color: white;
    font-weight: bold;
  }
`;

export const SearchArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SearchBar = styled.div`
  height: fit-content;
  background-color: #f4f4f4;
  border-radius: 999px;
  padding: 12px 12px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 5px;
  overflow: hidden;

  input {
    border: none;
    background: none;
    width: 100%;
    font-size: 14px;
    color: #333;

    ::placeholder {
      color: #999;
    }

    :focus {
      outline: none;
    }
  }
`;

export const RecentSearchWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Label = styled.div`
  color: #636366;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0.38px;
`;

export const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;
export const Tag = styled.div`
  background-color: #e7e7e7;
  border-radius: 20px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 8px;

  color: var(--1, #1c1c1e);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px; /* 171.429% */
  letter-spacing: 0.38px;
`;

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

export const Textarea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #eee;
  background: #f8f8f8;
  resize: vertical;
  color: #1c1c1e;
  font-size: 15px;
  font-weight: 500;
  box-sizing: border-box;

  &::placeholder {
    color: #aeaeae;
  }
`;
