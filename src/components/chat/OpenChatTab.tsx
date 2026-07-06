import styled from "styled-components";
import { OpenChatTab as OpenChatTabType } from "@/types/openchat";

interface Props {
  selectedTab: OpenChatTabType;
  onChangeTab: (tab: OpenChatTabType) => void;
}

const tabs: { label: string; value: OpenChatTabType }[] = [
  { label: "내 채팅방", value: "MY" },
  { label: "내 기숙사", value: "DORMITORY" },
  { label: "전체 방", value: "ALL" },
];

export default function OpenChatTab({ selectedTab, onChangeTab }: Props) {
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
        </TabButton>
      ))}
    </TabWrapper>
  );
}

const TabWrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 8px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  height: 34px;
  border: 1px solid ${({ $active }) => ($active ? "#2563EB" : "#d8dde8")};
  border-radius: 999px;
  background-color: #ffffff;
  color: ${({ $active }) => ($active ? "#2563EB" : "#8a93a3")};
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
`;
