import styled from "styled-components";


export default function HomePage() {
  return (
    <HomePageWrapper>
      홈페이지입니다.
    </HomePageWrapper>
  );
}

const HomePageWrapper = styled.div`
  padding: 0 32px;
  display: flex;
  flex-direction: column;
`;

