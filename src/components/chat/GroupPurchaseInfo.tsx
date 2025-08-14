import human from "../../assets/chat/human.svg";
import styled from "styled-components";

interface GroupPurchaseInfoProps {
  currentPeople?: number;
  maxPeople?: number;
  deadline?: string;
}

const GroupPurchaseInfo = ({
  currentPeople,
  maxPeople,
  deadline,
}: GroupPurchaseInfoProps) => {
  const getDDay = (deadline?: string) => {
    if (!deadline) return "D-?";
    const today = new Date();
    const end = new Date(deadline);
    const diff = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff >= 0 ? `D-${diff}` : "마감";
  };

  return (
    <GroupPurchaseInfoWrapper>
      <div className="dDay">{getDDay(deadline)}</div>
      <div className="people">
        |
        <img src={human} alt="인원 아이콘" />
        {currentPeople ?? 0}/{maxPeople ?? 0}
      </div>
    </GroupPurchaseInfoWrapper>
  );
};

export default GroupPurchaseInfo;

const GroupPurchaseInfoWrapper = styled.div`
  display: flex;
  width: fit-content;
  height: 100%;
  align-items: center;
  justify-content: center;

  //padding-left: 5px;
  gap: 5px;

  .dDay {
    font-style: normal;
    font-weight: 500;
    font-size: 10px;
    line-height: 21px;
    /* 상자 높이와 동일 또는 210% */
    letter-spacing: -0.165px;

    /* 서브2 */
    color: #f97171;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .people {
    font-style: normal;
    font-weight: 400;
    font-size: 10px;
    line-height: 12px;
    /* 상자 높이와 동일 */

    /* text/3 */
    color: #868686;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
  }
`;
