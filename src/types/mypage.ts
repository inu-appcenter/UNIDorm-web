// menuTypes.ts
export interface MenuItem {
  label: string;
  onClick: () => void; // 단일 방식으로 통일
}

export interface MenuGroup {
  title?: string;
  menus: MenuItem[];
}
