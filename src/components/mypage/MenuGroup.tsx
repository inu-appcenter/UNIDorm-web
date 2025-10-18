import styled from "styled-components";
import TitleLine from "./TitleLine.tsx";
import Switch from "../../components/common/Switch.tsx";

// MenuItem 인터페이스에 description 속성 추가
interface MenuItem {
  label: string;
  description?: string; // 메뉴 설명을 위한 속성
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
  const handleToggle = (menu: MenuItem, checked: boolean) => {
    if (onToggle && menu.type) {
      onToggle(menu.type, checked);
    }
  };

  return (
    <MenuGroupWrapper>
      {title && <TitleLine title={title} />}
      {menus.map((menu) => (
        <MenuLine key={menu.type || menu.label}>
          {/* 메뉴 아이템 클릭 영역을 전체로 확장 */}
          <MenuContent onClick={menu.onClick}>
            <MenuLabel>{menu.label}</MenuLabel>
            {/* description이 있을 경우에만 렌더링 */}
            {menu.description && (
              <MenuDescription>{menu.description}</MenuDescription>
            )}
          </MenuContent>
          {hasToggle && menu.checked !== undefined && (
            <Switch
              checked={menu.checked}
              onCheckedChange={(checked) => handleToggle(menu, checked)}
            />
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
`;

// 메뉴 텍스트와 설명을 감싸는 컨테이너
const MenuContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px; // 레이블과 설명 사이의 간격
  cursor: pointer;
  user-select: none;
  width: 100%;
  padding-right: 16px; // 토글 스위치와의 간격 확보

  &:hover {
    opacity: 0.7;
  }
`;

// 기존 MenuItem 스타일을 MenuLabel로 변경
const MenuLabel = styled.div`
  font-size: 18px;
`;

// 새로 추가된 메뉴 설명 스타일
const MenuDescription = styled.div`
  font-size: 14px;
  color: #8e8e93; // 회색 계열 색상
`;
