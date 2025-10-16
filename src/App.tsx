import "./index.css";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMemberInfo } from "./apis/members";
import useUserStore from "./stores/useUserStore";
import RootPage from "./pages/RootPage";
import SubPage from "./pages/SubPage";
import OutPage from "./pages/OutPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import LogoutPage from "./pages/LogoutPage";
import OnboardingPage from "./pages/OnboardingPage";
import MyPage from "./pages/MyPage";
import MyInfoEditPage from "./pages/MyPage/MyInfoEditPage";
import MyPostsPage from "./pages/MyPostsPage";
import MyLikesPage from "./pages/MyLikesPage";
import RoomMatePage from "./pages/RoomMate/RoomMatePage";
import MyRoomMatePage from "./pages/RoomMate/MyRoomMatePage";
import RoomMateListPage from "./pages/RoomMate/RoomMateListPage";
import RoomMateBoardDetailPage from "./pages/RoomMate/RoomMateBoardDetailPage";
import RoomMateFilterPage from "./pages/RoomMate/RoomMateFilterPage";
import RoomMateChecklistPage from "./pages/RoomMate/RoomMateChecklistPage";
import RoomMateAddPage from "./pages/RoomMate/RoomMateAddPage";
import ChatListPage from "./pages/Chat/ChatListPage";
import ChattingPage from "./pages/Chat/ChattingPage";
import GroupPurchaseMainPage from "./pages/GroupPurchase/GroupPurchaseMainPage";
import GroupPurchaseComingSoonPage from "./pages/GroupPurchase/GroupPurchaseComingSoonPage";
import GroupPurchasePostPage from "./pages/GroupPurchase/GroupPurchasePostPage";
import GroupPurchaseWritePage from "./pages/GroupPurchase/GroupPurchaseWritePage";
import NotificationBoardPage from "./pages/Announcement/AnnouncementPage";
import AnnounceDetailPage from "./pages/Announcement/AnnounceDetailPage";
import AnnounceWritePage from "./pages/Admin/AnnounceWritePage";
import NotificationPage from "./pages/NotificationPage";
import TipListPage from "./pages/Tip/TipListPage";
import TipWritePage from "./pages/Tip/TipWritePage";
import TipDetailPage from "./pages/Tip/TipDetailPage";
import AdminMainPage from "./pages/Admin/AdminMainPage";
import CalendarAdminPage from "./pages/Admin/CalendarAdminPage";
import CalendarPage from "./pages/CalendarPage";
import "./init";
import { ErrorBoundary } from "./ErrorBoundary.tsx";
import ComplainListPage from "./pages/Complain/ComplainListPage.tsx";
import ComplainDetailPage from "./pages/Complain/ComplainDetailPage.tsx";
import ComplainWritePage from "./pages/Complain/ComplainWritePage.tsx";
import ComplainAdminPage from "./pages/Admin/ComplainAdminPage.tsx";
import ComplainAnswerWritePage from "./pages/Admin/ComplainAnswerWritePage.tsx";
import KeywordAlertSettingPage from "./pages/GroupPurchase/KeywordAlertSettingPage.tsx";
import PopupNotiListPage from "./pages/Admin/PopupNotiListPage.tsx";
import PopupNotiCreatePage from "./pages/Admin/PopupNotiFormPage.tsx";
import CreateNotificationPage from "./pages/Admin/CreateNotificationPage.tsx";
import NotificationSettingPage from "./pages/MyPage/NotificationSettingPage.tsx";
import FCMPage from "./pages/Admin/FCMPage.tsx";
import AgreementPage from "./pages/MyPage/AgreementPage.tsx";
import CommonBottomModal from "./components/modal/CommonBottomModal.tsx";
import ModalContent_EventWin from "./components/common/ModalContent_EventWin.tsx";

function App() {
  console.log("현재 MODE:", import.meta.env.MODE);
  // useFcmToken();  //웹뷰환경에서 이 로직이 돌면 오류발생하므로, 앱에서 알림 처리해줘야됨

  if (import.meta.env.MODE === "production") {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    console.warn = () => {};
    console.error = () => {};
  }

  const { tokenInfo, setUserInfo } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    // if (tokenInfo.role === "USER_ADMIN") {
    //   console.log("admin모드로 이동합니다");
    //   navigate("/admin");
    //   return;
    // }

    const initializeUser = async () => {
      try {
        console.log("회원 정보 가져오기 시도");
        const response = await getMemberInfo();
        console.log("회원 정보 가져오기 성공:", response);
        setUserInfo(response.data);

        if (tokenInfo.accessToken && response.data.name === "") {
          alert("처음 로그인하셨네요! 먼저 회원 정보를 입력해주세요.");
          navigate(
            { pathname: "/myinfoedit", search: "?firstvisit=true" },
            { replace: true },
          );
          return;
        }
        if (!response.data.termsAgreed || !response.data.privacyAgreed) {
          navigate("/agreement", { replace: true });
        }
      } catch (error) {
        // alert("회원 가져오기 실패");
        console.error("회원 가져오기 실패", error);
      }
    };

    if (tokenInfo?.accessToken) {
      initializeUser();
    }
  }, [tokenInfo, setUserInfo]);

  useEffect(() => {
    const firstVisit = localStorage.getItem("isFirstVisit");
    if (firstVisit === null) {
      navigate("/onboarding");
    }
  }, []);

  // 웹뷰에서 FCM 토큰 전달 콜백 등록
  useEffect(() => {
    (window as any).onReceiveFcmToken = async function (token: string) {
      console.log("FCM 토큰 전달받음:", token);
      // 로컬스토리지에 토큰 저장
      localStorage.setItem("fcmToken", token);
    };

    return () => {
      (window as any).onReceiveFcmToken = null;
    };
  }, []);

  const [isOpen, setIsOpen] = useState(true);

  return (
    <ErrorBoundary>
      <Routes>
        {/* 로그인 / 온보딩 / 로그아웃 */}
        <Route path="/" element={<OutPage />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="logout" element={<LogoutPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
        </Route>

        {/* 홈 / 마이페이지 */}
        <Route element={<RootPage />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="mypage" element={<MyPage />} />
          <Route path="myinfoedit" element={<MyInfoEditPage />} />
          <Route path="agreement" element={<AgreementPage />} />
          <Route
            path="notification-setting"
            element={<NotificationSettingPage />}
          />
          <Route path="myposts" element={<MyPostsPage />} />
          <Route path="liked" element={<MyLikesPage />} />
        </Route>

        {/* RoomMate */}
        <Route path="roommate" element={<SubPage />}>
          <Route index element={<RoomMatePage />} />
          <Route path="my" element={<MyRoomMatePage />} />

          {/* 리스트와 상세를 같은 레벨로 분리 */}
          <Route path="list" element={<RoomMateListPage />} />
          <Route path="list/:boardId" element={<RoomMateBoardDetailPage />} />

          <Route path="filter" element={<RoomMateFilterPage />} />
          <Route path="checklist" element={<RoomMateChecklistPage />} />
          <Route path="add" element={<RoomMateAddPage />} />
        </Route>

        {/* Chat */}
        <Route path="chat" element={<SubPage />}>
          <Route index element={<ChatListPage />} />
          <Route path=":chatType/:id" element={<ChattingPage />} />
        </Route>

        {/* GroupPurchase */}
        <Route path="groupPurchase" element={<SubPage />}>
          <Route index element={<GroupPurchaseMainPage />} />
          <Route path="comingsoon" element={<GroupPurchaseComingSoonPage />} />
          <Route path=":boardId" element={<GroupPurchasePostPage />} />
          <Route path="write" element={<GroupPurchaseWritePage />} />
          <Route path="keywordSetting" element={<KeywordAlertSettingPage />} />
        </Route>

        {/* Announcement & Notification */}
        <Route path="announcements" element={<SubPage />}>
          <Route index element={<NotificationBoardPage />} />
          <Route path=":boardId" element={<AnnounceDetailPage />} />
          <Route path="write" element={<AnnounceWritePage />} />
        </Route>
        <Route path="notification" element={<NotificationPage />} />

        {/* Tip */}
        <Route path="tips" element={<SubPage />}>
          <Route index element={<TipListPage />} />
          <Route path="write" element={<TipWritePage />} />
          <Route path=":boardId" element={<TipDetailPage />} />
        </Route>

        {/* Calendar */}
        <Route path="calendar" element={<CalendarPage />} />

        {/*민원*/}
        <Route path="complain" element={<SubPage />}>
          <Route index element={<ComplainListPage />} />
          <Route path=":complainId" element={<ComplainDetailPage />} />
          <Route path="write" element={<ComplainWritePage />} />
        </Route>
        {/* Admin */}
        <Route path="admin" element={<SubPage />}>
          <Route index element={<AdminMainPage />} />
          <Route path="calendar" element={<CalendarAdminPage />} />
          <Route path="complain" element={<ComplainAdminPage />} />
          <Route
            path="complain/answer/:complainId"
            element={<ComplainAnswerWritePage />}
          />
          <Route path="popup-notifications" element={<PopupNotiListPage />} />
          <Route
            path="popup-notifications/create"
            element={<PopupNotiCreatePage />}
          />
          <Route
            path="popup-notifications/edit/:popupNotificationId"
            element={<PopupNotiCreatePage />}
          />
          <Route
            path="notification/create"
            element={<CreateNotificationPage />}
          />

          <Route path="fcm" element={<FCMPage />} />
        </Route>
      </Routes>
      <CommonBottomModal
        id={"이벤트 당첨"}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title={"이벤트에 당첨되었어요!"}
        headerImageId={3}
        children={ModalContent_EventWin()}
        closeButtonText={"감사합니다"}
      />
    </ErrorBoundary>
  );
}

export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
