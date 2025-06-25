import styled from "styled-components";

const GroupPurchaseItem = () => {
  return (
    <GroupPurchaseItemWrapper>
      <ItemImage />
      <TitleLine>휴지 공동구매 인원 구해요</TitleLine>
      <AdditionalLine>D-1 | 3/4</AdditionalLine>
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
  /* 또는 124% */
  letter-spacing: -0.165px;

  color: #000000;
`;
const AdditionalLine = styled.div`
  width: 100%;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 21px;
  /* 상자 높이와 동일 또는 150% */
  letter-spacing: -0.165px;

  /* 서브2 */
  color: #f97171;
`;
