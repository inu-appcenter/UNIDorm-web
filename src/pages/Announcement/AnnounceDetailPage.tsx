import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Header from "../../components/common/Header";
import { deleteAnnouncement, getAnnouncementDetail, getAnnouncementFiles } from "../../apis/announcements.ts";
import { AnnouncementDetail, AnnouncementFile } from "../../types/announcements.ts";
import useUserStore from "../../stores/useUserStore.ts";
import AnnounceAttachment from "../../components/announce/AnnounceAttachment.tsx";
import GrayDivider from "../../components/common/GrayDivider.tsx";
import { useSwipeable } from "react-swipeable";
import RoundSquareWhiteButton from "../../components/button/RoundSquareWhiteButton.tsx";
import 궁금해하는횃불이 from "../../assets/roommate/궁금해하는횃불이.png";

export default function AnnounceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [announce, setAnnounce] = useState<AnnouncementDetail | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const [attachments, setAttachments] = useState<AnnouncementFile[]>([]);
  const [images, setImages] = useState<AnnouncementFile[]>([]);

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        if (!id) return;
        const res = await getAnnouncementFiles(Number(id));
        setAttachments(res.data);

        const imageExtensions = [
          "jpg",
          "jpeg",
          "png",
          "gif",
          "bmp",
          "webp",
          "svg",
        ];
        const imgs = res.data.filter((file) => {
          const ext = file.fileName.split(".").pop()?.toLowerCase();
          return ext && imageExtensions.includes(ext);
        });
        setImages(imgs);
      } catch (error) {
        console.error("첨부파일 불러오기 실패:", error);
      }
    };
    fetchAttachments();
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
  // --- 이미지 슬라이더
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
          {announce && (
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
            <img src={previewUrl} />
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

// --- styled-components

const Wrapper = styled.div`
  position: relative;

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
  width: 100%;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

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
  word-break: break-all; /* 긴 단어라도 강제로 줄바꿈 */
  overflow-wrap: break-word; /* 브라우저 호환용 */
`;

const ImageSlider = styled.div`
  width: 100%;
  height: 200px;
  background: #ccc;
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
  border-radius: 10px;
`;

const SliderItem = styled.div`
  width: 100%;
  height: 100%;
`;

const SliderIndicator = styled.div`
  position: absolute;
  bottom: 8px;
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: #fff;
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
  flex-shrink: 0; /* 스크롤 시 줄어들지 않게 고정 */
  margin-bottom: 12px;
  justify-content: space-between;
  padding-right: 50px;
  overflow-wrap: break-word; // 또는 wordWrap
  word-break: keep-all; // 단어 중간이 아니라 단어 단위로 줄바꿈

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
    //height: 100%;
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
