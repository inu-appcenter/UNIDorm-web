import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Header from "../../components/common/Header";
import {
  deleteAnnouncement,
  getAnnouncementDetail,
  getAnnouncementFiles,
} from "../../apis/announcements.ts";
import {
  AnnouncementDetail,
  AnnouncementFile,
} from "../../types/announcements.ts";
import useUserStore from "../../stores/useUserStore.ts";
import AnnounceAttachment from "../../components/announce/AnnounceAttachment.tsx";
import GrayDivider from "../../components/common/GrayDivider.tsx";
import { useSwipeable } from "react-swipeable";
import RoundSquareWhiteButton from "../../components/button/RoundSquareWhiteButton.tsx";
import 궁금해하는횃불이 from "../../assets/roommate/궁금해하는횃불이.png";
// 🔽 필요한 컴포넌트를 import 합니다.
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import EmptyMessage from "../../constants/EmptyMessage.tsx";

export default function AnnounceDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [announce, setAnnounce] = useState<AnnouncementDetail | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AnnouncementFile[]>([]);
  const [images, setImages] = useState<AnnouncementFile[]>([]);

  // 🔽 로딩 상태를 관리할 state를 추가합니다.
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { userInfo } = useUserStore();
  const isAdmin = userInfo.isAdmin;

  const menuItems = [
    {
      label: "수정하기",
      onClick: () => {
        navigate("/announcements/write", {
          state: { announce },
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

  // 🔽 데이터 로딩 로직을 하나로 통합합니다.
  useEffect(() => {
    if (!boardId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true); // 로딩 시작
      try {
        // 상세 정보와 파일 목록을 동시에 요청합니다.
        const [detailResponse, filesResponse] = await Promise.all([
          getAnnouncementDetail(Number(boardId)),
          getAnnouncementFiles(Number(boardId)),
        ]);

        setAnnounce(detailResponse.data);

        // 파일 목록에서 이미지와 그 외 첨부파일을 분류합니다.
        const allFiles = filesResponse.data;
        const imageExtensions = [
          "jpg",
          "jpeg",
          "png",
          "gif",
          "bmp",
          "webp",
          "svg",
        ];
        const imageFiles = allFiles.filter((file) => {
          const ext = file.fileName.split(".").pop()?.toLowerCase();
          return ext && imageExtensions.includes(ext);
        });

        setImages(imageFiles);
        setAttachments(allFiles);
      } catch (err) {
        alert("공지사항을 불러오는 데 실패했습니다.");
        setAnnounce(null);
      } finally {
        setIsLoading(false); // 로딩 종료
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [boardId]);

  const handleDelete = async () => {
    if (!boardId) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteAnnouncement(Number(boardId));
      alert("삭제되었습니다.");
      navigate(-1);
    } catch (err) {
      alert("삭제에 실패했습니다.");
    }
  };

  const [currentImage, setCurrentImage] = useState(0);
  const handlers = useSwipeable({
    onSwipedLeft: () =>
      setCurrentImage((idx) => Math.min(images.length - 1, idx + 1)),
    onSwipedRight: () => setCurrentImage((idx) => Math.max(0, idx - 1)),
    trackMouse: true,
  });

  return (
    <Wrapper>
      <Header
        title="공지사항 상세"
        hasBack={true}
        menuItems={isAdmin ? menuItems : undefined}
      />

      <ScrollArea>
        <Content>
          {/* 🔽 로딩 상태에 따라 스피너, 상세 내용, 빈 메시지를 조건부 렌더링합니다. */}
          {isLoading ? (
            <LoadingSpinner message="공지사항을 불러오는 중..." />
          ) : announce ? (
            <>
              <Title>{announce.title}</Title>
              <UserInfo>
                <UserText>
                  <Nickname>{announce.writer}</Nickname>
                  <Date>{announce?.createdDate || "날짜 불러오는 중..."}</Date>
                </UserText>
              </UserInfo>
              <GrayDivider margin={"16px 0"} />

              {images.length > 0 && (
                <ImageSlider {...handlers} style={{ touchAction: "pan-y" }}>
                  <SliderItem
                    onClick={() => {
                      setPreviewUrl(images[currentImage].filePath);
                      setShowInfoModal(true);
                    }}
                  >
                    <img
                      src={images[currentImage].filePath}
                      alt={`공지사항 이미지 ${currentImage + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "10px",
                        userSelect: "none",
                        pointerEvents: "none",
                      }}
                      draggable={false}
                    />
                  </SliderItem>
                  <SliderIndicator>
                    {images.map((_, idx) => (
                      <Dot key={idx} $active={idx === currentImage} />
                    ))}
                  </SliderIndicator>
                </ImageSlider>
              )}
              <AnnounceAttachment attachments={attachments} />

              <BodyText>
                {announce.content.split("\n").map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
              </BodyText>
            </>
          ) : (
            <EmptyMessage message="공지사항을 불러올 수 없습니다." />
          )}
        </Content>
      </ScrollArea>
      {showInfoModal && previewUrl && (
        <ModalBackGround>
          <Modal>
            <ModalHeader>
              <img src={궁금해하는횃불이} className="wonder-character" />
              <h2>이미지 자세히 보기</h2>
              <span>{images[currentImage].fileName}</span>
            </ModalHeader>
            <img
              src={previewUrl}
              style={{ width: "100%", objectFit: "contain" }}
              alt="확대 이미지"
            />
            <ButtonGroupWrapper>
              <RoundSquareWhiteButton
                btnName={"닫기"}
                onClick={() => setShowInfoModal(false)}
              />
            </ButtonGroupWrapper>
          </Modal>
        </ModalBackGround>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  background: white;
  padding-top: 56px;
  height: 100vh;
  box-sizing: border-box;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 16px 100px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: visible;
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
  word-break: break-all;
  overflow-wrap: break-word;
`;

const ImageSlider = styled.div`
  width: 100%;
  height: 200px;
  background: #f0f0f0;
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
  border-radius: 10px;
`;

const SliderItem = styled.div`
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

const SliderIndicator = styled.div`
  position: absolute;
  bottom: 8px;
  width: 100%;
  text-align: center;
`;

const Dot = styled.span<{ $active: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 0 4px;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? "#222" : "#ddd")};
  transition: background 0.2s;
`;

const ModalHeader = styled.div`
  flex-shrink: 0;
  margin-bottom: 12px;
  justify-content: space-between;
  padding-right: 50px;
  overflow-wrap: break-word;
  word-break: keep-all;

  h2 {
    margin: 0;
    box-sizing: border-box;
  }
  span {
    font-size: 14px;
  }
`;

const ButtonGroupWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
`;

const ModalBackGround = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  inset: 0 0 0 0;
  z-index: 9999;
`;

const Modal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  padding: 32px 20px;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  max-height: 80%;
  background: white;
  color: #333366;
  font-weight: 500;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-out;
  overflow: hidden;
  position: relative;

  .wonder-character {
    position: absolute;
    top: 10px;
    right: 0;
    width: 100px;
    height: 100px;
    z-index: 1000;
  }

  .content {
    width: 100%;
    flex: 1;
    overflow-y: auto;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
