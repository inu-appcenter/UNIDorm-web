import styled from "styled-components";

export const RecentSearchWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Label = styled.div`
  color: #636366;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0.38px;
`;

export const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Tag = styled.div`
  background-color: #e7e7e7;
  border-radius: 20px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 8px;

  color: var(--1, #1c1c1e);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px; /* 171.429% */
  letter-spacing: 0.38px;
`;

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
`;
