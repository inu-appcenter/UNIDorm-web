import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { createOpenChatRoom } from "@/apis/openchat";
import { OpenChatScope } from "@/types/openchat";
import { useSetHeader } from "@/hooks/useSetHeader";

export default function OpenChatCreatePage() {
  const navigate = useNavigate();

  useSetHeader({
    title: "방 만들기",
    showAlarm: false,
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState<OpenChatScope>("DORMITORY");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = name.trim() && description.trim();

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    try {
      setIsSubmitting(true);

      await createOpenChatRoom({
        name: name.trim(),
        description: description.trim(),
        scope,
        maxParticipants: 100,
      });

      navigate("/chat/open", { replace: true });
    } catch (error) {
      console.error("오픈채팅방 생성 실패", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <Content>
        <GuideText>
          방 설명을 보고 참여 여부를 결정할 수 있도록 핵심 목적을 적어주세요.
        </GuideText>

        <FormGroup>
          <Label>방 이름</Label>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예) 1긱 같이 배달 시킬 사람"
            maxLength={30}
          />
        </FormGroup>

        <FormGroup>
          <Label>방 설명</Label>
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`예) 배달, 공동구매, 생활 정보처럼 같이 이야기할\n주제를 짧게 적기`}
            maxLength={100}
          />
        </FormGroup>

        <FormGroup>
          <Label>공개 범위</Label>

          <ScopeButtonRow>
            <ScopeButton
              type="button"
              $active={scope === "DORMITORY"}
              onClick={() => setScope("DORMITORY")}
            >
              내 기숙사
            </ScopeButton>

            <ScopeButton
              type="button"
              $active={scope === "ALL"}
              onClick={() => setScope("ALL")}
            >
              전체
            </ScopeButton>
          </ScopeButtonRow>

          <ScopeDescription>
            선택한 범위에 따라 내 기숙사 방 또는 전체 방 목록에 노출됩니다.
          </ScopeDescription>
        </FormGroup>

        <NoticeBox>
          <NoticeTitle>안내</NoticeTitle>
          <NoticeText>
            개인정보 공개, 금전 거래, 외부 연락처 교환은 사용자 책임 하에 이루어집니다.
          </NoticeText>
        </NoticeBox>
      </Content>

      <SubmitArea>
        <SubmitButton
          type="button"
          disabled={!isValid || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "만드는 중..." : "방 만들기"}
        </SubmitButton>
      </SubmitArea>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #ffffff;
  box-sizing: border-box;
`;

const Content = styled.main`
  padding: 24px 20px 100px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 769px) {
    max-width: 480px;
    margin: 0 auto;
  }
`;

const GuideText = styled.p`
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: #8b8b8b;
  word-break: keep-all;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const Label = styled.label`
  display: block;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  color: #3d3d3d;
`;

const TextInput = styled.input`
  width: 100%;
  height: 38px;
  padding: 8px 12px;
  background: #f7f7f7;
  border: none;
  border-radius: 4px;
  color: #3d3d3d;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: #8b8b8b;
  }

  &:focus {
    background: #f0f0f0;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 114px;
  padding: 8px 12px;
  background: #f7f7f7;
  border: none;
  border-radius: 4px;
  color: #3d3d3d;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  outline: none;
  resize: none;
  box-sizing: border-box;

  &::placeholder {
    color: #8b8b8b;
  }

  &:focus {
    background: #f0f0f0;
  }
`;

const ScopeButtonRow = styled.div`
  display: flex;
  gap: 8px;
`;

const ScopeButton = styled.button<{ $active: boolean }>`
  height: 36px;
  padding: 6px 14px;
  border: none;
  border-radius: 32px;
  background: ${({ $active }) => ($active ? "#1677ff" : "#f7f7f7")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#3d3d3d")};
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const ScopeDescription = styled.p`
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: #8b8b8b;
  word-break: keep-all;
`;

const NoticeBox = styled.div`
  padding: 16px;
  border: none;
  border-radius: 8px;
  background: #fffbe6;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NoticeTitle = styled.p`
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  color: #ad6800;
`;

const NoticeText = styled.p`
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: #613400;
  word-break: keep-all;
`;

const SubmitArea = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px 20px;
  background: #ffffff;
  box-sizing: border-box;

  @media (min-width: 769px) {
    max-width: 480px;
    margin: 0 auto;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 8px;
  background: #1677ff;
  color: #ffffff;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  cursor: pointer;
  transition: background 0.2s ease;

  &:disabled {
    background: #91caff;
    cursor: not-allowed;
  }
`;
