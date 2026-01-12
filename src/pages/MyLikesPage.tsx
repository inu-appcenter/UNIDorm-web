import styled from "styled-components";
import Header from "../components/common/Header/Header.tsx";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import MyPostLikeCard from "../components/mypage/MyPostLikeCard.tsx";
import { useEffect, useState } from "react";
import { MyPost_GroupOrder } from "@/types/members";
import { getMemberLikePosts } from "@/apis/members";

export default function MyLikesPage() {
  const [posts, setPosts] = useState<MyPost_GroupOrder[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getMemberLikePosts();
        console.log("내가 좋아요한 글 불러오기 성공", response);
        setPosts(response.data);
      } catch (error) {
        console.error("내가 좋아요한 글 불러오기 실패", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <MyScrapPageWrapper>
      <Header title="좋아요한 글" hasBack={true} showAlarm={true} />

      <TitleContentArea title="">
        <CardList>
          {posts.length > 0 ? (
            posts.map((post) => (
              <>
                <MyPostLikeCard key={post.boardId} post={post} isLike={true} />
                <Divider />
              </>
            ))
          ) : (
            <EmptyMessage>내가 좋아요한 글이 없습니다.</EmptyMessage>
          )}
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
