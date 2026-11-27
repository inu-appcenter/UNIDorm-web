import styled from "styled-components";
import { useTranslation } from "react-i18next";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import MyPostLikeCard from "../components/mypage/MyPostLikeCard.tsx";
import { useMemberLikePosts } from "@/queries/members";

export default function MyLikesPage() {
  const { t } = useTranslation("mypage");
  const { data: posts = [] } = useMemberLikePosts();

  return (
    <MyScrapPageWrapper>
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
            <EmptyMessage>{t("myLikes.empty")}</EmptyMessage>
          )}
        </CardList>
      </TitleContentArea>
    </MyScrapPageWrapper>
  );
}

const MyScrapPageWrapper = styled.div`
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
