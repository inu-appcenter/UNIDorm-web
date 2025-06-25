import styled from "styled-components";
import GroupPurchaseItem from "./GroupPurchaseItem.tsx";

const GroupPurchaseList = () => {
  return (
    <GroupPurchaseListWrapper>
      <GroupPurchaseItem />
      <GroupPurchaseItem />
      <GroupPurchaseItem />
      <GroupPurchaseItem />
      <GroupPurchaseItem />
    </GroupPurchaseListWrapper>
  );
};
export default GroupPurchaseList;

const GroupPurchaseListWrapper = styled.div`
  width: 100%;
  height: fit-content;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px; /* 아이템 간 간격 */
  justify-items: center;
`;
