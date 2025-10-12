import { useState } from "react";
import styled from "styled-components";
import { BsSend } from "react-icons/bs";
import TopRightDropdownMenu from "../common/TopRightDropdownMenu.tsx";
import { TipComment } from "../../types/tips.ts";
import { ReplyProps } from "../../types/comment.ts";
import { GroupOrderComment } from "../../types/grouporder.ts";
import useUserStore from "../../stores/useUserStore.ts";
import profileimg from "../../assets/profileimg.png";

interface CommentSectionProps {
  CommentDtoList: TipComment[] | GroupOrderComment[];
  setisneedupdate: (v: boolean) => void;
  handleReplySubmit: (props: ReplyProps) => void;
  handleDeleteComment: (commentId: number) => Promise<void>;
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
  return isTipComment(comment) ? comment.name : comment.username;
};

// 대댓글 가져오기
const getChildComments = (comment: TipComment | GroupOrderComment) => {
  return isTipComment(comment)
    ? comment.childTipCommentList
    : comment.childGroupOrderCommentList;
};

export default function CommentSection({
  CommentDtoList,
  setisneedupdate,
  handleReplySubmit,
  handleDeleteComment,
}: CommentSectionProps) {
  const [replyInputOpen, setReplyInputOpen] = useState<{
    [key: number]: boolean;
  }>({});
  const [replyInputs, setReplyInputs] = useState<{ [key: number]: string }>({});

  const { userInfo, tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  // 공통 메뉴 항목
  const baseMenuItems = [
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
  ];

  // 본인 댓글만 가능한 항목
  const ownerMenuItems = [
    {
      label: "삭제하기",
      onClick: async (comment: TipComment | GroupOrderComment) => {
        if (!window.confirm("정말 삭제할까요?")) return;
        try {
          await handleDeleteComment(getCommentId(comment));
          setisneedupdate(true);
          alert("삭제되었습니다.");
        } catch (err) {
          alert("삭제에 실패했습니다.");
        }
      },
    },
  ];

  // 대댓글 렌더링
  const renderReplies = (replies?: (TipComment | GroupOrderComment)[]) => {
    if (!replies || replies.length === 0) return null;

    return replies
      .filter((r) => !r.isDeleted)
      .map((reply) => {
        const replyId = getCommentId(reply);
        const childReplies = getChildComments(reply);

        return (
          <Reply key={replyId}>
            <WriterLine>
              <UserInfo>
                <img
                  src={getCommentImage(reply) || profileimg}
                  alt="프사"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <Nickname>{getCommentName(reply)}</Nickname>
              </UserInfo>
              {isLoggedIn && (
                <TopRightDropdownMenu
                  size={18}
                  items={ownerMenuItems.map((item) => ({
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
                  {"createdDate" in reply && reply.createdDate
                    ? new Date(reply.createdDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "방금"}
                </DateText>
              </CommentBody>
            </ReplyContent>

            {replyInputOpen[replyId] && (
              <ReplyInputArea>
                <ReplyInput
                  placeholder="답글 입력"
                  value={replyInputs[replyId] || ""}
                  onChange={(e) =>
                    setReplyInputs((prev) => ({
                      ...prev,
                      [replyId]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    handleReplySubmit({
                      parentCommentId: replyId,
                      replyInputs,
                      setReplyInputs,
                      setReplyInputOpen,
                    })
                  }
                />
                <ReplySendButton
                  onClick={() =>
                    handleReplySubmit({
                      parentCommentId: replyId,
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

            {renderReplies(childReplies)}
          </Reply>
        );
      });
  };

  return (
    <CommentList>
      {CommentDtoList?.filter(
        (c) => (c.parentId === 0 || c.parentId === null) && !c.isDeleted,
      ).map((comment) => {
        const commentId = getCommentId(comment);
        const childComments = getChildComments(comment);
        const isOwner = userInfo.id === comment.userId;

        const menuItems = isOwner
          ? [...baseMenuItems, ...ownerMenuItems]
          : baseMenuItems;

        return (
          <CommentBundle key={commentId}>
            <Comment>
              <WriterLine>
                <UserInfo>
                  <img
                    src={getCommentImage(comment) || profileimg}
                    alt="프사"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
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
                    {"createdDate" in comment && comment.createdDate
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
