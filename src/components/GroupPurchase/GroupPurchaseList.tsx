// src/components/GroupPurchase/GroupPurchaseList.tsx
import styled from "styled-components";
import { GroupOrderItem } from "../../apis/groupPurchase";

interface Props {
  items: GroupOrderItem[];
}

export default function GroupPurchaseList({ items }: Props) {
  if (!items?.length) return <Empty>조건에 맞는 공동구매가 없어요.</Empty>;

  return (
    <List>
      {items.map((it) => (
        <Card key={it.boardId}>
          <Thumb src={fullImageUrl(it.filePath)} alt={it.title} />
          <Info>
            <Title>{it.title}</Title>
            <Meta>
              <span>{it.type}</span>
              <span>마감: {formatDeadline(it.deadline)}</span>
            </Meta>
            <Progress>
              참여 {it.currentPeople}/{it.maxPeople}명
            </Progress>
            <Price>{formatPrice(it.price)}</Price>
          </Info>
        </Card>
      ))}
    </List>
  );
}

function fullImageUrl(path?: string) {
  if (!path) return "/no-image.png";
  if (path.startsWith("http")) return path;
  const BASE = import.meta.env.VITE_API_BASE_URL ?? "";
  return `${BASE}${path}`;
}

function formatDeadline(deadline: string) {
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return deadline || "-";
  const leftDays = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (leftDays < 0) return "마감";
  if (leftDays === 0) return "D-Day";
  return `D-${leftDays}`;
}

function formatPrice(n: number) {
  if (n == null) return "";
  return n.toLocaleString("ko-KR") + "원";
}

/* styles */
const List = styled.div`
  display: grid;
  gap: 12px;
`;

const Card = styled.div`
  display: flex;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
`;

const Thumb = styled.img`
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: 8px;
  background: #eee;
`;

const Info = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Title = styled.div`
  font-weight: 700;
  line-height: 1.2;
`;

const Meta = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 8px;
`;

const Progress = styled.div`
  font-size: 13px;
  color: #333;
`;

const Price = styled.div`
  margin-top: auto;
  font-weight: 800;
`;
const Empty = styled.div`
  padding: 24px;
  text-align: center;
  color: #777;
`;
