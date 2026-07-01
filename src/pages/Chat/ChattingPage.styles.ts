import styled from "styled-components";

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
  z-index: 1000;
`;

export const ChattingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  /* 남은 공간을 모두 차지하며 내부 스크롤 활성화 */
  flex: 1;
  overflow-y: auto;

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
  width: 512px;
  height: 549.5px;
  left: calc(50% + 5px);
  top: 358px;
  transform: translateX(-50%);
  background-image: url("data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDU1MiA1NzYuMDUyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBpZD0iRWxsaXBzZSAyIiBmaWx0ZXI9InVybCgjZmlsdGVyMF9mXzMzNDdfOTYzMykiPgo8cGF0aCBkPSJNNTMyIDMwMC4wNTJDNTMyIDQ0MS40MzcgNDE3LjM4NSA1NTYuMDUyIDI3NiA1NTYuMDUyQzEzNC42MTUgNTU2LjA1MiAyMCA0NDEuNDM3IDIwIDMwMC4wNTJDMjAgMTkzLjg2MSAxNjUuMjYxIDgxLjYxNjUgMjM3LjU3OCAzMi4zMTY0QzI2MS43ODcgMTUuODEyIDI5My4xNzkgMTUuOTAxIDMxNy4yOTEgMzIuNTQ2OEMzODguODc4IDgxLjk2NTYgNTMyIDE5NC4wMjYgNTMyIDMwMC4wNTJaIiBmaWxsPSJ1cmwoI3BhaW50MF9yYWRpYWxfMzM0N185NjMzKSIgZmlsbC1vcGFjaXR5PSIwLjUiLz4KPC9nPgo8ZGVmcz4KPGZpbHRlciBpZD0iZmlsdGVyMF9mXzMzNDdfOTYzMyIgeD0iMCIgeT0iMCIgd2lkdGg9IjU1MiIgaGVpZ2h0PSI1NzYuMDUyIiBmaWx0ZXJVbml0cz0idXNlclNwYWNlT25Vc2UiIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0ic1JHQiI+CjxmZUZsb29kIGZsb29kLW9wYWNpdHk9IjAiIHJlc3VsdD0iQmFja2dyb3VuZEltYWdlRml4Ii8+CjxmZUJsZW5kIG1vZGU9Im5vcm1hbCIgaW49IlNvdXJjZUdyYXBoaWMiIGluMj0iQmFja2dyb3VuZEltYWdlRml4IiByZXN1bHQ9InNoYXBlIi8+CjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjEwIiByZXN1bHQ9ImVmZmVjdDFfZm9yZWdyb3VuZEJsdXJfMzM0N185NjMzIi8+CjwvZmlsdGVyPgo8cmFkaWFsR3JhZGllbnQgaWQ9InBhaW50MF9yYWRpYWxfMzM0N185NjMzIiBjeD0iMCIgY3k9IjAiIHI9IjEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKDI3NiA0MTYuNTUyKSByb3RhdGUoLTkwKSBzY2FsZSg0MDAuNSA0MDAuNSkiPgo8c3RvcCBzdG9wLWNvbG9yPSIjMTY3N0ZGIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzE2NzdGRiIgc3RvcC1vcGFjaXR5PSIwIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+");
  background-size: contain;
  background-repeat: no-repeat;
  pointer-events: none;
  z-index: 0;
`;

export const NoticeContainer = styled.div`
  margin: 12px 20px;
  background-color: #e6f4ff;
  border: 1px solid #dfdfdf;
  border-radius: 16px;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease-in-out;
  position: relative;
  z-index: 10;
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
  transition: transform 0.2s ease-in-out;
  transform: ${({ $expanded }) => ($expanded ? "rotate(180deg)" : "rotate(0deg)")};
`;

export const NoticeBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  line-height: 1.5;
  color: #555555;
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
    color: var(--Main-Main1, #1677FF);
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
