import { createBrowserRouter, Navigate } from "react-router-dom";

/* 상수/경로 */
import { PATHS } from "@/constants/paths";

/* 레이아웃 */
import AppInitializer from "./AppInitializer";
import RootPage from "@/pages/layouts/RootPage";
import SubPage from "@/pages/layouts/SubPage";
import OutPage from "@/pages/layouts/OutPage";

/* 페이지 - 인증/온보딩 */
import LoginPage from "@/pages/LoginPage";
import LogoutPage from "@/pages/LogoutPage";
import OnboardingPage from "@/pages/OnboardingPage";

/* 페이지 - 메인 5개 탭 (RootPage 하위) */
import HomePage from "@/pages/HomePage";
import RoomMatePage from "@/pages/RoomMate/RoomMatePage";
import GroupPurchaseMainPage from "@/pages/GroupPurchase/GroupPurchaseMainPage";
import ChatListPage from "@/pages/Chat/ChatListPage";
import MyPage from "@/pages/MyPage";

/* 페이지 - 서브 상세 (SubPage 하위) */
import MyInfoEditPage from "@/pages/MyPage/MyInfoEditPage";
import AgreementPage from "@/pages/MyPage/AgreementPage";
import NotificationSettingPage from "@/pages/MyPage/NotificationSettingPage";
import MyPostsPage from "@/pages/MyPostsPage";
import MyLikesPage from "@/pages/MyLikesPage";
import NotificationPage from "@/pages/NotificationPage";
import CalendarPage from "@/pages/CalendarPage";

import MyRoomMatePage from "@/pages/RoomMate/MyRoomMatePage";
import RoomMateListPage from "@/pages/RoomMate/RoomMateListPage";
import RoomMateBoardDetailPage from "@/pages/RoomMate/RoomMateBoardDetailPage";
import RoomMateFilterPage from "@/pages/RoomMate/RoomMateFilterPage";
import RoomMateChecklistPage from "@/pages/RoomMate/RoomMateChecklistPage";
import RoomMateAddPage from "@/pages/RoomMate/RoomMateAddPage";

import ChattingPage from "@/pages/Chat/ChattingPage";

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
          { path: "chat", element: <ChatListPage /> },
          { path: "mypage", element: <MyPage /> },
        ],
      },

      /* 3. SubPage: 상세 페이지 (바텀바 숨김, 뒤로가기 헤더 노출) */
      {
        element: <SubPage />,
        children: [
          { path: "login", element: <LoginPage /> },
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
            children: [{ index: true, element: <MyInfoEditPage /> }],
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
            ],
          },

          // 채팅 상세
          {
            path: "chat",
            element: <SubPage />,
            children: [{ path: ":chatType/:id", element: <ChattingPage /> }],
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
              { index: true, element: <ComplainListPage /> },
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
            ],
          },
        ],
      },
    ],
  },
]);
