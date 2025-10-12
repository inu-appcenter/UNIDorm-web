export interface ReplyProps {
  parentCommentId: number;
  replyInputs: { [key: number]: string };
  setReplyInputs: React.Dispatch<
    React.SetStateAction<{ [key: number]: string }>
  >;
  setReplyInputOpen: React.Dispatch<
    React.SetStateAction<{ [key: number]: boolean }>
  >;
}
