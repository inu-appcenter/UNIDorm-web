import "./index.css";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getMemberInfo } from "./apis/members";
import useUserStore from "./stores/useUserStore";
import RootPage from "./pages/RootPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ChatListPage from "./pages/Chat/ChatListPage.tsx";
import RoomMatePage from "./pages/RoomMate/RoomMatePage.tsx";
import MyPage from "./pages/MyPage.tsx";
import NotificationBoardPage from "./pages/Announcement/AnnouncementPage.tsx";
import TipListPage from "./pages/Tip/TipListPage.tsx";
import TipWritePage from "./pages/Tip/TipWritePage.tsx";
import TipDetailPage from "./pages/Tip/TipDetailPage.tsx";
import RoomMateListPage from "./pages/RoomMate/RoomMateListPage.tsx";
import RoomMateBoardDetailPage from "./pages/RoomMate/RoomMateBoardDetailPage.tsx";
import OutPage from "./pages/OutPage.tsx";
import SubPage from "./pages/SubPage.tsx";
import GroupPurchasePostPage from "./pages/GroupPurchase/GroupPurchasePostPage.tsx";
import GroupPurchaseWritePage from "./pages/GroupPurchase/GroupPurchaseWritePage.tsx";
import RoomMateChecklistPage from "./pages/RoomMate/RoomMateChecklistPage.tsx";
import MyPostsPage from "./pages/MyPostsPage.tsx";
import GroupPurchaseMainPage from "./pages/GroupPurchase/GroupPurchaseMainPage.tsx";
import MyLikesPage from "./pages/MyLikesPage.tsx";
import MyInfoEditPage from "./pages/MyPage/MyInfoEditPage.tsx";
import MyRoomMatePage from "./pages/RoomMate/MyRoomMatePage.tsx";
import RoomMateAddPage from "./pages/RoomMate/RoomMateAddPage.tsx";
import ChattingPage from "./pages/Chat/ChattingPage.tsx";
import "./init";
import LogoutPage from "./pages/LogoutPage.tsx";
import OnboardingPage from "./pages/OnboardingPage.tsx";
import RoomMateFilterPage from "./pages/RoomMate/RoomMateFilterPage.tsx";
import GroupPurchaseComingSoonPage from "./pages/GroupPurchase/GroupPurchaseComingSoonPage.tsx";
import CalendarAdminPage from "./pages/Admin/CalendarAdminPage.tsx";
import AdminMainPage from "./pages/Admin/AdminMainPage.tsx";
import AnnounceDetailPage from "./pages/Announcement/AnnounceDetailPage.tsx";
import AnnounceWritePage from "./pages/Admin/AnnounceWritePage.tsx";
import NotificationPage from "./pages/NotificationPage.tsx";
import CalendarPage from "./pages/CalendarPage.tsx";

function App() {
  const { tokenInfo, setUserInfo, userInfo } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo.isAdmin) {
      console.log("admin모드로 이동합니다");
      navigate("/admin");
      return;
    }
    const initializeUser = async () => {
      try {
        const response = await getMemberInfo();
        console.log(response);
        setUserInfo(response.data);

        if (tokenInfo.accessToken && response.data.name === "") {
          alert("처음 로그인하셨네요! 먼저 회원 정보를 입력해주세요.");
          navigate(
            { pathname: "/myinfoedit", search: "?firstvisit=true" },
            { replace: true },
          );
        }
      } catch (error) {
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
      // 첫 방문이면 onboarding으로 이동
      navigate("/onboarding");
    }

    // firstVisit이 존재하고 false일 경우 아무것도 하지 않음
  }, []);

  return (
    <>
      <Routes>
        {/*로그인하기 전 페이지들*/}
        <Route path="/" element={<OutPage />}>
          <Route path={"/login"} element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>
        {/*바텀바가 필요한 루트 페이지들*/}
        <Route path="/" element={<RootPage />}>
          <Route index element={<HomePage />} />

          <Route path="/home" element={<HomePage />} />
          <Route path="/roommate" element={<RoomMatePage />} />
          <Route path="/myroommate" element={<MyRoomMatePage />} />

          <Route path="/groupPurchase" element={<GroupPurchaseMainPage />} />
          <Route
            path="/groupPurchase/comingsoon"
            element={<GroupPurchaseComingSoonPage />}
          />

          <Route path="/chat" element={<ChatListPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>
        {/*바텀바가 필요없는 2뎁스 이상 페이지들*/}
        <Route path="/" element={<SubPage />}>
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/roommatelist" element={<RoomMateListPage />} />
          <Route
            path="/roommatelist/:boardId"
            element={<RoomMateBoardDetailPage />}
          />
          <Route
            path={"/roommatelist/filter"}
            element={<RoomMateFilterPage />}
          />
          <Route
            path="/roommatechecklist"
            element={<RoomMateChecklistPage />}
          />
          <Route path="/myinfoedit" element={<MyInfoEditPage />} />
          <Route path={"/notification"} element={<NotificationPage />} />
          <Route path="/announcements" element={<NotificationBoardPage />} />
          <Route path="/announcements/:id" element={<AnnounceDetailPage />} />
          <Route path="/announcements/write" element={<AnnounceWritePage />} />
          <Route path="/chat/:chatType/:id" element={<ChattingPage />} />
          <Route path="/tips/write" element={<TipWritePage />} />
          <Route path="/tips/:boardId" element={<TipDetailPage />} />
          <Route path="/tips" element={<TipListPage />} />
          <Route path="/myposts" element={<MyPostsPage />} />
          <Route path="/liked" element={<MyLikesPage />} />
          <Route
            path="/groupPurchase/post"
            element={<GroupPurchasePostPage />}
          />
          <Route
            path="/groupPurchase/write"
            element={<GroupPurchaseWritePage />}
          />
          <Route path="/roommateadd" element={<RoomMateAddPage />} />
          <Route path="/admin" element={<AdminMainPage />} />
          <Route path="/admin/calendar" element={<CalendarAdminPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
