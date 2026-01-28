import styled from "styled-components";
import TitleLine from "./TitleLine.tsx";
import Switch from "../../components/common/Switch.tsx";

interface MenuItem {
  label: string;
  description?: string;
  type?: string;
  checked?: boolean;
  onClick?: () => void;
}

interface MenuGroupProps {
  title?: string;
  menus: MenuItem[];
  hasToggle?: boolean;
  onToggle?: (type: string, checked: boolean) => void;
}

const MenuGroup = ({ title, menus, hasToggle, onToggle }: MenuGroupProps) => {
  const handleToggle = (menu: MenuItem) => {
    // 토글 상태 변경 실행
    if (hasToggle && onToggle && menu.type && menu.checked !== undefined) {
      onToggle(menu.type, !menu.checked);
    }
    // 추가 정의된 onClick 실행
    if (menu.onClick) {
      menu.onClick();
    }
  };

  return (
    <MenuGroupWrapper>
      {title && <TitleLine title={title} />}
      {menus.map((menu) => (
        <MenuLine
          key={menu.type || menu.label}
          onClick={() => handleToggle(menu)}
        >
          <MenuContent>
            <MenuLabel>{menu.label}</MenuLabel>
            {menu.description && (
              <MenuDescription>{menu.description}</MenuDescription>
            )}
          </MenuContent>
          {hasToggle && menu.checked !== undefined && (
            <div onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={menu.checked}
                onCheckedChange={() => handleToggle(menu)}
              />
            </div>
          )}
        </MenuLine>
      ))}
    </MenuGroupWrapper>
  );
};

export default MenuGroup;

const MenuGroupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 20px;
`;

const MenuLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  cursor: pointer; /* 라인 전체 클릭 가능 표시 */

  &:hover {
    opacity: 0.7;
  }
`;

const MenuContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  user-select: none;
  width: 100%;
  padding-right: 16px;
`;

const MenuLabel = styled.div`
  font-size: 16px;
`;

const MenuDescription = styled.div`
  font-size: 12px;
  color: #8e8e93;
`;
