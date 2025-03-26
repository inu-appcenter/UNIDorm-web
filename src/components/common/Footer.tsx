import styled from "styled-components";

import { useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();

  return location.pathname === "/posts" || location.pathname === "/write" ? (
    <> </>
  ) : (
    <StyledFooter>
      <div className="footer-top">
        <h1>기숙사앱</h1>
        {/*<NavMenu isInFooter={true} />*/}
        <span />
      </div>
      <div className="footer-bottom"></div>
    </StyledFooter>
  );
}

const StyledFooter = styled.footer`
  margin-top: 20px;
  padding: 0 64px;
  .footer-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 4px solid #bebebe;
    padding: 8px 80px;
    h1 {
      margin: 0;
    }
  }

  .footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 80px;
    img {
      height: 32px;
    }
  }
`;
