import { useEffect, useState } from "react";
import styled from "styled-components";
import { useSetHeader } from "@/hooks/useSetHeader";
import {
  clearDebugLogs,
  DEBUG_LOG_UPDATED_EVENT,
  DebugLogEntry,
  getDebugLogs,
} from "@/utils/debugLog";

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleString("ko-KR", {
    hour12: false,
  });
};

const formatDetailValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
};

const DebugLogPage = () => {
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);

  const syncLogs = () => {
    setLogs([...getDebugLogs()].reverse());
  };

  useSetHeader({
    title: "로그 확인",
  });

  useEffect(() => {
    syncLogs();

    window.addEventListener("storage", syncLogs);
    window.addEventListener(DEBUG_LOG_UPDATED_EVENT, syncLogs);

    return () => {
      window.removeEventListener("storage", syncLogs);
      window.removeEventListener(DEBUG_LOG_UPDATED_EVENT, syncLogs);
    };
  }, []);

  const handleClearLogs = () => {
    if (!window.confirm("저장된 로그를 모두 삭제할까요?")) {
      return;
    }

    clearDebugLogs();
  };

  return (
    <PageWrapper>
      <TopSection>
        <SummaryCard>
          <SummaryTitle>토큰 리프레시 디버그 로그</SummaryTitle>
          <SummaryText>
            `tokenInstance`와 `refresh()`의 주요 동작을 로컬에 기록합니다.
          </SummaryText>
          <SummaryMeta>최신순 표시, 최대 500개까지 보관</SummaryMeta>
        </SummaryCard>

        <ButtonRow>
          <ActionButton type="button" onClick={syncLogs}>
            새로고침
          </ActionButton>
          <DangerButton type="button" onClick={handleClearLogs}>
            로그 삭제
          </DangerButton>
        </ButtonRow>
      </TopSection>

      {logs.length === 0 ? (
        <EmptyState>
          아직 저장된 로그가 없습니다.
          <br />
          리프레시가 발생하면 이 페이지에서 바로 확인할 수 있어요.
        </EmptyState>
      ) : (
        <LogList>
          {logs.map((log) => (
            <LogCard key={log.id}>
              <LogHeader>
                <CategoryBadge>{log.category}</CategoryBadge>
                <TimestampText>{formatTimestamp(log.timestamp)}</TimestampText>
              </LogHeader>
              <ActionText>{log.action}</ActionText>
              {log.details && Object.keys(log.details).length > 0 && (
                <DetailList>
                  {Object.entries(log.details).map(([key, value]) => (
                    <DetailRow key={`${log.id}-${key}`}>
                      <DetailKey>{key}</DetailKey>
                      <DetailValue>{formatDetailValue(value)}</DetailValue>
                    </DetailRow>
                  ))}
                </DetailList>
              )}
            </LogCard>
          ))}
        </LogList>
      )}
    </PageWrapper>
  );
};

export default DebugLogPage;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  height: 100%;
  padding: 24px 16px 100px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #fafafa;
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SummaryCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
`;

const SummaryTitle = styled.div`
  font-size: 17px;
  font-weight: 700;
  color: #111827;
`;

const SummaryText = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
`;

const SummaryMeta = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 14px;
  background: #111827;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const DangerButton = styled(ActionButton)`
  background: #fee2e2;
  color: #b91c1c;
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  border: 1px dashed #d1d5db;
  border-radius: 18px;
  background: #ffffff;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.7;
`;

const LogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LogCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
`;

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const CategoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
`;

const TimestampText = styled.span`
  font-size: 12px;
  color: #6b7280;
  text-align: right;
`;

const ActionText = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
`;

const DetailList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
`;

const DetailKey = styled.span`
  flex-shrink: 0;
  color: #6b7280;
`;

const DetailValue = styled.span`
  color: #111827;
  text-align: right;
  word-break: break-word;
`;

