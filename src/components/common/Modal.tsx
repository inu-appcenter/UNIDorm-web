import RoundSquareWhiteButton from "../button/RoundSquareWhiteButton.tsx";
import RoundSquareBlueButton from "../button/RoundSquareBlueButton.tsx";
import styled from "styled-components";
import Friends from "../../assets/roommate/Friends.svg";
import 눈물닦아주는횃불이 from "../../assets/눈물 닦아주는 횃불이.webp";

// 선택 가능한 이미지 맵
const headerImages: Record<number, string> = {
  1: Friends,
  2: 눈물닦아주는횃불이,
};

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  showHideOption?: boolean;
  headerImageId?: number | null; // 이미지 선택: 1, 2, 또는 null
}

const Modal = ({
  show,
  onClose,
  title,
  subtitle,
  content,
  showHideOption = false,
  headerImageId = null, // 기본은 이미지 없음
}: ModalProps) => {
  if (!show) return null;

  const headerImage = headerImageId ? headerImages[headerImageId] : null;

  return (
    <ModalBackGround>
      <ModalWrapper>
        <ModalContentWrapper>
          <ModalHeader>
            {headerImage && <img src={headerImage} alt="modal header" />}
            <h2>{title}</h2>
            {subtitle && <span>{subtitle}</span>}
          </ModalHeader>
          <ModalScrollArea>{content}</ModalScrollArea>
        </ModalContentWrapper>
        <ButtonGroupWrapper showHideOption={showHideOption}>
          {showHideOption && (
            <RoundSquareWhiteButton
              btnName={"다시 보지 않기"}
              onClick={() => {
                localStorage.setItem("hideInfoModal", "true");
                onClose();
              }}
            />
          )}
          <RoundSquareBlueButton
            btnName={"닫기"}
            onClick={() => {
              onClose();
            }}
          />
        </ButtonGroupWrapper>
      </ModalWrapper>
    </ModalBackGround>
  );
};

export default Modal;

const ModalBackGround = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  inset: 0 0 0 0;
  z-index: 9999;
`;

const ModalWrapper = styled.div`
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

const ModalContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden; /* 내부에서만 스크롤 생기도록 */
`;

const ModalHeader = styled.div`
  flex-shrink: 0;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  align-items: center; /* 중앙 정렬 */
  text-align: center;
  padding-right: 0; /* 중앙 정렬 시 불필요 */
  word-break: keep-all;
  white-space: pre-wrap; /* 줄바꿈 유지 + 자동 줄바꿈 */

  color: #1c408c;
  width: 100%;

  img {
    width: 50%;
    margin-bottom: 12px; /* 이미지와 제목 간 간격 */
  }

  h2 {
    margin: 0;
    font-size: 24px;
  }

  span {
    font-size: 14px;
  }
`;

const ModalScrollArea = styled.div`
  flex: 1;
  overflow-y: scroll; /* 항상 스크롤 가능하게 */
  padding-right: 8px;
  color: #6c6c74;
  font-size: 14px;
  word-break: break-word; /* 단어 단위 줄바꿈 */
  white-space: pre-wrap; /* 줄바꿈 유지 + 자동 줄바꿈 */

  /* 크롬/사파리 */
  &::-webkit-scrollbar {
    display: block; /* 기본 표시 */
    width: 8px; /* 스크롤바 두께 */
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  /* 파이어폭스 */
  scrollbar-width: thin; /* 얇게 */
  scrollbar-color: #ccc transparent;
`;

const ButtonGroupWrapper = styled.div<{ showHideOption: boolean }>`
  display: flex;
  gap: 6px;
  flex-direction: ${({ showHideOption }) =>
    showHideOption ? "row" : "column"};

  button {
    flex: ${({ showHideOption }) => (showHideOption ? "1" : "none")};
    width: ${({ showHideOption }) => (showHideOption ? "auto" : "100%")};
  }
`;
