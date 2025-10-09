import styled from "styled-components";
import TitleLine from "./TitleLine.tsx";
import Switch from "../../components/common/Switch.tsx";

// 부모에서 type과 checked 상태를 받도록 MenuItem 인터페이스 수정
interface MenuItem {
  label: string;
  type: string; // API 요청을 위한 type 추가
  checked: boolean; // 현재 상태 추가 (부모로부터 받음)
  onClick?: () => void;
}

interface MenuGroupProps {
  title?: string;
  menus: MenuItem[];
  hasToggle?: boolean;
  // onToggle의 인자를 label 대신 type과 checked로 변경 (API 요청에 type이 필요)
  onToggle?: (type: string, checked: boolean) => void;
}

// MenuGroup 컴포넌트에서 상태 관리 로직 제거
const MenuGroup = ({ title, menus, hasToggle, onToggle }: MenuGroupProps) => {
  // onToggle을 직접 호출하여 부모의 핸들러에 type과 checked 상태를 전달
  const handleToggle = (menu: MenuItem, checked: boolean) => {
    if (onToggle) {
      // label 대신 type을 전달
      onToggle(menu.type, checked);
    }
  };

  return (
    <MenuGroupWrapper>
      {title && <TitleLine title={title} />}
      {menus.map((menu) => (
        // index 대신 menu.type을 key로 사용하는 것을 권장 (선택적)
        <MenuLine key={menu.type}>
          <MenuItem onClick={menu.onClick}>{menu.label}</MenuItem>
          {hasToggle && (
            <Switch
              // 부모로부터 받은 checked 상태를 사용
              checked={menu.checked}
              // 토글 변경 시 부모 컴포넌트의 핸들러 호출
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

const MenuItem = styled.div`
  width: 100%;
  font-size: 18px;
  cursor: pointer;
  user-select: none;

  &:hover {
    opacity: 0.7;
  }
`;
