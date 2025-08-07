// src/pages/Tip/TipListPage.tsx

import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header.tsx";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import MyPostLikeCard from "../components/mypage/MyPostLikeCard.tsx";
import { useEffect, useState } from "react";
import { MyPost } from "../types/members.ts";
import { getMemberLikePosts } from "../apis/members.ts";
import RoomMateCard from "../components/roommate/RoomMateCard.tsx";

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

      <TitleContentArea title="">
        <CardList>
          {posts.length > 0 ? (
            posts.map((post) =>
              post.type === "ROOMMATE" ? (
                <RoomMateCard
                  key={post.boardId}
                  title={post.title}
                  boardId={post.boardId}
                  dormType={post.dormType}
                  mbti={post.mbti}
                  college={post.college}
                  isSmoker={post.smoking === "피워요"}
                  isClean={post.arrangement === "깔끔해요"}
                  stayDays={post.dormPeriod}
                  description={post.comment}
                  roommateBoardLike={post.roommateBoardLike}
                  matched={post.matched}
                />
              ) : post.type === "TIP" ? (
                <MyPostLikeCard
                  key={post.boardId}
                  post={post}
                  isLike={true}
                  onClick={() => navigate(`/tips/${post.boardId}`)}
                />
              ) : null,
            )
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
  gap: 24px;
  width: 100%;
  height: 100%;
`;

const EmptyMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: #aaa;
  font-size: 14px;
`;
