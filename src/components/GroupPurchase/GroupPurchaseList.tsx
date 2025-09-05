import styled from "styled-components";
import GroupPurchaseItem from "./GroupPurchaseItem";
import { GroupOrder } from "../../types/grouporder.ts";
import { useNavigate } from "react-router-dom";


interface GroupPurchaseListProps {
  groupOrders: GroupOrder[];
}

const GroupPurchaseList = ({ groupOrders }: GroupPurchaseListProps) => {
  const navigate = useNavigate();

  return (
    <GroupPurchaseListWrapper>
      {groupOrders.map((order) => (
        <GroupPurchaseItem
          key={order.boardId}
          title={order.title}
          price={order.price}
          deadline={order.deadline}
          currentPeople={order.currentPeople}
          maxPeople={order.maxPeople}
          thumbnailUrl={order.filePath}

          onClick={()=>{
            navigate(`/groupPurchase/${order.boardId}`)
          }}

        />
      ))}
    </GroupPurchaseListWrapper>
  );
};

export default GroupPurchaseList;

const GroupPurchaseListWrapper = styled.div`
  width: 100%;
  height: fit-content;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  justify-items: center;
`;
