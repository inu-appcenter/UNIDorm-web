import styled, { keyframes } from "styled-components";

export const ChatPageWrapper = styled.div`
  width: 100%;
  background: #ffffff;
  /* 부모 헤더(70px)를 뺀 나머지 화면 전체 고정 높이 */
  height: calc(100vh - 70px);
  /* Flex Column 레이아웃 */
  display: flex;
  flex-direction: column;
  /* 외부 스크롤 방지 */
  overflow: hidden;
  position: relative;
`;

export const FixedHeaderContainer = styled.div`
  width: 100%;
  background: transparent;
  /* 크기가 줄어들거나 늘어나지 않도록 고정 */
  flex-shrink: 0;
`;

export const ChattingWrapper = styled.div<{ $chatType?: string }>`
  display: flex;
  flex-direction: column;
  /* 남은 공간을 모두 차지하며 내부 스크롤 활성화 */
  flex: 1;
  overflow-y: auto;

  /* 오픈채팅방일 경우 상단에 플로팅 배너 높이만큼 여백 추가 */
  padding-top: ${({ $chatType }) => ($chatType === "open" ? "72px" : "0")};
  padding-bottom: 100px; /* 플로팅 입력 바 공간 확보 */
  box-sizing: border-box;
  background: transparent;
  position: relative;
  z-index: 1;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #d1d1d1;
    border-radius: 2px;
  }
`;

export const DateDivider = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 24px 0 16px 0;

  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #767676;
`;

export const BackgroundImage = styled.div`
  position: absolute;
  width: 140%;
  max-width: 600px;
  height: 50dvh;
  left: calc(50% + 5px);
  bottom: -100px;
  transform: translateX(-50%);
  background-image: url("data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDU1MiA1NzYuMDUyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBpZD0iRWxsaXBzZSAyIiBmaWx0ZXI9InVybCgjZmlsdGVyMF9mXzMzNDdfOTYzMykiPgo8cGF0aCBkPSJNNTMyIDMwMC4wNTJDNTMyIDQ0MS40MzcgNDE3LjM4NSA1NTYuMDUyIDI3NiA1NTYuMDUyQzEzNC42MTUgNTU2LjA1MiAyMCA0NDEuNDM3IDIwIDMwMC4wNTJDMjAgMTkzLjg2MSAxNjUuMjYxIDgxLjYxNjUgMjM3LjU3OCAzMi4zMTY0QzI2MS43ODcgMTUuODEyIDkyLjE3OSAxNS45MDEgMzE3LjI5MSAzMi41NDY4QzM4OC44NzggODEuOTY1NiA1MzIgMTk0LjAyNiA1MzIgMzAwLjA1MloiIGZpbGw9InVybCgjcGFpbnQwX3JhZGlhbF8zMzQ3Xzk2MzMpIiBmaWxsLW9wYWNpdHk9IjAuNSIvPgo8L2c+CjxkZWZzPgo8ZmlsdGVyIGlkPSJmaWx0ZXIwX2ZfMzM0N185NjMzIiB4PSIwIiB5PSIwIiB3aWR0aD0iNTUyIiBoZWlnaHQ9IjU3Ni4wNTIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KPGZlRmxvb2QgZmxvb2Qtb3BhY2l0eT0iMCIgcmVzdWx0PSJCYWNrZ3JvdW5kSW1hZ2VGaXgiLz4KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJCYWNrZ3JvdW5kSW1hZ2VGaXgiIHJlc3VsdD0ic2hhcGUiLz4KPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMTAiIHJlc3VsdD0iZWZmZWN0MV9mb3JlZ3JvdW5kQmx1cl8zMzQ3Xzk2MzMiLz4KPC9maWx0ZXI+CjxyYWRpYWxHcmFkaWVudCBpZD0icGFpbnQwX3JhZGlhbF8zMzQ3Xzk2MzMiIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjc2IDQxNi41NTIpIHJvdGF0ZSgtOTApIHNjYWxlKDQwMC41IDQwMC41KSI+CjxzdG9wIHN0b3AtY29sb3I9IiMxNjc3RkYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMTY3N0ZCIiBzdG9wLW9wYWNpdHk9IjAiLz4KPC9yYWRpYWxHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4=");
  background-size: contain;
  background-repeat: no-repeat;
  width: min(160vw, 760px);
  max-width: none;
  height: min(62dvh, 640px);
  bottom: clamp(-140px, -12dvh, -72px);
  background-image: radial-gradient(
    ellipse at 50% 88%,
    rgba(22, 119, 255, 0.38) 0%,
    rgba(22, 119, 255, 0.17) 42%,
    rgba(22, 119, 255, 0) 72%
  );
  background-size: 100% 100%;
  pointer-events: none;
  z-index: 0;
`;

export const NoticeContainer = styled.div`
  position: absolute;
  top: 12px;
  left: 20px;
  right: 20px;
  background-color: #e6f4ff;
  border: 1px solid #dfdfdf;
  border-radius: 16px;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 999;
`;

export const NoticeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
`;

export const NoticeTitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
`;

export const InfoIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const NoticeTitle = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #3d3d3d;
`;

export const ChevronWrapper = styled.div<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${({ $expanded }) =>
    $expanded ? "rotate(180deg)" : "rotate(0deg)"};
`;

export const NoticeBody = styled.div<{ $expanded: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  line-height: 1.5;
  color: #555555;

  /* 슬라이드 애니메이션 효과 */
  overflow: hidden;
  max-height: ${({ $expanded }) => ($expanded ? "150px" : "0px")};
  opacity: ${({ $expanded }) => ($expanded ? "1" : "0")};
  margin-top: ${({ $expanded }) => ($expanded ? "12px" : "0px")};
  transition:
    max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.25s ease-in-out,
    margin-top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const NoticeParagraph = styled.p`
  margin: 0;
`;

export const FloatingInputArea = styled.div`
  position: absolute;
  bottom: 24px;
  left: 20px;
  right: 20px;
  background-color: #ffffff;
  border-radius: 32px;
  display: flex;
  align-items: center;
  padding: 8px 4px 8px 16px;
  box-sizing: border-box;
  gap: 16px;
  box-shadow: 0px 2px 5px #dfdfdf;
  z-index: 100;
`;

export const PlusButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1677ff;
  flex-shrink: 0;
  padding: 0;
`;

const unfurlBottomToTop = keyframes`
  from {
    transform: translateY(8px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
`;

export const FloatingMenu = styled.div`
  position: absolute;
  bottom: calc(100% + 12px);
  left: 0;
  background-color: #ffffff;
  border: 1px solid #dfdfdf;
  border-radius: 16px;
  padding: 8px 16px;
  box-sizing: border-box;
  width: 160px;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 101;

  /* 아래에서 위 방향으로의 트랜지션 애니메이션 탑재 */
  transform-origin: bottom left;
  animation: ${unfurlBottomToTop} 0.15s ease-out;
`;

export const FloatingMenuItem = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 0;
  text-align: left;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5; /* 150% */
  color: #3d3d3d;
  width: 100%;
  box-sizing: border-box;

  &:not(:last-child) {
    border-bottom: 1px solid #efefef;
  }

  &:hover,
  &:active {
    color: var(--Main-Main1, #1677ff);
    font-weight: 400;
  }
`;

export const FloatingInput = styled.textarea`
  flex: 1;
  border: none;
  background: transparent;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #3d3d3d;
  resize: none;
  outline: none;
  padding: 4px 0;
  box-sizing: border-box; /* box-sizing을 명시하여 패딩이 높이에 포함되도록 설정 */
  height: 34px; /* 16px * 1.6 (25.6px) + padding 상하 8px = 33.6px. 모바일 포커스 시 위로 쏠리는 버그 방지 */
  max-height: 80px;

  &::placeholder {
    color: #8b8b8b;
  }
`;

export const SendCircleButton = styled.button`
  background-color: #0958d9;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0px 0px 8px 0px #bae0ff;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1677ff;
  }
`;

export const ShareCardWrapper = styled.div`
  background-color: #ffffff;
  border: 1px solid #dfdfdf;
  border-radius: 16px;
  padding: 16px;
  width: 100%;
  max-width: 360px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0px 1px 0.85px rgba(0, 0, 0, 0.1);
`;

export const ShareCardTextSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const ShareCardTitle = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #3d3d3d;
  margin: 0;
  line-height: 1.5;
`;

export const ShareCardSubtitle = styled.div`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #6b6b6b;

  p {
    margin: 0;
    line-height: 1.5;
  }
`;

export const ShareCardButtonGroup = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 8px;
`;

export const ShareCardButton = styled.button<{
  $variant?: "primary" | "secondary";
}>`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  min-width: 52px;
  min-height: 34px;
  padding: 6px 16px;
  border-radius: 20px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  border: ${({ $variant }) =>
    $variant === "secondary" ? "1px solid #dfdfdf" : "none"};
  background-color: ${({ $variant }) =>
    $variant === "secondary" ? "#ffffff" : "#1677ff"};
  color: ${({ $variant }) =>
    $variant === "secondary" ? "#8b8b8b" : "#ffffff"};
  width: fit-content;
  height: fit-content;

  &:hover:not(:disabled) {
    background-color: ${({ $variant }) =>
      $variant === "secondary" ? "#f7f7f7" : "#0958d9"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ShareSuccessCard = styled.div`
  background-color: #ffffff;
  border: 1px solid #dfdfdf;
  border-radius: 16px;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;

  max-width: 360px;
`;

export const ShareSuccessTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  color: #3d3d3d;
  margin: 0;
  white-space: nowrap;
`;

export const ShareSuccessInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 0 0 28px;
  width: 100%;
  box-sizing: border-box;
`;

export const ShareSuccessInfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  line-height: 1.5;

  .label {
    width: 37px;
    font-family: "Pretendard", sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: #3d3d3d;
    flex-shrink: 0;
  }

  .label-other {
    font-family: "Pretendard", sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: #3d3d3d;
    flex-shrink: 0;
  }

  .value {
    font-family: "Pretendard", sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #3d3d3d;
    white-space: nowrap;
    flex-shrink: 0;
  }
`;

export const ShareSystemMessage = styled.div`
  width: fit-content;
  max-width: 80%;
  margin: 12px auto;
  background-color: #f5f5f5;
  border: 1px solid #dfdfdf;
  border-radius: 12px;
  padding: 6px 16px;
  box-sizing: border-box;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  color: #8b8b8b;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
`;

export const ShareCardRowOther = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  justify-content: flex-start;
  padding: 12px 20px;
  box-sizing: border-box;
`;

export const ShareRejectedCard = styled.div`
  width: 100%;
  max-width: 360px;
  min-height: 64px;
  padding: 16px 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #dfdfdf;
  border-radius: 16px;
  background-color: #ffffff;
  color: #3d3d3d;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;

  svg {
    flex-shrink: 0;
    color: #ff4d4f;
  }
`;

export const ShareCardRowMy = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
  box-sizing: border-box;
`;

export const ProfileImgPlaceholder = styled.div`
  width: 30px;
  height: 30px;
  flex-shrink: 0;
`;

export const ShareTimeArea = styled.div`
  display: flex;
  align-items: flex-end;
  font-family: "Pretendard", sans-serif;

  .time {
    font-style: normal;
    font-weight: 400;
    font-size: 11px;
    line-height: 1.5;
    letter-spacing: 0.38px;
    color: #8b8b8b;
  }
`;

export const RoomLinkRow = styled.div`
  width: 100%;
  padding: 12px 20px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
`;

export const RoomLinkCard = styled.button`
  width: min(100%, 420px);
  min-height: 112px;
  padding: 18px 20px;
  border: 1px solid #b7d5ff;
  border-radius: 16px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(22, 119, 255, 0.08);

  &:disabled {
    cursor: wait;
    opacity: 0.65;
  }
`;

export const RoomLinkTextArea = styled.span`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const RoomLinkLabel = styled.span`
  color: #1677ff;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
`;

export const RoomLinkName = styled.span`
  color: #222222;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RoomLinkDescription = styled.span`
  color: #5f5f5f;
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  line-height: 1.45;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const RoomLinkMeta = styled.span`
  color: #8b8b8b;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
`;

export const RoomLinkAction = styled.span`
  flex-shrink: 0;
  color: #1677ff;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;
