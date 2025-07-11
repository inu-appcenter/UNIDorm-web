import styled from "styled-components";
import Header from "../components/common/Header";
import BottomBar from "../components/common/BottomBar";
import { BsBookmark } from "react-icons/bs";
import TitleContentArea from "../components/common/TitleContentArea.tsx";

const mockNotices = Array(6).fill({
  id: 1,
  title: "공지사항 제목",
  content: "공지사항 내용 요약...",
  isUrgent: true,
  scrap: 121,
});

export default function NoticeBoardPage() {
  return (
    <NoticePageWrapper>
      <Header title="공지사항" hasBack={true} showAlarm={true} />

      <TitleContentArea type="📢 공지사항">
        <NoticeList>
          {mockNotices.map((notice, idx) => (
            <NoticeCard key={idx}>
              <NoticeTop>
                <NoticeTitle>{notice.title}</NoticeTitle>
                {notice.isUrgent && <UrgentBadge>긴급</UrgentBadge>}
              </NoticeTop>
              <NoticeContent>{notice.content}</NoticeContent>
              <NoticeBottom>
                <BsBookmark size={16} /> {notice.scrap}
              </NoticeBottom>
            </NoticeCard>
          ))}
        </NoticeList>
      </TitleContentArea>

      <BottomBar />
    </NoticePageWrapper>
  );
}

const NoticePageWrapper = styled.div`
  padding: 90px 8px 90px 8px; // ✅ 좌우 여백 최소화
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #fafafa;
`;

const NoticeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NoticeCard = styled.div`
  padding: 16px;
  background: white;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  width: 420px; // ✅ 꽉 차게
  box-sizing: border-box;
  gap: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const NoticeTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NoticeTitle = styled.div`
  font-weight: bold;
  font-size: 15px;
`;

const UrgentBadge = styled.div`
  font-size: 12px;
  color: #007bff;
  border: 1px solid #007bff;
  padding: 2px 8px;
  border-radius: 20px;
`;

const NoticeContent = styled.div`
  font-size: 13px;
  color: #444;
`;

const NoticeBottom = styled.div`
  font-size: 12px;
  color: #444;
  display: flex;
  align-items: center;
  gap: 4px;
`;
