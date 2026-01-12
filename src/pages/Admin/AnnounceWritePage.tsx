import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SquareButton from "../../components/common/SquareButton.tsx";
import { RequestAnnouncementDto } from "@/types/announcements";
import {
  createAnnouncement,
  updateAnnouncement,
  updateAnnouncementWithFiles,
} from "@/apis/announcements";
import Header from "../../components/common/Header/Header.tsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import FileUploader from "../../components/common/FileUploader.tsx";
import { useFileHandler } from "@/hooks/useFileHandler";
import FormField from "../../components/complain/FormField.tsx";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import { Input, Textarea } from "@/styles/common";
import {
  ANNOUNCE_CATEGORY_LIST,
  ANNOUNCE_SUB_CATEGORY_LIST,
} from "@/constants/announcement";
import { useIsAdminRole } from "@/hooks/useIsAdminRole";

export default function AnnounceWritePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { announce, announceFiles } = location.state || {};

  const { isDormAdmin, isSupporters } = useIsAdminRole();

  const [title, setTitle] = useState(announce?.title || "");
  const [content, setContent] = useState(announce?.content || "");
  const [isEmergency, setIsEmergency] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const writerIndex = announce
    ? ANNOUNCE_CATEGORY_LIST.findIndex(
        (item) => item.label.ko === announce.announcementType,
      )
    : -1;

  const [selectedAnnounceCategoryIndex, setSelectedAnnounceCategoryIndex] =
    useState<number>(
      writerIndex !== -1 ? writerIndex : isDormAdmin ? 0 : isSupporters ? 1 : 2,
    );

  const [
    selectedAnnounceSubCategoryIndex,
    setselectedAnnounceSubCategoryIndex,
  ] = useState<number>(0);

  const { files, addFiles, deleteFile, isFileLoading } = useFileHandler({
    initialFiles: announceFiles,
    mode: "file",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    console.log("announceFiles", announceFiles);
  }, []);

  const handleSubmit = async () => {
    const data: RequestAnnouncementDto = {
      category:
        ANNOUNCE_SUB_CATEGORY_LIST[selectedAnnounceSubCategoryIndex + 1][
          "value"
        ],
      title,
      writer:
        ANNOUNCE_CATEGORY_LIST[selectedAnnounceCategoryIndex]["label"]["ko"],
      content,
      isEmergency,
    };
    console.log(data);
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
      navigate(-1);
    } catch (error) {
      console.error("공지사항 처리 실패:", error);
      alert("처리에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Wrapper>
      <Header
        title={announce ? "공지사항 수정" : "공지사항 작성"}
        hasBack={true}
      />
      {isLoading && <LoadingSpinner overlay message="글 쓰는 중..." />}

      <Content>
        <FormField
          label="담당부서"
          descriptionGray="로그인한 계정의 권한으로 자동 설정됩니다."
        >
          <SelectableChipGroup
            Groups={ANNOUNCE_CATEGORY_LIST.slice(1).map(
              (item) => item.label.ko,
            )}
            selectedIndex={selectedAnnounceCategoryIndex}
            onSelect={setSelectedAnnounceCategoryIndex}
            disabled={true}
          />
        </FormField>

        {/* 유형 */}
        {ANNOUNCE_CATEGORY_LIST[selectedAnnounceCategoryIndex]["label"][
          "ko"
        ] === "생활원" && (
          <FormField label="카테고리">
            <SelectableChipGroup
              Groups={ANNOUNCE_SUB_CATEGORY_LIST.slice(1).map(
                (item) => item.label.ko,
              )}
              selectedIndex={selectedAnnounceSubCategoryIndex}
              onSelect={setselectedAnnounceSubCategoryIndex}
            />
          </FormField>
        )}

        {/* 제목 */}
        <FormField label="제목">
          <Input
            placeholder="글 제목을 입력해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormField>

        {/*/!* 작성자 *!/*/}
        {/*<FormField label="작성자">*/}
        {/*  <Input*/}
        {/*    placeholder="입력하지 않으면 기본값은 '관리자'입니다."*/}
        {/*    value={writer}*/}
        {/*    onChange={(e) => setWriter(e.target.value)}*/}
        {/*  />*/}
        {/*</FormField>*/}

        {/* 내용 */}
        <FormField label="내용">
          <Textarea
            placeholder="내용을 입력해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </FormField>

        {/* 첨부파일 */}
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

        {/* 긴급 여부 */}
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
`;

const Content = styled.div`
  flex: 1;
  padding: 90px 16px 120px;
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
