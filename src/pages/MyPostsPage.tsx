// src/pages/Tip/TipListPage.tsx

import styled from "styled-components";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header.tsx";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import MyPostCard from "../components/mypage/MyPostCard.tsx";
import { MyPost } from "../types/members.ts";
import { getMemberPosts } from "../apis/members.ts";

export default function MyPostsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<MyPost[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getMemberPosts();
        setPosts(response.data);
      } catch (error) {
        console.error("게시글을 불러오는 데 실패했습니다.", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <MyPostsPageWrapper>
      <Header title="내 게시글" hasBack={true} showAlarm={true} />

      <TitleContentArea type="">
        <CardList>
          {posts.map((tip) => (
            <MyPostCard
              key={tip.id}
              tip={tip}
              onClick={() => navigate(`/tips/${tip.id}`)}
            />
          ))}
        </CardList>
      </TitleContentArea>
    </MyPostsPageWrapper>
  );
}

const MyPostsPageWrapper = styled.div`
  padding: 90px 20px 90px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #fafafa;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  height: 100%;
`;
