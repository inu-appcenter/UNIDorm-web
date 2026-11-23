import React, { useCallback, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { Search, X } from "lucide-react";
import { colors } from "@/styles/tokens";

/** BottomBar(1000)·Modal(9999)·Header(10000) 아래에 위치하는 기본 z-index */
export const FLOATING_SEARCH_BAR_Z_INDEX = 990;

/** 플로팅 검색바를 배치한 화면 본문 하단에 확보할 권장 여백 */
export const FLOATING_SEARCH_BAR_CLEARANCE = "84px";

export interface FloatingSearchBarProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  ariaLabel?: string;
  floating?: boolean;
  hasBottomBar?: boolean;
  bottomOffset?: string;
  maxWidth?: string;
  zIndex?: number;
  showClearButton?: boolean;
  rightAction?: React.ReactNode;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

/**
 * 하단 탭바 유무와 사용자 지정 오프셋에 따라 검색바 하단 여백을 계산합니다.
 */
export function resolveFloatingSearchBarBottomOffset({
  hasBottomBar = false,
  bottomOffset,
}: {
  hasBottomBar?: boolean;
  bottomOffset?: string;
}): string {
  if (bottomOffset && bottomOffset.trim().length > 0) {
    return bottomOffset;
  }
  return hasBottomBar ? "86px" : "16px";
}

/**
 * 검색어 앞뒤 공백을 제거합니다.
 */
export function normalizeSearchQuery(value: string): string {
  return value.trim();
}

export default function FloatingSearchBar({
  value,
  defaultValue = "",
  onChange,
  onSearch,
  onClear,
  placeholder = "검색어를 입력해 주세요",
  ariaLabel = "검색",
  floating = true,
  hasBottomBar = false,
  bottomOffset,
  maxWidth = "560px",
  zIndex = FLOATING_SEARCH_BAR_Z_INDEX,
  showClearButton = true,
  rightAction,
  disabled = false,
  autoFocus = false,
  className,
  inputRef,
  onFocus,
  onBlur,
}: FloatingSearchBarProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? value : internalValue;

  const localInputRef = useRef<HTMLInputElement | null>(null);

  const setMergedInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      localInputRef.current = node;
      if (typeof inputRef === "function") {
        inputRef(node);
      } else if (inputRef && "current" in inputRef) {
        (inputRef as React.MutableRefObject<HTMLInputElement | null>).current =
          node;
      }
    },
    [inputRef],
  );

  const updateValue = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  };

  const handleClear = () => {
    if (disabled) return;
    updateValue("");
    onClear?.();
    localInputRef.current?.focus();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled) return;
    onSearch?.(currentValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && event.nativeEvent.isComposing) {
      event.preventDefault();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      if (currentValue.length > 0) {
        handleClear();
      } else {
        localInputRef.current?.blur();
      }
    }
  };

  const resolvedBottomOffset = resolveFloatingSearchBarBottomOffset({
    hasBottomBar,
    bottomOffset,
  });

  const canClear = showClearButton && !disabled && currentValue.length > 0;

  const pillForm = (
    <PillForm
      role="search"
      onSubmit={handleSubmit}
      $maxWidth={maxWidth}
      $disabled={disabled}
    >
      <SearchButton
        type="submit"
        aria-label={ariaLabel}
        disabled={disabled}
      >
        <Search size={19} strokeWidth={2.1} aria-hidden="true" />
      </SearchButton>

      <SearchField
        ref={setMergedInputRef}
        type="search"
        enterKeyHint="search"
        value={currentValue}
        onChange={(event) => updateValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-label={ariaLabel}
        disabled={disabled}
        autoFocus={autoFocus}
      />

      {canClear && (
        <ClearButton
          type="button"
          onClick={handleClear}
          aria-label="검색어 지우기"
        >
          <X size={13} strokeWidth={2.4} aria-hidden="true" />
        </ClearButton>
      )}

      {rightAction && <RightActionSlot>{rightAction}</RightActionSlot>}
    </PillForm>
  );

  if (!floating) {
    return <InlineWrapper className={className}>{pillForm}</InlineWrapper>;
  }

  return (
    <FloatingWrapper
      className={className}
      $bottomOffset={resolvedBottomOffset}
      $zIndex={zIndex}
    >
      {pillForm}
    </FloatingWrapper>
  );
}

const FloatingWrapper = styled.div<{
  $bottomOffset: string;
  $zIndex: number;
}>`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${({ $zIndex }) => $zIndex};
  display: flex;
  justify-content: center;
  pointer-events: none;
  padding: 8px calc(16px + var(--safe-area-right, 0px))
    calc(${({ $bottomOffset }) => $bottomOffset} + var(--safe-area-bottom, 0px))
    calc(16px + var(--safe-area-left, 0px));
  box-sizing: border-box;
`;

const InlineWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
`;

const PillForm = styled.form<{ $maxWidth: string; $disabled: boolean }>`
  pointer-events: auto;
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth};
  height: 52px;
  padding: 0 10px 0 8px;
  box-sizing: border-box;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.76);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
  transition:
    background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:focus-within {
    background: rgba(255, 255, 255, 0.92);
    border-color: ${colors.blue.blue300};
    box-shadow:
      0 8px 28px rgba(22, 119, 255, 0.14),
      0 1px 3px rgba(0, 0, 0, 0.04);
  }

  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.65;
      cursor: not-allowed;
    `}
`;

const SearchButton = styled.button`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.text.text2};
  cursor: pointer;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover:not(:disabled) {
    color: ${colors.main.main1};
    background: rgba(22, 119, 255, 0.08);
  }

  &:active:not(:disabled) {
    transform: scale(0.92);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const SearchField = styled.input`
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.4;
  color: ${colors.text.text1};
  padding: 0;
  box-sizing: border-box;

  &::placeholder {
    color: ${colors.text.text3};
  }

  &::-webkit-search-cancel-button {
    display: none;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const ClearButton = styled.button`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  margin-right: 4px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.gray.gray200};
  color: ${colors.gray.gray700};
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: ${colors.gray.gray300};
  }

  &:active {
    transform: scale(0.92);
  }
`;

const RightActionSlot = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;
