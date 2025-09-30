import { useState } from "react";
import styled from "styled-components";
import { BsSend } from "react-icons/bs";
import { FaUserCircle } from "react-icons/fa";
import tokenInstance from "../../apis/tokenInstance.ts";
import TopRightDropdownMenu from "../common/TopRightDropdownMenu.tsx";
import { TipComment } from "../../types/tips.ts";

interface CommentSectionProps {
  tipCommentDtoList: TipComment[];
  boardId: string;
  isLoggedIn: boolean;
  setisneedupdate: (v: boolean) => void;
}

export default function CommentSection({
  tipCommentDtoList,
  boardId,
  isLoggedIn,
  setisneedupdate,
}: CommentSectionProps) {
  const [replyInputOpen, setReplyInputOpen] = useState<{
    [key: number]: boolean;
  }>({});
  const [replyInputs, setReplyInputs] = useState<{ [key: number]: string }>({});

  const handleReplySubmit = async (parentCommentId: number) => {
    const replyInput = replyInputs[parentCommentId];
    if (!replyInput?.trim()) return;
    try {
      await tokenInstance.post("/tip-comments", {
        parentCommentId,
        tipId: Number(boardId),
        reply: replyInput,
      });

      setReplyInputs((prev) => ({ ...prev, [parentCommentId]: "" }));
      setReplyInputOpen((prev) => ({ ...prev, [parentCommentId]: false }));
      setisneedupdate(true);
    } catch (err) {
      alert("대댓글 등록 실패");
    }
  };

  const renderReplies = (replies?: TipComment[]) => {
    if (!replies || replies.length === 0) return null;
    return replies
      .filter((r) => !r.isDeleted)
      .map((reply) => (
        <Reply key={reply.tipCommentId}>
          <WriterLine>
            <UserInfo>
              {" "}
              {reply.writerImageFile ? (
                <img
                  src={reply.writerImageFile}
                  alt="프사"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <FaUserCircle size={20} />
              )}
              <Nickname>{reply.name}</Nickname>
            </UserInfo>

            {isLoggedIn && (
              <TopRightDropdownMenu
                size={18}
                items={menuItems.map((item) => ({
                  ...item,
                  onClick: () => item.onClick(reply), // comment 전달
                }))}
              />
            )}
          </WriterLine>
          <ReplyContent>
            <CommentBody>
              <CommentText>{reply.reply}</CommentText>
              <DateText>
                {reply.createdDate
                  ? new Date(reply.createdDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "방금"}
              </DateText>
            </CommentBody>
          </ReplyContent>
          {renderReplies(reply.childTipCommentList)} {/* 재귀 호출 */}
        </Reply>
      ));
  };

  const menuItems = [
    {
      label: "답글달기",
      onClick: (comment: TipComment) => {
        setReplyInputOpen((prev) => ({
          ...prev,
          [comment.tipCommentId]: !prev[comment.tipCommentId],
        }));
      },
    },
    {
      label: "삭제하기",
      onClick: async (comment: TipComment) => {
        if (!comment.tipCommentId) return;
        console.log(comment.tipCommentId);
        if (!window.confirm("정말 삭제할까요?")) return;
        try {
          await tokenInstance.delete(`/tip-comments/${comment.tipCommentId}`);
          setisneedupdate(true);
          alert("삭제되었습니다.");
        } catch (err) {
          alert("삭제에 실패했습니다.");
        }
      },
    },

    // {
    //   label: "신고하기",
    //   onClick: () => {
    //     alert("신고가 접수되었습니다!");
    //   },
    // },
  ];

  return (
    <CommentList>
      {tipCommentDtoList
        ?.filter(
          (c) =>
            (c.parentId === 0 || c.parentId === null) && c.isDeleted === false,
        )
        .map((comment) => (
          <CommentBundle key={comment.tipCommentId}>
            <Comment>
              <WriterLine>
                <UserInfo>
                  <img
                    src={comment.writerImageFile}
                    alt="프사"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <Nickname>{comment.name}</Nickname>
                </UserInfo>

                {isLoggedIn && (
                  <TopRightDropdownMenu
                    size={18}
                    items={menuItems.map((item) => ({
                      ...item,
                      onClick: () => item.onClick(comment), // comment 전달
                    }))}
                  />
                )}
              </WriterLine>

              <CommentContent>
                <CommentBody>
                  <CommentText>{comment.reply}</CommentText>
                  <DateText>
                    {comment.createdDate
                      ? new Date(comment.createdDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "방금"}
                  </DateText>
                </CommentBody>
              </CommentContent>
            </Comment>

            {replyInputOpen[comment.tipCommentId] && (
              <ReplyInputArea>
                <ReplyInput
                  placeholder="답글 입력"
                  value={replyInputs[comment.tipCommentId] || ""}
                  onChange={(e) =>
                    setReplyInputs((prev) => ({
                      ...prev,
                      [comment.tipCommentId]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleReplySubmit(comment.tipCommentId)
                  }
                />
                <ReplySendButton
                  onClick={() => handleReplySubmit(comment.tipCommentId)}
                >
                  <BsSend size={16} />
                </ReplySendButton>
              </ReplyInputArea>
            )}

            {renderReplies(comment.childTipCommentList)}
          </CommentBundle>
        ))}
    </CommentList>
  );
}

const Nickname = styled.div`
  font-weight: 600;
  font-size: 14px;
`;

const DateText = styled.div`
  font-size: 12px;
  color: gray;
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CommentBundle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Comment = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CommentContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
`;

const CommentText = styled.div`
  font-size: 14px;
`;

const Reply = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #f0f0f0;
  padding: 12px;
  border-radius: 8px;
  margin-left: 36px;
`;

const CommentBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ReplyContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
`;

// 답글(대댓글) 입력 영역
const ReplyInputArea = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0 0 48px; /* 댓글에서 들여쓰기 */
  gap: 4px;
`;

const ReplyInput = styled.input`
  flex: 1;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 7px 12px;
  font-size: 13px;
`;

const ReplySendButton = styled.button`
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:active {
    background: #eee;
  }
`;

const WriterLine = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
`;
