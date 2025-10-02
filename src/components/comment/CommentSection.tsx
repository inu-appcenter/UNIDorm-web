import { useState } from "react";
import styled from "styled-components";
import { BsSend } from "react-icons/bs";
import { FaUserCircle } from "react-icons/fa";
import TopRightDropdownMenu from "../common/TopRightDropdownMenu.tsx";
import { TipComment } from "../../types/tips.ts";
import { ReplyProps } from "../../types/comment.ts";
import { GroupOrderComment } from "../../types/grouporder.ts";

interface CommentSectionProps {
  CommentDtoList: TipComment[] | GroupOrderComment[];
  isLoggedIn: boolean;
  setisneedupdate: (v: boolean) => void;
  handleReplySubmit: (props: ReplyProps) => void;
  handleDeleteComment: (commentId: number) => Promise<void>; // 추가
}

// 타입 가드
const isTipComment = (
  comment: TipComment | GroupOrderComment,
): comment is TipComment => {
  return (comment as TipComment).tipCommentId !== undefined;
};

// 댓글 ID 가져오기
const getCommentId = (comment: TipComment | GroupOrderComment) => {
  return isTipComment(comment)
    ? comment.tipCommentId
    : comment.groupOrderCommentId;
};

// 댓글 이미지 가져오기
const getCommentImage = (comment: TipComment | GroupOrderComment) => {
  return isTipComment(comment)
    ? comment.writerImageFile
    : comment.commentAuthorImagePath;
};

// 댓글 작성자 이름 가져오기
const getCommentName = (comment: TipComment | GroupOrderComment) => {
  return isTipComment(comment) ? comment.name : "익명";
};

// 대댓글 가져오기 (TipComment만 대댓글 가능)
const getChildComments = (comment: TipComment | GroupOrderComment) => {
  return isTipComment(comment) ? comment.childTipCommentList : undefined;
};

export default function CommentSection({
  CommentDtoList,
  isLoggedIn,
  setisneedupdate,
  handleReplySubmit,
  handleDeleteComment,
}: CommentSectionProps) {
  const [replyInputOpen, setReplyInputOpen] = useState<{
    [key: number]: boolean;
  }>({});
  const [replyInputs, setReplyInputs] = useState<{ [key: number]: string }>({});

  const menuItems = [
    {
      label: "답글달기",
      onClick: (comment: TipComment | GroupOrderComment) => {
        const id = getCommentId(comment);
        setReplyInputOpen((prev) => ({
          ...prev,
          [id]: !prev[id],
        }));
      },
    },
    {
      label: "삭제하기",
      onClick: async (comment: TipComment | GroupOrderComment) => {
        if (!window.confirm("정말 삭제할까요?")) return;
        try {
          if (isTipComment(comment)) {
            await handleDeleteComment(comment.tipCommentId); // prop으로 받은 삭제 함수 호출
          } else {
            await handleDeleteComment(comment.groupOrderCommentId); // prop으로 받은 삭제 함수 호출
          }
          setisneedupdate(true);
          alert("삭제되었습니다.");
        } catch (err) {
          alert("삭제에 실패했습니다.");
        }
      },
    },
  ];

  const renderReplies = (replies?: TipComment[]) => {
    if (!replies || replies.length === 0) return null;

    return replies
      .filter((r) => !r.isDeleted)
      .map((reply) => (
        <Reply key={reply.tipCommentId}>
          <WriterLine>
            <UserInfo>
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
                  onClick: () => item.onClick(reply),
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
          {renderReplies(reply.childTipCommentList)}
        </Reply>
      ));
  };

  return (
    <CommentList>
      {CommentDtoList?.filter(
        (c) => (c.parentId === 0 || c.parentId === null) && !c.isDeleted,
      ).map((comment) => {
        const commentId = getCommentId(comment);
        const childComments = getChildComments(comment);

        return (
          <CommentBundle key={commentId}>
            <Comment>
              <WriterLine>
                <UserInfo>
                  {getCommentImage(comment) ? (
                    <img
                      src={getCommentImage(comment)}
                      alt="프사"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <FaUserCircle size={24} />
                  )}
                  <Nickname>{getCommentName(comment)}</Nickname>
                </UserInfo>

                {isLoggedIn && (
                  <TopRightDropdownMenu
                    size={18}
                    items={menuItems.map((item) => ({
                      ...item,
                      onClick: () => item.onClick(comment),
                    }))}
                  />
                )}
              </WriterLine>

              <CommentContent>
                <CommentBody>
                  <CommentText>{comment.reply}</CommentText>
                  <DateText>
                    {isTipComment(comment) && comment.createdDate
                      ? new Date(comment.createdDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "방금"}
                  </DateText>
                </CommentBody>
              </CommentContent>
            </Comment>

            {replyInputOpen[commentId] && (
              <ReplyInputArea>
                <ReplyInput
                  placeholder="답글 입력"
                  value={replyInputs[commentId] || ""}
                  onChange={(e) =>
                    setReplyInputs((prev) => ({
                      ...prev,
                      [commentId]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    handleReplySubmit({
                      parentCommentId: commentId,
                      replyInputs,
                      setReplyInputs,
                      setReplyInputOpen,
                    })
                  }
                />
                <ReplySendButton
                  onClick={() =>
                    handleReplySubmit({
                      parentCommentId: commentId,
                      replyInputs,
                      setReplyInputs,
                      setReplyInputOpen,
                    })
                  }
                >
                  <BsSend size={16} />
                </ReplySendButton>
              </ReplyInputArea>
            )}

            {renderReplies(childComments)}
          </CommentBundle>
        );
      })}
    </CommentList>
  );
}

// Styled Components
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

const ReplyInputArea = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0 0 48px;
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
