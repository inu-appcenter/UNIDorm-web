import styled from "styled-components";

export const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #999;
  margin-bottom: 4px;
  gap: 6px;
`;

export const Dday = styled.span`
  color: #f97171;
`;

export const DividerBar = styled.span`
  color: #aaa;
`;

export const People = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  img {
    width: 14px;
    height: 14px;
  }

  color: var(--6, #8e8e93);
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 0%; /* 0 */
`;
