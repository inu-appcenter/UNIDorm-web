import styled from "styled-components";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import SquareButton from "../../components/common/SquareButton.tsx";
import Header from "../../components/common/Header/Header.tsx";
import { ComplaintReplyDto } from "../../types/complain.ts";
import {
  createComplaintReply,
  updateComplaintReply,
  updateComplaintStatus,
} from "../../apis/complainAdmin.ts";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import FileUploader from "../../components/common/FileUploader.tsx";
import { useFileHandler } from "../../hooks/useFileHandler.ts";

export default function ComplainAnswerWritePage() {
  const { complainId } = useParams<{ complainId: string }>();

  const navigate = useNavigate();
  const location = useLocation();
  const { complain, manager, Images } = location.state || {};
  const [isEditMode, setIsEditMode] = useState(false);

  const [isRejected, setIsRejected] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 이미지 상태 및 핸들러 커스텀 훅
  const { files, addFiles, deleteFile, isFileLoading } = useFileHandler({
    initialFiles: Images,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (complain) {
      setTitle(complain.reply.replyTitle);
      setContent(complain.reply.replyContent);
      setIsEditMode(true);
      setIsRejected(complain.status === "반려");
    }
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

      // DTO 구성
      const dto: ComplaintReplyDto = {
        replyTitle: title,
        responderName: manager,
        replyContent: content,
      };

      console.log("DTO", dto);

      setIsLoading(true);

      let res;

      if (isEditMode && complain?.id) {
        // 수정 모드
        res = await updateComplaintReply(complain.id, dto, files);
      } else {
        // 등록 모드
        res = await createComplaintReply(Number(complainId), dto, files);
      }
      if (isRejected === true) {
        await updateComplaintStatus(Number(complainId), "반려");
      } else {
        await updateComplaintStatus(Number(complainId), "처리완료");
      }

      alert(`답변이 ${isEditMode ? "수정" : "등록"}되었습니다!`);

      console.log("성공", res.data);
      navigate(-1);
    } catch (err: any) {
      console.error("실패", err);
      if (err.response?.data?.message) {
        alert(`[서버 응답] ${err.response.data.message}`);
      } else {
        alert("처리 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Wrapper>
      <Header title={"민원 답변 작성"} hasBack={true} />

      {isLoading && <LoadingSpinner overlay message="글 쓰는 중..." />}

      <Content>
        <Label>
          반려 여부<span className="required"></span>
        </Label>
        <label>
          <Input
            type="checkbox"
            checked={isRejected}
            onChange={(e) => setIsRejected(e.target.checked)}
          />{" "}
          반려
        </label>

        <Label>
          제목<span className="required"> *</span>
        </Label>
        <Input
          placeholder="제목을 입력해주세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Label>
          담당자<span className="required"> *</span>
        </Label>
        <Input placeholder="담당자명" value={manager} readOnly />
        <Label>
          내용<span className="required"> *</span>
        </Label>
        <Textarea
          placeholder="내용을 입력해주세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Label>이미지</Label>
        <FileUploader
          images={files}
          onAddImages={addFiles}
          onDeleteImage={deleteFile}
          isLoading={isFileLoading}
        />
      </Content>

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
  background: #fff;
`;

const Content = styled.div`
  flex: 1;
  padding: 90px 20px 120px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
`;

const Label = styled.label`
  font-weight: 600;

  .required {
    color: red;
  }
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

const ButtonWrapper = styled.div`
  width: 100%;
  height: fit-content;
  position: fixed;

  padding: 12px 16px;
  box-sizing: border-box;

  bottom: 0;
  left: 0;
`;
