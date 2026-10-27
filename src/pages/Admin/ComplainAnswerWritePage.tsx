import styled from "styled-components";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import SquareButton from "../../components/common/SquareButton.tsx";
import { ComplaintDetail, ComplaintReplyDto } from "@/types/complain";
import { useQueryClient } from "@tanstack/react-query";
import { complaintKeys, useComplaintDetail } from "@/queries/complaints";
import { useInitFromQuery } from "@/hooks/useInitFromQuery";
import {
  createComplaintReply,
  updateComplaintReply,
  updateComplaintStatus,
} from "@/apis/complainAdmin";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import FileUploader from "../../components/common/FileUploader.tsx";
import { useFileHandler } from "@/hooks/useFileHandler";
import LabeledField from "../../components/complain/LabeledField.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";

export default function ComplainAnswerWritePage() {
  const { complainId } = useParams<{ complainId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { complain: stateComplain, manager: stateManager, Images: stateImages } =
    location.state || {};

  const [complain, setComplain] = useState<ComplaintDetail | null>(
    stateComplain ?? null,
  );
  const [manager, setManager] = useState<string>(
    stateManager ?? stateComplain?.officer ?? "",
  );

  const [isEditMode, setIsEditMode] = useState<boolean>(
    Boolean(stateComplain?.reply),
  );
  const [isRejected, setIsRejected] = useState<boolean>(
    stateComplain?.status === "반려",
  );
  const [title, setTitle] = useState<string>(
    stateComplain?.reply?.replyTitle ?? "",
  );
  const [content, setContent] = useState<string>(
    stateComplain?.reply?.replyContent ?? "",
  );

  const [isLoading, setIsLoading] = useState(false);

  const { data: detailData, isLoading: isDetailLoading } = useComplaintDetail(
    !stateComplain && complainId ? Number(complainId) : undefined,
    { asAdmin: true },
  );

  const initialImages = useMemo(() => {
    if (stateImages && stateImages.length > 0) return stateImages;
    if (stateComplain?.reply?.attachmentUrl && stateComplain.reply.attachmentUrl.length > 0) {
      return stateComplain.reply.attachmentUrl;
    }
    if (detailData?.reply?.attachmentUrl && detailData.reply.attachmentUrl.length > 0) {
      return detailData.reply.attachmentUrl;
    }
    return [];
  }, [stateImages, stateComplain?.reply?.attachmentUrl, detailData?.reply?.attachmentUrl]);

  const { files, addFiles, deleteFile, isFileLoading } = useFileHandler({
    initialFiles: initialImages,
    mode: "image",
  });

  useInitFromQuery(
    detailData,
    (fetched: ComplaintDetail) => {
      if (!stateComplain && fetched) {
        setComplain(fetched);
        if (fetched.officer) setManager((prev: string) => prev || fetched.officer);
      }
    },
    complainId,
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!complain) return;

    if (complain.reply) {
      setTitle(complain.reply.replyTitle ?? "");
      setContent(complain.reply.replyContent ?? "");
      setIsEditMode(true);
      if (complain.reply.responderName) {
        setManager(complain.reply.responderName);
      } else if (complain.officer) {
        setManager(complain.officer);
      }
    } else {
      setIsEditMode(false);
      if (complain.officer) {
        setManager((prev: string) => prev || complain.officer);
      }
    }

    setIsRejected(complain.status === "반려");
  }, [complain]);

  const handleSubmit = async () => {
    try {
      if (!title.trim()) {
        alert("제목을 입력해주세요.");
        return;
      }
      if (!content.trim()) {
        alert("내용을 입력해주세요.");
        return;
      }

      const dto: ComplaintReplyDto = {
        replyTitle: title,
        responderName: manager,
        replyContent: content,
      };

      setIsLoading(true);
      let res;

      if (isEditMode && complain?.id) {
        res = await updateComplaintReply(complain.id, dto, files);
      } else {
        res = await createComplaintReply(Number(complainId), dto, files);
      }

      console.log("작성 성공", res);

      if (isRejected) {
        await updateComplaintStatus(Number(complainId), "반려");
      } else {
        await updateComplaintStatus(Number(complainId), "처리완료");
      }

      await queryClient.invalidateQueries({ queryKey: complaintKeys.all });
      alert(`답변이 ${isEditMode ? "수정" : "등록"}되었습니다!`);
      navigate(-1);
    } catch (err: unknown) {
      console.error("실패", err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        alert(`[서버 응답] ${axiosError.response.data.message}`);
      } else {
        alert("처리 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useSetHeader({ title: "민원 답변 작성/수정" });

  return (
    <Wrapper>
      {(isLoading || isDetailLoading) && (
        <LoadingSpinner
          overlay
          message={
            isDetailLoading ? "민원 정보 불러오는 중..." : "글 쓰는 중..."
          }
        />
      )}

      <Content>
        <LabeledField label="반려 여부">
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={isRejected}
              onChange={(e) => setIsRejected(e.target.checked)}
            />{" "}
            반려
          </CheckboxLabel>
        </LabeledField>

        <LabeledField label="제목" required>
          <Input
            placeholder="제목을 입력해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </LabeledField>

        <LabeledField
          label="담당자"
          required
          description="학생에게는 노출되지 않습니다."
        >
          <Input placeholder="담당자명" value={manager} readOnly />
        </LabeledField>

        <LabeledField label="내용" required>
          <Textarea
            placeholder="내용을 입력해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </LabeledField>

        <LabeledField label="이미지">
          <FileUploader
            images={files}
            onAddImages={addFiles}
            onDeleteImage={deleteFile}
            isLoading={isFileLoading}
          />
        </LabeledField>
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

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  padding: 0 16px calc(100px + var(--safe-area-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 12px 16px calc(12px + var(--safe-area-bottom, 0px));
  box-sizing: border-box;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: rgba(0, 0, 0, 0.04);
`;

const Textarea = styled.textarea`
  min-height: 200px;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: rgba(0, 0, 0, 0.04);
  resize: none;
`;
