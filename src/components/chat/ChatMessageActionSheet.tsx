import { useEffect, useState } from "react";
import { Drawer } from "vaul";
import styled from "styled-components";
import { OpenChatKickReason } from "@/types/openchat";

type Action = "menu" | "report" | "kick";
type ReportReason = "ADVERTISEMENT" | "ABUSE" | "FRAUD" | "OTHER";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  senderName: string;
  content: string;
  canKick: boolean;
  onReport: (reason: ReportReason) => Promise<void>;
  onKick: (reason: OpenChatKickReason) => Promise<void>;
}

const reportReasons: Array<[ReportReason, string]> = [
  ["ADVERTISEMENT", "도배 · 광고"],
  ["ABUSE", "욕설 · 비방"],
  ["FRAUD", "사기 · 사칭"],
  ["OTHER", "기타"],
];
const kickReasons: Array<[OpenChatKickReason, string]> = [
  ["SPAM", "도배 · 광고"],
  ["ABUSE", "욕설 · 비방"],
  ["REPORT_ACCUMULATED", "지속적인 분란 조성"],
  ["OTHER", "기타"],
];

export default function ChatMessageActionSheet(props: Props) {
  const [action, setAction] = useState<Action>("menu");
  const [selected, setSelected] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (props.open) {
      setAction("menu");
      setSelected("");
    }
  }, [props.open]);

  const submit = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      if (action === "report") await props.onReport(selected as ReportReason);
      if (action === "kick") await props.onKick(selected as OpenChatKickReason);
      props.onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const isKick = action === "kick";
  const reasons = isKick ? kickReasons : reportReasons;

  return (
    <Drawer.Root
      open={props.open}
      onOpenChange={props.onOpenChange}
      repositionInputs={false}
    >
      <Drawer.Portal>
        <Overlay />
        <Content>
          <Handle />
          {action === "menu" ? (
            <Body>
              <Drawer.Title>메시지 옵션</Drawer.Title>
              <MessageInfo>
                <span>{props.senderName}</span>
                <p>{props.content || "사진"}</p>
              </MessageInfo>
              <Primary onClick={() => setAction("report")}>신고하기</Primary>
              {props.canKick && (
                <Danger onClick={() => setAction("kick")}>퇴장시키기</Danger>
              )}
              <Cancel onClick={() => props.onOpenChange(false)}>취소</Cancel>
            </Body>
          ) : (
            <Body>
              <Drawer.Title>
                {isKick ? "퇴장 사유 선택" : "신고 사유 선택"}
              </Drawer.Title>
              <ReasonList>
                {reasons.map(([value, label]) => (
                  <ReasonRow key={value} onClick={() => setSelected(value)}>
                    {label}
                    <Radio $checked={selected === value} $danger={isKick} />
                  </ReasonRow>
                ))}
              </ReasonList>
              {isKick ? (
                <Danger disabled={!selected || submitting} onClick={submit}>
                  퇴장시키기
                </Danger>
              ) : (
                <Primary disabled={!selected || submitting} onClick={submit}>
                  신고하기
                </Primary>
              )}
              <Cancel onClick={() => props.onOpenChange(false)}>취소</Cancel>
            </Body>
          )}
        </Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const Overlay = styled(Drawer.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 20000;
  background: rgba(0, 0, 0, 0.4);
`;
const Content = styled(Drawer.Content)`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20001;
  max-width: 420px;
  margin: 0 auto;
  border-radius: 16px 16px 0 0;
  background: white;
  outline: none;
`;
const Handle = styled.div`
  width: 60px;
  height: 4px;
  margin: 12px auto 16px;
  border-radius: 4px;
  background: #dfdfdf;
`;
const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 20px 16px;
  h2 {
    margin: 0 0 4px;
    color: #3d3d3d;
    font:
      600 20px/1.5 Pretendard,
      sans-serif;
  }
`;
const MessageInfo = styled.div`
  span {
    color: #8b8b8b;
    font:
      400 12px/1.5 Pretendard,
      sans-serif;
  }
  p {
    margin: 4px 0 12px;
    color: #3d3d3d;
    font:
      400 14px/1.5 Pretendard,
      sans-serif;
  }
`;
const SheetButton = styled.button`
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: 8px;
  color: white;
  font:
    600 16px/1.5 Pretendard,
    sans-serif;
  cursor: pointer;
  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;
const Primary = styled(SheetButton)`
  background: #1677ff;
`;
const Danger = styled(SheetButton)`
  background: #f00000;
`;
const Cancel = styled(SheetButton)`
  background: #f7f7f7;
  color: #555;
`;
const ReasonList = styled.div`
  display: flex;
  flex-direction: column;
`;
const ReasonRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border: 0;
  background: transparent;
  color: #3d3d3d;
  font:
    400 16px/1.5 Pretendard,
    sans-serif;
  cursor: pointer;
`;
const Radio = styled.span<{ $checked: boolean; $danger: boolean }>`
  width: 20px;
  height: 20px;
  box-sizing: border-box;
  border-radius: 50%;
  border: 1px solid
    ${({ $checked, $danger }) =>
      $checked ? ($danger ? "#f00000" : "#1677ff") : "#dfdfdf"};
  box-shadow: ${({ $checked, $danger }) =>
    $checked
      ? `inset 0 0 0 4px white, inset 0 0 0 10px ${$danger ? "#f00000" : "#1677ff"}`
      : "none"};
`;
