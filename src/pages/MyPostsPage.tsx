// src/pages/Tip/TipListPage.tsx

import styled from "styled-components";
import { useTranslation } from "react-i18next";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import MyPostLikeCard from "../components/mypage/MyPostLikeCard.tsx";
import { useMemberPosts } from "@/queries/members";

export default function MyPostsPage() {
  const { t } = useTranslation("mypage");
  const { data: posts = [] } = useMemberPosts();

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
            <EmptyMessage>{t("myPosts.empty")}</EmptyMessage>
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
