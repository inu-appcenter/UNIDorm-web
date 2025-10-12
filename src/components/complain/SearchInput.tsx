import React from "react";
import styled from "styled-components";
import { Search } from "lucide-react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background-color: #ffffff;
  padding: 8px;
  box-sizing: border-box;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const StyledInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  box-shadow: none;
  font-size: 14px;
  color: #111827;
  &::placeholder {
    color: #9ca3af;
  }
`;

const SearchIcon = styled(Search)`
  width: 20px;
  height: 20px;
  color: #0a84ff;
`;

const SearchInput: React.FC<SearchInputProps> = ({ className, ...props }) => {
  return (
    <Container className={className}>
      <StyledInput
        type="text"
        placeholder="제목으로 검색할 수 있어요"
        {...props}
      />
      <SearchIcon />
    </Container>
  );
};

export default SearchInput;
