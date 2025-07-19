import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { getMemberInfo } from "./apis/members";
import useUserStore from "./stores/useUserStore";
import RootPage from "./pages/RootPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ChatListPage from "./pages/Chat/ChatListPage.tsx";
import ChattingPage from "./pages/Chat/ChattingPage.tsx";
import RoomMatePage from "./pages/RoomMate/RoomMatePage.tsx";
import MyPage from "./pages/MyPage.tsx";
import NotificationBoardPage from "./pages/NoticeBoardPage.tsx";
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
import MyScrapPage from "./pages/MyScrapPage.tsx";
import MyLikesPage from "./pages/MyLikesPage.tsx";
import MyInfoEditPage from "./pages/MyPage/MyInfoEditPage.tsx";
import MyRoomMatePage from "./pages/RoomMate/MyRoomMatePage.tsx";

function App() {
  const { tokenInfo, setUserInfo } = useUserStore();

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const response = await getMemberInfo();
        console.log(response);
        setUserInfo(response.data);
      } catch (error) {
        console.error("회원 가져오기 실패", error);
      }
    };

    if (tokenInfo?.accessToken) {
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
        </Route>
        {/*바텀바가 필요없는 2뎁스 이상 페이지들*/}
        <Route path="/" element={<SubPage />}>
          <Route path="/roommatelist" element={<RoomMateListPage />} />
          <Route
            path="/roommatelist/:boardId"
            element={<RoomMateBoardDetailPage />}
          />
          <Route
            path="/roommatechecklist"
            element={<RoomMateChecklistPage />}
          />
          <Route path="/myinfoedit" element={<MyInfoEditPage />} />

          <Route path="/notification" element={<NotificationBoardPage />} />
          <Route path="/chat/:chatType/:id" element={<ChattingPage />} />
          <Route path="/tips/write" element={<TipWritePage />} />
          <Route path="/tips/detail" element={<TipDetailPage />} />
          <Route path="/tips" element={<TipListPage />} />
          <Route path="/myposts" element={<MyPostsPage />} />
          <Route path="/scrap" element={<MyScrapPage />} />
          <Route path="/liked" element={<MyLikesPage />} />
          <Route
            path="/groupPurchase/post"
            element={<GroupPurchasePostPage />}
          />
          <Route
            path="/groupPurchase/write"
            element={<GroupPurchaseWritePage />}
          />
          <Route path="/myroommate" element={<MyRoomMatePage />} />
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
