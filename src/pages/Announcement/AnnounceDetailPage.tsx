import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Header from "../../components/common/Header";
import {
  deleteAnnouncement,
  getAnnouncementDetail,
} from "../../apis/announcements.ts";
import { AnnouncementDetail } from "../../types/announcements.ts";
import useUserStore from "../../stores/useUserStore.ts";

export default function AnnounceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [announce, setAnnounce] = useState<AnnouncementDetail | null>(null);
  const navigate = useNavigate();
  const { userInfo } = useUserStore();
  const isAdmin = userInfo.isAdmin;

  const menuItems = [
    {
      label: "수정하기",
      onClick: () => {
        navigate("/announcements/write", {
          state: {
            announce,
          },
        });
      },
    },
    {
      label: "삭제하기",
      onClick: () => {
        handleDelete();
      },
    },
  ];

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const response = await getAnnouncementDetail(Number(id));
        console.log(response.data);
        setAnnounce(response.data);
      } catch (err) {
        alert("공지사항을 불러오는 데 실패했습니다.");
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  // 게시글 삭제
  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteAnnouncement(Number(id));
      alert("삭제되었습니다.");
      navigate(-1);
    } catch (err) {
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <Wrapper>
      <Header
        title="공지사항 상세"
        hasBack={true}
        menuItems={isAdmin ? menuItems : undefined}
      />

      <ScrollArea>
        <Content>
          {announce && (
            <>
              <Title>{announce.title}</Title>
              <UserInfo>
                <UserText>
                  <Nickname>{announce.writer}</Nickname>
                  <Date>{announce?.createdDate || "날짜 불러오는 중..."}</Date>
                </UserText>
              </UserInfo>
              <BodyText>
                {announce.content.split("\n").map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
              </BodyText>
            </>
          )}
        </Content>
      </ScrollArea>
    </Wrapper>
  );
}

// --- styled-components

const Wrapper = styled.div`
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;
  padding-top: 56px;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 16px 100px; /* 댓글창 고려 */
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  position: relative; /* ✅ 메뉴 absolute 기준점으로 */
  overflow: visible; /* ✅ 안 짤리게 */
`;

const UserText = styled.div`
  display: flex;
  flex-direction: column;
`;

const Nickname = styled.div`
  font-weight: 600;
  font-size: 14px;
`;

const Date = styled.div`
  font-size: 12px;
  color: gray;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: bold;
  margin: 8px 0;
`;

const BodyText = styled.p`
  font-size: 16px;
  line-height: 1.5;
`;
