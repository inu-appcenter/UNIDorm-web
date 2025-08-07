import styled from "styled-components";

const TagIconWhiteBackground = ({ tagTitle }: { tagTitle: string }) => {
  return <TagIconWrapper>{tagTitle}</TagIconWrapper>;
};

export default TagIconWhiteBackground;

const TagIconWrapper = styled.div`
  /* Frame 10 */

  box-sizing: border-box;
  width: fit-content;
  height: fit-content;

  /* 오토레이아웃 */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 4px 8px;
  gap: 10px;

  border-radius: 16px;
  border: 1px solid #0a84ff;

  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  //line-height: 24px;
  //letter-spacing: 0.38px;

  color: #0a84ff;
`;
