import styled from "styled-components";

export default function Nav() {
  // const navigate = useNavigate();

  return <StyledNav></StyledNav>;
}

const StyledNav = styled.nav`
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  img {
    width: 220px;
  }
`;
