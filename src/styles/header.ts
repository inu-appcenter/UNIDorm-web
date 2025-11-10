import styled from "styled-components";

export const CategoryWrapper = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
  border-bottom: 1px solid silver;

  @media (min-width: 1024px) {
    max-width: 1200px;
    margin: 0 auto;
  }
`;

export const CategoryItem = styled.div`
  flex: 1;
  text-align: center;
  font-size: 16px;
  color: #aaa;
  cursor: pointer;
  padding: 6px 0;

  &.active {
    color: black;
    font-weight: bold;
    border-bottom: 2px solid black;
    padding-bottom: 2px;
  }
`;
