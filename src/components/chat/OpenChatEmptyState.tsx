import styled from "styled-components";
import { OpenChatTab } from "@/types/openchat";

interface Props {
  tab: OpenChatTab;
  onClickMoveDormitory?: () => void;
}

export default function OpenChatEmptyState({
  tab,
  onClickMoveDormitory,
}: Props) {
  const isMyChat = tab === "MY";

  return (
    <Container>
      {isMyChat ? (
        <>
          <Title>아직 참여한 채팅방이 없어요</Title>

          <Description>
            내 기숙사 방이나 전체 방에서 설명을 보고
            <br />
            참여해보세요
          </Description>

          <MoveButton type="button" onClick={onClickMoveDormitory}>
            내 기숙사 방 보기
          </MoveButton>
        </>
      ) : (
        <>
          <Title>지금 참여 가능한 방이 없어요</Title>

          <Description>
            나중에 다시 확인하거나 전체 방 탭으로 이동해
            <br />
            보세요
          </Description>
        </>
      )}
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  max-width: 288px;
  min-height: 200px;
  margin: 48px auto 0;
  padding: 32px 20px;
  border: 1px solid #e4e7ec;
  border-radius: 20px;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.35;
  text-align: center;
  color: #1f2430;
  word-break: keep-all;
`;

const Description = styled.p`
  margin: 20px 0 28px;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
  color: #8a93a3;
  text-align: center;
  word-break: keep-all;
`;

const MoveButton = styled.button`
  width: 200px;
  height: 46px;
  border: none;
  border-radius: 999px;
  background: #2563eb;
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
`;
