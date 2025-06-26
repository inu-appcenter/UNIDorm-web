import { Route, Routes, BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { getMembers } from "./apis/members";
import useUserStore from "./stores/useUserStore";
// import ScrollBarStyles from "resources/styles/ScrollBarStyles";
import RootPage from "./pages/RootPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ChatListPage from "./pages/ChatListPage.tsx";
import ChatPage from "./pages/ChatPage.tsx";
import GroupPurchasePage from "./pages/GroupPurchasePage.tsx";
import RoomMatePage from "./pages/RoomMatePage.tsx";
import MyPage from "./pages/MyPage.tsx";
import NotificationPage from "./pages/NotificationPage.tsx";
import TipListPage from "./pages/TipPage/TipListPage.tsx";


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
        <Route index element={<LoginPage />} />
        <Route path="/" element={<RootPage />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/roommate" element={<RoomMatePage />} />
          <Route path="/groupPurchase" element={<GroupPurchasePage />} />
          <Route path="/chat" element={<ChatListPage />} />
          <Route path="/chat/:chatType/:id" element={<ChatPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/notification" element={<NotificationPage />} />
          <Route path="/tips" element={<TipListPage />} />
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
