import { BsSend } from "react-icons/bs";
import styled from "styled-components";
import UseUserStore from "../../stores/useUserStore.ts";

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
  const { tokenInfo } = UseUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  return (
    <CommentInput>
      <input
        placeholder={isLoggedIn ? "댓글 입력" : "로그인 후 이용해주세요"}
        value={commentInput}
        onChange={(e) => setCommentInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && isLoggedIn) {
            e.preventDefault();
            handleCommentSubmit();
          }
        }}
        disabled={!isLoggedIn}
      />
      <SendButton
        onClick={isLoggedIn ? handleCommentSubmit : undefined}
        disabled={!isLoggedIn}
      >
        <BsSend
          size={18}
          style={{
            color: isLoggedIn ? "black" : "#aaa",
            backgroundColor: "white",
            padding: "4px",
          }}
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
    color: #333;

    &:disabled {
      background: #eee;
      color: #999;
      cursor: not-allowed;
    }
  }
`;

const SendButton = styled.button<{ disabled?: boolean }>`
  background: none;
  border: none;
  padding-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;
