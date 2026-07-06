import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { createOpenChatRoom } from "@/apis/openchat";
import { OpenChatScope } from "@/types/openchat";
import BottomBar from "@/components/common/BottomBar/BottomBar";

export default function OpenChatCreatePage() {
  const navigate = useNavigate();

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

      navigate("/chat/open");
    } catch (error) {
      console.error("오픈채팅방 생성 실패", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <Header>
        <Logo>
          UNI
          <br />
          Dorm
        </Logo>
      </Header>

      <TitleRow>
        <BackButton type="button" onClick={() => navigate(-1)}>
          &lt;
        </BackButton>
        <PageTitle>방 만들기</PageTitle>
      </TitleRow>

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
            placeholder={`예) 배달, 공동구매, 생활 정보처럼\n같이 이야기할 주제를 짧게 적기`}
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
            개인정보 공개, 금전 거래, 외부 연락처 교환은 사용자 책임 하에
            이루어집니다.
          </NoticeText>
        </NoticeBox>
      </Content>

      <SubmitArea>
        <SubmitButton
          type="button"
          disabled={!isValid || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "만드는 중..." : "만들기"}
        </SubmitButton>
      </SubmitArea>

      <BottomBar />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  padding-bottom: 100px;
  background: #ffffff;
  box-sizing: border-box;
`;

const Header = styled.header`
  height: 96px;
  padding: 24px 20px 16px;
  border-bottom: 1px solid #e5e7eb;
  box-sizing: border-box;
`;

const Logo = styled.div`
  font-size: 18px;
  font-weight: 900;
  line-height: 17px;
  color: #2563eb;
  letter-spacing: -0.5px;
`;

const TitleRow = styled.div`
  height: 72px;
  padding: 0 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 14px;
  box-sizing: border-box;
`;

const BackButton = styled.button`
  border: none;
  background: none;
  padding: 0;
  color: #1f2430;
  font-size: 26px;
  font-weight: 600;
  cursor: pointer;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  color: #1f2430;
`;

const Content = styled.main`
  padding: 28px 24px 140px;
  box-sizing: border-box;
`;

const GuideText = styled.p`
  margin: 0 0 28px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  color: #7a8495;
  word-break: keep-all;
`;

const FormGroup = styled.div`
  margin-bottom: 28px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 900;
  color: #1f2430;
`;

const TextInput = styled.input`
  width: 100%;
  height: 54px;
  padding: 0 18px;
  border: 1px solid #d8dde8;
  border-radius: 16px;
  color: #1f2430;
  font-size: 15px;
  font-weight: 500;
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: #b0b7c3;
  }

  &:focus {
    border-color: #3f6bff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 116px;
  padding: 18px;
  border: 1px solid #d8dde8;
  border-radius: 16px;
  color: #1f2430;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
  outline: none;
  resize: none;
  box-sizing: border-box;

  &::placeholder {
    color: #b0b7c3;
  }

  &:focus {
    border-color: #2563eb;
  }
`;

const ScopeButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
`;

const ScopeButton = styled.button<{ $active: boolean }>`
  min-width: 96px;
  height: 36px;
  padding: 0 18px;
  border: 1px solid ${({ $active }) => ($active ? "#2563EB" : "#d8dde8")};
  border-radius: 999px;
  background: #ffffff;
  color: ${({ $active }) => ($active ? "#2563EB" : "#9ca3af")};
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
`;

const ScopeDescription = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  color: #8a93a3;
  word-break: keep-all;
`;

const NoticeBox = styled.div`
  padding: 18px;
  border: 1px solid #ffc53d;
  border-radius: 16px;
  background: #fffaf0;
`;

const NoticeTitle = styled.p`
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 900;
  color: #b7791f;
`;

const NoticeText = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  color: #9a6b1f;
  word-break: keep-all;
`;

const SubmitArea = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 72px;
  padding: 14px 24px;
  background: #ffffff;
  box-sizing: border-box;

  @media (min-width: 769px) {
    max-width: 480px;
    margin: 0 auto;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 54px;
  border: none;
  border-radius: 14px;
  background: #2563eb;
  color: #ffffff;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    background: #c7d2fe;
    cursor: default;
  }
`;
