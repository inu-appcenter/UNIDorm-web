// components/modal/QuickMessageModal.tsx
import styled from "styled-components";

interface QuickMessageModalProps {
  onClose: () => void;
  onSelect: (message: string) => void;
}

const messages = [
  "오늘 늦을 것 같아요",
  "저 먼저 잘게요",
  "오늘 언제 오시나요?",
  "이어폰 껴주세요",
  "조금만 조용히 해주세요",
];

export default function QuickMessageModal({
  onClose,
  onSelect,
}: QuickMessageModalProps) {
  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        {messages.map((msg, idx) => (
          <MessageItem key={idx} onClick={() => onSelect(msg)}>
            {msg}
          </MessageItem>
        ))}
        <CancelButton onClick={onClose}>취소</CancelButton>
      </ModalBox>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background: white;
  border-radius: 10px;
  overflow: hidden;
  width: 90%;
  //max-width: 300px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  position: absolute;
  bottom: 12px;
`;

const MessageItem = styled.div`
  padding: 14px;
  text-align: center;
  border-bottom: 1px solid #eee;
  color: #007aff;
  font-size: 16px;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }
`;

const CancelButton = styled.div`
  padding: 14px;
  text-align: center;
  font-weight: bold;
  color: #007aff;
  background: #f9f9f9;
  cursor: pointer;
`;
