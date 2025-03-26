import { Route, Routes, BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { getMembers } from "./apis/members";
import useUserStore from "./stores/useUserStore";
// import ScrollBarStyles from "resources/styles/ScrollBarStyles";
import RootPage from "./pages/RootPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

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
      {/*{location.pathname.startsWith("/m/") ||*/}
      {/*location.pathname.startsWith("/app/") ? null : (*/}
      {/*    <ScrollBarStyles />*/}
      {/*)}*/}
      <Routes>
        <Route path="/" element={<RootPage />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
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
