// src/pages/Tip/TipListPage.tsx

import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header.tsx";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import MyPostCard from "../components/mypage/MyPostCard.tsx";
import { useEffect, useState } from "react";
import { MyPost } from "../types/members.ts";
import { getMemberLikePosts } from "../apis/members.ts";

export default function MyLikesPage() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<MyPost[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getMemberLikePosts();
        setPosts(response.data);
      } catch (error) {
        console.error("게시글을 불러오는 데 실패했습니다.", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <MyScrapPageWrapper>
      <Header title="좋아요한 글" hasBack={true} showAlarm={true} />

      <TitleContentArea type="">
        <CardList>
          {posts.map((tip, idx) => (
            <MyPostCard
              key={idx}
              tip={tip}
              onClick={() => navigate(`/tips/${tip.id}`)}
            />
          ))}
        </CardList>
      </TitleContentArea>
    </MyScrapPageWrapper>
  );
}

const MyScrapPageWrapper = styled.div`
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
