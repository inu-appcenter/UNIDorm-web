import styled from "styled-components";
import TitleLine from "./TitleLine.tsx";
import Switch from "../../components/common/Switch.tsx";
import { mixpanelTrack } from "@/utils/mixpanel";

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
    // mixpanel 추가
    mixpanelTrack.featureClicked(
      menu.label,
      title ? `마이페이지 - ${title}` : "마이페이지",
    );
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
            <ToggleContainer onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={menu.checked}
                onCheckedChange={() => handleToggle(menu)}
              />
            </ToggleContainer>
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
  width: calc(100% + 24px);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  padding: 10px 12px;
  margin: -4px -12px;
  border-radius: 12px;
  box-sizing: border-box;

  /* 셀 탭 피드백 */
  transition: background-color 0.12s ease, transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.06);
    transform: scale(0.99);
  }
`;

const MenuContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  user-select: none;
  flex: 1;
  min-width: 0;
  padding-right: 16px;
`;

const ToggleContainer = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const MenuLabel = styled.div`
  font-size: 16px;
`;

const MenuDescription = styled.div`
  font-size: 12px;
  color: #8e8e93;
`;
