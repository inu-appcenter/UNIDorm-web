import { createBrowserRouter, Navigate } from "react-router-dom";
import FeatureFlagGate from "@/components/common/FeatureFlagGate";
import {
  FRESHMAN_LOGIN_FEATURE_FLAG_KEY,
  FRESHMAN_MIGRATION_FEATURE_FLAG_KEY,
  FRESHMAN_SIGNUP_FEATURE_FLAG_KEY,
} from "@/constants/featureFlags";

/* 상수/경로 */
import { PATHS, isMainTabPath } from "@/constants/paths";
import { appBridge, supportsMultiWebView } from "@/utils/appBridgeAdapter";


/* 레이아웃 */
import AppInitializer from "./AppInitializer";
import RootPage from "@/pages/layouts/RootPage";
import SubPage from "@/pages/layouts/SubPage";
import OutPage from "@/pages/layouts/OutPage";

/* 페이지 - 인증/온보딩 */
import LoginPage from "@/pages/LoginPage";
import LogoutPage from "@/pages/LogoutPage";
import OnboardingPage from "@/pages/OnboardingPage";
import FreshmanLoginPage from "@/pages/FreshmanLoginPage";
import FreshmanSignupPage from "@/pages/FreshmanSignupPage";

/* 페이지 - 메인 5개 탭 (RootPage 하위) */
import HomePage from "@/pages/HomePage";
import RoomMatePage from "@/pages/RoomMate/RoomMatePage";
import GroupPurchaseMainPage from "@/pages/GroupPurchase/GroupPurchaseMainPage";
import MyPage from "@/pages/MyPage";

/* 페이지 - 서브 상세 (SubPage 하위) */
import MyInfoEditPage from "@/pages/MyPage/MyInfoEditPage";
import FreshmanMigrationPage from "@/pages/MyPage/FreshmanMigrationPage";
import AgreementPage from "@/pages/MyPage/AgreementPage";
import NotificationSettingPage from "@/pages/MyPage/NotificationSettingPage";
import MyPostsPage from "@/pages/MyPostsPage";
import MyLikesPage from "@/pages/MyLikesPage";
import NotificationPage from "@/pages/NotificationPage";
import CalendarPage from "@/pages/CalendarPage";
import PortalDormitoryPage from "@/pages/Dormitory/PortalDormitoryPage";
import DormitoryCardPage from "@/pages/Dormitory/DormitoryCardPage";
import PortalAccountPage from "@/pages/MyPage/PortalAccountPage";

import MyRoomMatePage from "@/pages/RoomMate/MyRoomMatePage";
import RoomMateListPage from "@/pages/RoomMate/RoomMateListPage";
import RoomMateBoardDetailPage from "@/pages/RoomMate/RoomMateBoardDetailPage";
import RoomMateFilterPage from "@/pages/RoomMate/RoomMateFilterPage";
import RoomMateChecklistPage from "@/pages/RoomMate/RoomMateChecklistPage";
import RoomMateAddPage from "@/pages/RoomMate/RoomMateAddPage";

/*OpenCHAT*/
import OpenChatPage from "@/pages/Chat/openChatPage";
import OpenChatCreatePage from "../pages/Chat/OpenChatCreatePage";
import OpenChatEditPage from "../pages/Chat/OpenChatEditPage";
import ChattingPage from "@/pages/Chat/ChattingPage";
import ChatMembersPage from "@/pages/Chat/ChatMembersPage";
import ChatNotificationSettingsPage from "@/pages/Chat/ChatNotificationSettingsPage";
import BlockListPage from "@/pages/Chat/BlockListPage";

import GroupPurchasePostPage from "@/pages/GroupPurchase/GroupPurchasePostPage";
import GroupPurchaseWritePage from "@/pages/GroupPurchase/GroupPurchaseWritePage";
import KeywordAlertSettingPage from "@/pages/GroupPurchase/KeywordAlertSettingPage";

import NotificationBoardPage from "@/pages/Announcement/AnnouncementPage";
import AnnounceDetailPage from "@/pages/Announcement/AnnounceDetailPage";
import TipListPage from "@/pages/Tip/TipListPage";
import TipWritePage from "@/pages/Tip/TipWritePage";
import TipDetailPage from "@/pages/Tip/TipDetailPage";

import ComplainListPage from "@/pages/Complain/ComplainListPage";
import ComplainDetailPage from "@/pages/Complain/ComplainDetailPage";
import ComplainWritePage from "@/pages/Complain/ComplainWritePage";
import FormListPage from "@/pages/Form/FormListPage";
import FormDetailPage from "@/pages/Form/FormDetailPage";

/* 페이지 - 관리자 */
import AdminMainPage from "@/pages/Admin/AdminMainPage";
import CalendarAdminPage from "@/pages/Admin/CalendarAdminPage";
import AnnounceWritePage from "@/pages/Admin/AnnounceWritePage";
import ComplainAdminPage from "@/pages/Admin/ComplainAdminPage";
import ComplainAnswerWritePage from "@/pages/Admin/ComplainAnswerWritePage";
import PopupNotiListPage from "@/pages/Admin/PopupNotiListPage";
import PopupNotiCreatePage from "@/pages/Admin/PopupNotiFormPage";
import CreateNotificationPage from "@/pages/Admin/CreateNotificationPage";
import FormCreatePage from "@/pages/Admin/FormCreatePage";
import FormResultPage from "@/pages/Admin/FormResultPage";
import FCMPage from "@/pages/Admin/FCMPage";
import FeatureFlagManagePage from "@/pages/Admin/FeatureFlagManagePage";
import RoomMateFindSettingPage from "@/pages/RoomMate/RoomMateFindSettingPage";
import DebugLogPage from "@/pages/MyPage/DebugLogPage";
import SettingsPage from "@/pages/MyPage/SettingsPage";
import StatisticsPage from "@/pages/Admin/StatisticsPage";
import OpenChatReportAdminPage from "@/pages/Admin/OpenChatReportAdminPage";
import OpenChatBotPage from "@/pages/Admin/OpenChatBotPage";
import OpenChatAdminPage from "@/pages/Admin/OpenChatAdminPage";

export const router = createBrowserRouter([
  {
    path: PATHS.ROOT,
    element: <AppInitializer />,
    children: [
      /* 1. OutPage: 헤더/바텀바 없음 */
      {
        element: <OutPage />,
        children: [
          { index: true, element: <Navigate to="/home" replace /> },
          { path: "logout", element: <LogoutPage /> },
          { path: "onboarding", element: <OnboardingPage /> },
        ],
      },

      /* 2. RootPage: 하단 탭바 노출 (메인 5개 탭 전용) */
      {
        element: <RootPage />,
        children: [
          { path: "home", element: <HomePage /> },
          { path: "roommate", element: <RoomMatePage /> },
          { path: "roommate/my", element: <MyRoomMatePage /> },
          { path: "groupPurchase", element: <GroupPurchaseMainPage /> },
          { path: "chat", element: <OpenChatPage /> },
          { path: "complain", element: <ComplainListPage /> },
          { path: "mypage", element: <MyPage /> },
        ],
      },

      /* 3. SubPage: 상세 페이지 (바텀바 숨김, 뒤로가기 헤더 노출) */
      {
        element: <SubPage />,
        children: [
          {
            path: "login",
            children: [
              { path: "", element: <LoginPage /> }, // 기본 /login 경로
              {
                path: "freshman",
                element: (
                  <FeatureFlagGate flagKey={FRESHMAN_LOGIN_FEATURE_FLAG_KEY}>
                    <FreshmanLoginPage />
                  </FeatureFlagGate>
                ),
              },
              {
                path: "freshman/signup",
                element: (
                  <FeatureFlagGate
                    flagKey={FRESHMAN_SIGNUP_FEATURE_FLAG_KEY}
                    fallbackPath={PATHS.FRESHMAN_LOGIN}
                  >
                    <FreshmanSignupPage />
                  </FeatureFlagGate>
                ),
              },
            ],
          },
          {
            path: "agreement",
            element: <AgreementPage />,
          },
        ],
      },

      {
        children: [
          // 마이페이지 서브
          {
            path: "myinfoedit",
            element: <SubPage />,
            children: [
              { index: true, element: <MyInfoEditPage /> },
              {
                path: "freshman-migration",
                element: (
                  <FeatureFlagGate
                    flagKey={FRESHMAN_MIGRATION_FEATURE_FLAG_KEY}
                    fallbackPath={PATHS.MYINFO_EDIT}
                  >
                    <FreshmanMigrationPage />
                  </FeatureFlagGate>
                ),
              },
            ],
          },

          {
            path: "notification-setting",
            element: <SubPage />,
            children: [{ index: true, element: <NotificationSettingPage /> }],
          },
          {
            path: "myposts",
            element: <SubPage />,
            children: [{ index: true, element: <MyPostsPage /> }],
          },
          {
            path: "liked",
            element: <SubPage />,
            children: [{ index: true, element: <MyLikesPage /> }],
          },
          {
            path: "settings",
            element: <SubPage />,
            children: [
              { index: true, element: <SettingsPage /> },
              { path: "logs", element: <DebugLogPage /> },
            ],
          },

          // 룸메이트 상세
          {
            path: "roommate",
            element: <SubPage />,
            children: [
              { path: "list", element: <RoomMateListPage /> },
              { path: "list/:boardId", element: <RoomMateBoardDetailPage /> },
              { path: "filter", element: <RoomMateFilterPage /> },
              { path: "checklist", element: <RoomMateChecklistPage /> },
              { path: "add", element: <RoomMateAddPage /> },
              { path: "find/settings", element: <RoomMateFindSettingPage /> },
            ],
          },

          // 채팅 상세
          {
            path: "chat",
            element: <SubPage />,
            children: [
              { path: "open/create", element: <OpenChatCreatePage /> },
              { path: "open/:id/edit", element: <OpenChatEditPage /> },
              { path: "blocked", element: <BlockListPage /> },
              { path: ":chatType/:id", element: <ChattingPage /> },
              { path: ":chatType/:id/members", element: <ChatMembersPage /> },
              {
                path: ":chatType/:id/notifications",
                element: <ChatNotificationSettingsPage />,
              },
            ],
          },

          // 공동구매 상세
          {
            path: "groupPurchase",
            element: <SubPage />,
            children: [
              { path: ":boardId", element: <GroupPurchasePostPage /> },
              { path: "write", element: <GroupPurchaseWritePage /> },
              { path: "keywordSetting", element: <KeywordAlertSettingPage /> },
            ],
          },

          // 공지사항, 팁, 민원, 폼, 알림, 일정
          {
            path: "announcements",
            element: <SubPage />,
            children: [
              { index: true, element: <NotificationBoardPage /> },
              { path: ":boardId", element: <AnnounceDetailPage /> },
              { path: "write", element: <AnnounceWritePage /> },
            ],
          },
          {
            path: "tips",
            element: <SubPage />,
            children: [
              { index: true, element: <TipListPage /> },
              { path: "write", element: <TipWritePage /> },
              { path: ":boardId", element: <TipDetailPage /> },
            ],
          },
          {
            path: "complain",
            element: <SubPage />,
            children: [
              { path: ":complainId", element: <ComplainDetailPage /> },
              { path: "write", element: <ComplainWritePage /> },
            ],
          },
          {
            path: "form",
            element: <SubPage />,
            children: [
              { index: true, element: <FormListPage /> },
              { path: ":formId", element: <FormDetailPage /> },
            ],
          },
          {
            path: "notification",
            element: <SubPage />,
            children: [{ index: true, element: <NotificationPage /> }],
          },
          {
            path: "calendar",
            element: <SubPage />,
            children: [{ index: true, element: <CalendarPage /> }],
          },
          {
            path: "mypage",
            element: <SubPage />,
            children: [{ path: "portal", element: <PortalAccountPage /> }],
          },
          {
            path: "dormitory",
            element: <SubPage />,
            children: [
              { path: "info", element: <PortalDormitoryPage /> },
              { path: "card", element: <DormitoryCardPage /> },
            ],
          },

          // 관리자
          {
            path: "admin",
            element: <SubPage />,
            children: [
              { index: true, element: <AdminMainPage /> },
              { path: "calendar", element: <CalendarAdminPage /> },
              { path: "complain", element: <ComplainAdminPage /> },
              {
                path: "complain/answer/:complainId",
                element: <ComplainAnswerWritePage />,
              },
              { path: "popup-notifications", element: <PopupNotiListPage /> },
              {
                path: "popup-notifications/create",
                element: <PopupNotiCreatePage />,
              },
              {
                path: "popup-notifications/edit/:popupNotificationId",
                element: <PopupNotiCreatePage />,
              },
              {
                path: "notification/create",
                element: <CreateNotificationPage />,
              },
              { path: "form/create", element: <FormCreatePage /> },
              { path: "form/:formId/result", element: <FormResultPage /> },
              { path: "fcm", element: <FCMPage /> },
              { path: "feature-flag", element: <FeatureFlagManagePage /> },
              { path: "statistics", element: <StatisticsPage /> },
              {
                path: "open-chat-reports",
                element: <OpenChatReportAdminPage />,
              },
              { path: "open-chat-bot", element: <OpenChatBotPage /> },
              { path: "open-chat-rooms", element: <OpenChatAdminPage /> },
            ],
          },
        ],
      },
      // 404 / 알 수 없는 라우트 처리 (루트 라우트로 리다이렉트)
      {
        path: "*",
        element: <Navigate to={PATHS.ROOT} replace />,
      },
    ],
  },
]);

function getPathname(to: any): string {
  if (!to) return "";
  if (typeof to === "string") {
    return to.split("?")[0].split("#")[0];
  }
  if (typeof to === "object" && to !== null) {
    return to.pathname || "";
  }
  return "";
}

if (typeof window !== "undefined") {
  const originalNavigate = router.navigate;

  (router as any).navigate = function (to: any, opts?: any) {
    // 1. 숫자가 전달된 경우 (뒤로가기)
    if (typeof to === "number") {
      if (to === -1 && supportsMultiWebView()) {
        appBridge.requestBack();
        return Promise.resolve();
      }
      return (originalNavigate as any).call(router, to, opts);
    }

    const path = getPathname(to);
    const isTabNavigation = opts?.state?.isTabNavigation === true;
    const isHomePath = path === PATHS.HOME || path === PATHS.ROOT;
    const isBootstrapRedirect = window.location.pathname === "/" && isHomePath;

    // 단순 해시(#)나 쿼리(?)만 변경하는 라우팅이거나 빈 이동인지 확인
    const isHashOrSearchOnly =
      to === "" ||
      (typeof to === "string" && (to.startsWith("#") || to.startsWith("?"))) ||
      (typeof to === "object" && to !== null && !to.pathname);
    const isSamePath = window.location.pathname === path;
    const isCurrentInMainTab = isMainTabPath(window.location.pathname);

    // 2. 메인 탭 경로 이동:
    // - 서브 웹뷰(pushed webview)에서 메인 탭으로 복귀하는 경우 네이티브 스택 닫기 신호(goHome)를 발송하고,
    // - 루트 웹뷰(로그인, 온보딩 등에서 /home 이동)에서도 SPA 이동이 정상 진행되도록 originalNavigate를 항상 함께 실행
    if (
      supportsMultiWebView() &&
      isMainTabPath(path) &&
      !isCurrentInMainTab &&
      !isTabNavigation &&
      !isBootstrapRedirect &&
      !isSamePath &&
      !isHashOrSearchOnly
    ) {
      appBridge.goHome(path);
      return (originalNavigate as any).call(router, to, opts);
    }

    // 3. 신규 멀티 웹뷰 환경이고 메인 탭이 아니며, 탭 이동 옵션도 없는 경우 -> 새 웹뷰 액티비티로 오픈
    if (
      supportsMultiWebView() &&
      !isMainTabPath(path) &&
      !isTabNavigation &&
      !opts?.replace &&
      !isHashOrSearchOnly
    ) {
      const fullPath =
        typeof to === "string"
          ? to
          : `${to.pathname || ""}${to.search || ""}${to.hash || ""}`;
      appBridge.navigateTo(fullPath);
      return Promise.resolve(); // 현재 웹뷰에서의 SPA 라우팅을 수행하지 않음
    }

    return (originalNavigate as any).call(router, to, opts);
  };
}

