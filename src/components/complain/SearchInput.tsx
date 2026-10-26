import React from "react";
import styled from "styled-components";
import { Search } from "lucide-react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  onSearch?: () => void;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background-color: #ffffff;
  padding: 8px 12px;
  box-sizing: border-box;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  gap: 8px;
`;

const StyledInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  box-shadow: none;
  font-size: 14px;
  color: #111827;
  background: transparent;
  &::placeholder {
    color: #9ca3af;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #3182f6;

  &:active {
    transform: scale(0.92);
  }
`;

const SearchIcon = styled(Search)`
  width: 20px;
  height: 20px;
`;

const SearchInput: React.FC<SearchInputProps> = ({
  className,
  onSearch,
  onKeyDown,
  ...props
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      e.preventDefault();
      onSearch();
    }
    onKeyDown?.(e);
  };

  return (
    <Container className={className}>
      <StyledInput
        type="text"
        placeholder="제목이나 내용으로 검색할 수 있어요"
        onKeyDown={handleKeyDown}
        {...props}
      />
      <IconButton
        type="button"
        onClick={onSearch}
        aria-label="검색"
        tabIndex={onSearch ? 0 : -1}
      >
        <SearchIcon />
      </IconButton>
    </Container>
  );
};

export default SearchInput;
