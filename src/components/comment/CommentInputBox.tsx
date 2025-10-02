import { BsSend } from "react-icons/bs";
import styled from "styled-components";

interface CommentInputBoxProps {
  commentInput: string;
  setCommentInput: (value: string) => void;
  handleCommentSubmit: () => void;
}

export default function CommentInputBox({
  commentInput,
  setCommentInput,
  handleCommentSubmit,
}: CommentInputBoxProps) {
  return (
    <CommentInput>
      <input
        placeholder="댓글 입력"
        value={commentInput}
        onChange={(e) => setCommentInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleCommentSubmit();
          }
        }}
      />
      <SendButton onClick={handleCommentSubmit}>
        <BsSend
          size={18}
          style={{ color: "black", backgroundColor: "white", padding: "4px" }}
        />
      </SendButton>
    </CommentInput>
  );
}

const CommentInput = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 8px 16px;
  background: white;
  border-top: 1px solid #eee;
  z-index: 999;

  input {
    flex: 1;
    border: none;
    padding: 10px 12px;
    border-radius: 20px;
    background: #f5f5f5;
    font-size: 14px;
    outline: none;
  }
`;

const SendButton = styled.button`
  background: none;
  border: none;
  padding-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;
