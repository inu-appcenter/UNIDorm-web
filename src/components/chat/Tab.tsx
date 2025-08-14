import styled from "styled-components";

interface TabProps {
  tabItems: string[];
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}
const Tab = ({ tabItems, selectedTab, setSelectedTab }: TabProps) => {
  return (
    <TabWrapper>
      {tabItems.map((item) => (
        <TabButton
          key={item}
          $isactive={selectedTab === item}
          onClick={() => setSelectedTab(item)}
        >
          <TabTitle $isactive={selectedTab === item}>{item}</TabTitle>
        </TabButton>
      ))}
    </TabWrapper>
  );
};

export default Tab;

// Props 타입 정의
const TabWrapper = styled.div`
  width: 100%;
  height: fit-content;

  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;

const TabButton = styled.div<{ $isactive: boolean }>`
  padding: 10px 20px;
  cursor: pointer;
  flex: 1;

  display: flex;
  justify-content: center;
  align-items: center;

  border-bottom: ${(props) =>
    props.$isactive ? "1px solid #000" : "1px solid #C6C6CD"};
`;

const TabTitle = styled.div<{ $isactive: boolean }>`
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  text-align: center;
  letter-spacing: 0.38px;

  color: ${(props) => (props.$isactive ? "#000000" : "#8E8E93")};
`;
