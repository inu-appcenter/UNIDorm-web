import styled from "styled-components";
import { OpenChatTab as OpenChatTabType } from "@/types/openchat";

interface Props {
  selectedTab: OpenChatTabType;
  onChangeTab: (tab: OpenChatTabType) => void;
  unreadCount?: number;
}

const tabs: { label: string; value: OpenChatTabType }[] = [
  { label: "내 채팅", value: "MY" },
  { label: "기숙사", value: "DORMITORY" },
  { label: "전체 방", value: "ALL" },
];

export default function OpenChatTab({ selectedTab, onChangeTab, unreadCount = 0 }: Props) {
  return (
    <TabWrapper>
      {tabs.map((tab) => (
        <TabButton
          key={tab.value}
          type="button"
          $active={selectedTab === tab.value}
          onClick={() => onChangeTab(tab.value)}
        >
          {tab.label}
          {tab.value === "MY" && unreadCount > 0 && (
            <Badge>{unreadCount > 99 ? "99+" : unreadCount}</Badge>
          )}
        </TabButton>
      ))}
    </TabWrapper>
  );
}

const TabWrapper = styled.div`
  width: 100%;
  display: flex;
  background-color: transparent;
  border-bottom: 1px solid var(--Gray-Gray200, #dfdfdf);
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  height: 40px;
  border: none;
  border-bottom: ${({ $active }) =>
    $active ? "2px solid var(--CTA-Default, #0958d9)" : "none"};
  margin-bottom: -1px; /* Overlaps TabWrapper's border-bottom */
  background-color: transparent;
  color: ${({ $active }) =>
    $active ? "var(--CTA-Default, #0958d9)" : "var(--Text-Text2, #6f6f6f)"};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 10px;
`;

const Badge = styled.span`
  position: absolute;
  top: 4px;
  left: calc(50% + 28px);
  background-color: #ff5a3d;
  color: #ffffff;
  font-size: 10px;
  font-weight: 500;
  min-width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  box-sizing: border-box;
`;
