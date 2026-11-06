import { lazy } from "react";
import { createBrowserRouter, Navigate, useParams } from "react-router-dom";
import { resolveNavigationTarget } from "@/utils/navigation";
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
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const LogoutPage = lazy(() => import("@/pages/LogoutPage"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const FreshmanLoginPage = lazy(() => import("@/pages/FreshmanLoginPage"));
const FreshmanSignupPage = lazy(() => import("@/pages/FreshmanSignupPage"));

/* 페이지 - 메인 5개 탭 (RootPage 하위) */
const HomePage = lazy(() => import("@/pages/HomePage"));
const RoomMatePage = lazy(() => import("@/pages/RoomMate/RoomMatePage"));
const GroupPurchaseMainPage = lazy(() => import("@/pages/GroupPurchase/GroupPurchaseMainPage"));
const MyPage = lazy(() => import("@/pages/MyPage"));

/* 페이지 - 서브 상세 (SubPage 하위) */
const MyInfoEditPage = lazy(() => import("@/pages/MyPage/MyInfoEditPage"));
const FreshmanMigrationPage = lazy(() => import("@/pages/MyPage/FreshmanMigrationPage"));
const AgreementPage = lazy(() => import("@/pages/MyPage/AgreementPage"));
const NotificationSettingPage = lazy(() => import("@/pages/MyPage/NotificationSettingPage"));
const MyPostsPage = lazy(() => import("@/pages/MyPostsPage"));
const MyLikesPage = lazy(() => import("@/pages/MyLikesPage"));
const NotificationPage = lazy(() => import("@/pages/NotificationPage"));
const CalendarPage = lazy(() => import("@/pages/CalendarPage"));
const PortalDormitoryPage = lazy(() => import("@/pages/Dormitory/PortalDormitoryPage"));
const DormitoryCardPage = lazy(() => import("@/pages/Dormitory/DormitoryCardPage"));
const PortalAccountPage = lazy(() => import("@/pages/MyPage/PortalAccountPage"));

const MyRoomMatePage = lazy(() => import("@/pages/RoomMate/MyRoomMatePage"));
const RoomMateListPage = lazy(() => import("@/pages/RoomMate/RoomMateListPage"));
const RoomMateBoardDetailPage = lazy(() => import("@/pages/RoomMate/RoomMateBoardDetailPage"));
const RoomMateFilterPage = lazy(() => import("@/pages/RoomMate/RoomMateFilterPage"));
const RoomMateChecklistPage = lazy(() => import("@/pages/RoomMate/RoomMateChecklistPage"));
const RoomMateAddPage = lazy(() => import("@/pages/RoomMate/RoomMateAddPage"));

/*OpenCHAT*/
const OpenChatPage = lazy(() => import("@/pages/Chat/openChatPage"));
const OpenChatCreatePage = lazy(() => import("@/pages/Chat/OpenChatCreatePage"));
const OpenChatEditPage = lazy(() => import("@/pages/Chat/OpenChatEditPage"));
const ChattingPage = lazy(() => import("@/pages/Chat/ChattingPage"));
const ChatMembersPage = lazy(() => import("@/pages/Chat/ChatMembersPage"));
const ChatNotificationSettingsPage = lazy(() => import("@/pages/Chat/ChatNotificationSettingsPage"));
const BlockListPage = lazy(() => import("@/pages/Chat/BlockListPage"));

const GroupPurchasePostPage = lazy(() => import("@/pages/GroupPurchase/GroupPurchasePostPage"));
const GroupPurchaseWritePage = lazy(() => import("@/pages/GroupPurchase/GroupPurchaseWritePage"));
const KeywordAlertSettingPage = lazy(() => import("@/pages/GroupPurchase/KeywordAlertSettingPage"));

const NotificationBoardPage = lazy(() => import("@/pages/Announcement/AnnouncementPage"));
const AnnounceDetailPage = lazy(() => import("@/pages/Announcement/AnnounceDetailPage"));
const TipListPage = lazy(() => import("@/pages/Tip/TipListPage"));
const TipWritePage = lazy(() => import("@/pages/Tip/TipWritePage"));
const TipDetailPage = lazy(() => import("@/pages/Tip/TipDetailPage"));

const ComplainListPage = lazy(() => import("@/pages/Complain/ComplainListPage"));
const ComplainDetailPage = lazy(() => import("@/pages/Complain/ComplainDetailPage"));
const ComplainWritePage = lazy(() => import("@/pages/Complain/ComplainWritePage"));
const FormListPage = lazy(() => import("@/pages/Form/FormListPage"));
const FormDetailPage = lazy(() => import("@/pages/Form/FormDetailPage"));

/* 페이지 - 관리자 */
const AdminMainPage = lazy(() => import("@/pages/Admin/AdminMainPage"));
const CalendarAdminPage = lazy(() => import("@/pages/Admin/CalendarAdminPage"));
const AnnounceWritePage = lazy(() => import("@/pages/Admin/AnnounceWritePage"));
const ComplainAdminPage = lazy(() => import("@/pages/Admin/ComplainAdminPage"));
const ComplainAnswerWritePage = lazy(() => import("@/pages/Admin/ComplainAnswerWritePage"));
const PopupNotiListPage = lazy(() => import("@/pages/Admin/PopupNotiListPage"));
const PopupNotiCreatePage = lazy(() => import("@/pages/Admin/PopupNotiFormPage"));
const CreateNotificationPage = lazy(() => import("@/pages/Admin/CreateNotificationPage"));
const FormCreatePage = lazy(() => import("@/pages/Admin/FormCreatePage"));
const FormResultPage = lazy(() => import("@/pages/Admin/FormResultPage"));
const FCMPage = lazy(() => import("@/pages/Admin/FCMPage"));
const FeatureFlagManagePage = lazy(() => import("@/pages/Admin/FeatureFlagManagePage"));
const RoomMateFindSettingPage = lazy(() => import("@/pages/RoomMate/RoomMateFindSettingPage"));
const DebugLogPage = lazy(() => import("@/pages/MyPage/DebugLogPage"));
const SettingsPage = lazy(() => import("@/pages/MyPage/SettingsPage"));
const StatisticsPage = lazy(() => import("@/pages/Admin/StatisticsPage"));
const OpenChatReportAdminPage = lazy(() => import("@/pages/Admin/OpenChatReportAdminPage"));
const OpenChatBotPage = lazy(() => import("@/pages/Admin/OpenChatBotPage"));
const OpenChatAdminPage = lazy(() => import("@/pages/Admin/OpenChatAdminPage"));

function ChattingPageRoute() {
  const { chatType, id } = useParams();
  return <ChattingPage key={`${chatType}-${id}`} />;
}

function RootIndexRedirect() {
  const firstVisit =
    typeof window !== "undefined"
      ? localStorage.getItem("isFirstVisit(10.20)")
      : "false";

  if (firstVisit === null) {
    return <Navigate to={PATHS.ONBOARDING} replace />;
  }

  return <Navigate to={PATHS.HOME} replace />;
}

export const router = createBrowserRouter([
  {
    path: PATHS.ROOT,
    element: <AppInitializer />,
    children: [
      /* 1. OutPage: 헤더/바텀바 없음 */
      {
        element: <OutPage />,
        children: [
          { index: true, element: <RootIndexRedirect /> },
          { path: "logout", element: <LogoutPage />, handle: { bg: "white" } },
          { path: "onboarding", element: <OnboardingPage />, handle: { bg: "white" } },
        ],
      },

      /* 2. RootPage: 하단 탭바 노출 (메인 5개 탭 전용) */
      {
        element: <RootPage />,
        children: [
          { path: "home", element: <HomePage />, handle: { bg: "gray" } },
          { path: "roommate", element: <RoomMatePage />, handle: { bg: "gray" } },
          { path: "roommate/my", element: <MyRoomMatePage />, handle: { bg: "gray" } },
          { path: "groupPurchase", element: <GroupPurchaseMainPage />, handle: { bg: "gray" } },
          { path: "chat", element: <OpenChatPage />, handle: { bg: "white" } },
          { path: "complain", element: <ComplainListPage />, handle: { bg: "gray" } },
          { path: "mypage", element: <MyPage />, handle: { bg: "gray" } },
        ],
      },

      /* 3. SubPage: 상세 페이지 (바텀바 숨김, 뒤로가기 헤더 노출) */
      {
        element: <SubPage />,
        children: [
          {
            path: "login",
            children: [
              { path: "", element: <LoginPage />, handle: { bg: "white" } }, // 기본 /login 경로
              {
                path: "freshman",
                element: (
                  <FeatureFlagGate flagKey={FRESHMAN_LOGIN_FEATURE_FLAG_KEY}>
                    <FreshmanLoginPage />
                  </FeatureFlagGate>
                ),
                handle: { bg: "white" },
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
                handle: { bg: "white" },
              },
            ],
          },
          {
            path: "agreement",
            element: <AgreementPage />,
            handle: { bg: "gray" },
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
              { index: true, element: <MyInfoEditPage />, handle: { bg: "gray" } },
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
                handle: { bg: "white" },
              },
            ],
          },

          {
            path: "notification-setting",
            element: <SubPage />,
            children: [{ index: true, element: <NotificationSettingPage />, handle: { bg: "gray" } }],
          },
          {
            path: "myposts",
            element: <SubPage />,
            children: [{ index: true, element: <MyPostsPage />, handle: { bg: "gray" } }],
          },
          {
            path: "liked",
            element: <SubPage />,
            children: [{ index: true, element: <MyLikesPage />, handle: { bg: "gray" } }],
          },
          {
            path: "settings",
            element: <SubPage />,
            children: [
              { index: true, element: <SettingsPage />, handle: { bg: "gray" } },
              { path: "logs", element: <DebugLogPage />, handle: { bg: "gray" } },
            ],
          },

          // 룸메이트 상세
          {
            path: "roommate",
            element: <SubPage />,
            children: [
              { path: "list", element: <RoomMateListPage />, handle: { bg: "gray" } },
              { path: "list/:boardId", element: <RoomMateBoardDetailPage />, handle: { bg: "gray" } },
              { path: "filter", element: <RoomMateFilterPage />, handle: { bg: "gray" } },
              { path: "checklist", element: <RoomMateChecklistPage />, handle: { bg: "gray" } },
              { path: "add", element: <RoomMateAddPage />, handle: { bg: "gray" } },
              { path: "find/settings", element: <RoomMateFindSettingPage />, handle: { bg: "gray" } },
            ],
          },

          // 채팅 상세
          {
            path: "chat",
            element: <SubPage />,
            children: [
              { path: "open/create", element: <OpenChatCreatePage />, handle: { bg: "white" } },
              { path: "open/:id/edit", element: <OpenChatEditPage />, handle: { bg: "white" } },
              { path: "blocked", element: <BlockListPage />, handle: { bg: "white" } },
              { path: ":chatType/:id", element: <ChattingPageRoute />, handle: { bg: "white" } },
              { path: ":chatType/:id/members", element: <ChatMembersPage />, handle: { bg: "white" } },
              {
                path: ":chatType/:id/notifications",
                element: <ChatNotificationSettingsPage />,
                handle: { bg: "white" },
              },
            ],
          },

          // 공동구매 상세
          {
            path: "groupPurchase",
            element: <SubPage />,
            children: [
              { path: ":boardId", element: <GroupPurchasePostPage />, handle: { bg: "white" } },
              { path: "write", element: <GroupPurchaseWritePage />, handle: { bg: "white" } },
              { path: "keywordSetting", element: <KeywordAlertSettingPage />, handle: { bg: "gray" } },
            ],
          },

          // 공지사항, 팁, 민원, 폼, 알림, 일정
          {
            path: "announcements",
            element: <SubPage />,
            children: [
              { index: true, element: <NotificationBoardPage />, handle: { bg: "gray" } },
              { path: ":boardId", element: <AnnounceDetailPage />, handle: { bg: "white" } },
              { path: "write", element: <AnnounceWritePage />, handle: { bg: "gray" } },
            ],
          },
          {
            path: "tips",
            element: <SubPage />,
            children: [
              { index: true, element: <TipListPage />, handle: { bg: "gray" } },
              { path: "write", element: <TipWritePage />, handle: { bg: "white" } },
              { path: ":boardId", element: <TipDetailPage />, handle: { bg: "white" } },
            ],
          },
          {
            path: "complain",
            element: <SubPage />,
            children: [
              { path: ":complainId", element: <ComplainDetailPage />, handle: { bg: "gray" } },
              { path: "write", element: <ComplainWritePage />, handle: { bg: "gray" } },
            ],
          },
          {
            path: "form",
            element: <SubPage />,
            children: [
              { index: true, element: <FormListPage />, handle: { bg: "white" } },
              { path: ":formId", element: <FormDetailPage />, handle: { bg: "white" } },
            ],
          },
          {
            path: "notification",
            element: <SubPage />,
            children: [{ index: true, element: <NotificationPage />, handle: { bg: "gray" } }],
          },
          {
            path: "calendar",
            element: <SubPage />,
            children: [{ index: true, element: <CalendarPage />, handle: { bg: "gray" } }],
          },
          {
            path: "mypage",
            element: <SubPage />,
            children: [{ path: "portal", element: <PortalAccountPage />, handle: { bg: "gray" } }],
          },
          {
            path: "dormitory",
            element: <SubPage />,
            children: [
              { path: "info", element: <PortalDormitoryPage />, handle: { bg: "gray" } },
              { path: "card", element: <DormitoryCardPage />, handle: { bg: "gray" } },
            ],
          },

          // 관리자
          {
            path: "admin",
            element: <SubPage />,
            children: [
              { index: true, element: <AdminMainPage />, handle: { bg: "gray" } },
              { path: "calendar", element: <CalendarAdminPage />, handle: { bg: "white" } },
              { path: "complain", element: <ComplainAdminPage />, handle: { bg: "gray" } },
              {
                path: "complain/answer/:complainId",
                element: <ComplainAnswerWritePage />,
                handle: { bg: "white" },
              },
              { path: "popup-notifications", element: <PopupNotiListPage />, handle: { bg: "gray" } },
              {
                path: "popup-notifications/create",
                element: <PopupNotiCreatePage />,
                handle: { bg: "white" },
              },
              {
                path: "popup-notifications/edit/:popupNotificationId",
                element: <PopupNotiCreatePage />,
                handle: { bg: "white" },
              },
              {
                path: "notification/create",
                element: <CreateNotificationPage />,
                handle: { bg: "gray" },
              },
              { path: "form/create", element: <FormCreatePage />, handle: { bg: "white" } },
              { path: "form/:formId/result", element: <FormResultPage />, handle: { bg: "white" } },
              { path: "fcm", element: <FCMPage />, handle: { bg: "gray" } },
              { path: "feature-flag", element: <FeatureFlagManagePage />, handle: { bg: "white" } },
              { path: "statistics", element: <StatisticsPage />, handle: { bg: "gray" } },
              {
                path: "open-chat-reports",
                element: <OpenChatReportAdminPage />,
                handle: { bg: "gray" },
              },
              { path: "open-chat-bot", element: <OpenChatBotPage />, handle: { bg: "gray" } },
              { path: "open-chat-rooms", element: <OpenChatAdminPage />, handle: { bg: "gray" } },
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

export { resolveNavigationTarget } from "@/utils/navigation";

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

    const resolvedTarget = resolveNavigationTarget(to, window.location.pathname);
    const path = resolvedTarget.pathname;
    const isTabNavigation = opts?.state?.isTabNavigation === true;
    const isHomePath = path === PATHS.HOME || path === PATHS.ROOT;
    const isBootstrapRedirect =
      window.location.pathname === "/" && (isHomePath || path === PATHS.ONBOARDING);

    // 단순 해시(#)나 쿼리(?)만 변경하는 라우팅이거나 빈 이동인지 확인
    const isHashOrSearchOnly =
      to === "" ||
      (typeof to === "string" && (to.startsWith("#") || to.startsWith("?"))) ||
      (typeof to === "object" && to !== null && !to.pathname);
    const isSamePath = window.location.pathname === path;
    const isCurrentInMainTab = isMainTabPath(window.location.pathname);

    // 개발 모드 안전장치: state에 데이터가 전달되었으나 URL 쿼리 파라미터가 없는 경우 경고 안내
    // 앱 멀티 웹뷰 환경에서는 새 웹뷰가 뜰 때 location.state가 유실되므로 식별자는 URL 쿼리 파라미터를 권장
    if (import.meta.env.DEV && opts?.state && typeof opts.state === 'object') {
      const stateKeys = Object.keys(opts.state).filter(
        (key) => key !== 'isTabNavigation' && key !== 'usr' && key !== 'key'
      );
      const fullPath = resolvedTarget.fullPath;
      const hasQuery = fullPath.includes('?');

      if (stateKeys.length > 0 && !hasQuery && !isMainTabPath(path)) {
        console.warn(
          `[Router Navigation Warning] 경로 "${path}" 이동 시 state(${stateKeys.join(', ')})가 전달되었지만 URL 쿼리 파라미터가 없습니다.\n` +
            `앱 멀티 웹뷰 환경에서는 새 웹뷰가 열릴 때 location.state가 유실될 수 있으므로 식별자(ID 등)는 '?id=...'와 같이 쿼리 파라미터로 함께 전달해주세요.`
        );
      }
    }

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
      !isHashOrSearchOnly &&
      !isSamePath
    ) {
      appBridge.navigateTo(resolvedTarget.fullPath);
      return Promise.resolve(); // 현재 웹뷰에서의 SPA 라우팅을 수행하지 않음
    }

    return (originalNavigate as any).call(router, to, opts);
  };
}

