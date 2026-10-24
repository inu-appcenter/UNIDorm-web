import styled from "styled-components";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { tipKeys, useTipDetail } from "@/queries/tips";
import { useInitFromQuery } from "@/hooks/useInitFromQuery";
import { useEffect, useMemo, useState } from "react";
import SquareButton from "../../components/common/SquareButton.tsx";
import { createTip, updateTip } from "@/apis/tips";
import FileUploader from "../../components/common/FileUploader.tsx";
import { useFileHandler } from "@/hooks/useFileHandler";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";
import { mixpanelTrack } from "@/utils/mixpanel";
import RichTextEditor from "../../components/common/Editor/RichTextEditor.tsx";

export default function TipWritePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get("id");
  const editId = queryId ? Number(queryId) : undefined;

  const { tip: stateTip, tipImages: stateImages } = location.state || {};
  const [tip, setTip] = useState<any>(stateTip ?? null);

  const [tipid, setTipid] = useState(stateTip?.id || "");
  const [title, setTitle] = useState(stateTip?.title || "");
  const [content, setContent] = useState(stateTip?.content || "");
  const [isEditMode, setIsEditMode] = useState(Boolean(stateTip));

  const [isLoading, setIsLoading] = useState(false);

  // 초기 렌더링 시 스크롤 상단 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: detailData, isLoading: isDetailLoading } = useTipDetail(
    !stateTip && editId ? editId : undefined,
  );

  const initialImages = useMemo(() => {
    if (stateImages && stateImages.length > 0) return stateImages;
    if (detailData?.images && detailData.images.length > 0) return detailData.images;
    return [];
  }, [stateImages, detailData?.images]);

  // 이미지 상태 및 핸들러 커스텀 훅
  const { files, addFiles, deleteFile, isFileLoading } = useFileHandler({
    initialFiles: initialImages,
    mode: "image",
  });

  useInitFromQuery(
    detailData,
    (fetched: any) => {
      if (!stateTip && fetched) {
        const item = fetched.tip || fetched;
        setTip(item);
        setTipid(item.id);
        setTitle(item.title);
        setContent(item.content);
        setIsEditMode(true);
      }
    },
    editId,
  );

  // 수정 모드 데이터 설정 (state로 넘어온 경우)
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
        await updateTip(Number(tipid), formData);
        await queryClient.invalidateQueries({ queryKey: tipKeys.all });
        alert("팁이 수정되었습니다!");
      } else {
        await createTip(formData);
        await queryClient.invalidateQueries({ queryKey: tipKeys.all });
        mixpanelTrack.postCreated("꿀팁", "꿀팁작성페이지");
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
      {(isLoading || isDetailLoading) && (
        <LoadingSpinner
          message={
            isDetailLoading ? "꿀팁 불러오는 중..." : "글 쓰는 중..."
          }
          overlay={true}
        />
      )}

      <Content>
        <Label>제목</Label>
        <Input
          placeholder="글 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Label>내용</Label>
        <RichTextEditor
          content={content}
          onChange={(html) => setContent(html)}
          placeholder="내용을 입력해주세요"
          minHeight="220px"
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
  padding: 0 16px calc(120px + var(--safe-area-bottom, 0px));
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


const ButtonWrapper = styled.div`
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 20px 16px calc(20px + var(--safe-area-bottom, 0px));
  box-sizing: border-box;
  background-color: #fafafa;
`;
