import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import SquareButton from "../../components/common/SquareButton.tsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import FileUploader from "../../components/common/FileUploader.tsx";
import FormField from "../../components/complain/FormField.tsx";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import {
  createAnnouncement,
  updateAnnouncement,
  updateAnnouncementWithFiles,
} from "@/apis/announcements";
import { useFileHandler } from "@/hooks/useFileHandler";
import { Input, Textarea } from "@/styles/common";
import {
  ANNOUNCE_CATEGORY_LIST,
  ANNOUNCE_SUB_CATEGORY_LIST,
} from "@/constants/announcement";
import { useIsAdminRole } from "@/hooks/useIsAdminRole";
import { useSetHeader } from "@/hooks/useSetHeader";
import { RequestAnnouncementDto } from "@/types/announcements";

export default function AnnounceWritePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const { announce, announceFiles } = location.state || {};

  const announceCategoryOptions = ANNOUNCE_CATEGORY_LIST.slice(1);
  const announceSubCategoryOptions = ANNOUNCE_SUB_CATEGORY_LIST.slice(1);
  const { isDormAdmin, isSupporters } = useIsAdminRole();

  const [title, setTitle] = useState(announce?.title || "");
  const [content, setContent] = useState(announce?.content || "");
  const [isEmergency, setIsEmergency] = useState(announce?.emergency ?? false);
  const [isLoading, setIsLoading] = useState(false);

  const writerIndex = announce
    ? announceCategoryOptions.findIndex(
        (item) =>
          item.value === announce.announcementType ||
          item.label.ko === announce.announcementType,
      )
    : -1;

  const [selectedAnnounceCategoryIndex, setSelectedAnnounceCategoryIndex] =
    useState<number>(
      writerIndex !== -1 ? writerIndex : isDormAdmin ? 0 : isSupporters ? 1 : 2,
    );

  const [
    selectedAnnounceSubCategoryIndex,
    setSelectedAnnounceSubCategoryIndex,
  ] = useState<number>(0);

  const { files, addFiles, deleteFile, isFileLoading } = useFileHandler({
    initialFiles: announceFiles,
    mode: "file",
  });

  const selectedAnnounceCategory =
    announceCategoryOptions[selectedAnnounceCategoryIndex];
  const isDormitoryAnnouncement =
    selectedAnnounceCategory?.value === "DORMITORY";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async () => {
    if (!selectedAnnounceCategory) {
      alert("공지 작성 주체를 확인해주세요.");
      return;
    }

    const data: RequestAnnouncementDto = {
      category: isDormitoryAnnouncement
        ? announceSubCategoryOptions[selectedAnnounceSubCategoryIndex]?.value ??
          ANNOUNCE_SUB_CATEGORY_LIST[0].value
        : ANNOUNCE_SUB_CATEGORY_LIST[0].value,
      title,
      writer: selectedAnnounceCategory.label.ko,
      content,
      isEmergency,
    };

    try {
      setIsLoading(true);

      if (announce) {
        if (files.length > 0) {
          await updateAnnouncementWithFiles(announce.id, data, files);
        } else {
          await updateAnnouncement(announce.id, data);
        }
        alert("공지사항이 성공적으로 수정되었습니다.");
      } else {
        await createAnnouncement(data, files);
        alert("공지사항이 성공적으로 등록되었습니다.");
      }

      await queryClient.invalidateQueries({
        queryKey: ["announcements", "scroll"],
      });

      navigate(-1);
    } catch (error) {
      console.error("공지사항 처리 실패:", error);
      alert("처리에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useSetHeader({ title: "공지사항 작성/수정" });

  return (
    <Wrapper>
      {isLoading && <LoadingSpinner overlay message="글 올리는 중..." />}

      <Content>
        <FormField
          label="작성 주체"
          descriptionGray="로그인한 계정의 권한으로 자동 설정됩니다."
        >
          <SelectableChipGroup
            Groups={announceCategoryOptions.map((item) => item.label.ko)}
            selectedIndex={selectedAnnounceCategoryIndex}
            onSelect={setSelectedAnnounceCategoryIndex}
            disabled={true}
          />
        </FormField>

        {isDormitoryAnnouncement && (
          <FormField label="카테고리">
            <SelectableChipGroup
              Groups={announceSubCategoryOptions.map((item) => item.label.ko)}
              selectedIndex={selectedAnnounceSubCategoryIndex}
              onSelect={setSelectedAnnounceSubCategoryIndex}
            />
          </FormField>
        )}

        <FormField label="제목">
          <Input
            placeholder="글 제목을 입력해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormField>

        <FormField label="내용">
          <Textarea
            placeholder="내용을 입력해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </FormField>

        <FormField label="첨부파일">
          {announce && (
            <div className="description">
              이미지 또는 일반 파일을 첨부할 수 있습니다. 이미지를 첨부하면
              게시글에서 미리보기가 지원됩니다.
            </div>
          )}
          <FileUploader
            images={files}
            onAddImages={addFiles}
            onDeleteImage={deleteFile}
            isLoading={isFileLoading}
            mode="file"
          />
        </FormField>

        <FormField label="긴급 여부">
          <CheckBoxWrapper>
            <input
              type="checkbox"
              id="emergency"
              checked={isEmergency}
              onChange={(e) => setIsEmergency(e.target.checked)}
            />
            <label htmlFor="emergency">긴급 공지로 설정</label>
          </CheckBoxWrapper>
        </FormField>
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
  background: #fafafa;
  flex: 1;
  padding: 0 16px 120px;
`;

const Content = styled.div`
  flex: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;

  .description {
    font-size: 14px;
    color: #555;
  }
`;

const CheckBoxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  input {
    width: 18px;
    height: 18px;
    accent-color: #ff5555;
  }

  label {
    font-size: 14px;
    color: #333;
  }
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
