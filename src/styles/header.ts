import styled from "styled-components";

export const CategoryWrapper = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
  background-color: transparent;
  border-bottom: 1px solid var(--Gray-Gray200, #dfdfdf);

  @media (min-width: 1024px) {
    max-width: 1200px;
    margin: 0 auto;
  }
`;

export const CategoryItem = styled.div`
  flex: 1;
  text-align: center;
  font-size: 16px;
  color: var(--Text-Text2, #6f6f6f);
  cursor: pointer;
  padding: 8px 0;

  &.active {
    color: var(--CTA-Default, #0958d9);
    font-weight: 600;
    border-bottom: 2px solid var(--CTA-Default, #0958d9);
    margin-bottom: -1px;
  }
`;
