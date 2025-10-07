import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { MdImage } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import SquareButton from "../../components/common/SquareButton.tsx";
import { RequestAnnouncementDto } from "../../types/announcements.ts";
import {
  createAnnouncement,
  updateAnnouncement,
  updateAnnouncementWithFiles,
} from "../../apis/announcements.ts";
import Header from "../../components/common/Header.tsx";

export default function AnnounceWritePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { announce } = location.state || {};
  const [title, setTitle] = useState(announce?.title || "");
  const [content, setContent] = useState(announce?.content || "");
  const [writer, setWriter] = useState(announce?.writer || "관리자");
  const [isEmergency, setIsEmergency] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    const data: RequestAnnouncementDto = {
      title,
      writer,
      content,
      isEmergency,
    };

    try {
      if (announce) {
        // 수정 모드
        if (files.length > 0) {
          // 새 첨부파일이 있는 경우 → with-files API
          await updateAnnouncementWithFiles(announce.id, data, files);
        } else {
          // 첨부파일 변경 없음 → 기존 수정 API
          await updateAnnouncement(announce.id, data);
        }
        alert("공지사항이 성공적으로 수정되었습니다.");
      } else {
        // 생성 모드
        await createAnnouncement(data, files);
        alert("공지사항이 성공적으로 등록되었습니다.");
      }
      navigate(-1);
    } catch (error) {
      console.error("공지사항 처리 실패:", error);
      alert("처리에 실패했습니다.");
    }
  };
  return (
    <Wrapper>
      <Header
        title={announce ? "공지사항 수정" : "공지사항 작성"}
        hasBack={true}
      />

      <Content>
        <Label>제목</Label>
        <Input
          placeholder="글 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Label>작성자</Label>
        <Input
          placeholder="입력하지 않으면 기본값은 '관리자'입니다."
          value={writer}
          onChange={(e) => setWriter(e.target.value)}
        />
        <Label>내용</Label>
        <Textarea
          placeholder="내용을 입력해주세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Label>첨부파일</Label>
        {announce && (
          <div className="description">
            첨부파일을 넣으면 기존에 업로드된 첨부파일 대신 새로 업로드한
            첨부파일로 대체됩니다.
          </div>
        )}
        <FileBox onClick={() => inputRef.current?.click()}>
          <MdImage size={36} color="#888" />
          <span>{files.length}/10</span>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={handleFileChange}
          />
        </FileBox>
        <Label>긴급 여부</Label>
        <CheckBoxWrapper>
          <input
            type="checkbox"
            id="emergency"
            checked={isEmergency}
            onChange={(e) => setIsEmergency(e.target.checked)}
          />
          <label htmlFor="emergency">긴급 공지로 설정</label>
        </CheckBoxWrapper>
      </Content>

      {/*<SubmitButton onClick={handleSubmit}>등록하기</SubmitButton>*/}
      <ButtonWrapper>
        <SquareButton text="등록하기" onClick={handleSubmit} />
      </ButtonWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fafafa;
`;

const Content = styled.div`
  flex: 1;
  padding: 90px 20px 120px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;

  .description {
    font-size: 14px;
    color: #555;
  }
`;

const FileBox = styled.div`
  width: 100%;
  height: 80px;
  background: #eee;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #555;

  img {
    width: 24px;
    height: 24px;
  }
`;

const Label = styled.label`
  font-weight: 600;
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: rgb(255, 255, 255);
`;

const Textarea = styled.textarea`
  min-height: 200px;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: rgb(255, 255, 255);
  resize: none;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  height: fit-content;
  position: fixed;

  padding: 12px 16px;
  box-sizing: border-box;

  bottom: 0;
  left: 0;
`;

const CheckBoxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  input {
    width: 18px;
    height: 18px;
    accent-color: #ff5555; /* 빨간색 강조 (긴급 느낌) */
  }

  label {
    font-size: 14px;
    color: #333;
  }
`;
