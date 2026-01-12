import { createBrowserRouter } from "react-router-dom";
import { PATHS } from "@/constants/paths";
// 페이지 및 레이아웃 임포트 (기존과 동일)
import AppInitializer from "./AppInitializer";
import OutPage from "../pages/OutPage";
import LoginPage from "../pages/LoginPage";
import LogoutPage from "../pages/LogoutPage";
import OnboardingPage from "../pages/OnboardingPage";
import RootPage from "../pages/RootPage";
import HomePage from "../pages/HomePage";
import MyPage from "../pages/MyPage";
import MyInfoEditPage from "../pages/MyPage/MyInfoEditPage";
import AgreementPage from "../pages/MyPage/AgreementPage";
import NotificationSettingPage from "../pages/MyPage/NotificationSettingPage";
import MyPostsPage from "../pages/MyPostsPage";
import MyLikesPage from "../pages/MyLikesPage";
import SubPage from "../pages/SubPage";
import RoomMatePage from "../pages/RoomMate/RoomMatePage";
import MyRoomMatePage from "../pages/RoomMate/MyRoomMatePage";
import RoomMateListPage from "../pages/RoomMate/RoomMateListPage";
import RoomMateBoardDetailPage from "../pages/RoomMate/RoomMateBoardDetailPage";
import RoomMateFilterPage from "../pages/RoomMate/RoomMateFilterPage";
import RoomMateChecklistPage from "../pages/RoomMate/RoomMateChecklistPage";
import RoomMateAddPage from "../pages/RoomMate/RoomMateAddPage";
import ChatListPage from "../pages/Chat/ChatListPage";
import ChattingPage from "../pages/Chat/ChattingPage";
import GroupPurchaseMainPage from "../pages/GroupPurchase/GroupPurchaseMainPage";
import GroupPurchaseComingSoonPage from "../pages/GroupPurchase/GroupPurchaseComingSoonPage";
import GroupPurchasePostPage from "../pages/GroupPurchase/GroupPurchasePostPage";
import GroupPurchaseWritePage from "../pages/GroupPurchase/GroupPurchaseWritePage";
import KeywordAlertSettingPage from "../pages/GroupPurchase/KeywordAlertSettingPage";
import NotificationBoardPage from "../pages/Announcement/AnnouncementPage";
import AnnounceDetailPage from "../pages/Announcement/AnnounceDetailPage";
import AnnounceWritePage from "../pages/Admin/AnnounceWritePage";
import NotificationPage from "../pages/NotificationPage";
import TipListPage from "../pages/Tip/TipListPage";
import TipWritePage from "../pages/Tip/TipWritePage";
import TipDetailPage from "../pages/Tip/TipDetailPage";
import CalendarPage from "../pages/CalendarPage";
import ComplainListPage from "../pages/Complain/ComplainListPage";
import ComplainDetailPage from "../pages/Complain/ComplainDetailPage";
import ComplainWritePage from "../pages/Complain/ComplainWritePage";
import FormListPage from "../pages/Form/FormListPage";
import FormDetailPage from "../pages/Form/FormDetailPage";
import AdminMainPage from "../pages/Admin/AdminMainPage";
import CalendarAdminPage from "../pages/Admin/CalendarAdminPage";
import ComplainAdminPage from "../pages/Admin/ComplainAdminPage";
import ComplainAnswerWritePage from "../pages/Admin/ComplainAnswerWritePage";
import PopupNotiListPage from "../pages/Admin/PopupNotiListPage";
import PopupNotiCreatePage from "../pages/Admin/PopupNotiFormPage";
import CreateNotificationPage from "../pages/Admin/CreateNotificationPage";
import FormCreatePage from "../pages/Admin/FormCreatePage";
import FormResultPage from "../pages/Admin/FormResultPage";
import FCMPage from "../pages/Admin/FCMPage";

export const router = createBrowserRouter([
  {
    path: PATHS.ROOT,
    element: <AppInitializer />, // 초기화 훅을 실행할 래퍼 컴포넌트
    children: [
      // 1. OutPage 레이아웃 (로그인 관련)
      {
        element: <OutPage />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "logout", element: <LogoutPage /> },
          { path: "onboarding", element: <OnboardingPage /> },
        ],
      },
      // 2. RootPage 레이아웃 (메인 탭 관련)
      {
        element: <RootPage />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "home", element: <HomePage /> },
          { path: "mypage", element: <MyPage /> },
          { path: "myinfoedit", element: <MyInfoEditPage /> },
          { path: "agreement", element: <AgreementPage /> },
          {
            path: "notification-setting",
            element: <NotificationSettingPage />,
          },
          { path: "myposts", element: <MyPostsPage /> },
          { path: "liked", element: <MyLikesPage /> },
        ],
      },
      // 3. SubPage 레이아웃 (도메인별 상세/리스트)
      {
        path: "roommate",
        element: <SubPage />,
        children: [
          { index: true, element: <RoomMatePage /> },
          { path: "my", element: <MyRoomMatePage /> },
          { path: "list", element: <RoomMateListPage /> },
          { path: "list/:boardId", element: <RoomMateBoardDetailPage /> },
          { path: "filter", element: <RoomMateFilterPage /> },
          { path: "checklist", element: <RoomMateChecklistPage /> },
          { path: "add", element: <RoomMateAddPage /> },
        ],
      },
      {
        path: "chat",
        element: <SubPage />,
        children: [
          { index: true, element: <ChatListPage /> },
          { path: ":chatType/:id", element: <ChattingPage /> },
        ],
      },
      {
        path: "groupPurchase",
        element: <SubPage />,
        children: [
          { index: true, element: <GroupPurchaseMainPage /> },
          { path: "comingsoon", element: <GroupPurchaseComingSoonPage /> },
          { path: ":boardId", element: <GroupPurchasePostPage /> },
          { path: "write", element: <GroupPurchaseWritePage /> },
          { path: "keywordSetting", element: <KeywordAlertSettingPage /> },
        ],
      },
      {
        path: "announcements",
        element: <SubPage />,
        children: [
          { index: true, element: <NotificationBoardPage /> },
          { path: ":boardId", element: <AnnounceDetailPage /> },
          { path: "write", element: <AnnounceWritePage /> },
        ],
      },
      { path: "notification", element: <NotificationPage /> },
      {
        path: "tips",
        element: <SubPage />,
        children: [
          { index: true, element: <TipListPage /> },
          { path: "write", element: <TipWritePage /> },
          { path: ":boardId", element: <TipDetailPage /> },
        ],
      },
      { path: "calendar", element: <CalendarPage /> },
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
      // 4. Admin 레이아웃
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
          { path: "notification/create", element: <CreateNotificationPage /> },
          { path: "form/create", element: <FormCreatePage /> },
          { path: "form/:formId/result", element: <FormResultPage /> },
          { path: "fcm", element: <FCMPage /> },
        ],
      },
    ],
  },
]);
