import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SquareButton from "../../components/common/SquareButton.tsx";
import tokenInstance from "../../apis/tokenInstance.ts";
import FileUploader from "../../components/common/FileUploader.tsx";
import { useFileHandler } from "@/hooks/useFileHandler";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";

export default function TipWritePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tip, tipImages } = location.state || {};

  const [tipid, setTipid] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // 이미지 상태 및 핸들러 커스텀 훅
  const { files, addFiles, deleteFile, isFileLoading } = useFileHandler({
    initialFiles: tipImages,
  });

  // 초기 렌더링 시 스크롤 상단 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 수정 모드 데이터 설정
  useEffect(() => {
    if (tip) {
      setTipid(tip.id);
      setTitle(tip.title);
      setContent(tip.content);
      setIsEditMode(true);
    }
  }, [tip]);

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }
    if (title.length > 100) {
      alert("제목은 100자 이하로 입력해주세요.");
      return;
    }
    if (content.length > 2000) {
      alert("내용은 2000자 이하로 입력해주세요.");
      return;
    }

    const formData = new FormData();

    // DTO 데이터 추가
    const tipDto = new Blob([JSON.stringify({ title, content })], {
      type: "application/json",
    });
    formData.append("requestTipDto", tipDto);

    // 이미지 파일 추가
    files.forEach((imageFile) => {
      formData.append("images", imageFile.file);
    });

    try {
      setIsLoading(true);
      if (isEditMode) {
        await tokenInstance.put(`/tips/${tipid}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("팁이 수정되었습니다!");
      } else {
        await tokenInstance.post("/tips", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("팁이 등록되었습니다!");
      }
      navigate(-1);
    } catch (err: any) {
      console.error("Submit failed:", err);
      const message =
        err.response?.data?.message || "처리 중 오류가 발생했습니다.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  useSetHeader({ title: "TIP 등록/수정" });

  return (
    <Wrapper>
      {isLoading && <LoadingSpinner message="글 쓰는 중..." overlay={true} />}

      <Content>
        <Label>제목</Label>
        <Input
          placeholder="글 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Label>내용</Label>
        <Textarea
          placeholder="내용을 입력해주세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Label>이미지 ({files.length}/10)</Label>
        {isEditMode && (
          <InfoText>
            이미지를 새로 첨부하면 기존 이미지는 모두 대체됩니다.
          </InfoText>
        )}

        <FileUploader
          images={files}
          onAddImages={addFiles}
          onDeleteImage={deleteFile}
          isLoading={isFileLoading}
        />
      </Content>

      <ButtonWrapper>
        <SquareButton
          text={isEditMode ? "수정하기" : "등록하기"}
          onClick={handleSubmit}
        />
      </ButtonWrapper>
    </Wrapper>
  );
}

// --- Styled Components ---

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 16px 120px;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Label = styled.label`
  font-weight: 600;
`;

const InfoText = styled.p`
  font-size: 14px;
  color: #888;
  margin: -8px 0;
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
`;

const Textarea = styled.textarea`
  min-height: 200px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  resize: none;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 20px 16px;
  box-sizing: border-box;
  background-color: #fafafa;
`;
