import styled from "styled-components";
import human from "../../assets/chat/human.svg";
import 기타 from "../../assets/groupPurchase/default-image/기타.webp";
import 배달 from "../../assets/groupPurchase/default-image/배달.webp";
import 생활용품 from "../../assets/groupPurchase/default-image/생활용품.webp";
import 식자재 from "../../assets/groupPurchase/default-image/식자재.webp";

import { GroupOrder } from "../../types/grouporder.ts";
import { getDeadlineText } from "../../utils/dateUtils.ts";

interface GroupPurchaseItemProps {
  groupOrder: GroupOrder;
  onClick: () => void;
}

// --- 추가: groupOrderType에 따라 기본 이미지 경로를 반환하는 함수 ---
const getDefaultImageByType = (type: string) => {
  switch (type) {
    case "배달":
      return 배달;
    case "생활용품":
      return 생활용품;
    case "식자재":
      return 식자재;
    case "기타":
    default:
      return 기타;
  }
};
// -----------------------------------------------------------------

const GroupPurchaseItem = ({ groupOrder, onClick }: GroupPurchaseItemProps) => {
  // --- 수정: 이미지가 없을 경우 groupOrderType에 맞는 기본 이미지를 사용 ---
  const hasImage = !!groupOrder.filePath;
  const imageUrl = hasImage
    ? groupOrder.filePath
    : getDefaultImageByType(groupOrder.groupOrderType);
  // ----------------------------------------------------------------------

  return (
    <GroupPurchaseItemWrapper onClick={onClick}>
      {/* --- 수정: styled-component에 props 전달 --- */}
      <ItemImage $imageUrl={imageUrl} $hasDefaultImage={!hasImage} />
      {/* ------------------------------------------- */}
      <TitleLine>{groupOrder.title}</TitleLine>
      <Price>{groupOrder.price.toLocaleString()}원</Price>
      <AdditionalLine>
        <span className="dDay">{getDeadlineText(groupOrder.deadline)}</span>
        <span className="divider">|</span>
        <span className="people">
          <img src={human} alt="인원 아이콘" />
          {groupOrder.viewCount}
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
  gap: 4px;
  width: 100%;

  cursor: pointer;
`;

// --- 추가: ItemImage가 받을 props 타입 정의 ---
interface ItemImageProps {
  $imageUrl: string;
  $hasDefaultImage: boolean;
}
// -------------------------------------------

// --- 수정: props를 받아 조건부 스타일링 적용 ---
const ItemImage = styled.div<ItemImageProps>`
  width: 100%;
  aspect-ratio: 1 / 1; /* ✅ 가로 세로 1:1 비율 유지 */
  background-image: url(${(props) => props.$imageUrl});
  background-position: center;
  background-color: #d9d9d9;
  border-radius: 10px;

  /* 기본 이미지일 경우 아이콘이 잘 보이도록 cover 대신 크기 지정 및 반복 없음 처리 */
  background-size: ${(props) => (props.$hasDefaultImage ? "40%" : "cover")};
  background-repeat: no-repeat;
`;
// ----------------------------------------------

const TitleLine = styled.div`
  /* ... (기존과 동일) ... */
  margin-top: 4px;
  width: 100%;
  //font-style: normal;
  font-weight: 500;
  font-size: 17px;
  //line-height: 21px;
  //letter-spacing: -0.165px;
  color: #000000;
`;

const Price = styled.div`
  /* ... (기존과 동일) ... */
  width: 100%;
  font-size: 16px;
  font-weight: bold;
  color: #000;
`;

const AdditionalLine = styled.div`
  /* ... (기존과 동일) ... */
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  //line-height: 21px;
  //letter-spacing: -0.165px;
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
    font-weight: normal;

    img {
      width: 14px;
      height: 14px;
    }
  }
`;
