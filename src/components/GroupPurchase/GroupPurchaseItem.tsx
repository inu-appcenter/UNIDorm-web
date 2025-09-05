import styled from "styled-components";
import human from "../../assets/chat/human.svg";

interface Props {
  title: string;
  price: number;
  deadline: string;
  currentPeople: number;
  maxPeople: number;
  thumbnailUrl: string;
  onClick: () => void;
}

const GroupPurchaseItem = ({
  title,
  price,
  deadline,
  currentPeople,
  maxPeople,
  thumbnailUrl,
  onClick,
}: Props) => {
  const getDDay = (deadline: string) => {
    const today = new Date();
    const end = new Date(deadline);
    const diff = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff >= 0 ? `D-${diff}` : "마감";
  };

  return (
    <GroupPurchaseItemWrapper onClick={onClick}>
      <ItemImage style={{ backgroundImage: `url(${thumbnailUrl})` }} />
      <TitleLine>{title}</TitleLine>
      <Price>{price.toLocaleString()}원</Price>
      <AdditionalLine>
        <span className="dDay">{getDDay(deadline)}</span>
        <span className="divider">|</span>
        <span className="people">
          <img src={human} alt="인원 아이콘" />
          {currentPeople}/{maxPeople}
        </span>
      </AdditionalLine>
    </GroupPurchaseItemWrapper>
  );
};

export default GroupPurchaseItem;

const GroupPurchaseItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: fit-content;
  gap: 10px;
  width: 150px;
  
  cursor: pointer;
`;

const ItemImage = styled.div`
  width: 100%;
  height: 150px;
  background-size: cover;
  background-position: center;
  background-color: #eee;
  border-radius: 10px;
`;

const TitleLine = styled.div`
  width: 100%;
  font-style: normal;
  font-weight: 500;
  font-size: 17px;
  line-height: 21px;
  letter-spacing: -0.165px;
  color: #000000;
`;

const Price = styled.div`
  width: 100%;
  font-size: 16px;
  font-weight: bold;
  color: #000;
`;

const AdditionalLine = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 21px;
  letter-spacing: -0.165px;
  color: #666;

  .dDay {
    color: #f97171;
  }

  .divider {
    color: #aaa;
  }

  .people {
    display: flex;
    align-items: center;
    gap: 4px;

    img {
      width: 14px;
      height: 14px;
    }
  }
`;
