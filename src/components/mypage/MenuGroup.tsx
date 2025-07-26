import styled from "styled-components";
import TitleLine from "./TitleLine.tsx";
import { useNavigate } from "react-router-dom";

interface MenuItem {
  label: string;
  path: string;
}

interface MenuGroupProps {
  title?: string;
  menus: MenuItem[];
}

const MenuGroup = ({ title, menus }: MenuGroupProps) => {
  const navigate = useNavigate();

  return (
    <MenuGroupWrapper>
      {title && <TitleLine title={title} />}
      {menus.map((menu, index) => (
        <MenuItem key={index} onClick={() => navigate(menu.path)}>
          {menu.label}
        </MenuItem>
      ))}
    </MenuGroupWrapper>
  );
};

export default MenuGroup;

const MenuGroupWrapper = styled.div`
  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  width: 100%;
  height: fit-content;

  gap: 20px;
`;
const MenuItem = styled.div`
  width: 100%;
  height: fit-content;
  font-size: 16px;
`;
