/**
 * 파일 경로: src/pages/admin/PopupNotiListPage.tsx
 */
import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  deletePopupNotification,
  getAllPopupNotifications,
} from "@/apis/popup-notification";
import { PopupNotification } from "@/types/popup-notifications";
import { useSetHeader } from "@/hooks/useSetHeader";

const PopupNotiListPage = () => {
  const [notifications, setNotifications] = useState<PopupNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getAllPopupNotifications();
        console.log("팝업 공지 목록 조회 성공", response);
        setNotifications(response.data);
      } catch (error) {
        console.error("팝업 공지 목록 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleCreateClick = () => {
    navigate("create");
  };

  const handleEditClick = (popupNotificationId: number) => {
    navigate(`edit/${popupNotificationId}`);
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm("정말로 이 공지를 삭제하시겠습니까?")) {
      try {
        await deletePopupNotification(id);
        alert("공지가 삭제되었습니다.");
        setNotifications((prev) => prev.filter((noti) => noti.id !== id));
      } catch (error) {
        console.error("팝업 공지 삭제 실패:", error);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  useSetHeader({ title: "홈 화면 팝업 공지 관리" });

  if (loading) {
    return <Message>불러오는 중입니다...</Message>;
  }

  return (
    <Wrapper>
      <ButtonContainer>
        <CreateButton onClick={handleCreateClick}>
          팝업 공지 등록하기
        </CreateButton>
      </ButtonContainer>
      {notifications.length === 0 ? (
        <Message>등록된 팝업 공지가 없습니다.</Message>
      ) : (
        <List>
          {notifications.map((noti) => (
            <Card key={noti.id}>
              <CardHeader>
                <CardTitle>{noti.title}</CardTitle>
                <TypeTag>{noti.notificationType}</TypeTag>
              </CardHeader>
              <CardContent>{noti.content}</CardContent>
              <CardFooter>
                <span>📅 시작일: {noti.startDate}</span>
                <span>📅 마감일: {noti.deadline}</span>
                <span>🕓 등록일: {noti.createdDate}</span>
              </CardFooter>
              {noti.imagePath && noti.imagePath.length > 0 && (
                <ImageContainer>
                  {noti.imagePath.map((img, i) => (
                    <Image key={i} src={img} alt={`popup-img-${i}`} />
                  ))}
                </ImageContainer>
              )}
              <CardActions>
                <ActionButton onClick={() => handleEditClick(noti.id)}>
                  수정
                </ActionButton>
                <ActionButton
                  onClick={() => handleDeleteClick(noti.id)}
                  className="delete"
                >
                  삭제
                </ActionButton>
              </CardActions>
            </Card>
          ))}
        </List>
      )}
    </Wrapper>
  );
};

export default PopupNotiListPage;

// ================= Styled Components =================

const Wrapper = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 16px 100px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`;

const CreateButton = styled.button`
  padding: 10px 18px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #0056b3;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
`;

const TypeTag = styled.span`
  font-size: 12px;
  color: white;
  background: #007aff;
  padding: 4px 8px;
  border-radius: 8px;
`;

const CardContent = styled.p`
  font-size: 14px;
  color: #333;
  margin: 10px 0;
  white-space: pre-wrap;
`;

const CardFooter = styled.div`
  font-size: 12px;
  color: #777;
  display: flex;
  justify-content: space-between;
  margin-top: auto;
`;

const ImageContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
`;

const Image = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
`;

const Message = styled.div`
  text-align: center;
  padding: 60px 0;
  font-size: 16px;
  color: #555;
`;

const CardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f8f9fa;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  &:hover {
    background-color: #e9ecef;
    border-color: #adb5bd;
  }
  &.delete {
    color: #dc3545;
    border-color: #dc3545;
    &:hover {
      background-color: #dc3545;
      color: white;
    }
  }
`;
