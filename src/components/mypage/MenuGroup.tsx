import styled from "styled-components";
import TitleLine from "./TitleLine.tsx";

interface MenuItem {
  label: string;
  onClick: () => void;
}

interface MenuGroupProps {
  title?: string;
  menus: MenuItem[];
}

const MenuGroup = ({ title, menus }: MenuGroupProps) => {
  return (
    <MenuGroupWrapper>
      {title && <TitleLine title={title} />}
      {menus.map((menu, index) => (
        <MenuItem key={index} onClick={menu.onClick}>
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
  cursor: pointer;
`;
