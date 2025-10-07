import { useEffect, useState } from "react";
import styled from "styled-components";
// react-router-dom의 useNavigate를 import 합니다.
import { useNavigate } from "react-router-dom";
import { getAllPopupNotifications } from "../../apis/popup-notification.ts";
import { PopupNotification } from "../../types/popup-notifications.ts";
import Header from "../../components/common/Header.tsx";

const PopupNotiListPage = () => {
  const [notifications, setNotifications] = useState<PopupNotification[]>([]);
  const [loading, setLoading] = useState(true);
  // useNavigate 훅을 초기화합니다.
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getAllPopupNotifications();
        setNotifications(response.data);
      } catch (error) {
        console.error("팝업 공지 목록 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // 등록 버튼 클릭 시 호출될 함수입니다.
  const handleCreateClick = () => {
    navigate("create");
  };

  if (loading) {
    return <Message>불러오는 중입니다...</Message>;
  }

  return (
    <Wrapper>
      <Header title={"홈 화면 팝업 공지 관리"} hasBack={true} />

      {/* 버튼을 오른쪽 정렬하기 위한 컨테이너와 버튼을 추가합니다. */}
      <ButtonContainer>
        <CreateButton onClick={handleCreateClick}>
          팝업 공지 등록하기
        </CreateButton>
      </ButtonContainer>

      {notifications.length === 0 ? (
        <Message>등록된 팝업 공지가 없습니다.</Message>
      ) : (
        <List>
          {notifications.map((noti, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{noti.title}</CardTitle>
                <TypeTag>{noti.notificationType}</TypeTag>
              </CardHeader>
              <CardContent>{noti.content}</CardContent>
              <CardFooter>
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
  padding: 40px 16px;
  padding-top: 80px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: 20px;
`;

// 버튼을 담을 컨테이너 스타일 추가
const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`;

// 등록 버튼 스타일 추가
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

// ... 이하 기존 스타일 컴포넌트는 동일 ...

const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
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
`;

const CardFooter = styled.div`
  font-size: 12px;
  color: #777;
  display: flex;
  justify-content: space-between;
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
