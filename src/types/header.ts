import { ReactNode } from "react";

/** 메뉴 아이템 인터페이스 */
export interface MenuItem {
  label: string; // 메뉴 명칭
  onClick: () => void; // 클릭 이벤트 핸들러
}

/** 헤더 설정 인터페이스 (공용) */
export interface HeaderConfig {
  title?: string; // 헤더 타이틀
  menuItems?: MenuItem[] | null; // 우측 드롭다운 메뉴
  settingOnClick?: (() => void) | null; // 설정 아이콘 클릭 핸들러
  showAlarm?: boolean; // 알림 벨 노출 여부
  secondHeader?: ReactNode | null; // 추가 헤더 영역 (탭, 검색바 등)
}
