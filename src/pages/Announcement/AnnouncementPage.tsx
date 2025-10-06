import styled from "styled-components";
import Header from "../../components/common/Header.tsx";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import { useNavigate } from "react-router-dom";
import { BsEye } from "react-icons/bs";
import { useEffect, useState } from "react";
import { Announcement } from "../../types/announcements.ts";
import { getAnnouncements } from "../../apis/announcements.ts";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import EmptyMessage from "../../constants/EmptyMessage.tsx";
import { useIsAdminRole } from "../../hooks/useIsAdminRole.ts";

export default function AnnouncementPage() {
  const navigate = useNavigate();
  const { isAdmin } = useIsAdminRole();

  const [notices, setNotices] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // 🔽 로딩 상태를 명시적으로 true로 설정 (초기값이 true이므로 생략 가능)
      setLoading(true);
      try {
        const response = await getAnnouncements();
        setNotices(response.data);
      } catch (error) {
        console.error("공지사항 불러오기 실패", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // ❌ 기존의 전체 페이지 로딩을 제거합니다.
  // if (loading) return <NoticePageWrapper>로딩중...</NoticePageWrapper>;

  return (
    <NoticePageWrapper>
      <Header title="생활원 공지사항" hasBack={true} />

      <TitleContentArea
        title="생활원 공지사항"
        description={
          "인천대학교 생활원에서 알려드리는 공지사항을 확인해보세요."
        }
      >
        {/* 🔽 로딩 상태에 따라 스피너, 공지사항 목록, 빈 메시지를 조건부 렌더링합니다. */}
        {loading ? (
          <LoadingSpinner message="공지사항을 불러오는 중..." />
        ) : notices.length > 0 ? (
          <NoticeList>
            {notices.map((notice) => (
              <NoticeCard
                key={notice.id}
                onClick={() => {
                  navigate(`/announcements/${notice.id}`);
                }}
              >
                <NoticeTop>
                  <NoticeTitle>{notice.title}</NoticeTitle>
                  {notice.emergency && <UrgentBadge>긴급</UrgentBadge>}
                </NoticeTop>
                <NoticeContent>{notice.content}</NoticeContent>
                <NoticeBottom>
                  <BsEye size={16} /> {notice.viewCount}
                </NoticeBottom>
              </NoticeCard>
            ))}
          </NoticeList>
        ) : (
          <EmptyMessage message="등록된 공지사항이 없습니다." />
        )}
      </TitleContentArea>
      {isAdmin && (
        <WriteButton onClick={() => navigate("/announcements/write")}>
          ✏️ 공지사항 작성하기
        </WriteButton>
      )}
    </NoticePageWrapper>
  );
}

const NoticePageWrapper = styled.div`
  padding: 90px 16px 90px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #fafafa;
`;

const NoticeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  height: 100%;
`;

const NoticeCard = styled.div`
  padding: 16px;
  background: white;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  gap: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
  }
`;

const NoticeTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NoticeTitle = styled.div`
  font-weight: bold;
  font-size: 18px;

  display: -webkit-box;
  -webkit-line-clamp: 1; /* 한 줄 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UrgentBadge = styled.div`
  font-size: 14px;
  color: #007bff;
  border: 1px solid #007bff;
  padding: 2px 8px;
  border-radius: 20px;
`;

const NoticeContent = styled.div`
  font-size: 16px;
  color: #444;

  display: -webkit-box;
  -webkit-line-clamp: 2; /* 두 줄 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoticeBottom = styled.div`
  font-size: 12px;
  color: #444;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const WriteButton = styled.button`
  position: fixed;
  bottom: 90px;
  right: 20px;
  background-color: #007bff;
  color: white;
  border-radius: 24px;
  padding: 12px 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 100;
`;
