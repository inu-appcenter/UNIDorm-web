// src/pages/Tip/TipListPage.tsx

import styled from "styled-components";
import { useCallback, useEffect, useState } from "react";
import { usePageFocus } from "@/hooks/usePageFocus";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import MyPostLikeCard from "../components/mypage/MyPostLikeCard.tsx";
import { MyPost } from "@/types/members";
import { getMemberPosts } from "@/apis/members";

export default function MyPostsPage() {
  const [posts, setPosts] = useState<MyPost[]>([]);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await getMemberPosts();
      setPosts(response.data);
    } catch (error) {
      console.error("게시글을 불러오는 데 실패했습니다.", error);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 글 상세(별도 웹뷰)에서 글 수정·삭제 후 돌아오면 재조회
  usePageFocus(() => fetchPosts());

  return (
    <MyPostsPageWrapper>
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
  padding: 0 16px 100px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow-y: auto;
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
  width: 100vw;
  background: #0000001a;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
`;
