import { useEffect, useState } from "react";
import styled from "styled-components";
import { User } from "lucide-react";
import { useSetHeader } from "@/hooks/useSetHeader";
import { getBlockedUsers, unblockUser, BlockedUser } from "@/apis/block";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { motion } from "framer-motion";

export default function BlockListPage() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBlockedUsers = async () => {
    setIsLoading(true);
    try {
      const res = await getBlockedUsers();
      setBlockedUsers(res.data);
    } catch (err) {
      console.error("차단 목록 조회 실패", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const handleUnblock = async (blockedUserId: number) => {
    try {
      await unblockUser(blockedUserId);
      setBlockedUsers((prev) =>
        prev.filter((user) => user.blockedUserId !== blockedUserId),
      );
    } catch (err) {
      console.error("차단 해제 실패", err);
      alert("차단 해제 중 오류가 발생했습니다.");
    }
  };

  useSetHeader({
    title: "차단 목록",
    showAlarm: false,
    headerRightElement: (
      <HeaderRightCount>
        <User size={16} color="#8b8b8b" />
        <span>{blockedUsers.length}</span>
      </HeaderRightCount>
    ),
  });

  return (
    <PageWrapper
      as={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {isLoading ? (
        <LoadingSpinner message="차단 목록을 불러오는 중입니다..." />
      ) : blockedUsers.length > 0 ? (
        <CardList>
          {blockedUsers.map((user) => (
            <UserCard key={user.blockedUserId}>
              <UserName>{user.blockedUserName || `익명`}</UserName>
              <UnblockButton
                type="button"
                onClick={() => handleUnblock(user.blockedUserId)}
              >
                차단 해제
              </UnblockButton>
            </UserCard>
          ))}
        </CardList>
      ) : (
        <EmptyMessage>차단한 사용자가 없습니다.</EmptyMessage>
      )}
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: 100%;
  padding: 16px 20px 100px;
  box-sizing: border-box;

  @media (min-width: 1024px) {
    max-width: 1200px;
    margin: 0 auto;
  }
`;

const HeaderRightCount = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #8b8b8b;
  line-height: 1.5;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const UserCard = styled.div`
  background-color: #ffffff;
  border: 1px solid #dfdfdf;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  width: 100%;
`;

const UserName = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #3d3d3d;
  line-height: 1.5;
`;

const UnblockButton = styled.button`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #ff4242;
  line-height: 1.5;
  cursor: pointer;
  border: none;
  background: transparent;
  padding: 0;
`;

const EmptyMessage = styled.div`
  padding: 40px 24px;
  text-align: center;
  color: #8b8b8b;
  font-family: "Pretendard", sans-serif;
  font-size: 15px;
  line-height: 1.5;
`;
