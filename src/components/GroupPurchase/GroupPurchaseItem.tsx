import styled from "styled-components";
import human from "../../assets/chat/human.svg";

const GroupPurchaseItem = () => {
  return (
    <GroupPurchaseItemWrapper>
      <ItemImage />
      <TitleLine>휴지 공동구매 인원 구해요</TitleLine>
      <Price>24,000원</Price>
      <AdditionalLine>
        <span className="dDay">D-1</span>
        <span className="divider">|</span>
        <span className="people">
          <img src={human} alt="인원 아이콘" />
          3/4
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
`;

const ItemImage = styled.div`
  width: 100%;
  height: 150px;
  background: rgba(0, 0, 0, 0.2);
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
