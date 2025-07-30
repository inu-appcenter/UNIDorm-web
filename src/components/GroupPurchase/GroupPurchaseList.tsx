import styled from "styled-components";
import GroupPurchaseItem from "./GroupPurchaseItem";
import { useEffect, useState } from "react";
import axiosInstance from "../../apis/axiosInstance";

interface GroupOrder {
  id: number;
  title: string;
  filePath: string;
  deadline: string;
  price: number;
  currentPeople: number;
  maxPeople: number;
}

const GroupPurchaseList = () => {
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);

  useEffect(() => {
    const fetchGroupOrders = async () => {
      try {
        const res = await axiosInstance.get("/group-orders");
        setGroupOrders(res.data);
      } catch (err) {
        console.error("공동구매 목록 불러오기 실패", err);
      }
    };

    fetchGroupOrders();
  }, []);

  return (
    <GroupPurchaseListWrapper>
      {groupOrders.map((order) => (
        <GroupPurchaseItem
          key={order.id}
          title={order.title}
          price={order.price}
          deadline={order.deadline}
          currentPeople={order.currentPeople}
          maxPeople={order.maxPeople}
          thumbnailUrl={order.filePath}
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
