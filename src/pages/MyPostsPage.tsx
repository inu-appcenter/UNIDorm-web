// src/pages/Tip/TipListPage.tsx

import styled from "styled-components";
import { useEffect, useState } from "react";
import Header from "../components/common/Header.tsx";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import MyPostLikeCard from "../components/mypage/MyPostLikeCard.tsx";
import { MyPost_GroupOrder } from "../types/members.ts";
import { getMemberPosts } from "../apis/members.ts";

export default function MyPostsPage() {
  const [posts, setPosts] = useState<MyPost_GroupOrder[]>([]);

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

      <TitleContentArea title="">
        <CardList>
          {posts.length > 0 ? (
            posts.map((post) => (
              <>
                <MyPostLikeCard key={post.boardId} post={post} />
                <Divider />
              </>
            ))
          ) : (
            <EmptyMessage>내가 작성한 게시글이 없습니다.</EmptyMessage>
          )}
        </CardList>
      </TitleContentArea>
    </MyPostsPageWrapper>
  );
}

const MyPostsPageWrapper = styled.div`
  padding: 90px 16px 90px 16px;
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
  gap: 16px;
  width: 100%;
  height: 100%;
`;

const EmptyMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: #aaa;
  font-size: 14px;
`;

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: #0000001a;
`;
