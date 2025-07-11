import { Route, Routes, BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { getMembers } from "./apis/members";
import useUserStore from "./stores/useUserStore";
// import ScrollBarStyles from "resources/styles/ScrollBarStyles";
import RootPage from "./pages/RootPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ChatListPage from "./pages/Chat/ChatListPage.tsx";
import ChattingPage from "./pages/Chat/ChattingPage.tsx";
import RoomMatePage from "./pages/RoomMate/RoomMatePage.tsx";
import MyPage from "./pages/MyPage.tsx";
import NotificationPage from "./pages/NotificationPage.tsx";
import TipListPage from "./pages/Tip/TipListPage.tsx";
import TipWritePage from "./pages/Tip/TipWritePage.tsx";
import TipDetailPage from "./pages/Tip/TipDetailPage.tsx";
import RoomMateListPage from "./pages/RoomMate/RoomMateListPage.tsx";
import RoomMateDetailPage from "./pages/RoomMate/RoomMateDetailPage.tsx";
import OutPage from "./pages/OutPage.tsx";
import SubPage from "./pages/SubPage.tsx";
import NoticeBoardPage from "./pages/NoticeBoardPage.tsx";
import GroupPurchaseMainPage from "./pages/GroupPurchase/GroupPurchaseMainPage.tsx";
import GroupPurchasePostPage from "./pages/GroupPurchase/GroupPurchasePostPage.tsx";
import GroupPurchaseWritePage from "./pages/GroupPurchase/GroupPurchaseWritePage.tsx";
import RoomMateChecklistPage from "./pages/RoomMate/RoomMateChecklistPage.tsx";

function App() {
  const location = useLocation();
  const { tokenInfo, setTokenInfo, setUserInfo } = useUserStore();

  // URL 쿼리에서 토큰 값 추출 및 저장
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get("token");

    if (accessToken) {
      // URL에서 받은 token으로 accessToken 설정
      setTokenInfo({
        accessToken: accessToken,
        accessTokenExpiredTime: "",
        refreshToken: "",
        refreshTokenExpiredTime: "",
      });
    }
  }, [location.search, setTokenInfo]);

  // 초기화 및 회원 정보 가져오기
  useEffect(() => {
    const storedTokenInfo = localStorage.getItem("tokenInfo"); // 로컬스토리지에서 tokenInfo 가져오기
    if (storedTokenInfo) {
      const parsedTokenInfo = JSON.parse(storedTokenInfo);
      setTokenInfo(parsedTokenInfo);
    }
  }, [setTokenInfo]);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const response = await getMembers();
        setUserInfo(response.data);
      } catch (error) {
        console.error("회원 가져오기 실패", error);
      }
    };

    if (tokenInfo.accessToken) {
      initializeUser();
    }
  }, [tokenInfo, setUserInfo]);

  return (
    <>
      <Routes>
        {/*로그인하기 전 페이지들*/}
        <Route path="/" element={<OutPage />}>
          <Route index element={<LoginPage />} />
          <Route path={"/login"} element={<LoginPage />} />
        </Route>
        {/*바텀바가 필요한 루트 페이지들*/}
        <Route path="/" element={<RootPage />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/roommate" element={<RoomMatePage />} />
          <Route path="/groupPurchase" element={<GroupPurchaseMainPage />} />
          <Route path="/chat" element={<ChatListPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/noticeboard" element={<NoticeBoardPage />} /> 
        </Route>
        {/*바텀바가 필요없는 2뎁스 이상 페이지들*/}
        <Route path="/" element={<SubPage />}>
          <Route path="/roommatelist" element={<RoomMateListPage />} />
          <Route path="/roommatelist/:id" element={<RoomMateDetailPage />} />
          <Route
            path="/roommatechecklist"
            element={<RoomMateChecklistPage />}
          />

          <Route path="/notification" element={<NotificationPage />} />
          <Route path="/chat/:chatType/:id" element={<ChattingPage />} />
          <Route path="/tips/write" element={<TipWritePage />} />
          <Route path="/tips/detail" element={<TipDetailPage />} />
          <Route path="/tips" element={<TipListPage />} />
          <Route path="/groupPurchase/post" element={<GroupPurchasePostPage />} />
          <Route path="/groupPurchase/write" element={<GroupPurchaseWritePage />} />
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
